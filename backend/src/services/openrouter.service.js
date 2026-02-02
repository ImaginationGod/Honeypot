import axios from "axios";
import { OPENROUTER_API_KEY } from "../config/env.js";
import { OPENROUTER_URL } from "../config/openrouter.js";

export const chatPrompt = async (model, messages) => {
    const response = await axios.post(
        OPENROUTER_URL,
        { model, messages, temperature: 0.3, max_tokens: 800 },
        {
            headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:4000",
                "X-Title": "Agentic Honeypot"
            }
        }
    );

    return response.data.choices[0].message.content;
};
