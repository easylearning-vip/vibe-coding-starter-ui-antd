/**
 * 全局日志配置
 */

import { type LogConfig, LogLevel } from '@/utils/logger';

// 环境变量检测
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

/**
 * 开发环境日志配置
 */
export const developmentLogConfig: LogConfig = {
  level: LogLevel.DEBUG, // 开发环境使用debug级别
  enableConsole: true,
  enableTimestamp: true,
  enableCaller: true,
  prefix: '[Vibe-Dev]',
};

/**
 * 生产环境日志配置
 */
export const productionLogConfig: LogConfig = {
  level: LogLevel.OFF, // 生产环境默认禁用Console日志
  enableConsole: false,
  enableTimestamp: false,
  enableCaller: false,
  prefix: '[Vibe-Prod]',
};

/**
 * 测试环境日志配置
 */
export const testLogConfig: LogConfig = {
  level: LogLevel.WARN,
  enableConsole: true,
  enableTimestamp: false,
  enableCaller: false,
  prefix: '[Vibe-Test]',
};

/**
 * 根据环境获取默认配置
 */
export const getDefaultLogConfig = (): LogConfig => {
  if (isDev) {
    return developmentLogConfig;
  }

  if (isProd) {
    return productionLogConfig;
  }

  return testLogConfig;
};

/**
 * 日志级别映射
 */
export const logLevelMap = {
  debug: LogLevel.DEBUG,
  normal: LogLevel.NORMAL,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
  off: LogLevel.OFF,
};

/**
 * 从环境变量或localStorage获取日志配置
 */
export const getLogConfigFromEnv = (): Partial<LogConfig> => {
  const config: Partial<LogConfig> = {};

  // 从环境变量读取
  const envLevel = process.env.REACT_APP_LOG_LEVEL;
  if (envLevel && envLevel in logLevelMap) {
    config.level = logLevelMap[envLevel as keyof typeof logLevelMap];
  }

  const envConsole = process.env.REACT_APP_LOG_CONSOLE;
  if (envConsole !== undefined) {
    config.enableConsole = envConsole === 'true';
  }

  // 从localStorage读取（仅在浏览器环境）
  if (typeof window !== 'undefined') {
    try {
      const storedLevel = localStorage.getItem('vibe_log_level');
      if (storedLevel && storedLevel in logLevelMap) {
        config.level = logLevelMap[storedLevel as keyof typeof logLevelMap];
      }

      const storedConsole = localStorage.getItem('vibe_log_console');
      if (storedConsole !== null) {
        config.enableConsole = storedConsole === 'true';
      }
    } catch (_e) {
      // localStorage可能不可用，忽略错误
    }
  }

  return config;
};

/**
 * 保存日志配置到localStorage
 */
export const saveLogConfigToStorage = (config: Partial<LogConfig>): void => {
  if (typeof window !== 'undefined') {
    try {
      if (config.level !== undefined) {
        const levelName = Object.keys(logLevelMap).find(
          (key) =>
            logLevelMap[key as keyof typeof logLevelMap] === config.level,
        );
        if (levelName) {
          localStorage.setItem('vibe_log_level', levelName);
        }
      }

      if (config.enableConsole !== undefined) {
        localStorage.setItem(
          'vibe_log_console',
          config.enableConsole.toString(),
        );
      }
    } catch (_e) {
      // localStorage可能不可用，忽略错误
    }
  }
};

/**
 * 初始化日志配置
 */
export const initializeLogConfig = (): LogConfig => {
  const defaultConfig = getDefaultLogConfig();
  const envConfig = getLogConfigFromEnv();

  return {
    ...defaultConfig,
    ...envConfig,
  };
};
