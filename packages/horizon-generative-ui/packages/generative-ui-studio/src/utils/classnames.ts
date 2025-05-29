import { twMerge } from 'tailwind-merge'
import classNames from 'classnames'

export const cn = (...cls: classNames.ArgumentArray) => {
  return twMerge(classNames(cls))
}

export default cn
