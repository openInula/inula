import React, { useEffect } from 'react';
import { Row, Col, Card } from 'antd';
import { Color } from '../../utils';
import { Page, ScrollBar } from '../../components';
import { NumberCard, Quote, Sales, Weather, RecentSales, Comments, Completed, Browser, Cpu, User } from './components';
import styles from './index.less';
import store from 'store';
import { getStore } from './model';

const bodyStyle = {
  bodyStyle: {
    height: 432,
    background: '#fff',
  },
};

function Dashboard() {
  const st = getStore();

  useEffect(() => {
    st.query();
  }, []);

  const userDetail = store.get('user');
  const { avatar, username } = userDetail;

  const weather = st.weather;
  const sales = st.sales;
  const quote = st.quote;
  const numbers = st.numbers;
  const recentSales = st.recentSales;
  const comments = st.comments;
  const completed = st.completed;
  const browser = st.browser;
  const cpu = st.cpu;
  const user = st.user;

  const numberCards = numbers.map((item, key) => (
    <Col key={key} lg={6} md={12}>
      <NumberCard {...item} />
    </Col>
  ));

  return (
    <Page loading={st.loading} className={styles.dashboard}>
      <Row gutter={24}>
        {numberCards}
        <Col lg={18} md={24}>
          <Card
            bordered={false}
            bodyStyle={{
              padding: '24px 36px 24px 0',
            }}
          >
            <Sales data={sales} />
          </Card>
        </Col>
        <Col lg={6} md={24}>
          <Row gutter={24}>
            <Col lg={24} md={12}>
              <Card
                bordered={false}
                className={styles.weather}
                bodyStyle={{
                  padding: 0,
                  height: 204,
                  background: Color.blue,
                }}
              >
                <Weather {...weather} />
              </Card>
            </Col>
            <Col lg={24} md={12}>
              <Card
                bordered={false}
                className={styles.quote}
                bodyStyle={{
                  padding: 0,
                  height: 204,
                  background: Color.peach,
                }}
              >
                <ScrollBar>
                  <Quote {...quote} />
                </ScrollBar>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Page>
  );
}

export default Dashboard;
