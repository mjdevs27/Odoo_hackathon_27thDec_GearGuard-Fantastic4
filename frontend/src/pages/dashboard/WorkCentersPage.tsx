import { useState } from 'react';

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

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
            <div className="h-full flex flex-col p-8">
                {/* Header Section */}
                <div className="mb-6 flex-shrink-0">
                    <div className="flex items-baseline gap-3 mb-3">
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
                            Work center list view
                        </h1>
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                    </div>
                    <div className="flex items-start gap-2 pl-1">
                        <div className="w-0.5 h-5 bg-red-500 rounded-full mt-0.5"></div>
                        <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed font-medium">
                            Note:- Must create a work center proper form view with respective field that are needed in work center for maintenance request.
                        </p>
                    </div>
                </div>

                {/* Table Container - Full Height */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden flex flex-col backdrop-blur-sm">
                    {/* Table Header with Work Center label */}
                    <div className="border-b border-slate-200 dark:border-slate-800 px-8 py-5 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900/30 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 tracking-tight">Work Center</h2>
                            <div className="ml-auto flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="font-medium">2 Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Table - Scrollable */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10">
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md">
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                        Work Center
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                        Code
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                        Tag
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                        Alternative Workcenters
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                        Cost per hour
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                        Capacity Time
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                        Efficie...
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                        OEE Target
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {workCenters.map((workCenter, index) => (
                                    <tr
                                        key={workCenter.id}
                                        className="group hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-200 cursor-pointer"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-125 transition-transform"></div>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                                    {workCenter.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                {workCenter.code || '—'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                {workCenter.tag || '—'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                {workCenter.alternativeWorkcenters || '—'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                                                    {workCenter.costPerHour.toFixed(2)}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                                                    {workCenter.costPerHour.toFixed(2)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                                                    {workCenter.capacityTime.toFixed(2)}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                                                    {workCenter.capacityTime.toFixed(2)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                                                {workCenter.timeEfficiency > 0 ? workCenter.timeEfficiency.toFixed(2) : '—'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                                                {workCenter.oeeTarget > 0 ? workCenter.oeeTarget.toFixed(2) : '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Info */}
                    <div className="border-t border-slate-200 dark:border-slate-800 px-8 py-4 bg-slate-50/50 dark:bg-slate-900/30 flex-shrink-0">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
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
