import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, Calendar, Wrench, BarChart3, Users, Plus, Settings } from 'lucide-react';

interface WorkCenter {
    id: string;
    name: string;
    code: string;
    tag: string;
    alternativeWorkcenters: string;
    costPerHour: number;
    capacityTime: number;
    timeEfficiency: number;
    oeeTarget: number;
}

const WorkCentersPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Equipment');

    // Sample data matching the image exactly
    const workCenters: WorkCenter[] = [
        {
            id: '1',
            name: 'Assembly 1',
            code: '',
            tag: '',
            alternativeWorkcenters: '',
            costPerHour: 1.00,
            capacityTime: 100.00,
            timeEfficiency: 34.59,
            oeeTarget: 0
        },
        {
            id: '2',
            name: 'Drill 1',
            code: '',
            tag: '',
            alternativeWorkcenters: '',
            costPerHour: 1.00,
            capacityTime: 100.00,
            timeEfficiency: 0,

            oeeTarget: 40.00
        }
    ];

    const navTabs = [
        { name: 'Maintenance', icon: Wrench, route: '/dashboard' },
        { name: 'Dashboard', icon: BarChart3, route: '/dashboard' },
        { name: 'Maintenance Calendar', icon: Calendar, route: '/dashboard' },
        { name: 'Equipment', icon: Settings, route: '/dashboard/work-centers' },
        { name: 'Reporting', icon: BarChart3, route: '/dashboard' },
        { name: 'Teams', icon: Users, route: '/dashboard' }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Clean Navbar */}
            <nav className="bg-white border-b border-slate-200">
                <div className="px-6 py-3">
                    {/* Top row with logo and search */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">GearGuard</span>
                        </div>

                        {/* Search bar */}
                        <div className="flex-1 max-w-md mx-8">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                New
                            </button>
                        </div>
                    </div>

                    {/* Navigation tabs */}
                    <div className="flex items-center gap-1 border-b border-slate-100 -mb-3">
                        {navTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.name;
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => {
                                        setActiveTab(tab.name);
                                        if (tab.route) navigate(tab.route);
                                    }}
                                    className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${isActive
                                        ? 'text-blue-600 border-blue-600'
                                        : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        {tab.name}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="p-8">
                {/* Header Section - Matching exact image structure */}
                <div className="mb-8">
                    <h1 className="text-xl font-medium text-slate-900 mb-2">
                        Work Center List
                    </h1>

                </div>

                {/* Table Container - Clean, minimal design */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    {/* Table Header Label */}
                    <div className="border-b border-slate-200 px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-0.5 h-5 bg-slate-800 rounded-full"></div>
                            <h2 className="text-base font-medium text-slate-900">Work Center</h2>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                                        Work Center
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                                        Tag
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                                        Alternative Workcenters
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                                        Cost per hour
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                                        Capacity Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                                        Efficie...
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                                        OEE Target
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {workCenters.map((workCenter) => (
                                    <tr
                                        key={workCenter.id}
                                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900">
                                                {workCenter.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-500">
                                                {workCenter.code || ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-500">
                                                {workCenter.tag || ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-500">
                                                {workCenter.alternativeWorkcenters || ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900 tabular-nums">
                                                {workCenter.costPerHour.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900 tabular-nums">
                                                {workCenter.capacityTime.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900 tabular-nums">
                                                {workCenter.timeEfficiency > 0 ? workCenter.timeEfficiency.toFixed(2) : ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900 tabular-nums">
                                                {workCenter.oeeTarget > 0 ? workCenter.oeeTarget.toFixed(2) : ''}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkCentersPage;
