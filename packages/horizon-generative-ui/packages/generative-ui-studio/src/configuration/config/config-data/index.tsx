import { ReactNode, useState } from 'react';
import PromptEditorHeightResizeWrap from './prompt-editor-height-resize-wrap';
import PromptEditor from '@/components/prompt-editor';
import cn from '@/utils/classnames';
import Tooltip from '@/components/base/tooltip';
import { RiSettingsLine } from '@remixicon/react';
import OperationBtn from '../base/operation-btn';
import { Drawer, Space } from 'antd';
import { dslSystemPrompt } from 'generative-ui-core';

export type PromptProps = {
  promptTemplate: string;
  className: string;
  title: ReactNode;
  readonly?: boolean;
  onChange?: (prompt: string) => void;
  noTitle?: boolean;
  gradientBorder?: boolean;
  editorHeight?: number;
  noResize?: boolean;
};

function DataConfig({
  promptTemplate,
  readonly = false,
  onChange,
  title,
  noTitle,
  editorHeight: initEditorHeight,
  className = '',
  noResize,
}: PromptProps) {
  const minHeight = initEditorHeight || 228;
  const [editorHeight, setEditorHeight] = useState(minHeight);
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div
      className={cn(
        className,
        'relative rounded-xl bg-gradient-to-r from-components-input-border-active-prompt-1 to-components-input-border-active-prompt-2 p-0.5 shadow-xs',
      )}
    >
      <div className="rounded-xl bg-background-section-burn">
        {!noTitle && (
          <div className="flex h-11 items-center justify-between pl-3 pr-2.5">
            <div className="flex items-center space-x-1">
              <div className="h2 system-sm-semibold-uppercase text-text-secondary">{title}</div>
              {!readonly && <Tooltip popupContent={<div className="w-[180px]">promptTip</div>} />}
            </div>
          </div>
        )}
        <PromptEditorHeightResizeWrap
          className="min-h-[228px] rounded-t-xl bg-background-default px-4 pt-2 text-sm text-text-secondary"
          height={editorHeight}
          minHeight={minHeight}
          onHeightChange={setEditorHeight}
          hideResize={noResize}
          footer={
            <div className="flex rounded-b-xl bg-background-default pb-2 pl-4">
              <div className="h-[18px] rounded-md bg-components-badge-bg-gray-soft px-1 text-xs leading-[18px] text-text-tertiary">
                {promptTemplate.length}
              </div>
            </div>
          }
        >
          <PromptEditor
            className="min-h-[210px]"
            compact
            value={promptTemplate}
            historyBlock={{
              show: false,
              selectable: false,
              history: {
                user: '',
                assistant: '',
              },
              onEditRole: () => {},
            }}
            queryBlock={{
              show: false,
            }}
            onChange={(value) => {
              onChange?.(value);
            }}
            onBlur={() => {
              onChange?.(promptTemplate);
            }}
            editable={!readonly}
          />
        </PromptEditorHeightResizeWrap>
      </div>
    </div>
  );
}
export default DataConfig;
