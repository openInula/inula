'use client'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import cn from '@/utils/classnames'
import type { InputVarType } from '@/components/workflow/types'
export type ISelectTypeItemProps = {
  type: InputVarType
  selected: boolean
  onClick: () => void
}

const i18nFileTypeMap: Record<string, string> = {
  'file': 'single-file',
  'file-list': 'multi-files',
}

const SelectTypeItem: FC<ISelectTypeItemProps> = ({
  type,
  selected,
  onClick,
}) => {
  const typeName = type

  return (
    <div
      className={cn(
        'flex h-[58px] flex-col items-center justify-center space-y-1 rounded-lg border border-components-option-card-option-border bg-components-option-card-option-bg text-text-secondary',
        selected ? 'system-xs-medium border-[1.5px] border-components-option-card-option-selected-border bg-components-option-card-option-selected-bg shadow-xs' : ' system-xs-regular cursor-pointer hover:border-components-option-card-option-border-hover hover:bg-components-option-card-option-bg-hover hover:shadow-xs')}
      onClick={onClick}
    >
      <div className='shrink-0'>
      </div>
      <span>{typeName}</span>
    </div>
  )
}
export default React.memo(SelectTypeItem)
