import chokidar from 'chokidar';
import bodyParser from 'body-parser';
import {globSync} from 'glob';
import { join } from 'path';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mockDir = join(process.cwd(), 'mock');
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({
  extended: true,
});

interface Mock {
  [key: string]: any;
}

// 读取 mock 文件夹下的 js 文件
function getMocksFile() {
  const mockFiles = globSync('**/*.js', {
    cwd: mockDir,
  });
  let ret = mockFiles.reduce((mocks: any, mockFile: string) => {
    if (!mockFile.startsWith('_')) {
      mocks = {
        ...mocks,
        ...require(join(mockDir, mockFile)),
      };
      console.log('mockFile', require(join(mockDir, mockFile)));
    }

    return mocks;
  }, {});

  return ret;
}

function generateRoutes(app: any) {
  let mockStartIndex = app._router.stack.length,
    mocks: Mock = {};

  try {
    mocks = getMocksFile();
  } catch (error) {
    console.error('Generate mock routes error', error);
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
            : (_req: any, res: { send: (arg0: any) => void }) => {
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

export default (app: { _router: { stack: any[] } }) => {
  const mockRoutes = generateRoutes(app);
  let { mockRoutesLength } = mockRoutes;
  let { mockStartIndex } = mockRoutes;

  // 监听 mock 文件夹下文件变化
  chokidar
    .watch(mockDir, {
      ignoreInitial: true,
    })
    .on('all', (event: string, _path: any) => {
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
