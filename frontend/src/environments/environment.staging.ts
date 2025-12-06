export const environment = {
  production: false,
  apiUrl: 'https://<STAGING_ALB_DNS_NAME>/api',
  appName: 'NebulaMart (Staging)',
  version: '1.0.0',
  enableDevTools: true,
  logLevel: 'info',
  aws: {
    region: 'us-east-1',
    cognito: {
      userPoolId: '<STAGING_COGNITO_USER_POOL_ID>',
      userPoolClientId: '<STAGING_COGNITO_USER_POOL_CLIENT_ID>'
    }
  },
  features: {
    enablePWA: true,
    enableAnalytics: false,
    enableChatSupport: false
  }
};