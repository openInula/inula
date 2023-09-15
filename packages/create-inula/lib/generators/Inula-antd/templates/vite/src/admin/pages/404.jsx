import Inula from 'inulajs';
import { FrownOutlined } from '@ant-design/icons';
import { Page } from 'components';
import styles from './404.module.less';

const Error = () => (
  <Page inner>
    <div className={styles.error}>
      <FrownOutlined />
      <h1>404 Not Found</h1>
    </div>
  </Page>
);

export default Error;
