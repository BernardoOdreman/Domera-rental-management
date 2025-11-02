// Only keep the greeting message for initial chat opening
export const mockResponses: Record<string, string> = {
  default: "Hi there! 👋 I'm your property management assistant. How can I help you today?",
}

// This function will now just return the default greeting
export function findBestMockResponse(userMessage: string): string {
  return mockResponses.default
}
