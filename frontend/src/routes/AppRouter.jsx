import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Analytics from "../pages/Analytics";
import Conversations from "../pages/Conversations";
import ConversationDetail from "../pages/ConversationDetail";
import Simulator from "../pages/Simulator";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/conversations/:id" element={<ConversationDetail />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="*" element={<h1 className="p-4 text-xl">404 Not Found</h1>} />
        </Routes>
    );
}
