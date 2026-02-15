import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AppRouter from "./routes/AppRouter";

export default function App() {

  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE_URL + "/health")
      .then(res => {
        if (!res.ok) throw new Error();
        setBackendOnline(true);
      })
      .catch(() => setBackendOnline(false));
  }, []);

  return (
    <div className="relative flex min-h-dvh w-full overflow-x-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      <Sidebar backendOnline={backendOnline} />

      <div className="flex-1 flex flex-col">
        <Navbar backendOnline={backendOnline} />

        {!backendOnline && (
          <div className="bg-red-600 text-white text-center py-2 px-2">
            Backend not reachable. Please start the server.
          </div>
        )}

        <main className="flex-1 overflow-auto relative">
          <AppRouter backendOnline={backendOnline} />

          {/* Overlay Blocker */}
          {!backendOnline && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl text-center">
                <h2 className="text-lg font-semibold mb-2">
                  Backend Offline
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please start the backend server to continue.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
