export const environment = {
  production: true,
  claudeApiUrl: 'https://api.anthropic.com/v1/complete',
  CLAUDE_API_KEY: "YOUR_API_KEY",
  useMockClaudeApi: false,  // Use real Claude API in production
  GEMINI_API_KEY: "YOUR_API_KEY",
  useMockGeminiApi: true,  // Set to false to use the real Gemini API
  firebase: {
    apiKey: 'your-api-key',
    authDomain: 'your-auth-domain',
    projectId: 'your-project-id',
    storageBucket: 'your-storage-bucket',
    messagingSenderId: 'your-messaging-sender-id',
    appId: 'your-app-id'
  }
};
