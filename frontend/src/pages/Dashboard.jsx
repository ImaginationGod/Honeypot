import { useEffect, useState } from "react";
import { getAnalytics } from "../services/analyticsService";
import Card from "../components/Card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import SkeletonLoader from "../components/SkeletonLoader";
import toast from "react-hot-toast";
import dayjs from "dayjs";

export default function Dashboard() {

    const [analytics, setAnalytics] = useState({
        totalSessions: 0,
        totalScams: 0,
        totalSafe: 0,
        totalPhishingLinks: 0,
        totalUpiIds: 0,
        sessionsOverTime: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await getAnalytics();

                if (data) {
                    setAnalytics(prev => ({
                        ...prev,
                        ...data
                    }));
                }
            } catch (err) {
                toast.error("Failed to fetch analytics.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const formattedSessions =
        analytics.sessionsOverTime?.map(item => ({
            date: dayjs(
                `${item._id.year}-${item._id.month}-${item._id.day}`
            ).format("DD MMM"),
            sessions: item.count,
        })) || [];

    return (
        <div className="p-4 md:p-6 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    Array(5).fill(0).map((_, i) => <SkeletonLoader key={i} />)
                ) : (
                    <>
                        <Card title="Total Sessions" value={analytics.totalSessions ?? 0} />
                        <Card title="Scam Sessions" value={analytics.totalScams ?? 0} />
                        <Card title="Safe Sessions" value={analytics.totalSafe ?? 0} />
                        <Card title="Phishing Links" value={analytics.totalPhishingLinks ?? 0} />
                        <Card title="UPI IDs Detected" value={analytics.totalUpiIds ?? 0} />
                    </>
                )}
            </div>

            {/* Sessions Over Time Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <h2 className="font-semibold mb-2">Sessions Over Time</h2>
                {loading ? (
                    <SkeletonLoader className="h-64" />
                ) : (
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={formattedSessions}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="sessions"
                                stroke="#4F46E5"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
