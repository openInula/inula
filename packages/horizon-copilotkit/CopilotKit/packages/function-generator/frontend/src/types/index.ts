export interface TabFunctionState {
  activeTab: string;
  functionDefinition: string;
  ragRequest: string;
  executorCode: string;
  formData: {
    functionName: string;
    playwrightScript: string;
    basicDescription: string;
    outputDescription: string;
    dependencies: string[];
  };
}

export interface GenerateFunctionRequest {
  functionName: string;
  playwrightScript: string;
  description: string;
  outputDesc: string;
  dependencies: string[];
}

export interface RAGStoreRequest {
  functionDefinition: string;
  metadata: Record<string, any>;
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    description: string;
    type: string;
    required: boolean;
  }>;
  handler: string;
}

export interface GenerateResponse {
  success: boolean;
  functionDefinition?: string; // Changed to string as backend now returns JS code
  executorCode?: string;
  ragRequest?: RAGStoreRequest;
  error?: string;
}