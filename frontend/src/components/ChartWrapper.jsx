import { ResponsiveContainer } from "recharts";

export default function ChartWrapper({ children, height = 250 }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <ResponsiveContainer width="100%" height={height}>{children}</ResponsiveContainer>
        </div>
    );
}
