export const calculateMetrics = (conversation) => {
    const turns = conversation.messages.length;
    const duration =
        (Date.now() - new Date(conversation.createdAt).getTime()) / 1000;

    return { turns, duration_seconds: Math.floor(duration) };
};
