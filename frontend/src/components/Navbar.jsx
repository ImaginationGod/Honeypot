import { useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const [open, setOpen] = useState(false);

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex justify-between items-center">
                <Link
                    to="/dashboard"
                    className="text-xl font-bold text-indigo-600 dark:text-indigo-400"
                >
                    ScamIntel
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex space-x-6 items-center">
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/analytics">Analytics</Link>
                    <Link to="/conversations">Conversations</Link>
                    <Link to="/simulator">Simulator</Link>

                    <button
                        onClick={() =>
                            setTheme(theme === "light" ? "dark" : "light")
                        }
                        className="p-2 rounded hover:bg-indigo-600 text-[#343434] dark:bg-indigo-600 dark:text-[#dfdfdf] dark:hover:bg-indigo-700"
                    >
                        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                </div>

                {/* Mobile Controls */}
                <div className="md:hidden flex items-center gap-3">
                    <button
                        onClick={() =>
                            setTheme(theme === "light" ? "dark" : "light")
                        }
                        className="p-2 rounded hover:bg-indigo-600 text-[#343434] dark:bg-indigo-600 dark:text-[#dfdfdf] dark:hover:bg-indigo-700"
                    >
                        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    <button onClick={() => setOpen(!open)}>
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-96 opacity-100 mt-3 pt-3" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="flex flex-col gap-3 border-t dark:border-gray-700">
                    <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                    <Link to="/analytics" onClick={() => setOpen(false)}>Analytics</Link>
                    <Link to="/conversations" onClick={() => setOpen(false)}>Conversations</Link>
                    <Link to="/simulator" onClick={() => setOpen(false)}>Simulator</Link>
                </div>
            </div>
        </nav>
    );
}
