import { chatPrompt } from "./openrouter.service.js";
import { extractionPrompt } from "../prompts/extraction.prompt.js";
import { MODELS } from "../constants/models.js";
import { cleanAndParseJSON } from "../utils/jsonCleaner.js";

export const extractIntel = async (history) => {
    const output = await chatPrompt(MODELS.EXTRACTION, [
        { role: "user", content: extractionPrompt(history) }
    ]);
    return cleanAndParseJSON(output);};
