```typescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, X, FileText, ChevronRight, Check,
    Diamond, User, Building2, Save, Loader2
} from 'lucide-react';
import axios from 'axios';

// Types
interface MaintenanceRequest {
    id: string;
    subject: string;
    description: string;
    created_by: string;
    maintenance_for: 'equipment' | 'work_center';
    equipment_id: string | null;
    equipment_name: string;
    work_center_id: string | null;
    work_center_name: string;
    category: string;
    request_date: string;
    maintenance_type: 'CORRECTIVE' | 'PREVENTIVE';
    team_id: string;
    team_name: string;
    technician_id: string;
    technician_name: string;
    scheduled_date: string;
    duration_minutes: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    stage: 'NEW' | 'IN_PROGRESS' | 'REPAIRED' | 'SCRAP';
    company_name: string;
    notes: string;
    instructions: string;
    is_overdue: boolean;
}

interface Equipment {
    id: string;
    name: string;
    serial_number: string;
    category: string;
}

interface WorkCenter {
    id: string;
    name: string;
    code: string;
}

interface Team {
    id: string;
    name: string;
}

interface Technician {
    id: string;
    full_name: string;
}

const stages = [
    { key: 'NEW', label: 'New Request' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'REPAIRED', label: 'Repaired' },
    { key: 'SCRAP', label: 'Scrap' }
];

const MaintenanceRequestPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'notes' | 'instructions'>('notes');
    const [showWorksheet, setShowWorksheet] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<MaintenanceRequest>>({
        subject: '',
        description: '',
        maintenance_for: 'equipment',
        equipment_id: null,
        work_center_id: null,
        category: '',
        request_date: new Date().toISOString().split('T')[0],
        maintenance_type: 'CORRECTIVE',
        team_id: '',
        technician_id: '',
        scheduled_date: '',
        duration_minutes: 0,
        priority: 'MEDIUM',
        stage: 'NEW',
        notes: '',
        instructions: ''
    });

    // Dropdown options
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [workCenterList, setWorkCenterList] = useState<WorkCenter[]>([]);
    const [teamList, setTeamList] = useState<Team[]>([]);
    const [technicianList, setTechnicianList] = useState<Technician[]>([]);

    // Fetch dropdown data
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [equipRes, teamRes, techRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/dashboard/equipment'),
                    axios.get('http://localhost:5000/api/maintenance/teams'),
                    axios.get('http://localhost:5000/api/dashboard/technicians')
                ]);
                setEquipmentList(equipRes.data);
                setTeamList(teamRes.data);
                setTechnicianList(techRes.data);

                // Fetch work centers
                try {
                    const wcRes = await axios.get('http://localhost:5000/api/workcenters');
                    setWorkCenterList(wcRes.data);
                } catch {
                    // Work centers API may not exist yet
                    setWorkCenterList([
                        { id: '1', name: 'Assembly 1', code: 'ASM-001' },
                        { id: '2', name: 'Drill 1', code: 'DRL-001' }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching dropdowns:', error);
            }
        };
        fetchDropdowns();
    }, []);

    // Fetch request data if editing
    useEffect(() => {
        if (!isNew && id) {
            const fetchRequest = async () => {
                try {
                    const res = await axios.get(`http://localhost:5000/api/maintenance/requests/${id}`);
setFormData(res.data);
                } catch (error) {
    console.error('Error fetching request:', error);
    // Use mock data for demo
    setFormData({
        id: id,
        subject: 'Test Activity',
        description: 'Testing maintenance request',
        maintenance_for: 'equipment',
        equipment_id: '1',
        equipment_name: 'Acer Laptop/LP/203/19281928',
        category: 'Computers',
        request_date: '2025-12-18',
        maintenance_type: 'CORRECTIVE',
        team_id: '1',
        team_name: 'Internal Maintenance',
        technician_id: '1',
        technician_name: 'Aka Foster',
        scheduled_date: '2025-12-28T14:30:00',
        duration_minutes: 0,
        priority: 'MEDIUM',
        stage: 'NEW',
        company_name: 'My Company (San Francisco)',
        notes: '',
        instructions: '',
        created_by: 'Mitchell Admin'
    });
} finally {
    setIsLoading(false);
}
            };
fetchRequest();
        }
    }, [id, isNew]);

// Auto-fill category when equipment is selected
const handleEquipmentChange = (equipmentId: string) => {
    const equipment = equipmentList.find(e => e.id === equipmentId);
    setFormData(prev => ({
        ...prev,
        equipment_id: equipmentId,
        category: equipment?.category || prev.category
    }));
};

