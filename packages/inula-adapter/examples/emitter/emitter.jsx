export default function (props) {
  function clicked() {
    useInstance().$refs.emitter.$emit('eventEmitterClicked');
  }

  return (
    <button
      ref="emitter"
      onClick={() => {
        clicked();
      }}
    >
      emit event
    </button>
  );
}
