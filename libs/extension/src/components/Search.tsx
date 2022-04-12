import styles from './Search.less';

interface SearchProps {
  onChange: (event: any) => void,
  value: string,
}

export default function Search(props: SearchProps) {
  const { onChange, value } = props;
  const handleChange = (event) => {
    onChange(event.target.value);
  };
  return (
    <input
      onChange={handleChange}
      className={styles.search}
      value={value}
      placeholder={'Search (text or /regex/)'}
    />
  );
}