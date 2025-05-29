'use client';
import type { FC } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import cn from '@/utils/classnames';
import OperationBtn from '@/configuration/config/base/operation-btn';
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/components/base/portal-to-follow-elem';
import { DSLActionType } from '@/models/debug';
import InputVarTypeIcon from '@/components/base/input-var-type-icon';

type Props = {
  onChange: (value: DSLActionType) => void;
};

type ItemProps = {
  text: string;
  value: string;
  Icon?: any;
  type?: DSLActionType;
  onClick: (value: string) => void;
};

const SelectItem: FC<ItemProps> = ({ text, type, value, Icon, onClick }) => {
  return (
    <div
      className="flex h-8 cursor-pointer items-center rounded-lg px-3 hover:bg-gray-50"
      onClick={() => onClick(value)}
    >
      <InputVarTypeIcon type={type!} className="h-4 w-4 text-gray-500" />
      <div className="ml-2 truncate text-xs text-gray-600">{text}</div>
    </div>
  );
};

const SelectActionsType: FC<Props> = ({ onChange }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const handleChange = (value: string) => {
    onChange(value as DSLActionType);
    setOpen(false);
  };
  return (
    <PortalToFollowElem
      open={open}
      onOpenChange={setOpen}
      placement="bottom-end"
      offset={{
        mainAxis: 8,
        crossAxis: -2,
      }}
    >
      <PortalToFollowElemTrigger onClick={() => setOpen((v) => !v)}>
        <OperationBtn type="add" actionName="添加" className={cn(open && 'bg-gray-200')} />
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent style={{ zIndex: 1000 }}>
        <div className="min-w-[192px] rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-1">
            <SelectItem
              type={DSLActionType.event}
              value="event"
              text="事件"
              onClick={handleChange}
            ></SelectItem>

            <SelectItem
              type={DSLActionType.link}
              value="router"
              text="路由"
              onClick={handleChange}
            ></SelectItem>

            <SelectItem
              type={DSLActionType.function}
              value="function"
              text="函数"
              onClick={handleChange}
            ></SelectItem>
          </div>
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  );
};
export default React.memo(SelectActionsType);
