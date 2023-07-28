import { stringify } from 'qs';
import store from 'store';
import { pathToRegexp } from 'path-to-regexp';
import { ROLE_TYPE } from '../utils/constant';
import { queryLayout } from '../utils';
import api from '../services';
import config from '../utils/config';
// @ts-ignore
const { queryRouteList, queryUserInfo } = api;

import { createStore } from 'inulajs';

const goDashboard = history => {
  if (pathToRegexp(['/', '/login']).exec(window.location.pathname)) {
    history.push({
      pathname: '/dashboard',
    });
  }
};

export const getStore = createStore({
  id: 'app',
  state: {
    routeList: [],
    permissions: { visit: [] },
    locationPathname: '',
    locationQuery: {},
    theme: store.get('theme') || 'light',
    collapsed: store.get('collapsed') || false,
    notifications: [
      {
        title: 'New User is registered.',
        date: new Date(Date.now() - 10000000),
      },
      {
        title: 'Application has been approved.',
        date: new Date(Date.now() - 50000000),
      },
    ],
  },
  actions: {
    handleThemeChange(state, val) {
      store.set('theme', val);
      state.theme = val;
    },

    handleCollapseChange(state, val) {
      store.set('collapsed', val);
      state.collapsed = val;
    },

    allNotificationsRead(state) {
      state.notifications = [];
    },

    async query(state, history) {
      const locationPathname = state.locationPathname;
      const { success, user } = await queryUserInfo();
      if (success && user) {
        const { list } = await queryRouteList();
        const { permissions } = user;
        let routeList = list;
        if (permissions.role === ROLE_TYPE.ADMIN || permissions.role === ROLE_TYPE.DEVELOPER) {
          permissions.visit = list.map(item => item.id);
        } else {
          routeList = list.filter(item => {
            const cases = [
              permissions.visit.includes(item.id),
              item.mpid ? permissions.visit.includes(item.mpid) || item.mpid === '-1' : true,
              item.bpid ? permissions.visit.includes(item.bpid) : true,
            ];
            return cases.every(_ => _);
          });
        }
        state.routeList = routeList;
        state.permissions = permissions;
        store.set('user', user);
        goDashboard(history);
      }
    },
  },
});
