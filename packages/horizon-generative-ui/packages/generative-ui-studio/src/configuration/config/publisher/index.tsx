import { memo, useCallback, useState } from 'react';
import {
  RiArrowDownSLine,
  RiPlayCircleLine,
} from '@remixicon/react';
import Button from '@/components/base/button';
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/components/base/portal-to-follow-elem';
import SuggestedAction from './suggested-action';
import { useCurrentAgent } from '@/configuration';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn'; // 导入中文语言包

dayjs.extend(relativeTime);

export type AppPublisherProps = {
  disabled?: boolean;
  publishDisabled?: boolean;
  publishedAt?: number;
  /** only needed in workflow / chatflow mode */
  draftUpdatedAt?: number;
  debugWithMultipleModel?: boolean;
  /** modelAndParameter is passed when debugWithMultipleModel is true */
  onPublish?: (params?: any) => Promise<any> | any;
  onRestore?: () => Promise<any> | any;
  onToggle?: (state: boolean) => void;
  crossAxisOffset?: number;
  toolPublished?: boolean;
  onRefreshData?: () => void;
};

const AppPublisher = ({
  disabled = false,
  publishDisabled = false,
  onPublish,
  onRestore,
  onToggle,
  crossAxisOffset = 0,
}: AppPublisherProps) => {
  const [published, setPublished] = useState(false);
  const [open, setOpen] = useState(false);

  const formatTimeFromNow = useCallback((time: number) => {
    return dayjs(time).locale('zh-cn').fromNow();
  }, []);

  const handlePublish = useCallback(async () => {
    try {
      await onPublish?.();
      setPublished(true);
    } catch {
      setPublished(false);
    }
  }, [onPublish]);

  const handleRestore = useCallback(async () => {
    try {
      await onRestore?.();
      setOpen(false);
    } catch {}
  }, [onRestore]);

  const handleTrigger = useCallback(() => {
    const state = !open;

    if (disabled) {
      setOpen(false);
      return;
    }

    onToggle?.(state);
    setOpen(state);

    if (state) setPublished(false);
  }, [disabled, onToggle, open]);

  const {
    data: { publishedAt },
  } = useCurrentAgent();

  return (
    <>
      <PortalToFollowElem
        open={open}
        onOpenChange={setOpen}
        placement="bottom-end"
        offset={{
          mainAxis: 4,
          crossAxis: crossAxisOffset,
        }}
      >
        <PortalToFollowElemTrigger onClick={handleTrigger}>
          <Button variant="primary" className="p-2 px-4" disabled={disabled}>
            保存
            <RiArrowDownSLine className="h-4 w-4 text-components-button-primary-text" />
          </Button>
        </PortalToFollowElemTrigger>
        <PortalToFollowElemContent className="z-[11]">
          <div className="w-[320px] rounded-2xl border-[0.5px] border-components-panel-border bg-components-panel-bg shadow-xl shadow-shadow-shadow-5">
            <div className="p-4 pt-3">
              <div className="system-xs-medium-uppercase flex h-6 items-center text-text-tertiary">
                {publishedAt ? '最新发布' : '未完成发布'}
              </div>
              {publishedAt && (
                <div className="flex items-center justify-between">
                  <div className="system-sm-medium flex items-center text-text-secondary">
                    发布于 {formatTimeFromNow(publishedAt)}
                  </div>
                  <Button
                    variant="secondary-accent"
                    size="small"
                    onClick={handleRestore}
                    disabled={published}
                  >
                    恢复
                  </Button>
                </div>
              )}
              <Button
                variant="primary"
                className="mt-3 w-full"
                onClick={() => handlePublish()}
                disabled={publishDisabled || published}
              >
                {published ? (
                  '完成发布'
                ) : (
                  <div className="flex gap-1">
                    <span>发布更新</span>
                  </div>
                )}
              </Button>
            </div>

            <div className="border-t-[0.5px] border-t-divider-regular p-4 pt-3">
              <SuggestedAction icon={<RiPlayCircleLine className="h-4 w-4" />}>
                导出参数包
              </SuggestedAction>
            </div>
          </div>
        </PortalToFollowElemContent>
      </PortalToFollowElem>
    </>
  );
};

export default memo(AppPublisher);
