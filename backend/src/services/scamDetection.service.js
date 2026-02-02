import { chatPrompt } from "./openrouter.service.js";
import { scamDetectionPrompt } from "../prompts/scamDetection.prompt.js";
import { MODELS } from "../constants/models.js";
import { cleanAndParseJSON } from "../utils/jsonCleaner.js";

export const detectScam = async (message) => {
    const output = await chatPrompt(MODELS.DETECTION, [
        { role: "user", content: scamDetectionPrompt(message) }
    ]);
    return cleanAndParseJSON(output);
};
