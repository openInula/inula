'use client'
import type { FC } from 'react'
import React, { useState } from 'react'
import {
  RiDeleteBinLine,
  RiEditLine,
} from '@remixicon/react'
import type { IInputTypeIconProps } from './input-type-icon'
import IconTypeIcon from './input-type-icon'
import { BracketsX as VarIcon } from '@/components/base/icons/src/vender/line/development'
import cn from '@/utils/classnames'
import { PromptDSLAction, DSLActionType } from '@/models/debug'

type ItemProps = {
  readonly?: boolean
  action: PromptDSLAction;
  type: string
  onEdit: () => void
  onRemove: () => void
}

const getActionContent = (action: PromptDSLAction) => {
  switch (action.type) {
    case DSLActionType.link:
      return <div className='truncate'>
        <span className='system-sm-medium text-text-secondary'>{action.target}</span>
        <span className='system-xs-regular px-1 text-text-quaternary'>·</span>
        <span className='system-xs-medium text-text-tertiary'>{action.description}</span>
      </div>
    case DSLActionType.event:
      return <div className='truncate'>
      <span className='system-sm-medium text-text-secondary'>{action.eventName}</span>
      <span className='system-xs-regular px-1 text-text-quaternary'>·</span>
      <span className='system-xs-medium text-text-tertiary'>{JSON.stringify(action.param)}</span>
    </div>
    default:
      return ''
  }

}
const VarItem: FC<ItemProps> = ({
  readonly,
  action,
  type,
  onEdit,
  onRemove,
}) => {
  const [isDeleting, setIsDeleting] = useState(false)


  return (
    <div className={cn('group relative mb-1 flex h-[34px] w-full items-center  rounded-lg border-[0.5px] border-components-panel-border-subtle bg-components-panel-on-panel-item-bg pl-2.5 pr-3 shadow-xs last-of-type:mb-0 hover:bg-components-panel-on-panel-item-bg-hover hover:shadow-sm', isDeleting && 'border-state-destructive-border hover:bg-state-destructive-hover', readonly && 'cursor-not-allowed opacity-30')}>
      <VarIcon className='mr-1 h-4 w-4 shrink-0 text-text-accent' />
      <div className='flex w-0 grow items-center'>
        {getActionContent(action)}
      </div>
      <div className='shrink-0'>
        <div className={cn('flex items-center', !readonly && 'group-hover:hidden')}>
          <span className='system-xs-regular pl-2 pr-1 text-text-tertiary'>{type}</span>
          <IconTypeIcon type={type as IInputTypeIconProps['type']} className='text-text-tertiary' />
        </div>
        <div className={cn('hidden items-center justify-end rounded-lg', !readonly && 'group-hover:flex')}>
          <div
            className='mr-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md hover:bg-black/5'
            onClick={onEdit}
          >
            <RiEditLine className='h-4 w-4 text-text-tertiary' />
          </div>
          <div
            className='flex h-6 w-6 cursor-pointer items-center  justify-center text-text-tertiary hover:text-text-destructive'
            onClick={onRemove}
            onMouseOver={() => setIsDeleting(true)}
            onMouseLeave={() => setIsDeleting(false)}
          >
            <RiDeleteBinLine className='h-4 w-4' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default VarItem
