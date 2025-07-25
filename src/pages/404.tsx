import { history, useIntl } from '@umijs/max';
import { Button, Card, Result } from 'antd';
import React from 'react';

const NoFoundPage: React.FC = () => {
  const intl = useIntl();

  return (
    <Card variant="borderless">
      <Result
        status="404"
        title="404"
        subTitle={intl.formatMessage({ id: 'pages.404.subTitle' })}
        extra={
          <Button type="primary" onClick={() => history.push('/')}>
            {intl.formatMessage({ id: 'pages.404.buttonText' })}
          </Button>
        }
      />
    </Card>
  );
};

export default NoFoundPage;
