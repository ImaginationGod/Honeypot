export const cleanAndParseJSON = (raw) => {
    if (!raw) throw new Error("Empty AI response");

    let cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("No JSON object found in AI response");
    }

    cleaned = cleaned.substring(firstBrace, lastBrace + 1);

    return JSON.parse(cleaned);
};