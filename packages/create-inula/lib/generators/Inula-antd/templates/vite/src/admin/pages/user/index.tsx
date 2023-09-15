import Inula, { useEffect } from '@cloudsop/horizon';
import { Row, Col, Button, Popconfirm } from 'antd';
import { Page } from '../../components';
import { stringify } from 'qs';
import List from './components/List';
import Filter from './components/Filter';
import Modal from './components/Modal';
import { getStore } from './model';
import { pathToRegexp } from 'path-to-regexp';
import { t } from '../../utils/intl';
import { parseSearch } from '../../utils';

function User({ location, history }) {
  const st = getStore();

  useEffect(() => {
    if (pathToRegexp('/user').exec(location.pathname)) {
      const payload = {
        page: 1,
        pageSize: 10,
        ...parseSearch(location.search),
      };
      st.query(payload);
    }
  }, [st.pagination.total]);

  const handleRefresh = newQuery => {
    const { search, pathname } = location;

    const params = {
      ...parseSearch(search),
      ...newQuery,
    };

    history.push({
      pathname,
      search: stringify(params, { arrayFormat: 'repeat' }),
    });

    st.query(params);
  };

  const handleDeleteItems = () => {
    st.multiDelete({
      ids: st.selectedRowKeys,
    });

    handleRefresh({
      page:
        st.list.length === st.selectedRowKeys.length && st.pagination.current > 1
          ? st.pagination.current - 1
          : st.pagination.current,
    });
  };

  const modalProps = () => {
    return {
      item: st.modalType === 'create' ? {} : st.currentItem,
      visible: st.modalVisible,
      destroyOnClose: true,
      maskClosable: false,
      confirmLoading: false,
      title: `${st.modalType === 'create' ? t`Create User` : t`Update User`}`,
      centered: true,
      onOk: data => {
        st[st.modalType](data);
        handleRefresh();
      },
      onCancel() {
        st.hideModal();
      },
    };
  };

  const listProps = () => {
    return {
      dataSource: st.list,
      loading: false,
      pagination: st.pagination,
      onChange: page => {
        const { search } = location;
        const params = {
          ...parseSearch(search),
          page: page.current,
          pageSize: page.pageSize,
        };

        handleRefresh(params);
      },
      onDeleteItem: id => {
        st.delete(id);
        handleRefresh({
          page: st.list.length === 1 && st.pagination.current > 1 ? st.pagination.current - 1 : st.pagination.current,
        });
      },
      onEditItem: item => {
        st.showModal({
          modalType: 'update',
          currentItem: item,
        });
      },
      rowSelection: {
        selectedRowKeys: st.selectedRowKeys,
        onChange: keys => {
          st.selectedRowKeys = keys;
        },
      },
    };
  };

  const filterProps = () => {
    const { search } = location;

    return {
      filter: {
        ...parseSearch(search),
      },
      onFilterChange: value => {
        handleRefresh({
          ...value,
        });
      },
      onAdd: () => {
        st.showModal({
          modalType: 'create',
        });
      },
    };
  };

  return (
    <Page inner loading={st.loading}>
      <Filter {...filterProps()} />
      {st.selectedRowKeys.length > 0 && (
        <Row style={{ marginBottom: 24, textAlign: 'right', fontSize: 13 }}>
          <Col>
            {`Selected ${st.selectedRowKeys.length} items `}
            <Popconfirm title="Are you sure delete these items?" placement="left" onConfirm={handleDeleteItems}>
              <Button type="primary" style={{ marginLeft: 8 }}>
                Remove
              </Button>
            </Popconfirm>
          </Col>
        </Row>
      )}
      <List {...listProps()} />
      <Modal {...modalProps()} />
    </Page>
  );
}

export default User;
