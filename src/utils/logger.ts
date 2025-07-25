/**
 * 统一日志管理系统
 * 支持normal和debug两种日志级别
 * 支持全局日志级别配置
 */

export enum LogLevel {
  DEBUG = 0,
  NORMAL = 1,
  WARN = 2,
  ERROR = 3,
  OFF = 4,
}

export interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableTimestamp: boolean;
  enableCaller: boolean;
  prefix?: string;
}

class Logger {
  private config: LogConfig;
  private static instance: Logger;

  private constructor() {
    // 根据环境设置默认配置
    const isDev = process.env.NODE_ENV === 'development';

    this.config = {
      level: isDev ? LogLevel.DEBUG : LogLevel.OFF, // 开发环境默认debug级别，生产环境默认禁用
      enableConsole: isDev, // 生产环境默认禁用Console日志
      enableTimestamp: true,
      enableCaller: isDev,
      prefix: '[Vibe-Coding]',
    };
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 更新日志配置
   */
  public updateConfig(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  public getConfig(): LogConfig {
    return { ...this.config };
  }

  /**
   * 设置日志级别
   */
  public setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * 启用/禁用Console日志
   */
  public setConsoleEnabled(enabled: boolean): void {
    this.config.enableConsole = enabled;
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(
    level: string,
    message: string,
    ..._args: any[]
  ): string {
    const parts: string[] = [];

    if (this.config.prefix) {
      parts.push(this.config.prefix);
    }

    if (this.config.enableTimestamp) {
      parts.push(new Date().toISOString());
    }

    parts.push(`[${level}]`);

    if (this.config.enableCaller) {
      const stack = new Error().stack;
      if (stack) {
        const caller = stack.split('\n')[4]; // 获取调用者信息
        if (caller) {
          const match = caller.match(/at\s+(.+)\s+\((.+):(\d+):(\d+)\)/);
          if (match) {
            const [, _func, file, line] = match;
            const fileName = file.split('/').pop();
            parts.push(`${fileName}:${line}`);
          }
        }
      }
    }

    parts.push(message);

    return parts.join(' ');
  }

  /**
   * 检查是否应该输出日志
   */
  private shouldLog(level: LogLevel): boolean {
    return this.config.enableConsole && level >= this.config.level;
  }

  /**
   * DEBUG级别日志
   */
  public debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage('DEBUG', message, ...args);
      console.debug(formattedMessage, ...args);
    }
  }

  /**
   * NORMAL级别日志（相当于INFO）
   */
  public normal(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.NORMAL)) {
      const formattedMessage = this.formatMessage('INFO', message, ...args);
      console.log(formattedMessage, ...args);
    }
  }

  /**
   * INFO级别日志（别名）
   */
  public info(message: string, ...args: any[]): void {
    this.normal(message, ...args);
  }

  /**
   * WARN级别日志
   */
  public warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage('WARN', message, ...args);
      console.warn(formattedMessage, ...args);
    }
  }

  /**
   * ERROR级别日志
   */
  public error(message: string, error?: Error, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage('ERROR', message, ...args);
      if (error) {
        console.error(formattedMessage, error, ...args);
      } else {
        console.error(formattedMessage, ...args);
      }
    }
  }

  /**
   * 分组日志开始
   */
  public group(label: string): void {
    if (this.config.enableConsole) {
      console.group(this.formatMessage('GROUP', label));
    }
  }

  /**
   * 分组日志结束
   */
  public groupEnd(): void {
    if (this.config.enableConsole) {
      console.groupEnd();
    }
  }

  /**
   * 表格日志
   */
  public table(data: any): void {
    if (this.config.enableConsole && this.shouldLog(LogLevel.DEBUG)) {
      console.table(data);
    }
  }

  /**
   * 计时开始
   */
  public time(label: string): void {
    if (this.config.enableConsole && this.shouldLog(LogLevel.DEBUG)) {
      console.time(label);
    }
  }

  /**
   * 计时结束
   */
  public timeEnd(label: string): void {
    if (this.config.enableConsole && this.shouldLog(LogLevel.DEBUG)) {
      console.timeEnd(label);
    }
  }
}

// 导出单例实例
export const logger = Logger.getInstance();

// 导出便捷方法
export const debug = (message: string, ...args: any[]) =>
  logger.debug(message, ...args);
export const normal = (message: string, ...args: any[]) =>
  logger.normal(message, ...args);
export const info = (message: string, ...args: any[]) =>
  logger.info(message, ...args);
export const warn = (message: string, ...args: any[]) =>
  logger.warn(message, ...args);
export const error = (message: string, error?: Error, ...args: any[]) =>
  logger.error(message, error, ...args);

export default logger;
