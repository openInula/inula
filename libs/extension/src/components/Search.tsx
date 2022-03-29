import styles from './Search.less';

export default function Search() {
  return (
    <input className={styles.search} placeholder={'Search (text or /regex/)'}/>
  )
}