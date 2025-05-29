import React, { useState } from 'react';
import { useConversations } from '../service/conversations';

const ConversationsTest = () => {
  console.log('ConversationsTest component rendered');
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 使用 console.log 记录组件中的状态
  console.log('Current state:', { page, pageSize });
  
  // 调用钩子，启用调试模式
  const { data, isLoading, error, refetch } = useConversations({
    page,
    pageSize
  });
  
  // 记录钩子返回值
  console.log('useConversations result:', { data, isLoading, error });
  
  const handleRefetch = () => {
    console.log('Manual refetch triggered');
    refetch();
  };
  
  // 显示页面内容
  return (
    <div>
      <h1>会话列表测试</h1>
      
      <div>
        <button onClick={() => setPage(prevPage => Math.max(1, prevPage - 1))}>
          上一页
        </button>
        <span>当前页: {page}</span>
        <button onClick={() => setPage(prevPage => prevPage + 1)}>
          下一页
        </button>
        <button onClick={handleRefetch}>
          手动刷新
        </button>
      </div>
      
      {isLoading && <p>加载中...</p>}
      
      {error && (
        <div>
          <h3>发生错误:</h3>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      
      {data && (
        <div>
          <h3>成功加载 {data.data.length} 个会话</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ConversationsTest;
