import Inula, { PureComponent } from '@cloudsop/horizon';
import PropTypes from 'prop-types';
import { Page } from 'components';
import styles from './index.module.less';

class UserDetail extends PureComponent {
  render() {
    const { userDetail } = this.props;
    const { data } = userDetail;
    const content = [];
    for (let key in data) {
      if ({}.hasOwnProperty.call(data, key)) {
        content.push(
          <div key={key} className={styles.item}>
            <div>{key}</div>
            <div>{String(data[key])}</div>
          </div>
        );
      }
    }
    return (
      <Page inner>
        <div className={styles.content}>{content}</div>
      </Page>
    );
  }
}

UserDetail.propTypes = {
  userDetail: PropTypes.object,
};

export default UserDetail;