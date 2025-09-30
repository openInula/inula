import { useState, useEffect } from "react";

function FetchData({ url }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true; // 避免组件卸载后 setState 报错
    fetch(url)
      .then(res => res.json())
      .then(_data => {
        if (isMounted) setData(_data);
      });
    return () => {
      isMounted = false;
    };
  }, [url]); // 当 url 改变时重新触发

  return (
    <div>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>加载中...</p>
      )}
    </div>
  );
}

export default FetchData;
