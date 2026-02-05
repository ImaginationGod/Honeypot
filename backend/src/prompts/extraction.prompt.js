export const extractionPrompt = (history) => `
You are a fraud intelligence extractor.

From the conversation below, extract ALL POSSIBLE indicators of a scam.

Rules:
- Any string matching something@something is a UPI ID
- Any amount with ₹, rupees, Rs is a payment attempt
- Words like blocked, urgent, immediately, pay, verify are suspicious
- Even if unsure, INCLUDE the value

Return strict JSON:
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
