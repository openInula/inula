import { useInstance } from 'vue-inula';

export default function (props) {
  function validateAndSubmit() {
    if (!useInstance().$refs[0].value) {
      useInstance().$refs[0].focus();
    } else {
      submit();
    }
  }

  return (
    <div>
      <input ref="myInput" type="text" />
      <button
        onCclick={() => {
          validateAndSubmit();
        }}
      >
        submit
      </button>
    </div>
  );
}
