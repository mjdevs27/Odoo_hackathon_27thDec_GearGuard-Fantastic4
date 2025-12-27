import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Search, AlertTriangle, Users, ClipboardList, RefreshCw, Plus } from 'lucide-react';
import axios from 'axios';
import DashboardNavbar from '../../components/DashboardNavbar';

// Types
interface MaintenanceRequest {
    id: string;
    subject: string;
    equipment: string;
    technician: string;
    technicianAvatar: string;
    category: string;
    stage: 'new' | 'in_progress' | 'repaired' | 'scrap';
    company: string;
    isOverdue: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface DashboardStats {
    criticalEquipment: number;
    technicianLoad: number;
    openRequests: number;
    overdueCount: number;
}

interface KanbanCardProps {
    request: MaintenanceRequest;
    onClick: (id: string) => void;
}

interface KanbanColumnProps {
    stage: MaintenanceRequest['stage'];
    title: string;
    requests: MaintenanceRequest[];
    onDrop: (id: string, stage: MaintenanceRequest['stage']) => void;
    color: string;
    onCardClick: (id: string) => void;
}

// Drag types
const ItemTypes = {
    CARD: 'card'
};

// Kanban Card Component
const KanbanCard = ({ request, onClick }: KanbanCardProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.CARD,
        item: { id: request.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    useEffect(() => {
        drag(ref);
    }, [drag]);

    return (
        <div
            ref={ref}
            onClick={() => onClick(request.id)}
            className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 mb-2 cursor-pointer active:cursor-grabbing transition-all hover:shadow-md hover:border-blue-400 ${isDragging ? 'opacity-50 scale-95' : ''
                } ${request.isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {request.subject}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {request.equipment}
                    </p>
                </div>
                {request.technicianAvatar && (
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {request.technicianAvatar}
                    </div>
                )}
            </div>
            {request.isOverdue && (
                <div className="mt-2 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded inline-block">
                    Overdue
                </div>
            )}
        </div>
    );
};

// Kanban Column Component
const KanbanColumn = ({ stage, title, requests, onDrop, color, onCardClick }: KanbanColumnProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.CARD,
        drop: (item: { id: string }) => {
            onDrop(item.id, stage);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    useEffect(() => {
        drop(ref);
    }, [drop]);

    return (
        <div
            ref={ref}
            className={`flex-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-3 min-w-[280px] transition-all ${isOver ? 'ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-slate-950' : ''
                }`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    <h3 className="font-medium text-slate-700 dark:text-slate-200">{title}</h3>
                </div>
                <span className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium px-2 py-1 rounded-full">
                    {requests.length}
                </span>
            </div>
            <div className="min-h-[150px]">
                {requests.map((request) => (
                    <KanbanCard key={request.id} request={request} onClick={onCardClick} />
                ))}
            </div>
        </div>
    );
};

// Main Dashboard Component
const DashboardPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for data from API
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        criticalEquipment: 0,
        technicianLoad: 85,
        openRequests: 0,
        overdueCount: 0
    });

    // Fetch data from API
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch maintenance requests
            const requestsRes = await axios.get('http://localhost:5000/api/dashboard/requests');
            setRequests(requestsRes.data);

            // Fetch stats
            const statsRes = await axios.get('http://localhost:5000/api/dashboard/stats');
            setStats(statsRes.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please check if the backend is running.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle drag & drop - update stage in database
    const handleDrop = useCallback(async (id: string, newStage: MaintenanceRequest['stage']) => {
        // Optimistic update
        setRequests((prev) =>
            prev.map((req) =>
                req.id === id ? { ...req, stage: newStage } : req
            )
        );

        try {
            await axios.patch(`http://localhost:5000/api/dashboard/requests/${id}/stage`, {
                stage: newStage
            });
        } catch (err) {
            console.error('Error updating request stage:', err);
            // Revert on error
            fetchData();
        }
    }, [fetchData]);

    const getRequestsByStage = (stage: MaintenanceRequest['stage']) =>
        requests.filter((r) => r.stage === stage);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950">
                <DashboardNavbar />

                <div className="w-full px-6 py-6">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance Dashboard</h1>
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Controls Row */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/dashboard/request/new')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            New Request
                        </button>
                        <div className="flex-1 relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Critical Equipment Card */}
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Critical Equipment</h3>
                                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.criticalEquipment} Units</p>
                                    <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">(Health &lt; 30%)</p>
                                </div>
                                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </div>

                        {/* Technician Load Card */}
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Technician Load</h3>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.technicianLoad}% Utilized</p>
                                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">(Assign Carefully)</p>
                                </div>
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </div>

                        {/* Open Requests Card */}
                        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-xl p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">Open Requests</h3>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.openRequests} Pending</p>
                                    <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">{stats.overdueCount} Overdue</p>
                                </div>
                                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                    <ClipboardList className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kanban Board */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Maintenance Kanban Board</h2>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            <KanbanColumn
                                stage="new"
                                title="New"
                                requests={getRequestsByStage('new')}
                                onDrop={handleDrop}
                                color="blue"
                                onCardClick={(id) => navigate(`/dashboard/request/${id}`)}
                            />
                            <KanbanColumn
                                stage="in_progress"
                                title="In Progress"
                                requests={getRequestsByStage('in_progress')}
                                onDrop={handleDrop}
                                color="yellow"
                                onCardClick={(id) => navigate(`/dashboard/request/${id}`)}
                            />
                            <KanbanColumn
                                stage="repaired"
                                title="Repaired"
                                requests={getRequestsByStage('repaired')}
                                onDrop={handleDrop}
                                color="green"
                                onCardClick={(id) => navigate(`/dashboard/request/${id}`)}
                            />
                            <KanbanColumn
                                stage="scrap"
                                title="Scrap"
                                requests={getRequestsByStage('scrap')}
                                onDrop={handleDrop}
                                color="red"
                                onCardClick={(id) => navigate(`/dashboard/request/${id}`)}
                            />
                        </div>
                    </div>

                    {/* Maintenance Reports Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Maintenance Reports</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-900/50">
                                    <tr className="border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Equipment</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Technician</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Stage</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Company</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                                No maintenance requests found
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map((request) => (
                                            <tr
                                                key={request.id}
                                                onClick={() => navigate(`/dashboard/request/${request.id}`)}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">{request.subject}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{request.equipment}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                                            {request.technicianAvatar || request.technician.charAt(0)}
                                                        </div>
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">{request.technician}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{request.category}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${request.stage === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        request.stage === 'in_progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            request.stage === 'repaired' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {request.stage === 'in_progress' ? 'In Progress' : request.stage.charAt(0).toUpperCase() + request.stage.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{request.company}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default DashboardPage;
