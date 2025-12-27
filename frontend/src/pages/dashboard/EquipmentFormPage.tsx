import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, X, Save, Loader2, ChevronRight, Wrench
} from 'lucide-react';
import axios from 'axios';

interface EquipmentForm {
    id?: string;
    name: string;
    category: string;
    company: string;
    used_by: string;
    maintenance_team: string;
    assigned_date: string;
    description: string;
    technician: string;
    employee: string;
    scrap_date: string;
    location: string;
    work_center: string;
    serial_number: string;
}

interface MaintenanceRequest {
    id: string;
    subject: string;
    stage: string;
    priority: string;
    created_at: string;
}

interface SelectOption {
    id: string;
    name: string;
}

const EquipmentFormPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);
    const [showRequestsModal, setShowRequestsModal] = useState(false);
    const [relatedRequests, setRelatedRequests] = useState<MaintenanceRequest[]>([]);
    const [requestCount, setRequestCount] = useState(0);

    // Form state
    const [formData, setFormData] = useState<EquipmentForm>({
        name: '',
        category: '',
        company: 'My Company (San Francisco)',
        used_by: '',
        maintenance_team: '',
        assigned_date: '',
        description: '',
        technician: '',
        employee: '',
        scrap_date: '',
        location: '',
        work_center: '',
        serial_number: ''
    });

    // Dropdown options
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [teams, setTeams] = useState<SelectOption[]>([]);
    const [technicians, setTechnicians] = useState<SelectOption[]>([]);
    const [workCenters, setWorkCenters] = useState<SelectOption[]>([]);
    const [employees, setEmployees] = useState<SelectOption[]>([]);

    // Fetch dropdown options
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [techRes, teamRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/dashboard/technicians'),
                    axios.get('http://localhost:5000/api/maintenance/teams')
                ]);
                setTechnicians(techRes.data.map((t: any) => ({ id: t.id, name: t.full_name })));
                setTeams(teamRes.data);
            } catch (error) {
                console.error('Error fetching options:', error);
                setTechnicians([
                    { id: '1', name: 'Mitchell Admin' },
                    { id: '2', name: 'Marc Demo' },
                    { id: '3', name: 'Vansh Momaya' }
                ]);
                setTeams([
                    { id: '1', name: 'Internal Maintenance' },
                    { id: '2', name: 'External Team' }
                ]);
            }

            // Mock data for other dropdowns
            setCategories([
                { id: '1', name: 'Monitors' },
                { id: '2', name: 'Computers' },
                { id: '3', name: 'Machinery' },
                { id: '4', name: 'Electrical' }
            ]);
            setWorkCenters([
                { id: '1', name: 'Assembly 1' },
                { id: '2', name: 'Drill 1' }
            ]);
            setEmployees([
                { id: '1', name: 'Abigail Peterson' },
                { id: '2', name: 'Tejas Modi' },
                { id: '3', name: 'Bhaumik P' }
            ]);
        };
        fetchOptions();
    }, []);

    // Fetch equipment data and related requests if editing
    useEffect(() => {
        if (!isNew && id) {
            const fetchEquipment = async () => {
                try {
                    const res = await axios.get(`http://localhost:5000/api/equipment/${id}`);
                    setFormData(res.data);

                    // Fetch related maintenance requests
                    const reqRes = await axios.get(`http://localhost:5000/api/equipment/${id}/requests`);
                    setRelatedRequests(reqRes.data);
                    setRequestCount(reqRes.data.length);
                } catch (error) {
                    console.error('Error fetching equipment:', error);
                    // Mock data for demo
                    setFormData({
                        id: id,
                        name: 'Samsung Monitor 15"',
                        category: 'Monitors',
                        company: 'My Company (San Francisco)',
                        used_by: 'Employee',
                        maintenance_team: 'Internal Maintenance',
                        assigned_date: '12/24/2025',
                        description: '',
                        technician: 'Mitchell Admin',
                        employee: 'Abigail Peterson',
                        scrap_date: '',
                        location: 'Building A',
                        work_center: '',
                        serial_number: 'MT/125/22778837'
                    });
                    // Mock requests
                    setRelatedRequests([
                        { id: '1', subject: 'Screen flickering issue', stage: 'NEW', priority: 'HIGH', created_at: '2025-12-20' },
                        { id: '2', subject: 'Annual maintenance check', stage: 'REPAIRED', priority: 'LOW', created_at: '2025-11-15' }
                    ]);
                    setRequestCount(2);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchEquipment();
        }
    }, [id, isNew]);

    // Save equipment
    const handleSave = async () => {
        if (!formData.name) {
            alert('Please enter equipment name');
            return;
        }

        setIsSaving(true);
        try {
            if (isNew) {
                await axios.post('http://localhost:5000/api/equipment', formData);
            } else {
                await axios.put(`http://localhost:5000/api/equipment/${id}`, formData);
            }
            navigate('/dashboard/equipment');
        } catch (error) {
            console.error('Error saving equipment:', error);
            navigate('/dashboard/equipment');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-slate-200 sticky top-0 z-20 bg-white">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Controls */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard/equipment')}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>

                            {/* New Button */}
                            <button
                                onClick={() => navigate('/dashboard/equipment/new')}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                New
                            </button>

                            {/* Equipment Label */}
                            <div className="flex items-center gap-2">
                                <div className="w-0.5 h-5 bg-slate-800 rounded-full"></div>
                                <h2 className="text-base font-medium text-slate-900">Equipment</h2>
                            </div>
                        </div>

                        {/* Right: Smart Button & Actions */}
                        <div className="flex items-center gap-4">
                            {/* Smart Button - Maintenance Requests */}
                            {!isNew && (
                                <button
                                    onClick={() => setShowRequestsModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                                        <span className="text-sm font-medium text-slate-700">Maintenance</span>
                                    </div>
                                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full min-w-[24px] text-center">
                                        {requestCount}
                                    </span>
                                </button>
                            )}

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={() => navigate('/dashboard/equipment')}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                {/* Form Container */}
                <div className="bg-white border border-slate-200 rounded-lg p-8 max-w-5xl">
                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Name?</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Samsung Monitor 15&quot;"
                                    className="w-full pb-2 border-b-2 border-slate-300 focus:border-blue-600 outline-none text-sm text-slate-900 bg-transparent transition-colors"
                                />
                            </div>

                            {/* Equipment Category */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Equipment Category?</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full pb-2 border-b-2 border-slate-300 focus:border-blue-600 outline-none text-sm text-slate-900 bg-transparent cursor-pointer"
                                >
                                    <option value="">Select category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Company */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Company?</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    readOnly
                                    className="w-full pb-2 border-b-2 border-slate-200 outline-none text-sm text-slate-600 bg-transparent"
                                />
                            </div>

                            {/* Used By */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Used By?</label>
                                <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-300">
                                    <select
                                        value={formData.used_by}
                                        onChange={(e) => setFormData(prev => ({ ...prev, used_by: e.target.value }))}
                                        className="flex-1 outline-none text-sm text-slate-900 bg-transparent cursor-pointer"
                                    >
                                        <option value="">Select...</option>
                                        <option value="Employee">Employee</option>
                                        <option value="Department">Department</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                </div>
                            </div>

                            {/* Maintenance Team */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Maintenance Team?</label>
                                <select
                                    value={formData.maintenance_team}
                                    onChange={(e) => setFormData(prev => ({ ...prev, maintenance_team: e.target.value }))}
                                    className="w-full pb-2 border-b-2 border-slate-300 focus:border-blue-600 outline-none text-sm text-slate-900 bg-transparent cursor-pointer"
                                >
                                    <option value="">Select team...</option>
                                    {teams.map(team => (
                                        <option key={team.id} value={team.name}>{team.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Assigned Date */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Assigned Date?</label>
                                <input
                                    type="text"
                                    value={formData.assigned_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, assigned_date: e.target.value }))}
                                    placeholder="12/24/2025"
                                    className="w-full pb-2 border-b-2 border-slate-300 focus:border-blue-600 outline-none text-sm text-slate-900 bg-transparent transition-colors"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter description..."
                                    rows={3}
                                    className="w-full pb-2 border-b-2 border-slate-300 focus:border-blue-600 outline-none text-sm text-slate-900 bg-transparent transition-colors resize-none"
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Technician */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Technician?</label>
                                <select
                                    value={formData.technician}
                                    onChange={(e) => setFormData(prev => ({ ...prev, technician: e.target.value }))}
                                    className="w-full pb-2 border-b-2 border-slate-300 focus:border-blue-600 outline-none text-sm text-slate-900 bg-transparent cursor-pointer"
                                >
                                    <option value="">Select technician...</option>
                                    {technicians.map(tech => (
                                        <option key={tech.id} value={tech.name}>{tech.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Employee */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Employee?</label>
                                <select
                                    value={formData.employee}
                                    onChange={(e) => setFormData(prev => ({ ...prev, employee: e.target.value }))}
                                    className="w-full pb-2 border-b-2 border-slate-300 focus:border-blue-600 outline-none text-sm text-slate-900 bg-transparent cursor-pointer"
                                >
                                    <option value="">Select employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.name}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Scrap Date */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Scrap Date?</label>
                                <input
                                    type="text"
                                    value={formData.scrap_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, scrap_date: e.target.value }))}
                                    placeholder=""
                                    className="w-full pb-2 border-b-2 border-slate-300 focus:border-blue-600 outline-none text-sm text-slate-900 bg-transparent transition-colors"
                                />
                            </div>

                            {/* Used in location */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Used in location?</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="Building A - Floor 1"
                                    className="w-full pb-2 border-b-2 border-slate-300 focus:border-blue-600 outline-none text-sm text-slate-900 bg-transparent transition-colors"
                                />
                            </div>

                            {/* Work Center */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Work Center?</label>
                                <select
                                    value={formData.work_center}
                                    onChange={(e) => setFormData(prev => ({ ...prev, work_center: e.target.value }))}
                                    className="w-full pb-2 border-b-2 border-slate-300 focus:border-blue-600 outline-none text-sm text-slate-900 bg-transparent cursor-pointer"
                                >
                                    <option value="">Select work center...</option>
                                    {workCenters.map(wc => (
                                        <option key={wc.id} value={wc.name}>{wc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Maintenance Requests Modal */}
            {showRequestsModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Maintenance Requests</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    All requests for: {formData.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowRequestsModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="overflow-auto max-h-[60vh]">
                            {relatedRequests.length === 0 ? (
                                <div className="px-6 py-12 text-center text-slate-500">
                                    No maintenance requests found for this equipment
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr className="border-b border-slate-200">
                                            <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Subject</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Stage</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Priority</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {relatedRequests.map((req) => (
                                            <tr
                                                key={req.id}
                                                className="hover:bg-blue-50 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    setShowRequestsModal(false);
                                                    navigate(`/dashboard/request/${req.id}`);
                                                }}
                                            >
                                                <td className="px-6 py-4 text-sm text-blue-600 font-medium hover:underline">
                                                    {req.subject}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${req.stage === 'NEW' ? 'bg-blue-100 text-blue-700' :
                                                            req.stage === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                                                                req.stage === 'REPAIRED' ? 'bg-green-100 text-green-700' :
                                                                    'bg-red-100 text-red-700'
                                                        }`}>
                                                        {req.stage.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${req.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                                                            req.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                                                req.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-green-100 text-green-700'
                                                        }`}>
                                                        {req.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {req.created_at}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setShowRequestsModal(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentFormPage;
