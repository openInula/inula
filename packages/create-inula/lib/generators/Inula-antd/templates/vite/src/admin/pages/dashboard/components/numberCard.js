import Inula from 'inulajs';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import iconMap from 'utils/iconMap';
import styles from './numberCard.module.less';

function NumberCard({ icon, color, title, number }) {
  return (
    <Card className={styles.numberCard} bordered={false} bodyStyle={{ padding: 10 }}>
      <span className={styles.iconWarp} style={{ color }}>
        {iconMap[icon]}
      </span>
      <div className={styles.content}>
        <p className={styles.title}>{title || 'No Title'}</p>
        <p className={styles.number}>
          {number}
        </p>
      </div>
    </Card>
  );
}

NumberCard.propTypes = {
  icon: PropTypes.string,
  color: PropTypes.string,
  title: PropTypes.string,
  number: PropTypes.number,
  countUp: PropTypes.object,
};

export default NumberCard;
