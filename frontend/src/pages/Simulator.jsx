import { useState } from "react";
import { sendMessage } from "../services/conversationService";
import SkeletonLoader from "../components/SkeletonLoader";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

export default function Simulator() {
    const [message, setMessage] = useState("");
    const [conversationId, setConversationId] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scamDetected, setScamDetected] = useState(false);
    const [riskData, setRiskData] = useState(null);
    const [explanation, setExplanation] = useState(null);

    const handleSend = async () => {
        if (!message.trim() || loading) return;

        setLoading(true);

        const userMessage = { role: "user", content: message };
        setMessages((prev) => [...prev, userMessage]);

        try {
            const res = await sendMessage({
                message: { text: message },
                sessionId: conversationId || undefined,
            });

            const {
                reply,
                conversationId: cid,
                scamDetected,
                risk,
                explanation,
            } = res;

            setConversationId(cid);
            setScamDetected(scamDetected);
            setRiskData(risk || null);
            setExplanation(explanation || null);

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: reply },
            ]);

            setMessage("");
        } catch (err) {
            if (err?.isNetworkError) {
                toast.error("Backend server is not running.");
            } else {
                toast.error(err?.message || "Failed to send message.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = () => {
        setConversationId("");
        setMessages([]);
        setRiskData(null);
        setScamDetected(false);
        setExplanation(null);
    };

    const getRiskColor = () => {
        if (!riskData?.finalScore) return "bg-gray-200";
        if (riskData.finalScore < 0.4) return "bg-green-500";
        if (riskData.finalScore < 0.7) return "bg-yellow-500";
        return "bg-red-600";
    };

    return (
        <div className="p-4 md:p-6 flex flex-col h-full space-y-4">
            <div className="p-4 flex flex-row space-x-4 md:p-6">
                <h1 className="text-2xl md:text-3xl font-bold">
                    AI Interaction Simulator
                </h1>
                <button
                    onClick={handleNewChat}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition duration-200 shadow-sm hover:shadow-md active:scale-95"
                >
                    <Plus className="w-6 h-6 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">New Chat</span>
                </button>
            </div>

            {/* Chat Box */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md space-y-2 overflow-y-auto max-h-[60vh]">
                {messages.length === 0 && (
                    <p className="text-gray-500">
                        Start the conversation by typing below.
                    </p>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`p-3 rounded-lg text-sm md:text-base ${msg.role === "assistant"
                            ? "bg-indigo-50 dark:bg-indigo-900"
                            : "bg-gray-100 dark:bg-gray-700"
                            }`}
                    >
                        <span className="font-semibold capitalize">
                            {msg.role}:
                        </span>{" "}
                        {msg.content}
                    </div>
                ))}

                {loading && <SkeletonLoader className="h-10 w-full" />}
            </div>

            {/* Scam Alert */}
            {scamDetected && (
                <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-3 rounded-lg text-sm">
                    🚨 Scam Detected!
                </div>
            )}

            {/* Risk Breakdown */}
            {riskData && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Risk Score</span>
                        <span className="font-bold">
                            {riskData.finalScore}
                        </span>
                    </div>

                    {/* Risk Bar */}
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${getRiskColor()}`}
                            style={{
                                width: `${Math.min(
                                    riskData.finalScore * 100,
                                    100
                                )}%`,
                            }}
                        />
                    </div>

                    <div className="text-xs space-y-1 mt-2">
                        <div>Heuristic Contribution: {riskData.heuristic}</div>
                        <div>AI Confidence: {riskData.aiConfidence}</div>
                        <div>Weighted AI: {riskData.weightedAI}</div>
                    </div>
                </div>
            )}

            {/* Explainability*/}
            {explanation?.reasons?.length > 0 && (
                <div
                    className={`p-4 rounded-lg text-sm transition-colors duration-300 ${scamDetected
                        ? "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200"
                        : "bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200"
                        }`}
                >
                    <div className="font-semibold mb-2">
                        {scamDetected
                            ? "🚨 Detection Reasons:"
                            : "ℹ️ Minor Signals Detected (Low Risk):"}
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                        {explanation.reasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Input Area */}
            <div className="flex space-x-2">
                <input
                    type="text"
                    className="flex-1 p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    disabled={loading}
                    onClick={handleSend}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
