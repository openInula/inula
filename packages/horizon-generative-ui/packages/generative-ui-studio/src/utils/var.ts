import { DSLActionType, PromptDSLAction } from '@/models/debug'

export const getNewDSLAction = (key: string, type: DSLActionType): PromptDSLAction => {
  if (type === DSLActionType.link) {
    return {
      type,
      key,
      target: '',
      description: ''
    }
  } else if (type === DSLActionType.event) {
    return {
      type,
      key,
      eventName: '',
      param: {}
    }
  }

  throw new Error('unpported dsl actions type')
}
