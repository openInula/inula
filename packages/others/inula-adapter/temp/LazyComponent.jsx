export default function Lazy({ loadingComponent, children }) {
  const content = window.horizon.useRef(null);
  const [b, r] = window.horizon.useState(false);
  const reload = window.horizon.useRef(() => {
    r(!b);
  });

  window.horizon.useEffect(() => {
    reload.current = () => {
      r(!b);
    };
  });

  if (content.current) {
    return typeof content.current === 'function' ? <component is={content.current} />:content.current
  } else {
    setTimeout(()=>{
      try {
        const lazy = loadingComponent();
        lazy.then(function (resolved) {
          content.current = resolved.default;
          reload.current();
        });
      } catch(err){
        content.current = loadingComponent;
        reload.current();
      }
    },1)

    return children;
  }
}
