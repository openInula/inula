import Inula from 'inulajs';
import { Table, Modal } from 'antd';
import { DropOption } from 'components';
import { t } from 'utils/intl';
import { Trans } from 'utils/intl';
import styles from './List.module.less';

const { confirm } = Modal;

function List({ onDeleteItem, onEditItem, ...tableProps }) {
  const handleMenuClick = (record, e) => {
    if (e.key === '1') {
      onEditItem(record);
    } else if (e.key === '2') {
      confirm({
        title: t`Are you sure delete this record?`,
        onOk() {
          onDeleteItem(record.id);
        },
      });
    }
  };

  const columns = [
    {
      title: <Trans>Name</Trans>,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: <Trans>NickName</Trans>,
      dataIndex: 'nickName',
      key: 'nickName',
    },
    {
      title: <Trans>Age</Trans>,
      dataIndex: 'age',
      width: '6%',
      key: 'age',
    },
    {
      title: <Trans>Gender</Trans>,
      dataIndex: 'isMale',
      key: 'isMale',
      width: '7%',
      render: text => <span>{text ? 'Male' : 'Female'}</span>,
    },
    {
      title: <Trans>Phone</Trans>,
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: <Trans>Email</Trans>,
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: <Trans>Address</Trans>,
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: <Trans>CreateTime</Trans>,
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: <Trans>Operation</Trans>,
      key: 'operation',
      fixed: 'right',
      width: '8%',
      render: (text, record) => {
        return (
          <DropOption
            onMenuClick={e => handleMenuClick(record, e)}
            menuOptions={[
              { key: '1', name: t`Update` },
              { key: '2', name: t`Delete` },
            ]}
          />
        );
      },
    },
  ];

  return (
    <Table
      {...tableProps}
      pagination={{
        ...tableProps.pagination,
        showTotal: total => t(`Total`, { total }),
      }}
      className={styles.table}
      bordered
      scroll={{ x: 1200 }}
      columns={columns}
      simple
      rowKey={record => record.id}
    />
  );
}

export default List;
