export default function (props) {
  useInstance().$refs.emitter.$on('eventEmitterClicked');

  return <ButtonEmitter ref="emitter">emit event</ButtonEmitter>;
}
