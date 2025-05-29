import React, { useState } from 'react'
import { ArrowLeftIcon, Squares2X2Icon } from '@heroicons/react/24/solid'
import classNames from '@/utils/classnames'
import type { AppDetailResponse } from '@/models/app'

type IAppBackProps = {
  curApp: AppDetailResponse
}
export default function AppBack({ curApp }: IAppBackProps) {

  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={classNames(`
        flex items-center h-7 pl-2.5 pr-2
        text-[#1C64F2] font-semibold cursor-pointer
        rounded-[10px]
        ${curApp && 'hover:bg-[#EBF5FF]'}
      `)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {
        (hovered && curApp)
          ? <ArrowLeftIcon className='mr-1 h-[18px] w-[18px]' />
          : <Squares2X2Icon className='mr-1 h-[18px] w-[18px]' />
      }
      应用
    </div>
  )
}
