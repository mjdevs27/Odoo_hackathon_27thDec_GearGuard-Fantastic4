import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, Loader2, X, Save, Users } from 'lucide-react';
import axios from 'axios';
import DashboardNavbar from '../../components/DashboardNavbar';

interface TeamMember {
    id: string;
    name: string;
}

interface Team {
    id: string;
    name: string;
    members: TeamMember[];
    company: string;
}

interface User {
    id: string;
    full_name: string;
}

const TeamsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [formData, setFormData] = useState({ name: '', memberIds: [] as string[], company: 'XYZ' });
    const [isSaving, setIsSaving] = useState(false);

    // Fetch teams and users
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teamsRes, usersRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/teams'),
                    axios.get('http://localhost:5000/api/categories/users')
                ]);
                setTeams(teamsRes.data);
                setUsers(usersRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Mock data
                setTeams([
                    { id: '1', name: 'Internal Maintenance', members: [{ id: '1', name: 'Moksh Jhaveri' }], company: 'XYZ' },
                    { id: '2', name: 'Metrology', members: [{ id: '2', name: 'Ebrahim Gamdiwala' }], company: 'XYZ' },
                    { id: '3', name: 'Subcontractor', members: [{ id: '3', name: 'Rutu Mehta' }], company: 'XYZ' }
                ]);
                setUsers([
                    { id: '1', full_name: 'Moksh Jhaveri' },
                    { id: '2', full_name: 'Ebrahim Gamdiwala' },
                    { id: '3', full_name: 'Rutu Mehta' },
                    { id: '4', full_name: 'Mitchell Admin' },
                    { id: '5', full_name: 'Vansh Momaya' }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Handle delete
    const handleDelete = async (ids: string[]) => {
        if (!confirm(`Delete ${ids.length} team(s)?`)) return;

        try {
            await Promise.all(ids.map(id =>
                axios.delete(`http://localhost:5000/api/teams/${id}`)
            ));
            setTeams(prev => prev.filter(team => !ids.includes(team.id)));
            setSelectedIds([]);
        } catch (error) {
            console.error('Error deleting teams:', error);
            setTeams(prev => prev.filter(team => !ids.includes(team.id)));
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

    // Open modal for new/edit
    const openModal = (team?: Team) => {
        if (team) {
            setEditingTeam(team);
            setFormData({
                name: team.name,
                memberIds: team.members.map(m => m.id),
                company: team.company
            });
        } else {
            setEditingTeam(null);
            setFormData({ name: '', memberIds: [], company: 'XYZ' });
        }
        setShowModal(true);
    };

    // Toggle member selection
    const toggleMember = (userId: string) => {
        setFormData(prev => ({
            ...prev,
            memberIds: prev.memberIds.includes(userId)
                ? prev.memberIds.filter(id => id !== userId)
                : [...prev.memberIds, userId]
        }));
    };

    // Save team
    const handleSave = async () => {
        if (!formData.name) {
            alert('Please enter a team name');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name: formData.name,
                member_ids: formData.memberIds,
                company: formData.company
            };

            if (editingTeam) {
                const res = await axios.put(`http://localhost:5000/api/teams/${editingTeam.id}`, payload);
                setTeams(prev => prev.map(team =>
                    team.id === editingTeam.id ? res.data : team
                ));
            } else {
                const res = await axios.post('http://localhost:5000/api/teams', payload);
                setTeams(prev => [...prev, res.data]);
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving team:', error);
            // Mock save for demo
            const selectedMembers = users
                .filter(u => formData.memberIds.includes(u.id))
                .map(u => ({ id: u.id, name: u.full_name }));

            if (editingTeam) {
                setTeams(prev => prev.map(team =>
                    team.id === editingTeam.id
                        ? { ...team, name: formData.name, members: selectedMembers }
                        : team
                ));
            } else {
                setTeams(prev => [...prev, {
                    id: Date.now().toString(),
                    name: formData.name,
                    members: selectedMembers,
                    company: formData.company
                }]);
            }
            setShowModal(false);
        } finally {
            setIsSaving(false);
        }
    };

    // Filter teams
    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.members.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
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
                {/* Table Container */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    {/* Table Header Controls */}
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* New Button */}
                            <button
                                onClick={() => openModal()}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New
                            </button>

                            {/* Teams Label */}
                            <div className="flex items-center gap-2">
                                <div className="w-0.5 h-5 bg-slate-800 rounded-full"></div>
                                <h2 className="text-base font-medium text-slate-900">Teams</h2>
                            </div>
                        </div>

                        {/* Search & Actions */}
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
                                    placeholder="Search teams..."
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
                                            checked={selectedIds.length === filteredTeams.length && filteredTeams.length > 0}
                                            onChange={() => {
                                                if (selectedIds.length === filteredTeams.length) {
                                                    setSelectedIds([]);
                                                } else {
                                                    setSelectedIds(filteredTeams.map(team => team.id));
                                                }
                                            }}
                                            className="w-4 h-4 text-blue-600 rounded border-slate-300"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700 italic">Team Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Team Members</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Company</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700 w-20">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTeams.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No teams found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTeams.map((team) => (
                                        <tr
                                            key={team.id}
                                            className="hover:bg-blue-50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(team.id)}
                                                    onChange={() => toggleSelection(team.id)}
                                                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                                                />
                                            </td>
                                            <td
                                                className="px-6 py-4 cursor-pointer"
                                                onClick={() => openModal(team)}
                                            >
                                                <span className="text-sm text-blue-600 hover:underline font-medium">
                                                    {team.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {team.members.length === 0 ? (
                                                        <span className="text-sm text-slate-400">No members</span>
                                                    ) : (
                                                        team.members.map((member, idx) => (
                                                            <span key={member.id} className="text-sm text-slate-700">
                                                                {member.name}{idx < team.members.length - 1 ? ',' : ''}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-700">{team.company}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openModal(team)}
                                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete([team.id])}
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
                            <span>Showing {filteredTeams.length} of {teams.length} teams</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {editingTeam ? 'Edit Team' : 'New Team'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-5">
                            {/* Team Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Team Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Internal Maintenance"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-blue-500 outline-none"
                                />
                            </div>

                            {/* Team Members */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Team Members ({formData.memberIds.length} selected)
                                </label>
                                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                    {users.map(user => (
                                        <label
                                            key={user.id}
                                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors ${formData.memberIds.includes(user.id) ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.memberIds.includes(user.id)}
                                                onChange={() => toggleMember(user.id)}
                                                className="w-4 h-4 text-blue-600 rounded border-slate-300"
                                            />
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                                                    {user.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm text-slate-700">{user.full_name}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Company */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    readOnly
                                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamsPage;
