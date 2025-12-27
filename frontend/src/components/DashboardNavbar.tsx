import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, LogOut, Wrench, Calendar, Box, BarChart3, Users } from 'lucide-react';
import { ReactNode } from 'react';

interface NavTab {
    name: string;
    route: string;
    icon: ReactNode;
}

const DashboardNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navTabs: NavTab[] = [
        { name: 'Maintenance', route: '/dashboard', icon: <Wrench className="w-4 h-4" /> },
        { name: 'Maintenance Calendar', route: '/dashboard/calendar', icon: <Calendar className="w-4 h-4" /> },
        { name: 'Equipment', route: '/dashboard/equipment', icon: <Box className="w-4 h-4" /> },
        { name: 'Reporting', route: '/dashboard/reporting', icon: <BarChart3 className="w-4 h-4" /> },
        { name: 'Teams', route: '/dashboard/teams', icon: <Users className="w-4 h-4" /> }
    ];

    // Determine active tab based on current path
    const getActiveTab = () => {
        const path = location.pathname;

        // Exact matches first
        if (path === '/dashboard') return 'Maintenance';
        if (path === '/dashboard/calendar') return 'Maintenance Calendar';
        if (path.startsWith('/dashboard/equipment')) return 'Equipment';
        if (path === '/dashboard/reporting') return 'Reporting';
        if (path === '/dashboard/teams') return 'Teams';
        if (path.startsWith('/dashboard/request')) return 'Maintenance';
        if (path === '/dashboard/work-centers') return 'Equipment';
        if (path === '/dashboard/equipment-categories') return 'Equipment';

        return 'Maintenance';
    };

    const activeTab = getActiveTab();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-slate-200">
            <div className="px-6 py-3">
                {/* Top row */}
                <div className="flex items-center justify-between mb-4">
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate('/dashboard')}
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">GearGuard</span>
                    </div>

                    {/* User actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Navigation tabs */}
                <div className="flex items-center gap-1 border-b border-slate-100 -mb-3">
                    {navTabs.map((tab) => {
                        const isActive = activeTab === tab.name;
                        return (
                            <button
                                key={tab.name}
                                onClick={() => navigate(tab.route)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${isActive
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                {tab.icon}
                                {tab.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default DashboardNavbar;
