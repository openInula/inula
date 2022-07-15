import { createStore } from '../../../../libs/horizon/src/horizonx/store/StoreHandler';

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
