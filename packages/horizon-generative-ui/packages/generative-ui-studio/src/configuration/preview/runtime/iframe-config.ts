import { envConfig, validateEnvConfig } from '../../../utils/env-config';

/**
 * iframe 配置常量
 */
export const IFRAME_CONFIG = {
  // iframe URL
  URL: envConfig.IFRAME_URL,
  
  // iframe 安全配置
  SANDBOX_PERMISSIONS: [
    'allow-scripts',
    'allow-same-origin', 
    'allow-forms',
    'allow-popups',
    'allow-top-navigation-by-user-activation'
  ] as const,
  
  // iframe 允许的功能
  ALLOW_FEATURES: [
    'fullscreen',
    'camera',
    'microphone',
    'geolocation'
  ] as const,
  
  // 通信配置
  MESSAGE_TIMEOUT: envConfig.MESSAGE_TIMEOUT,
  RETRY_CONFIG: {
    maxRetries: envConfig.MAX_RETRIES,
    retryDelay: envConfig.RETRY_DELAY,
  },
  
  // 调试模式
  DEBUG: envConfig.DEBUG,
} as const;

/**
 * 获取iframe的origin
 */
export const getIframeOrigin = (): string => {
  try {
    return new URL(IFRAME_CONFIG.URL).origin;
  } catch (error) {
    console.error('Invalid iframe URL:', IFRAME_CONFIG.URL, error);
    return '*'; // 降级到通配符，但生产环境不推荐
  }
};

/**
 * 验证iframe URL是否有效
 */
export const validateIframeUrl = (url: string = IFRAME_CONFIG.URL): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * 验证iframe配置
 */
export const validateIframeConfig = (): { isValid: boolean; errors: string[] } => {
  const baseValidation = validateEnvConfig();
  const errors = [...baseValidation.errors];
  
  // 额外的iframe特定验证
  if (!validateIframeUrl()) {
    errors.push(`Invalid iframe URL: ${IFRAME_CONFIG.URL}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 打印配置信息（调试用）
 */
export const logConfig = (): void => {
  if (IFRAME_CONFIG.DEBUG) {
    console.group('🔧 Iframe Configuration');
    console.log('📍 URL:', IFRAME_CONFIG.URL);
    console.log('🔒 Origin:', getIframeOrigin());
    console.log('🛡️ Sandbox:', IFRAME_CONFIG.SANDBOX_PERMISSIONS.join(', '));
    console.log('🎯 Features:', IFRAME_CONFIG.ALLOW_FEATURES.join(', '));
    console.log('⏱️ Timeout:', IFRAME_CONFIG.MESSAGE_TIMEOUT + 'ms');
    console.log('🔄 Max Retries:', IFRAME_CONFIG.RETRY_CONFIG.maxRetries);
    console.log('⏳ Retry Delay:', IFRAME_CONFIG.RETRY_CONFIG.retryDelay + 'ms');
    console.log('🐛 Debug Mode:', IFRAME_CONFIG.DEBUG);
    
    const validation = validateIframeConfig();
    if (!validation.isValid) {
      console.warn('❌ Configuration Errors:', validation.errors);
    } else {
      console.log('✅ Configuration is valid');
    }
    console.groupEnd();
  }
};
