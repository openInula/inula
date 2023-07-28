import React, { useRef } from 'react';
import moment from 'moment';
import { FilterItem } from 'components';
import { Button, Row, Col, DatePicker, Form, Input, Cascader } from 'antd';
import city from 'utils/city';
import { Trans, t } from 'utils/intl';
import styles from './Filter.less';

const { Search } = Input;
const { RangePicker } = DatePicker;

const ColProps = {
  xs: 24,
  sm: 12,
  style: {
    marginBottom: 16,
  },
};

const TwoColProps = {
  ...ColProps,
  xl: 96,
};

function Filter({ onFilterChange, onAdd, filter }) {
  const formRef = useRef();

  const handleFields = fields => {
    const { createTime } = fields;
    if (createTime && createTime.length) {
      fields.createTime = [moment(createTime[0]).format('YYYY-MM-DD'), moment(createTime[1]).format('YYYY-MM-DD')];
    }
    return fields;
  };

  const handleSubmit = () => {
    const values = formRef.current.getFieldsValue();
    const fields = handleFields(values);
    onFilterChange(fields);
  };

  const handleReset = () => {
    const fields = formRef.current.getFieldsValue();
    for (let item in fields) {
      if ({}.hasOwnProperty.call(fields, item)) {
        if (fields[item] instanceof Array) {
          fields[item] = [];
        } else {
          fields[item] = undefined;
        }
      }
    }
    formRef.current.setFieldsValue(fields);
    handleSubmit();
  };

  const handleChange = (key, values) => {
    let fields = formRef.current.getFieldsValue();
    fields[key] = values;
    fields = handleFields(fields);
    onFilterChange(fields);
  };

  const { name, address } = filter;

  let initialCreateTime = [];
  if (filter.createTime && filter.createTime[0]) {
    initialCreateTime[0] = moment(filter.createTime[0]);
  }
  if (filter.createTime && filter.createTime[1]) {
    initialCreateTime[1] = moment(filter.createTime[1]);
  }

  return (
    <Form ref={formRef} name="control-ref" initialValues={{ name, address, createTime: initialCreateTime }}>
      <Row gutter={24}>
        <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }}>
          <Form.Item name="name">
            <Search placeholder={t`Search Name`} onSearch={handleSubmit} />
          </Form.Item>
        </Col>
        <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }} id="addressCascader">
          <Form.Item name="address">
            <Cascader style={{ width: '100%' }} options={city} placeholder={t`Please pick an address`} />
          </Form.Item>
        </Col>
        <Col {...ColProps} xl={{ span: 6 }} md={{ span: 8 }} sm={{ span: 12 }} id="createTimeRangePicker">
          <FilterItem label={t`CreateTime`}>
            <Form.Item name="createTime">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </FilterItem>
        </Col>
        <Col {...TwoColProps} xl={{ span: 10 }} md={{ span: 24 }} sm={{ span: 24 }}>
          <Row type="flex" align="middle" justify="space-between">
            <div>
              <Button type="primary" htmlType="submit" className={styles['margin-right']} onClick={handleSubmit}>
                <Trans>Search</Trans>
              </Button>
              <Button onClick={handleReset}>
                <Trans>Reset</Trans>
              </Button>
            </div>
            <Button type="ghost" onClick={onAdd}>
              <Trans>Create</Trans>
            </Button>
          </Row>
        </Col>
      </Row>
    </Form>
  );
}

export default Filter;
