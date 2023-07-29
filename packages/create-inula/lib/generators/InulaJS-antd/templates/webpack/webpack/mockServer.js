const chokidar = require('chokidar');
const bodyParser = require('body-parser');
const glob = require('glob');
const { join } = require('path');

const mockDir = join(process.cwd(), 'mock');
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({
  extended: true,
});

// 读取 mock 文件夹下的 js 文件
function getMocksFile() {
  const mockFiles = glob.sync('**/*.js', {
    cwd: mockDir,
  });

  let ret = mockFiles.reduce((mocks, mockFile) => {
    if (!mockFile.startsWith('_')) {
      mocks = {
        ...mocks,
        ...require(join(mockDir, mockFile)),
      };
    }

    return mocks;
  }, {});

  return ret;
}

// 生成 express 路由
function generateRoutes(app) {
  let mockStartIndex = app._router.stack.length,
    mocks = {};

  try {
    mocks = getMocksFile();
  } catch (error) {
    console.error(error);
  }

  for (const mockItem in mocks) {
    if (Object.prototype.hasOwnProperty.call(mocks, mockItem)) {
      try {
        const trimMockItemArr = mockItem
          .replace(/(^\s*)|(\s*$)/g, '')
          .replace(/\s+/g, ' ')
          .split(' ');

        const respond = mocks[mockItem];

        let mockType = 'get',
          mockUrl;
        if (trimMockItemArr.length === 1) {
          mockUrl = trimMockItemArr[0];
        } else {
          [mockType, mockUrl] = trimMockItemArr;
        }

        const mockTypeLowerCase = mockType.toLowerCase();

        if (!HTTP_METHODS.includes(mockTypeLowerCase)) {
          throw new Error(`Invalid HTTP request method ${mockType} for path ${mockUrl}`);
        }

        app[mockTypeLowerCase](
          mockUrl,
          [jsonParser, urlencodedParser],
          respond instanceof Function
            ? respond
            : (_req, res) => {
                res.send(respond);
              }
        );
      } catch (error) {
        console.error(error);
      }
    }
  }
  return {
    mockRoutesLength: app._router.stack.length - mockStartIndex,
    mockStartIndex: mockStartIndex,
  };
}

// 清除 mock 文件下的 require 缓存
function cleanRequireCache() {
  Object.keys(require.cache).forEach(key => {
    if (key.includes(mockDir)) {
      delete require.cache[require.resolve(key)];
    }
  });
}

module.exports = app => {
  const mockRoutes = generateRoutes(app);
  let { mockRoutesLength } = mockRoutes;
  let { mockStartIndex } = mockRoutes;

  // 监听 mock 文件夹下文件变化
  chokidar
    .watch(mockDir, {
      ignoreInitial: true,
    })
    .on('all', (event, _path) => {
      if (event === 'change' || event === 'add') {
        try {
          // 删除中间件映射
          app._router.stack.splice(mockStartIndex, mockRoutesLength);

          cleanRequireCache();
          const mockRoutes = generateRoutes(app);

          mockRoutesLength = mockRoutes.mockRoutesLength;
          mockStartIndex = mockRoutes.mockStartIndex;
        } catch (error) {
          console.error(error);
        }
      }
    });
};
