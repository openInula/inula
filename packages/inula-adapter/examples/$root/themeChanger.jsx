import { useInstance } from 'vue-inula';

export default function (props) {
  const { theme } = props;

  function changeTheme() {
    useInstance().$root.changeTheme(theme);
  }

  return (
    <button
      onClick={() => {
        changeTheme();
      }}
    >
      Change theme to {theme}
    </button>
  );
}
