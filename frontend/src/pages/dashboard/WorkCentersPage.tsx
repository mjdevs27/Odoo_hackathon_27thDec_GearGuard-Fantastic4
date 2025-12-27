import { useState } from 'react';
import { Shield, Search, Calendar, Wrench, BarChart3, Users } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState('Dashboard');

    // Sample data matching the image
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
        { name: 'Maintenance', icon: Wrench },
        { name: 'Dashboard', icon: BarChart3 },
        { name: 'Maintenance Calendar', icon: Calendar },
        { name: 'Equipment', icon: Wrench },
        { name: 'Reporting', icon: BarChart3 },
        { name: 'Teams', icon: Users }
    ];

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Navbar matching the uploaded image */}
            <nav className="bg-slate-950 border-b border-slate-800/50 backdrop-blur-xl">
                <div className="px-6 py-3">
                    {/* Top row with logo and search */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-blue-600 rounded-lg">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">GearGuard</span>
                        </div>

                        {/* Search bar */}
                        <div className="flex-1 max-w-md mx-8">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Navigation tabs */}
                    <div className="flex items-center gap-1">
                        {navTabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.name
                                        ? 'bg-slate-800 text-white border border-slate-700/50'
                                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
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
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex items-baseline gap-3 mb-3">
                        <h1 className="text-2xl font-semibold text-white tracking-tight">
                            Work center list view
                        </h1>
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    </div>
                    <div className="flex items-start gap-2 pl-1">
                        <div className="w-0.5 h-5 bg-red-500 rounded-full mt-0.5"></div>
                        <p className="text-sm text-red-400 leading-relaxed font-medium">
                            Note:- Must create a work center proper form view with respective field that are needed in work center for maintenance request.
                        </p>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
                    {/* Table Header */}
                    <div className="border-b border-slate-700/50 px-8 py-5 bg-gradient-to-r from-slate-800/50 to-slate-800/30">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/50"></div>
                            <h2 className="text-lg font-semibold text-white tracking-tight">Work Center</h2>
                            <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="font-medium">{workCenters.length} Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10">
                                <tr className="border-b border-slate-700/50 bg-slate-800/60 backdrop-blur-md">
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                                        Work Center
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                                        Code
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                                        Tag
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                                        Alternative Workcenters
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                                        Cost per hour
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                                        Capacity Time
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                                        Efficie...
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                                        OEE Target
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {workCenters.map((workCenter) => (
                                    <tr
                                        key={workCenter.id}
                                        className="group hover:bg-blue-500/10 transition-all duration-200 cursor-pointer"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform"></div>
                                                <span className="text-sm font-semibold text-white">
                                                    {workCenter.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm text-slate-400 font-medium">
                                                {workCenter.code || '—'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm text-slate-400 font-medium">
                                                {workCenter.tag || '—'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm text-slate-400 font-medium">
                                                {workCenter.alternativeWorkcenters || '—'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm font-semibold text-slate-200 tabular-nums">
                                                    {workCenter.costPerHour.toFixed(2)}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-200 tabular-nums">
                                                    {workCenter.costPerHour.toFixed(2)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm font-semibold text-slate-200 tabular-nums">
                                                    {workCenter.capacityTime.toFixed(2)}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-200 tabular-nums">
                                                    {workCenter.capacityTime.toFixed(2)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-semibold text-slate-200 tabular-nums">
                                                {workCenter.timeEfficiency > 0 ? workCenter.timeEfficiency.toFixed(2) : '—'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-semibold text-slate-200 tabular-nums">
                                                {workCenter.oeeTarget > 0 ? workCenter.oeeTarget.toFixed(2) : '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Info */}
                    <div className="border-t border-slate-700/50 px-8 py-4 bg-slate-800/30">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-medium">Showing {workCenters.length} work centers</span>
                            <span className="font-medium">Last updated: Just now</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkCentersPage;
