import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Edit2, Loader2 } from 'lucide-react';
import axios from 'axios';
import DashboardNavbar from '../../components/DashboardNavbar';

interface Equipment {
    id: string;
    name: string;
    serial_number: string;
    employee: string;
    department: string;
    technician: string;
    category: string;
    company: string;
    status: string;
    location: string;
}

const EquipmentListPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Fetch equipment data
    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/dashboard/equipment');
                setEquipment(res.data.map((eq: any) => ({
                    id: eq.id,
                    name: eq.name,
                    serial_number: eq.serial_number,
                    employee: eq.employee || 'Unassigned',
                    department: eq.department || 'General',
                    technician: eq.technician || 'Unassigned',
                    category: eq.category || 'Uncategorized',
                    company: 'XYZ',
                    status: eq.status || 'ACTIVE',
                    location: eq.location || ''
                })));
            } catch (error) {
                console.error('Error fetching equipment:', error);
                // Mock data for demo
                setEquipment([
                    {
                        id: '1',
                        name: 'Samsung Monitor 15"',
                        serial_number: 'MT/125/22778837',
                        employee: 'Tejas Modi',
                        department: 'Admin',
                        technician: 'Mitchell Admin',
                        category: 'Monitors',
                        company: 'XYZ',
                        status: 'ACTIVE',
                        location: 'Building A'
                    },
                    {
                        id: '2',
                        name: 'Acer Laptop',
                        serial_number: 'MT/122/11112222',
                        employee: 'Bhaumik P',
                        department: 'Technician',
                        technician: 'Marc Demo',
                        category: 'Computers',
                        company: 'XYZ',
                        status: 'ACTIVE',
                        location: 'Building B'
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEquipment();
    }, []);

    // Handle delete
    const handleDelete = async (ids: string[]) => {
        if (!confirm(`Delete ${ids.length} equipment item(s)?`)) return;

        try {
            await Promise.all(ids.map(id =>
                axios.delete(`http://localhost:5000/api/equipment/${id}`)
            ));
            setEquipment(prev => prev.filter(eq => !ids.includes(eq.id)));
            setSelectedIds([]);
        } catch (error) {
            console.error('Error deleting equipment:', error);
            // For demo, just remove from state
            setEquipment(prev => prev.filter(eq => !ids.includes(eq.id)));
            setSelectedIds([]);
        }
    };

    // Toggle selection
    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    // Filter equipment by search
    const filteredEquipment = equipment.filter(eq =>
        eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.serial_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.employee.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <DashboardNavbar />

            {/* Main Content */}
            <div className="p-8">
                {/* Header */}

                {/* Table Container */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    {/* Table Header Controls */}
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
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

                        {/* Search */}
                        <div className="flex items-center gap-3">
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={() => handleDelete(selectedIds)}
                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete ({selectedIds.length})
                                </button>
                            )}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-6 py-3 text-left w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredEquipment.length && filteredEquipment.length > 0}
                                            onChange={() => {
                                                if (selectedIds.length === filteredEquipment.length) {
                                                    setSelectedIds([]);
                                                } else {
                                                    setSelectedIds(filteredEquipment.map(eq => eq.id));
                                                }
                                            }}
                                            className="w-4 h-4 text-blue-600 rounded border-slate-300"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700 underline">
                                        Equipment Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                                        Employee
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                                        Department
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                                        Serial Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                                        Technician
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                                        Equipment Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                                        Company
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700 w-20">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEquipment.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                                            No equipment found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEquipment.map((eq) => (
                                        <tr
                                            key={eq.id}
                                            className="hover:bg-blue-50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(eq.id)}
                                                    onChange={() => toggleSelection(eq.id)}
                                                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                                                />
                                            </td>
                                            <td
                                                className="px-6 py-4 cursor-pointer"
                                                onClick={() => navigate(`/dashboard/equipment/${eq.id}`)}
                                            >
                                                <span className="text-sm text-blue-600 hover:underline font-medium">
                                                    {eq.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-700">{eq.employee}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-700">{eq.department}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-700 font-mono">{eq.serial_number}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-700">{eq.technician}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-700">{eq.category}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-700">{eq.company}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => navigate(`/dashboard/equipment/${eq.id}`)}
                                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete([eq.id])}
                                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200 px-6 py-3 bg-slate-50">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Showing {filteredEquipment.length} of {equipment.length} equipment</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentListPage;
