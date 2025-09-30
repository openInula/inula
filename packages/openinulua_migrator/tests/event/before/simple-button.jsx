import { useState } from 'react';

function SimpleButton() {
  const [message, setMessage] = useState('');
  
  return (
    <div>
      <button onClick={() => setMessage('你好！')}>
        打招呼
      </button>
      <p>{message}</p>
    </div>
  );
}


