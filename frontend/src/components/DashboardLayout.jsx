import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <main className="flex-1 lg:ml-64">
                {/* Mobile top bar */}
                <div className="sticky top-0 z-30 lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="font-bold text-slate-900 text-sm">CivicEye</span>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
