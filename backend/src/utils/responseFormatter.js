export const formatResponse = ({
    detection,
    conversation,
    metrics,
    extracted
}) => ({
    scam_detected: detection.scam,
    confidence: detection.confidence,
    engagement: {
        conversation_id: conversation.conversationId,
        turns: metrics.turns,
        duration_seconds: metrics.duration_seconds
    },
    extracted_intelligence: extracted
});
