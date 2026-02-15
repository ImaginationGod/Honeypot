import { useEffect, useState } from "react";
import { getConversations } from "../services/conversationService";
import SkeletonLoader from "../components/SkeletonLoader";
import Badge from "../components/Badge";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Conversations() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchConversations = async (page = 1) => {
        try {
            setLoading(true);

            const res = await getConversations(page);

            setConversations(Array.isArray(res.data) ? res.data : []);
            setCurrentPage(res.currentPage || 1);
            setTotalPages(res.totalPages || 1);

        } catch (err) {
            toast.error("Failed to fetch conversations.");
            setConversations([]); // prevent crash
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations(1);
    }, []);

    const goToNext = () => {
        if (currentPage < totalPages) {
            fetchConversations(currentPage + 1);
        }
    };

    const goToPrev = () => {
        if (currentPage > 1) {
            fetchConversations(currentPage - 1);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold">Conversations</h1>

            {loading ? (
                Array(5).fill(0).map((_, i) => (
                    <SkeletonLoader key={i} className="h-20 w-full mb-2" />
                ))
            ) : (
                <>
                    <div className="space-y-2">
                        {(conversations ?? []).map(conv => (
                            <Link
                                to={`/conversations/${conv.conversationId}`}
                                key={conv.conversationId}
                            >
                                <div className="bg-white my-2 dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition">

                                    <div>
                                        <p className="font-medium truncate">
                                            {conv.conversationId}
                                        </p>

                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {dayjs(conv.createdAt).format("DD MMM YYYY, HH:mm")}
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:mt-0 text-sm text-gray-500 dark:text-gray-400">

                                        <Badge type={conv.scamDetected ? "scam" : "safe"} />

                                        <span>
                                            Links: {conv.extractedData?.phishingLinks?.length ?? 0}
                                        </span>

                                        <span>
                                            UPI: {conv.extractedData?.upiIds?.length ?? 0}
                                        </span>

                                        <span>
                                            Phones: {conv.extractedData?.phoneNumbers?.length ?? 0}
                                        </span>
                                    </div>

                                </div>
                            </Link>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-4">
                            <button
                                onClick={goToPrev}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-40"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <span className="text-sm font-medium">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={goToNext}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-40"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
