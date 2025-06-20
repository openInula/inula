import { useInstance } from 'vue-inula';

export default function (props) {
  const introduction = useInstance().$t('introduction');

  return <div>{introduction}</div>;
}
