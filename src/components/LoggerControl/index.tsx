/**
 * 日志控制组件 - 仅在开发环境显示
 */

import { BugOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Select, Space, Switch, Typography } from 'antd';
import React, { useState } from 'react';
import { saveLogConfigToStorage } from '@/config/logger.config';
import { LogLevel, logger } from '@/utils/logger';

const { Text } = Typography;
const { Option } = Select;

const LoggerControl: React.FC = () => {
  const [config, setConfig] = useState(logger.getConfig());
  const [visible, setVisible] = useState(false);

  // 仅在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const logLevelOptions = [
    { value: LogLevel.DEBUG, label: 'DEBUG' },
    { value: LogLevel.NORMAL, label: 'NORMAL' },
    { value: LogLevel.WARN, label: 'WARN' },
    { value: LogLevel.ERROR, label: 'ERROR' },
    { value: LogLevel.OFF, label: 'OFF' },
  ];

  const handleLevelChange = (level: LogLevel) => {
    const newConfig = { ...config, level };
    setConfig(newConfig);
    logger.updateConfig(newConfig);
    saveLogConfigToStorage(newConfig);
    logger.info('Log level changed', { level });
  };

  const handleConsoleToggle = (enableConsole: boolean) => {
    const newConfig = { ...config, enableConsole };
    setConfig(newConfig);
    logger.updateConfig(newConfig);
    saveLogConfigToStorage(newConfig);
    logger.info('Console logging toggled', { enableConsole });
  };

  const handleTimestampToggle = (enableTimestamp: boolean) => {
    const newConfig = { ...config, enableTimestamp };
    setConfig(newConfig);
    logger.updateConfig(newConfig);
    logger.info('Timestamp toggled', { enableTimestamp });
  };

  const handleCallerToggle = (enableCaller: boolean) => {
    const newConfig = { ...config, enableCaller };
    setConfig(newConfig);
    logger.updateConfig(newConfig);
    logger.info('Caller info toggled', { enableCaller });
  };

  const testLogs = () => {
    logger.debug('This is a DEBUG message', { test: true });
    logger.normal('This is a NORMAL message', { test: true });
    logger.warn('This is a WARN message', { test: true });
    logger.error('This is an ERROR message', new Error('Test error'), {
      test: true,
    });
  };

  const clearConsole = () => {
    console.clear();
    logger.info('Console cleared');
  };

  if (!visible) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          cursor: 'pointer',
        }}
        onClick={() => setVisible(true)}
      >
        <Card
          size="small"
          style={{
            backgroundColor: '#f0f0f0',
            border: '1px solid #d9d9d9',
            borderRadius: 6,
          }}
        >
          <Space>
            <BugOutlined />
            <Text type="secondary">Logger</Text>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        width: 300,
      }}
    >
      <Card
        title={
          <Space>
            <SettingOutlined />
            <span>Logger Control</span>
          </Space>
        }
        size="small"
        extra={
          <Button type="text" size="small" onClick={() => setVisible(false)}>
            ×
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Log Level:</Text>
            <Select
              value={config.level}
              onChange={handleLevelChange}
              style={{ width: '100%', marginTop: 4 }}
              size="small"
            >
              {logLevelOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Space>
              <Text>Console:</Text>
              <Switch
                checked={config.enableConsole}
                onChange={handleConsoleToggle}
                size="small"
              />
            </Space>
          </div>

          <div>
            <Space>
              <Text>Timestamp:</Text>
              <Switch
                checked={config.enableTimestamp}
                onChange={handleTimestampToggle}
                size="small"
              />
            </Space>
          </div>

          <div>
            <Space>
              <Text>Caller Info:</Text>
              <Switch
                checked={config.enableCaller}
                onChange={handleCallerToggle}
                size="small"
              />
            </Space>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          <Space>
            <Button size="small" onClick={testLogs}>
              Test Logs
            </Button>
            <Button size="small" onClick={clearConsole}>
              Clear Console
            </Button>
          </Space>

          <div style={{ fontSize: 12, color: '#666' }}>
            <Text type="secondary">
              Current:{' '}
              {logLevelOptions.find((opt) => opt.value === config.level)?.label}
              {config.enableConsole ? ' | Console ON' : ' | Console OFF'}
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default LoggerControl;
