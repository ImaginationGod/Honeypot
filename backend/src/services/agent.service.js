import { chatPrompt } from "./openrouter.service.js";
import { agentPersonaPrompt } from "../prompts/agentPersona.prompt.js";
import { MODELS } from "../constants/models.js";

export const runAgent = async (history) => {
    return chatPrompt(MODELS.AGENT, [
        { role: "user", content: agentPersonaPrompt(history) }
    ]);
};
