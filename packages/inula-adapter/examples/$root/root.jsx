import { ref, defineExpose } from 'vue-inula';

export default function (props) {
  const theme = ref('light');

  function changeTheme(color) {
    theme.value = color;
  }

  defineExpose({ changeTheme });

  return <app color={theme}></app>;
}
