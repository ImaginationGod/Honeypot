export const extractionPrompt = (history) => `
Extract scam intelligence from this conversation.

Return ONLY JSON:
{
  "bank_accounts": [],
  "upi_ids": [],
  "phishing_urls": []
}

Conversation:
${history}
`;
