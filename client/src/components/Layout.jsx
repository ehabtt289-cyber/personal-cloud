import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { HiMenuAlt2 } from "react-icons/hi";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400">
            <HiMenuAlt2 size={22} />
          </button>
          <span className="text-lg font-semibold text-indigo-400">☁ Vault</span>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
