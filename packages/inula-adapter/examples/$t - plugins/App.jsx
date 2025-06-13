import { useInstance } from 'vue-horizon';

export default function (props) {
  const introduction = useInstance().$t('introduction');

  return <div>{introduction}</div>;
}
