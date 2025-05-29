'use client'
import type { FC } from 'react'
import React from 'react'
import { RiAlignLeft, RiCheckboxMultipleLine, RiFileCopy2Line, RiFileList2Line, RiHashtag, RiTextSnippet } from '@remixicon/react'
import { DSLActionType } from '@/models/debug'

type Props = {
  className?: string
  type: DSLActionType
}

const getIcon = (type: DSLActionType) => {
  return ({
    [DSLActionType.event]: RiTextSnippet,
    [DSLActionType.function]: RiAlignLeft,
    [DSLActionType.link]: RiCheckboxMultipleLine,
  } as any)[type] || RiTextSnippet
}

const DSLActionTypeIcon: FC<Props> = ({
  className,
  type,
}) => {
  const Icon = getIcon(type)
  return (
    <Icon className={className} />
  )
}
export default React.memo(DSLActionTypeIcon)
