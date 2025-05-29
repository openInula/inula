import { createContext, useContext } from 'use-context-selector'
import { PromptMode } from '@/models/debug'
import type {
  AnnotationReplyConfig,
  BlockStatus,
  ChatPromptConfig,
  CitationConfig,
  CompletionPromptConfig,
  ConversationHistoriesRole,
  Inputs,
  ModelConfig,
  ModerationConfig,
  MoreLikeThisConfig,
  AgentConfig,
  PromptItem,
  SpeechToTextConfig,
  SuggestedQuestionsAfterAnswerConfig,
  TextToSpeechConfig,
} from '@/models/debug'

const noop = () => { }

type IDebugConfiguration = {
  prevPromptConfig: AgentConfig
  setPrevPromptConfig: (prevPromptConfig: AgentConfig) => void
  promptConfig: AgentConfig
  setPromptConfig: (promptConfig: AgentConfig) => void
}

const DebugConfigurationContext = createContext<IDebugConfiguration>({
  prevPromptConfig: {
    promptTemplate: '',
    uiActions: [],
    userData: '',
    promptQueries: ''
  },
  setPrevPromptConfig: noop,
  promptConfig: {
    // provider: 'OPENAI', // 'OPENAI'
    // model_id: 'gpt-3.5-turbo', // 'gpt-3.5-turbo'
    promptTemplate: '',
    uiActions: [],
    userData: '',
    promptQueries: ''
  },
  setPromptConfig: noop,
})

export const useDebugConfigurationContext = () => useContext(DebugConfigurationContext)

export default DebugConfigurationContext
