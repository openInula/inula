/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { createStore } from '../../../../libs/inula/src/inulax/store/StoreHandler';

export const useLogStore = createStore({
  id: 'logStore', // you do not need to specify ID for local store
  state: {
    logs: ['log'],
  },
  actions: {
    addLog: (state, data) => {
      state.logs.push(data);
    },
    removeLog: (state, index) => {
      state.logs.splice(index, 1);
    },
    cleanLog: state => {
      state.logs.length = 0;
    },
  },
  computed: {
    length: state => {
      return state.logs.length;
    },
    log: state => index => state.logs[index],
  },
});
