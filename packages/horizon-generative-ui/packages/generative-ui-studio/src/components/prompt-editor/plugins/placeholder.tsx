import { memo } from 'react'
import cn from '@/utils/classnames'

const Placeholder = ({
  compact,
  value,
  className,
}: {
  compact?: boolean
  value?: string
  className?: string
}) => {

  return (
    <div className={cn(
      className,
      'pointer-events-none absolute left-0 top-0 h-full w-full select-none text-sm text-components-input-text-placeholder',
      compact ? 'text-[13px] leading-5' : 'text-sm leading-6',
    )}>
      {value || '请输入领域背景相关的提示词'}
    </div>
  )
}

export default memo(Placeholder)
