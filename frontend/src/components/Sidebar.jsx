import { Link } from "react-router-dom";
import { Home, BarChart2, MessageCircle, Cpu } from "lucide-react";

export default function Sidebar() {
    return (
        <aside className="bg-white dark:bg-gray-900 w-64 min-h-screen border-r border-gray-200 dark:border-gray-700 p-4 hidden md:flex flex-col space-y-4">
            <Link to="/dashboard" className="flex items-center space-x-2 hover:text-indigo-600 dark:hover:text-indigo-400">
                <Home size={20} /> <span>Dashboard</span>
            </Link>
            <Link to="/analytics" className="flex items-center space-x-2 hover:text-indigo-600 dark:hover:text-indigo-400">
                <BarChart2 size={20} /> <span>Analytics</span>
            </Link>
            <Link to="/conversations" className="flex items-center space-x-2 hover:text-indigo-600 dark:hover:text-indigo-400">
                <MessageCircle size={20} /> <span>Conversations</span>
            </Link>
            <Link to="/simulator" className="flex items-center space-x-2 hover:text-indigo-600 dark:hover:text-indigo-400">
                <Cpu size={20} /> <span>Simulator</span>
            </Link>
        </aside>
    );
}
