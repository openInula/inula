function SimpleButton() {
  let message = '';
  
  return (
    <div>
      <button onClick={() => message = '你好！'}>
        打招呼
      </button>
      <p>{message}</p>
    </div>
  );
}


