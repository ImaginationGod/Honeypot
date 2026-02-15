import { useEffect, useState } from "react";
import { getAnalytics } from "../services/analyticsService";
import {
    PieChart,
    Pie,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    LineChart,
    Line,
    CartesianGrid,
} from "recharts";
import SkeletonLoader from "../components/SkeletonLoader";
import toast from "react-hot-toast";

export default function Analytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await getAnalytics();
                setAnalytics(data);
            } catch (err) {
                toast.error("Failed to fetch analytics.");
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <SkeletonLoader className="h-96 w-full" />;

    const totalConversations =
        analytics.totalScams + analytics.totalSafe;

    const scamRate =
        ((analytics.totalScams / totalConversations) * 100).toFixed(1);

    const pieData = [
        { name: "Scam", value: analytics.totalScams, fill: "#EF4444" },
        { name: "Safe", value: analytics.totalSafe, fill: "#10B981" },
    ];


    const detectionData = [
        { name: "Phishing Links", value: analytics.totalPhishingLinks },
        { name: "UPI IDs", value: analytics.totalUpiIds },
    ];

    const trendData = analytics.dailyTrend || [
        { day: "Mon", value: 12 },
        { day: "Tue", value: 18 },
        { day: "Wed", value: 9 },
        { day: "Thu", value: 22 },
        { day: "Fri", value: 15 },
    ];

    const entityData = [
        { name: "Links", value: analytics.totalPhishingLinks },
        { name: "UPI IDs", value: analytics.totalUpiIds },
    ];

    return (
        <div className="p-4 md:p-6 space-y-8">

            {/* ===== Title ===== */}
            <h1 className="text-2xl md:text-3xl font-bold">
                Analytics Dashboard
            </h1>

            {/* ===== KPI CARDS ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPI title="Total Conversations" value={totalConversations} />
                <KPI title="Total Scams" value={analytics.totalScams} danger />
                <KPI title="Scam Rate" value={`${scamRate}%`} />
                <KPI
                    title="Entities Extracted"
                    value={
                        analytics.totalPhishingLinks + analytics.totalUpiIds
                    }
                />
            </div>

            {/* ===== CHART GRID ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Scam vs Safe Donut */}
                <Card title="Scam vs Safe Distribution">
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                outerRadius={90}
                                label
                            />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                {/* Detection Signals */}
                <Card title="Detection Signals">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={detectionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#6366F1" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Risk Trend Line */}
                <Card title="Daily Scam Trend">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#EF4444"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Entity Breakdown */}
                <Card title="Entity Breakdown">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={entityData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" />
                            <Tooltip />
                            <Bar dataKey="value" fill="#10B981" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

            </div>
        </div>
    );
}

/* ===== Reusable KPI Card ===== */
function KPI({ title, value, danger }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {title}
            </p>
            <h2
                className={`text-2xl font-bold mt-1 ${danger ? "text-red-500" : ""
                    }`}
            >
                {value}
            </h2>
        </div>
    );
}

/* ===== Reusable Chart Card ===== */
function Card({ title, children }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md">
            <h2 className="font-semibold mb-4">{title}</h2>
            {children}
        </div>
    );
}
