import { RiHistoryLine } from '@remixicon/react';
import { Preview } from './Preview';
import Button from '@/components/base/button';
import { useState } from 'react';
import { ConversationsList } from './chat-history';
import cn from '@/utils/classnames';

export function PreviewWrapper({ className, ...props }) {
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  return (
    <div className={cn('flex-1 flex flex-col pt-4', className)}>
      <div className="flex justify-between items-center px-8 pb-2">
        <div className="h2 system-sm-semibold-uppercase text-text-secondary">调试预览</div>
        <Button variant="ghost" onClick={() => setShowHistory((v) => !v)}>
          <RiHistoryLine className="h-5 w-5 shrink-0 " />
        </Button>
      </div>
      <div className="flex-1">
        {showHistory && (
          <ConversationsList setMessages={setMessages} onClose={() => setShowHistory(false)} />
        )}
        <div style={{ display: showHistory ? 'none' : 'block' }} className="h-full">
          <Preview messages={messages} setMessages={setMessages} {...props} />
        </div>
      </div>
    </div>
  );
}
