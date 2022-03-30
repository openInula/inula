import styles from './Search.less';

interface SearchProps {
  onChange: (event: any) => void,
}

export default function Search(props: SearchProps) {
  const { onChange } = props;
  const handleChange = (event) => {
    onChange(event.target.value);
  }
  return (
    <input
      onChange={handleChange}
      className={styles.search}
      placeholder={'Search (text or /regex/)'}
    />
  )
}