export default function (props) {
  // inula rendering is synchronous, so this timeout appends this function at next asynchronous position to execute after render
  useEffect(() => {
    // this timeout should be wrapped as an adapter that way you can call only $nextClick( ... ) as usual
    const timeout = setTimeout(() => {
      // this must be wrapped, because at the time of render, this element does not exist yet
      useInstance().$refs.inp.$el.attachEventListener('keyUp', e => {
        console.log(e);
      });
    }, 1);

    return () => {
      clearTimeout(timeout);
    };
  });

  return <input ref="inp" type="text" />;
}
