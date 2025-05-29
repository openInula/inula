'use client'
import React from 'react'
import type { FC } from 'react'
import { ApiConnection } from '@/components/base/icons/src/vender/solid/development'
import InputVarTypeIcon from '@/components/base/input-var-type-icon'
import { DSLActionType } from '@/models/debug'

export type IInputTypeIconProps = {
  type: 'string' | 'select'
  className: string
}

const IconMap = (type: IInputTypeIconProps['type'], className: string) => {
  const classNames = `w-3.5 h-3.5 ${className}`
  const icons = {
    string: (
      <InputVarTypeIcon type={DSLActionType.link} className={classNames} />
    ),
    paragraph: (
      <InputVarTypeIcon type={DSLActionType.event} className={classNames} />
    ),
    select: (
      <InputVarTypeIcon type={DSLActionType.function} className={classNames} />
    ),
    api: (
      <ApiConnection className={classNames} />
    ),
  }

  return icons[type]
}

const InputTypeIcon: FC<IInputTypeIconProps> = ({
  type,
  className,
}) => {
  const Icon = IconMap(type, className)
  return Icon
}

export default React.memo(InputTypeIcon)
