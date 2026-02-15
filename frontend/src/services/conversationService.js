import api from "./api";

// Send a message to honeypot
export async function sendMessage({ sessionId, message }) {
    const payload = {
        sessionId,
        message: { text: message },
    };
    const res = await api.post("/api/honeypot/message", payload); // FIXED URL
    return { ...res.data, conversationId: sessionId };
}

// Get paginated conversations
export async function getConversations(page = 1) {
    const res = await api.get(`/conversations?page=${page}`); // backend route
    return res.data;
}

// Get a single conversation by ID
export async function getConversationById(id) {
    const res = await api.get(`/conversations/${id}`);
    return res.data;
}
