import { parse } from 'qs';
import api from '../../services';
import { createStore } from 'inulajs';

const { queryDashboard, queryWeather } = api;
const avatar = '//cdn.antd-admin.zuiidea.com/bc442cf0cc6f7940dcc567e465048d1a8d634493198c4-sPx5BR_fw236.jpeg';

export const getStore = createStore({
  id: 'dashboard',
  state: {
    weather: {
      city: '深圳',
      temperature: '30',
      name: '晴',
      icon: '//cdn.antd-admin.zuiidea.com/sun.png',
    },
    message: null,
    sales: [],
    quote: {
      avatar,
    },
    numbers: [],
    recentSales: [],
    comments: [],
    completed: [],
    browser: [],
    cpu: {},
    user: {
      avatar,
    },
    loading: false,
  },
  actions: {
    async query(state, payload) {
      state.loading = true;
      const data = await queryDashboard(parse(payload));
      state.loading = false;

      state.browser = data.browser;
      state.comments = data.comments;
      state.completed = data.completed;
      state.cpu = data.cpu;
      state.message = data.message;
      state.numbers = data.numbers;
      state.quote = data.quote;
      state.recentSales = data.recentSales;
      state.sales = data.sales;
      state.user = data.user;
    },
    async queryWeather(state, payload = {}) {
      payload.location = 'shenzhen';
      const result = await queryWeather(payload);
      const { success } = result;
      if (success) {
        const data = result.results[0];
        const weather = {
          city: data.location.name,
          temperature: data.now.temperature,
          name: data.now.text,
          icon: `//cdn.antd-admin.zuiidea.com/web/icons/3d_50/${data.now.code}.png`,
        };

        state.weather = weather;
      }
    },
  },
});
