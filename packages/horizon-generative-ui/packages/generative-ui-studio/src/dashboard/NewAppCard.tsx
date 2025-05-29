'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileArrow01, FilePlus01, FilePlus02 } from '@/components/base/icons/src/vender/line/files';
import cn from '@/utils/classnames';

export type CreateAppCardProps = {
  className?: string;
  onCreate?: () => void;
};

const CreateAppCard = ({
  ref,
  className,
  onCreate,
}: CreateAppCardProps & {
  ref: React.RefObject<HTMLDivElement>;
}) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative col-span-1 inline-flex h-full w-full flex-col justify-between rounded-xl border-[0.5px] border-components-card-border bg-components-card-bg',
        className,
      )}
    >
      <div className="grow rounded-t-xl p-2">
        <div className="px-6 pb-1 pt-2 text-xs font-medium leading-[18px] text-text-tertiary">
          创建应用
        </div>
        <button
          onClick={onCreate}
          className="mb-1 flex w-full cursor-pointer items-center rounded-lg px-6 py-[7px] text-[13px] font-medium leading-[18px] text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary"
        >
          <FilePlus01 className="mr-2 h-4 w-4 shrink-0" />
          创建空白应用
        </button>
        <button className="flex w-full cursor-pointer items-center rounded-lg px-6 py-[7px] text-[13px] font-medium leading-[18px] text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary">
          <FilePlus02 className="mr-2 h-4 w-4 shrink-0" />
          从模板开始创建
        </button>
        <button className="flex w-full cursor-pointer items-center rounded-lg px-6 py-[7px] text-[13px] font-medium leading-[18px] text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary">
          <FileArrow01 className="mr-2 h-4 w-4 shrink-0" />
          导入配置文件
        </button>
      </div>
    </div>
  );
};

CreateAppCard.displayName = 'CreateAppCard';
export default CreateAppCard;
export { CreateAppCard };
