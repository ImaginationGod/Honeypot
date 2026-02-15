import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getConversationById } from "../services/conversationService";
import SkeletonLoader from "../components/SkeletonLoader";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import Badge from "../components/Badge";
import { ArrowLeft } from "lucide-react";

export default function ConversationDetail() {
    const { id } = useParams();
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConversation = async () => {
            try {
                const data = await getConversationById(id);
                setConversation(data.data);
            } catch (err) {
                toast.error("Failed to fetch conversation.");
            } finally {
                setLoading(false);
            }
        };
        fetchConversation();
    }, [id]);

    if (loading) return <SkeletonLoader className="h-96 w-full" />;

    const { scamDetected, messages, extractedData, createdAt, updatedAt } = conversation;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <button
                onClick={() => navigate("/conversations")}
                className="mb-4 flex items-center gap-2 text-sm bg-gray-200 dark:bg-gray-700 
               px-3 py-2 rounded-md hover:opacity-80 transition-all duration-200"
            >
                <ArrowLeft size={16} />
                Back
            </button>

            <h1 className="text-2xl md:text-3xl font-bold">Conversation Detail</h1>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-500">Created: {dayjs(createdAt).format("DD MMM YYYY, HH:mm")}</p>
                    <p className="text-sm text-gray-500">Updated: {dayjs(updatedAt).format("DD MMM YYYY, HH:mm")}</p>
                </div>
                <Badge type={scamDetected ? "scam" : "safe"} />
            </div>

            {/* Extracted Intelligence */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-2">
                <h2 className="font-semibold mb-2">Extracted Intelligence</h2>
                {Object.entries(extractedData).map(([key, value]) => (
                    <div key={key} className="flex flex-col md:flex-row md:space-x-2">
                        <span className="font-medium w-40 capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
                        <span className="break-words">{Array.isArray(value) ? value.join(", ") || "-" : value || "-"}</span>
                    </div>
                ))}
            </div>

            {/* Messages */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-2 max-h-[400px] overflow-y-auto">
                <h2 className="font-semibold mb-2">Messages</h2>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`p-2 rounded-md ${msg.role === "assistant"
                            ? "bg-indigo-50 dark:bg-indigo-900"
                            : "bg-gray-100 dark:bg-gray-700"
                            }`}
                    >
                        <span className="font-medium capitalize">
                            {msg.role}:
                        </span>{" "}
                        {(() => {
                            try {
                                const parsed = JSON.parse(msg.content);
                                return parsed.text || msg.content;
                            } catch {
                                return msg.content;
                            }
                        })()}
                    </div>
                ))}
            </div>
        </div>
    );
}
