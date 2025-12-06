export const environment = {
  production: true,
  apiUrl: 'https://<ALB_DNS_NAME>/api',
  appName: 'NebulaMart',
  version: '1.0.0',
  enableDevTools: false,
  logLevel: 'error',
  aws: {
    region: 'us-east-1',
    cognito: {
      userPoolId: '<COGNITO_USER_POOL_ID>',
      userPoolClientId: '<COGNITO_USER_POOL_CLIENT_ID>'
    }
  },
  features: {
    enablePWA: true,
    enableAnalytics: true,
    enableChatSupport: true
  }
};