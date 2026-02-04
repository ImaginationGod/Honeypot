export const calculateMetrics = (conversation) => {
    const messages = conversation?.messages || [];

    const turns = messages.filter(m => m.role === "user").length;

    const startTime = conversation?.createdAt
        ? new Date(conversation.createdAt).getTime()
        : Date.now();

    const sessionDuration = (Date.now() - startTime) / 1000;

    return {
        turns,
        duration_seconds: Math.max(0, Math.floor(sessionDuration)),
        total_messages: messages.length
    };
};