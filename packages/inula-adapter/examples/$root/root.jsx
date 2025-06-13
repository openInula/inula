import { ref, defineExpose } from 'vue-horizon';

export default function (props) {
  const theme = ref('light');

  function changeTheme(color) {
    theme.value = color;
  }

  defineExpose({ changeTheme });

  return <app color={theme}></app>;
}
