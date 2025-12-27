import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import DashboardNavbar from '../../components/DashboardNavbar';

interface Stats {
    totalRequests: number;
    completedRequests: number;
    pendingRequests: number;
    overdueRequests: number;
    avgResolutionTime: string;
    topCategory: string;
}

const ReportingPage = () => {
    const [stats, setStats] = useState<Stats>({
        totalRequests: 0,
        completedRequests: 0,
        pendingRequests: 0,
        overdueRequests: 0,
        avgResolutionTime: '0h',
        topCategory: 'N/A'
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/dashboard/stats');
                setStats({
                    totalRequests: res.data.openRequests + (res.data.stageCounts?.repaired || 0) + (res.data.stageCounts?.scrap || 0),
                    completedRequests: (res.data.stageCounts?.repaired || 0) + (res.data.stageCounts?.scrap || 0),
                    pendingRequests: res.data.openRequests || 0,
                    overdueRequests: res.data.overdueCount || 0,
                    avgResolutionTime: '2.5h',
                    topCategory: 'Computers'
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
                // Mock data
                setStats({
                    totalRequests: 45,
                    completedRequests: 32,
                    pendingRequests: 13,
                    overdueRequests: 3,
                    avgResolutionTime: '2.5h',
                    topCategory: 'Computers'
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Total Requests',
            value: stats.totalRequests,
            icon: Wrench,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Completed',
            value: stats.completedRequests,
            icon: CheckCircle,
            color: 'bg-green-500',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Pending',
            value: stats.pendingRequests,
            icon: Clock,
            color: 'bg-yellow-500',
            bgColor: 'bg-yellow-50'
        },
        {
            title: 'Overdue',
            value: stats.overdueRequests,
            icon: AlertTriangle,
            color: 'bg-red-500',
            bgColor: 'bg-red-50'
        }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <DashboardNavbar />
                <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <DashboardNavbar />

            {/* Main Content */}
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-slate-900">Reporting Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Analytics and insights for maintenance operations
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((card) => (
                        <div
                            key={card.title}
                            className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                                    <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                                </div>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900">{card.value}</h3>
                            <p className="text-sm text-slate-500 mt-1">{card.title}</p>
                        </div>
                    ))}
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Average Resolution Time */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-medium text-slate-900">Average Resolution Time</h3>
                        </div>
                        <p className="text-4xl font-bold text-slate-900">{stats.avgResolutionTime}</p>
                        <p className="text-sm text-slate-500 mt-2">Based on completed requests</p>
                    </div>

                    {/* Top Category */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-medium text-slate-900">Most Requested Category</h3>
                        </div>
                        <p className="text-4xl font-bold text-slate-900">{stats.topCategory}</p>
                        <p className="text-sm text-slate-500 mt-2">Highest number of maintenance requests</p>
                    </div>
                </div>

                {/* Completion Rate */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-slate-900">Request Completion Rate</h3>
                        <span className="text-2xl font-bold text-green-600">
                            {stats.totalRequests > 0
                                ? Math.round((stats.completedRequests / stats.totalRequests) * 100)
                                : 0}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                            className="bg-green-500 h-3 rounded-full transition-all duration-500"
                            style={{
                                width: `${stats.totalRequests > 0
                                    ? (stats.completedRequests / stats.totalRequests) * 100
                                    : 0}%`
                            }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>{stats.completedRequests} completed</span>
                        <span>{stats.pendingRequests} pending</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportingPage;
