export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'NebulaMart',
  version: '1.0.0',
  enableDevTools: true,
  logLevel: 'debug',
  aws: {
    region: 'us-east-1',
    cognito: {
      userPoolId: 'us-east-1_example',
      userPoolClientId: 'example_client_id'
    }
  },
  features: {
    enablePWA: false,
    enableAnalytics: false,
    enableChatSupport: false
  }
};