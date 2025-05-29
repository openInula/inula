export type Inputs = Record<string, string | number | object>

export enum PromptMode {
  simple = 'simple',
  advanced = 'advanced',
}

export type PromptItem = {
  role?: PromptRole
  text: string
}

export type ChatPromptConfig = {
  prompt: PromptItem[]
}

export type ConversationHistoriesRole = {
  user_prefix: string
  assistant_prefix: string
}
export type CompletionPromptConfig = {
  prompt: PromptItem
  conversation_histories_role: ConversationHistoriesRole
}

export type BlockStatus = {
  context: boolean
  history: boolean
  query: boolean
}

export enum PromptRole {
  system = 'system',
  user = 'user',
  assistant = 'assistant',
}

export type PromptVariable = {
  key: string
  name: string
  type: string // "string" | "number" | "select",
  default?: string | number
  required?: boolean
  options?: string[]
  max_length?: number
  is_context_var?: boolean
  enabled?: boolean
  config?: Record<string, any>
  icon?: string
  icon_background?: string
}

export type DSLRouteAction = {
  key: string
  type: DSLActionType.link
  description: string
  target: string
}

export type DSLEventAction = {
  key: string
  type: DSLActionType.event
  eventName: string
  param: Record<string, any>
}

export type DSLFunctionAction = {
  key: string
  type: DSLActionType.function
  eventName: string
  param: Record<string, any>
}


export type PromptDSLAction =
  | DSLRouteAction
  | DSLEventAction
  | DSLFunctionAction

export type CompletionParams = {
  max_tokens: number
  temperature: number
  top_p: number
  presence_penalty: number
  frequency_penalty: number
  stop?: string[]
}

export type ModelId = 'gpt-3.5-turbo' | 'text-davinci-003'

export type AgentConfig = {
  id: number;
  description: string;
  promptTemplate: string
  userData: string
  promptQueries: string
  uiActions: PromptDSLAction[]
  publishedAt?: string;
  templateQuestions: TemplateQuestion[] | null
}

export type MoreLikeThisConfig = {
  enabled: boolean
}

export type SuggestedQuestionsAfterAnswerConfig = MoreLikeThisConfig

export type SpeechToTextConfig = MoreLikeThisConfig

export type TextToSpeechConfig = {
  enabled: boolean
  voice?: string
  language?: string
  autoPlay?: TtsAutoPlay
}

export type CitationConfig = MoreLikeThisConfig

export type AnnotationReplyConfig = {
  id: string
  enabled: boolean
  score_threshold: number
  embedding_model: {
    embedding_provider_name: string
    embedding_model_name: string
  }
}

export type ModerationContentConfig = {
  enabled: boolean
  preset_response?: string
}
export type ModerationConfig = MoreLikeThisConfig & {
  type?: string
  config?: {
    keywords?: string
    api_based_extension_id?: string
    inputs_config?: ModerationContentConfig
    outputs_config?: ModerationContentConfig
  } & Partial<Record<string, any>>
}

export interface TemplateQuestion {
  id?: number;
  content: string;
}

export type RetrieverResourceConfig = MoreLikeThisConfig
// frontend use. Not the same as backend
export type ModelConfig = {
  provider: string // LLM Provider: for example "OPENAI"
  model_id: string
  configs: AgentConfig
  opening_statement: string | null
  more_like_this: MoreLikeThisConfig | null
  speech_to_text: SpeechToTextConfig | null
  text_to_speech: TextToSpeechConfig | null
  retriever_resource: RetrieverResourceConfig | null
  sensitive_word_avoidance: ModerationConfig | null
  annotation_reply: AnnotationReplyConfig | null
}
export type DatasetConfigItem = {
  enable: boolean
  value: number
}


export type DebugRequestBody = {
  inputs: Inputs
  query: string
  completion_params: CompletionParams
  model_config: ModelConfig
}

export type DebugResponse = {
  id: string
  answer: string
  created_at: string
}

export type DebugResponseStream = {
  id: string
  data: string
  created_at: string
}

export type FeedBackRequestBody = {
  message_id: string
  rating: 'like' | 'dislike'
  content?: string
  from_source: 'api' | 'log'
}

export type FeedBackResponse = {
  message_id: string
  rating: 'like' | 'dislike'
}

// Log session list
export type LogSessionListQuery = {
  keyword?: string
  start?: string // format datetime(YYYY-mm-dd HH:ii)
  end?: string // format datetime(YYYY-mm-dd HH:ii)
  page: number
  limit: number // default 20. 1-100
}

export type LogSessionListResponse = {
  data: {
    id: string
    conversation_id: string
    query: string // user's query question
    message: string // prompt send to LLM
    answer: string
    created_at: string
  }[]
  total: number
  page: number
}

// log session detail and debug
export type LogSessionDetailResponse = {
  id: string
  conversation_id: string
  model_provider: string
  query: string
  inputs: Record<string, string | number | object>[]
  message: string
  message_tokens: number // number of tokens in message
  answer: string
  answer_tokens: number // number of tokens in answer
  provider_response_latency: number // used time in ms
  from_source: 'api' | 'log'
}

export type SavedMessage = {
  id: string
  answer: string
}

export enum DSLActionType {
  event = 'event',
  link = 'router',
  function = 'function',
}