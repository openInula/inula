import api from '../../services';
import { createStore } from 'inulajs';

const { queryUserList, createUser, removeUser, updateUser, removeUserList } = api;

export const getStore = createStore({
  id: 'user',

  state: {
    currentItem: {
      id: 0,
    },
    modalVisible: false,
    modalType: 'create',
    selectedRowKeys: [],

    list: [],
    pagination: {
      showSizeChanger: true,
      showQuickJumper: true,
      current: 1,
      total: 0,
      pageSize: 10,
    },
    loading: false,
  },

  actions: {
    async query(state, payload) {
      state.loading = true;
      const data = await queryUserList(payload);
      state.loading = false;
      if (data) {
        state.list = data.data;
        state.pagination.current = Number(payload.page) || 1;
        state.pagination.pageSize = Number(payload.pageSize) || 10;
        state.pagination.total = data.total;
      }
    },

    async delete(state, payload) {
      const data = await removeUser({ id: payload });
      if (data.success) {
        state.selectedRowKeys = state.selectedRowKeys.filter(_ => _ !== payload);
      } else {
        throw data;
      }
    },

    async multiDelete(state, payload) {
      const data = await removeUserList(payload);
      if (data.success) {
        state.selectedRowKeys = [];
      } else {
        throw data;
      }
    },

    async create(state, payload) {
      const data = await createUser(payload);
      if (data.success) {
        this.hideModal();
      } else {
        throw data;
      }
    },

    async update(state, payload) {
      const newUser = { ...payload, id: state.currentItem.id };
      const data = await updateUser(newUser);
      if (data.success) {
        this.hideModal();
      } else {
        throw data;
      }
    },

    showModal(state, payload) {
      state.modalVisible = true;
      if (state.modalType !== undefined) {
        state.modalType = payload.modalType;
      }
      if (payload.currentItem !== undefined) {
        state.currentItem = payload.currentItem;
      }
    },

    hideModal(state) {
      state.modalVisible = false;
    },
  },
});