// Save request
const handleSave = async () => {
    setIsSaving(true);
    try {
        if (isNew) {
            await axios.post('http://localhost:5000/api/maintenance/requests', formData);
        } else {
            await axios.put(`http://localhost:5000/api/maintenance/requests/${id}`, formData);
        }
        navigate('/dashboard');
    } catch (error) {
        console.error('Error saving request:', error);
    } finally {
        setIsSaving(false);
    }
};

// Update stage
const handleStageChange = async (newStage: string) => {
    setFormData(prev => ({ ...prev, stage: newStage as any }));
    if (!isNew && id) {
        try {
            await axios.patch(`http://localhost:5000/api/dashboard/requests/${id}/stage`, {
                stage: newStage
            });
        } catch (error) {
            console.error('Error updating stage:', error);
        }
    }
};

const getCurrentStageIndex = () => {
    return stages.findIndex(s => s.key === formData.stage);
};

if (isLoading) {
    return (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );
}

return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 overflow-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: Breadcrumb & Title */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Maintenance Requests</span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900 dark:text-white">
                                {isNew ? 'New Request' : formData.subject}
                            </span>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                            {formData.stage === 'NEW' ? 'New' : formData.stage?.replace('_', ' ')}
                        </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Worksheet Button */}
                        <button
                            onClick={() => setShowWorksheet(!showWorksheet)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                            Worksheet
                        </button>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Stage Progress Bar */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        {stages.map((stage, index) => (
                            <div key={stage.key} className="flex items-center flex-1">
                                <button
                                    onClick={() => handleStageChange(stage.key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${index <= getCurrentStageIndex()
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {index < getCurrentStageIndex() && <Check className="w-4 h-4" />}
                                    {stage.label}
                                </button>
                                {index < stages.length - 1 && (
                                    <ChevronRight className="w-5 h-5 text-slate-400 mx-1 flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Stage Status Indicators */}
                    <div className="flex items-center gap-4 ml-6 pl-6 border-l border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">In Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">Blocked</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">Ready for next stage</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                {/* Subject */}
                <div className="mb-6">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Subject?</label>
                    <input
                        type="text"
                        value={formData.subject || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Enter subject..."
                        className="text-3xl font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none w-full placeholder-slate-300"
                    />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-5">
                        {/* Created By */}
                        <div className="flex items-center gap-4">
                            <label className="w-36 text-sm font-medium text-slate-600 dark:text-slate-400">Created By</label>
                            <div className="flex-1 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-900 dark:text-white">{formData.created_by || 'Mitchell Admin'}</span>
                            </div>
                        </div>

                        {/* Maintenance For */}
                        <div className="flex items-center gap-4">
                            <label className="w-36 text-sm font-medium text-slate-600 dark:text-slate-400">Maintenance For</label>
                            <div className="flex-1">
                                <select
                                    value={formData.maintenance_for}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        maintenance_for: e.target.value as any,
                                        equipment_id: null,
                                        work_center_id: null
                                    }))}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                                >
                                    <option value="equipment">Equipment</option>
                                    <option value="work_center">Work Center</option>
                                </select>
                            </div>
                        </div>

                        {/* Equipment OR Work Center */}
                        {formData.maintenance_for === 'equipment' ? (
                            <div className="flex items-center gap-4">
                                <label className="w-36 text-sm font-medium text-slate-600 dark:text-slate-400">Equipment</label>
                                <div className="flex-1">
                                    <select
                                        value={formData.equipment_id || ''}
                                        onChange={(e) => handleEquipmentChange(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Select Equipment...</option>
                                        {equipmentList.map(eq => (
                                            <option key={eq.id} value={eq.id}>
                                                {eq.name} / {eq.serial_number}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <label className="w-36 text-sm font-medium text-slate-600 dark:text-slate-400">Work Center</label>
                                <div className="flex-1">
                                    <select
                                        value={formData.work_center_id || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, work_center_id: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Select Work Center...</option>
                                        {workCenterList.map(wc => (
                                            <option key={wc.id} value={wc.id}>
                                                {wc.name} ({wc.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Category */}
                        <div className="flex items-center gap-4">
                            <label className="w-36 text-sm font-medium text-slate-600 dark:text-slate-400">Category</label>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={formData.category || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    placeholder="Auto-filled from equipment"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Request Date */}
                        <div className="flex items-center gap-4">
                            <label className="w-36 text-sm font-medium text-slate-600 dark:text-slate-400">Request Date?</label>
                            <div className="flex-1">
                                <input
                                    type="date"
                                    value={formData.request_date || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, request_date: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Maintenance Type */}
                        <div className="flex items-center gap-4">
                            <label className="w-36 text-sm font-medium text-slate-600 dark:text-slate-400">Maintenance Type</label>
                            <div className="flex-1 flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="maintenance_type"
                                        value="CORRECTIVE"
                                        checked={formData.maintenance_type === 'CORRECTIVE'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, maintenance_type: e.target.value as any }))}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Corrective</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="maintenance_type"
                                        value="PREVENTIVE"
                                        checked={formData.maintenance_type === 'PREVENTIVE'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, maintenance_type: e.target.value as any }))}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Preventive</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-5">
                        {/* Team */}
                        <div className="flex items-center gap-4">
                            <label className="w-36 text-sm font-medium text-slate-600 dark:text-slate-400">Team</label>
                            <div className="flex-1">
                                <select
                                    value={formData.team_id || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, team_id: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                                >
                                    <option value="">Select Team...</option>
                                    {teamList.map(team => (
                                        <option key={team.id} value={team.id}>{team.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Technician */}
                        <div className="flex items-center gap-4">
                            <label className="w-36 text-sm font-medium text-slate-600 dark:text-slate-400">Technician</label>
                            <div className="flex-1">
                                <select
                                    value={formData.technician_id || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, technician_id: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                                >
                                    <option value="">Select Technician...</option>
                                    {technicianList.map(tech => (
                                        <option key={tech.id} value={tech.id}>{tech.full_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Scheduled Date */}
                        <div className="flex items-center gap-4">
                            <label className="w-36 text-sm font-medium text-slate-600 dark:text-slate-400">Scheduled Date?</label>
                            <div className="flex-1">
                                <input
                                    type="datetime-local"
                                    value={formData.scheduled_date || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-4">
                            <label className="w-36 text-sm font-medium text-slate-600 dark:text-slate-400">Duration</label>
                            <div className="flex-1 flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    value={Math.floor((formData.duration_minutes || 0) / 60)}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        duration_minutes: parseInt(e.target.value) * 60 + ((prev.duration_minutes || 0) % 60)
                                    }))}
                                    className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none text-center"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400">:</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={(formData.duration_minutes || 0) % 60}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        duration_minutes: Math.floor((prev.duration_minutes || 0) / 60) * 60 + parseInt(e.target.value)
                                    }))}
                                    className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none text-center"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400">hours</span>
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="flex items-center gap-4">
                            <label className="w-36 text-sm font-medium text-slate-600 dark:text-slate-400">Priority</label>
                            <div className="flex-1 flex items-center gap-2">
                                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority, index) => (
                                    <button
                                        key={priority}
                                        onClick={() => setFormData(prev => ({ ...prev, priority: priority as any }))}
                                        className={`p-2 rounded-lg transition-all ${formData.priority === priority
                                            ? 'bg-blue-100 dark:bg-blue-900/30'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        title={priority}
                                    >
                                        <Diamond
                                            className={`w-5 h-5 ${index <= ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].indexOf(formData.priority || 'MEDIUM')
                                                ? priority === 'URGENT' ? 'text-red-500 fill-red-500' :
                                                    priority === 'HIGH' ? 'text-orange-500 fill-orange-500' :
                                                        priority === 'MEDIUM' ? 'text-yellow-500 fill-yellow-500' :
                                                            'text-green-500 fill-green-500'
                                                : 'text-slate-300 dark:text-slate-600'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Company */}
                        <div className="flex items-center gap-4">
                            <label className="w-36 text-sm font-medium text-slate-600 dark:text-slate-400">Company</label>
                            <div className="flex-1 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-900 dark:text-white">
                                    {formData.company_name || 'My Company (San Francisco)'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes / Instructions Tabs */}
                <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
                    <div className="flex items-center gap-1 mb-4">
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all ${activeTab === 'notes'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                        >
                            Notes
                        </button>
                        <button
                            onClick={() => setActiveTab('instructions')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all ${activeTab === 'instructions'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                        >
                            Instructions
                        </button>
                    </div>

                    <textarea
                        value={activeTab === 'notes' ? (formData.notes || '') : (formData.instructions || '')}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            [activeTab]: e.target.value
                        }))}
                        placeholder={activeTab === 'notes' ? 'Add notes about this maintenance request...' : 'Add instructions for the technician...'}
                        rows={5}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 outline-none resize-none"
                    />
                </div>
            </div>

            {/* Worksheet Sidebar */}
            {showWorksheet && (
                <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl z-30 overflow-auto">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Worksheet Comments</h3>
                        <button
                            onClick={() => setShowWorksheet(false)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                    <div className="p-4">
                        <textarea
                            placeholder="Add a comment..."
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 outline-none resize-none mb-3"
                        />
                        <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            Add Comment
                        </button>

                        <div className="mt-6 space-y-4">
                            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">No comments yet</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);
};

export default MaintenanceRequestPage;
