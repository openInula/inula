/**
 * 环境配置管理器
 * 提供类型安全的环境变量访问
 */

export interface EnvConfig {
  LLM_TOKEN: string;
  // iframe 相关配置
  IFRAME_URL: string;
  MESSAGE_TIMEOUT: number;
  MAX_RETRIES: number;
  RETRY_DELAY: number;
  
  // 应用配置
  DEBUG: boolean;
  NODE_ENV: string;
  
  // 可选配置
  API_BASE_URL?: string;
  APP_TITLE?: string;
}

/**
 * 获取环境变量值
 */
const getEnvValue = (key: string, defaultValue: string = ''): string => {
  // Vite 环境变量
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[key];
    if (typeof value === 'string') {
      return value;
    }
  }
  
  return defaultValue;
};

/**
 * 获取布尔环境变量
 */
const getBooleanEnv = (key: string, defaultValue: boolean = false): boolean => {
  const value = getEnvValue(key).toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
};

/**
 * 获取数字环境变量
 */
const getNumberEnv = (key: string, defaultValue: number = 0): number => {
  const value = getEnvValue(key);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * 环境配置实例
 */
export const envConfig: EnvConfig = {
  LLM_TOKEN: getEnvValue('VITE_LLM_TOKEN'),

  // iframe 配置
  IFRAME_URL: getEnvValue('VITE_IFRAME_URL', 'http://10.189.214.32:5173/'),
  MESSAGE_TIMEOUT: getNumberEnv('VITE_MESSAGE_TIMEOUT', 5000),
  MAX_RETRIES: getNumberEnv('VITE_MAX_RETRIES', 3),
  RETRY_DELAY: getNumberEnv('VITE_RETRY_DELAY', 1000),
  
  // 应用配置
  DEBUG: getBooleanEnv('VITE_DEBUG', false),
  NODE_ENV: getEnvValue('NODE_ENV', 'development'),
  
  // 可选配置
  API_BASE_URL: getEnvValue('VITE_API_BASE_URL') || undefined,
  APP_TITLE: getEnvValue('VITE_APP_TITLE') || undefined,
};

/**
 * 验证必需的环境变量
 */
export const validateEnvConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // 检查必需的配置
  if (!envConfig.IFRAME_URL) {
    errors.push('VITE_IFRAME_URL is required');
  }
  
  try {
    new URL(envConfig.IFRAME_URL);
  } catch {
    errors.push('VITE_IFRAME_URL must be a valid URL');
  }
  
  if (envConfig.MESSAGE_TIMEOUT <= 0) {
    errors.push('VITE_MESSAGE_TIMEOUT must be greater than 0');
  }
  
  if (envConfig.MAX_RETRIES < 0) {
    errors.push('VITE_MAX_RETRIES must be greater than or equal to 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 打印环境配置信息
 */
export const logEnvConfig = (): void => {
  if (envConfig.DEBUG) {
    console.group('🌍 Environment Configuration');
    console.table(envConfig);
    
    const validation = validateEnvConfig();
    if (!validation.isValid) {
      console.warn('❌ Configuration Errors:', validation.errors);
    } else {
      console.log('✅ Configuration is valid');
    }
    console.groupEnd();
  }
};

/**
 * 检查是否为开发环境
 */
export const isDevelopment = (): boolean => {
  return envConfig.NODE_ENV === 'development';
};

/**
 * 检查是否为生产环境
 */
export const isProduction = (): boolean => {
  return envConfig.NODE_ENV === 'production';
};
