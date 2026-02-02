export const scamDetectionPrompt = (message) => `
You are a scam detection system for a honeypot.

Classify a message as scam = true if:
- It mentions money, refund, prize, cashback, winnings, payment, transfer
- OR it asks to "share details", "verify", "confirm", "update"
- OR it is vague but related to financial action
- Early-stage scam messages SHOULD be marked as scam=true

Be cautious of false negatives. False positives are acceptable.

Message:
"${message}"

Respond ONLY in valid JSON:
{
  "scam": boolean,
  "confidence": number,
  "reason": string
}
`;
