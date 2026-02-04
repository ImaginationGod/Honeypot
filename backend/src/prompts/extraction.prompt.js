export const extractionPrompt = (history) => `
You are a fraud intelligence extraction system.

Extract ALL scam indicators from the conversation.
If something is clearly implied, infer it.

Return ONLY valid JSON in this exact format:
{
  "bankAccounts": [],
  "upiIds": [],
  "phishingLinks": [],
  "phoneNumbers": [],
  "suspiciousKeywords": [],
  "agentNotes": ""
}

Conversation:
${history}
`;
