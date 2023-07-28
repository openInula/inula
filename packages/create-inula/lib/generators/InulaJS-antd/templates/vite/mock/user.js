import { Constant } from './_utils';
import Mock from 'mockjs';
import qs from 'qs';
import { randomAvatar } from './_utils';
import url from 'url';

const { ApiPrefix } = Constant;

let usersListData = Mock.mock({
  'data|80-100': [
    {
      id: '@id',
      name: '@name',
      nickName: '@last',
      phone: /^1[34578]\d{9}$/,
      'age|11-99': 1,
      address: '@county(true)',
      isMale: '@boolean',
      email: '@email',
      createTime: '@datetime',
      avatar() {
        return randomAvatar();
      },
    },
  ],
});

let database = usersListData.data;

const EnumRoleType = {
  ADMIN: 'admin',
  DEFAULT: 'guest',
  DEVELOPER: 'developer',
};

const userPermission = {
  DEFAULT: {
    visit: ['1', '2', '21', '7', '5', '51', '52', '53'],
    role: EnumRoleType.DEFAULT,
  },
  ADMIN: {
    role: EnumRoleType.ADMIN,
  },
  DEVELOPER: {
    role: EnumRoleType.DEVELOPER,
  },
};

const adminUsers = [
  {
    id: 0,
    username: 'admin',
    password: 'admin',
    permissions: userPermission.ADMIN,
    avatar: randomAvatar(),
  },
  {
    id: 1,
    username: 'guest',
    password: 'guest',
    permissions: userPermission.DEFAULT,
    avatar: randomAvatar(),
  },
  {
    id: 2,
    username: '吴彦祖',
    password: '123456',
    permissions: userPermission.DEVELOPER,
    avatar: randomAvatar(),
  },
];

const queryArray = (array, key, keyAlias = 'key') => {
  if (!(array instanceof Array)) {
    return null;
  }
  let data;

  for (let item of array) {
    if (item[keyAlias] === key) {
      data = item;
      break;
    }
  }

  if (data) {
    return data;
  }
  return null;
};

const NOTFOUND = {
  message: 'Not Found',
  documentation_url: 'http://localhost:8000/request',
};

export default [
  {
    url: `${ApiPrefix}/user`,
    method: 'get',
    response: () => {
      return {
        success: true,
        user: adminUsers[0],
      };
    },
  },
  {
    url: `${ApiPrefix}/users`,
    method: 'get',
    response: req => {
      const { query } = url.parse(req.url, true);
      let { pageSize, page, ...other } = query;
      pageSize = pageSize || 10;
      page = page || 1;

      let newData = database;
      for (let key in other) {
        if ({}.hasOwnProperty.call(other, key)) {
          newData = newData.filter(item => {
            if ({}.hasOwnProperty.call(item, key)) {
              if (key === 'address') {
                return other[key].every(iitem => item[key].indexOf(iitem) > -1);
              } else if (key === 'createTime') {
                const start = new Date(other[key][0]).getTime();
                const end = new Date(other[key][1]).getTime();
                const now = new Date(item[key]).getTime();

                if (start && end) {
                  return now >= start && now <= end;
                }
                return true;
              }
              return String(item[key]).trim().indexOf(decodeURI(other[key]).trim()) > -1;
            }
            return true;
          });
        }
      }
      return {
        data: newData.slice((page - 1) * pageSize, page * pageSize),
        total: newData.length,
      };
    },
  },
  {
    url: `${ApiPrefix}/users/delete`,
    method: 'post',
    response: req => {
      const { ids = [] } = req.body;
      database = database.filter(item => !ids.some(_ => _ === item.id));
    },
  },
  {},
];
