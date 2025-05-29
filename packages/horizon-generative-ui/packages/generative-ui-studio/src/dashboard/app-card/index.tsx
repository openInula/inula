'use client';
import cn from '@/utils/classnames';
import type { App } from '@/models/explore';
import AppIcon from '@/components/base/app-icon';
import { Divider, Modal, Tag } from 'antd';
import {
  EditOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  InteractionOutlined,
} from '@ant-design/icons';
import CustomPopover from '@/components/base/popover';
import { RiMoreFill } from '@remixicon/react';
export type AppCardProps = {
  app: App;
  onClick: (id: number) => void;
  onDelete?: (id: number) => void;
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const AppCard = ({ app: appBasicInfo, onClick, onDelete }: AppCardProps) => {
  const Operations = (props: HtmlContentProps) => {
    const onMouseLeave = async () => {
      props.onClose?.();
    };
    const onClickSettings = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      props.onClick?.();
      e.preventDefault();
      // setShowEditModal(true);
    };
    const onClickDelete = async (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();
      const isConfirmed = window.confirm('你确定要执行此操作吗？');
      if (isConfirmed) {
        onDelete?.(appBasicInfo.id);
      }
    };
    return (
      <div className="relative w-full py-1" onMouseLeave={onMouseLeave}>
        <button
          className="mx-1 flex h-8 w-[calc(100%_-_8px)] cursor-pointer items-center gap-2 rounded-lg px-3 py-[6px] hover:bg-state-base-hover"
          onClick={onClickSettings}
        >
          <span className="system-sm-regular text-text-secondary">设置</span>
        </button>
        <div
          className="group mx-1 flex h-8 w-[calc(100%_-_8px)] cursor-pointer items-center gap-2 rounded-lg px-3 py-[6px] hover:bg-state-destructive-hover"
          onClick={onClickDelete}
        >
          <span className="system-sm-regular text-text-secondary group-hover:text-text-destructive">
            删除
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={() => onClick?.(appBasicInfo.id)}
      className={cn(
        'group relative col-span-1 flex cursor-pointer flex-col overflow-visible rounded-lg border-[0.5px] border-components-panel-border bg-components-panel-on-panel-item-bg pb-2 shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg',
      )}
    >
      <div className="flex h-[66px] shrink-0 grow-0 items-center gap-3 px-[14px] pb-3 pt-[14px]">
        <div className="relative shrink-0">
          <AppIcon size="large" />
        </div>
        <div className="w-0 grow py-[1px]">
          <div className="flex items-center text-sm font-semibold leading-5 text-text-secondary">
            <div className="truncate" title={appBasicInfo.name}>
              {appBasicInfo.name}
            </div>
          </div>
        </div>
      </div>
      <div className="description-wrapper system-xs-regular h-[60px] px-[14px] text-text-tertiary">
        <div className="line-clamp-4 group-hover:line-clamp-2">{appBasicInfo.description}</div>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      <div
        className="px-[14px] justify-between"
        style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
      >
        <div>
          {appBasicInfo.publishedAt ? (
            <Tag className="my-[5px]" color="default" icon={<CalendarOutlined />}>
              发布于{formatDate(appBasicInfo.publishedAt)}
            </Tag>
          ) : (
            <Tag className="my-[5px]" color="yellow" icon={<EditOutlined />}>
              未完发布
            </Tag>
          )}
          {appBasicInfo.uiActions?.length ? (
            <Tag className="my-[5px]" color="blue" icon={<InteractionOutlined />}>
              UI 操作 ({appBasicInfo.uiActions.length})
            </Tag>
          ) : null}

          {appBasicInfo.testSets?.length ? (
            <Tag className="my-[5px]" color="green" icon={<ExperimentOutlined />}>
              {appBasicInfo.testSets.length} 项测试
            </Tag>
          ) : null}
        </div>

        <div className="!hidden shrink-0 group-hover:!flex">
          <CustomPopover
            htmlContent={<Operations />}
            position="br"
            trigger="click"
            btnElement={
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md">
                <RiMoreFill className="h-4 w-4 text-text-tertiary" />
              </div>
            }
            btnClassName={(open) =>
              cn(
                open ? '!bg-black/5 !shadow-none' : '!bg-transparent',
                'h-8 w-8 rounded-md border-none !p-2 hover:!bg-black/5',
              )
            }
            popupClassName={'!w-[256px] translate-x-[-224px]'}
            className={'!z-40 h-fit'}
          />
        </div>
      </div>
    </div>
  );
};

export default AppCard;
