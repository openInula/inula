import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  getConversationById,
  useConversations,
  useDeleteConversation,
} from '@/service/conversations';
import Button from '@/components/base/button';
import { RiCloseLine, RiDeleteBin6Line, RiMoreLine } from '@remixicon/react';

interface ConversationsListProps {
  setMessages: (message: any) => void; // Callback to update messages in parent
  onClose: () => void; // Callback to update messages in parent
}

export function ConversationsList({ onClose, setMessages }: ConversationsListProps) {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [allConversations, setAllConversations] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const PAGE_SIZE = 10;

  const { data, isLoading, error, refetch } = useConversations({
    page: page,
    pageSize: PAGE_SIZE,
    agentId: id ? Number(id) : undefined,
  });

  // 添加删除功能的钩子
  const { mutate: deleteConversation, isLoading: isDeleting } = useDeleteConversation({
    onSuccess: () => {
      // 删除成功后刷新列表
      setPage(1);
      refetch();
    },
  });

  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAllConversations(data.data);
      } else {
        setAllConversations((prev) => [...prev, ...data.data]);
      }

      setHasMore(data.meta.page < data.meta.totalPages);
      setIsLoadingMore(false);
    }
  }, [data]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleConversationClick = async (conversationId) => {
    // 留空，由你填充实际导航逻辑
    onClose();
    const conversation = await getConversationById(conversationId);
    setMessages(conversation.messages);
  };

  // 添加删除会话的处理函数
  const handleDeleteConversation = (e, conversationId) => {
    e.stopPropagation(); // 阻止冒泡，避免触发对话点击事件
    if (window.confirm('确定要删除这条会话记录吗？')) {
      deleteConversation(conversationId);
      setActiveMenu(null);
    }
  };

  // 切换更多菜单的显示状态
  const toggleMenu = (e, conversationId) => {
    e.stopPropagation(); // 阻止冒泡，避免触发对话点击事件
    setActiveMenu(activeMenu === conversationId ? null : conversationId);
  };

  // 点击其他区域关闭菜单
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // 计算各种时间差
    const seconds = diffInSeconds;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    // 根据时间差返回友好的格式
    if (seconds < 60) {
      return '刚刚';
    } else if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else if (days < 30) {
      return `${days}天前`;
    } else if (months < 12) {
      return `${months}个月前`;
    } else {
      return `${years}年前`;
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && page === 1) {
    return (
      <div className="p-4 text-gray-700 text-center">
        <p>加载错误: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col px-8">
      <div className="py-4 flex justify-between items-center">
        <h2 className="text-base font-medium text-primary">会话列表</h2>
        <Button variant="ghost" onClick={onClose}>
          <RiCloseLine />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {allConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-3 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm">暂无会话记录</p>
          </div>
        ) : (
          <ul className="pt-2">
            {allConversations.map((conversation, index) => (
              <li
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className={`mx-2 mb-2 px-4 py-3 rounded-lg cursor-pointer bg-white hover:bg-primary-50 border border-gray-200 transition-colors duration-150 ease-in-out relative group`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate max-w-[85%]">
                      {conversation.messages?.length > 0 ? (
                        conversation.title
                      ) : (
                        <i className="line-through text-text-tertiary">{conversation.title || '新对话'}</i>
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center">
                    <div className="text-xs text-gray-500 mr-2 whitespace-nowrap">
                      最后消息 {formatDate(conversation.updatedAt || conversation.createdAt)}
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => toggleMenu(e, conversation.id)}
                        className="p-1 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors duration-150 opacity-0 group-hover:opacity-100"
                        aria-label="更多选项"
                      >
                        <RiMoreLine size={16} />
                      </button>
                      {activeMenu === conversation.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white shadow-lg rounded-md border border-gray-200 z-10 overflow-hidden">
                          <button
                            onClick={(e) => handleDeleteConversation(e, conversation.id)}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors duration-150"
                            disabled={isDeleting}
                          >
                            <RiDeleteBin6Line className="mr-2" size={16} />
                            {isDeleting ? '删除中...' : '删除会话'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {hasMore && (
          <div ref={loadMoreRef} className="py-4 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-4 py-2 text-sm bg-white text-primary-600 border border-primary-200 rounded-md hover:bg-primary-50 transition-colors duration-150 ease-in-out shadow-sm"
            >
              {isLoadingMore ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600 mr-2"></div>
                  加载中...
                </span>
              ) : (
                '加载更多'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
