import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { Helmet, history, useIntl } from '@umijs/max';
import { Alert, App } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { Footer } from '@/components';
import { register } from '@/services/user/api';
import { logger } from '@/utils/logger';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles((_) => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const RegisterMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Register: React.FC = () => {
  const intl = useIntl();
  const [registerState, setRegisterState] = useState<{
    status?: string;
    message?: string;
  }>({});
  const { styles } = useStyles();
  const { message } = App.useApp();

  const handleSubmit = async (values: UserAPI.RegisterRequest) => {
    try {
      logger.debug('User registration attempt', {
        username: values.username,
        email: values.email,
      });
      const response = await register(values);
      if (response.id) {
        logger.info('Registration successful', {
          userId: response.id,
          username: values.username,
        });
        const successMessage = intl.formatMessage({
          id: 'pages.register.success',
        });
        message.success(successMessage);

        // 跳转到登录页面
        logger.debug('Redirecting to login page after registration');
        history.push('/user/login');
        return;
      }
    } catch (error: any) {
      const failureMessage = intl.formatMessage({
        id: 'pages.register.failure',
      });
      logger.error('Registration failed', error, {
        username: values.username,
        email: values.email,
      });
      message.error(error.message || failureMessage);
      setRegisterState({ status: 'error', message: error.message });
    }
  };

  const { status } = registerState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({ id: 'pages.register.title' })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="Vibe Coding Admin"
          subTitle={intl.formatMessage({ id: 'pages.register.subtitle' })}
          submitter={{
            searchConfig: {
              submitText: intl.formatMessage({ id: 'pages.register.submit' }),
            },
          }}
          onFinish={async (values) => {
            await handleSubmit(values as UserAPI.RegisterRequest);
          }}
        >
          {status === 'error' && (
            <RegisterMessage
              content={intl.formatMessage({ id: 'pages.register.error' })}
            />
          )}

          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.register.username.placeholder',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.register.username.required',
                }),
              },
              {
                min: 3,
                max: 50,
                message: intl.formatMessage({
                  id: 'pages.register.username.length',
                }),
              },
            ]}
          />

          <ProFormText
            name="email"
            fieldProps={{
              size: 'large',
              prefix: <MailOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.register.email.placeholder',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.register.email.required',
                }),
              },
              {
                type: 'email',
                message: intl.formatMessage({
                  id: 'pages.register.email.invalid',
                }),
              },
            ]}
          />

          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.register.password.placeholder',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.register.password.required',
                }),
              },
              {
                min: 6,
                message: intl.formatMessage({
                  id: 'pages.register.password.min',
                }),
              },
            ]}
          />

          <ProFormText.Password
            name="confirmPassword"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.register.confirmPassword.placeholder',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.register.confirmPassword.required',
                }),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      intl.formatMessage({
                        id: 'pages.register.confirmPassword.mismatch',
                      }),
                    ),
                  );
                },
              }),
            ]}
          />

          <ProFormText
            name="nickname"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.register.nickname.placeholder',
            })}
            rules={[
              {
                max: 50,
                message: intl.formatMessage({
                  id: 'pages.register.nickname.max',
                }),
              },
            ]}
          />

          <div
            style={{
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            <a href="/user/login">
              {intl.formatMessage({ id: 'pages.register.login' })}
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
