function FetchData({ url }) {
    let data = null;
  
    watch(() => {
      fetch(url)
        .then(res => res.json())
        .then(_data => {
          data = _data;
        });
    });
  
    return (
      <div>
        <if cond={data}>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </if>
        <else>
          <p>加载中...</p>
        </else>
      </div>
    );
  }