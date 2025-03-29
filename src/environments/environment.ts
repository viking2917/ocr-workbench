// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
  production: false,
  claudeApiUrl: 'https://api.anthropic.com/v1/complete',
  CLAUDE_API_KEY: "YOUR_API_KEY",
  useMockClaudeApi: true,  // Set to false to use the real Claude API
  GEMINI_API_KEY: "YOUR_API_KEY",
  useMockGeminiApi: false, // true,  // Set to false to use the real Gemini API
  firebase: {
    apiKey: 'your-api-key',
    authDomain: 'your-auth-domain',
    projectId: 'your-project-id',
    storageBucket: 'your-storage-bucket',
    messagingSenderId: 'your-messaging-sender-id',
    appId: 'your-app-id'
  }
};
