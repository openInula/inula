export default function (props) {
  // useeffect and clearInterval operation mas no sense, but this is necessary
  // to prevent problems between persistent vue components and temporary inula function components
  useEffect(() => {
    const [b, r] = useState(false); // by toggling this state object, force update is triggered
    const interval = setInterval(() => {
      r(!b);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });
  return <span>{Date.now()}</span>;
}
