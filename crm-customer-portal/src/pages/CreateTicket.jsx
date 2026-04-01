import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Info, AlertCircle } from 'lucide-react';

const CreateTicket = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        customerId: user?.id,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePrioritySelect = (priority) => {
        setFormData({ ...formData, priority });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/tickets', formData);
            toast.success("Ticket created successfully");
            navigate('/tickets');
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create ticket");
        } finally {
            setLoading(false);
        }
    };

    const priorities = [
        { id: 'LOW', label: 'LOW', sla: '48h SLA', dot: 'bg-slate-400' },
        { id: 'MEDIUM', label: 'MEDIUM', sla: '24h SLA', dot: 'bg-amber-500' },
        { id: 'HIGH', label: 'HIGH', sla: '8h SLA', dot: 'bg-orange-500' },
        { id: 'CRITICAL', label: 'CRITICAL', sla: '2h SLA', dot: 'bg-red-500' },
    ];

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Create New Ticket</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Form Panel */}
                <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                        <div>
                            <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                placeholder="Briefly describe your issue"
                                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-[6px] text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-colors"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Priority <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {priorities.map((p) => {
                                    const isSelected = formData.priority === p.id;
                                    return (
                                        <button
                                            type="button"
                                            key={p.id}
                                            onClick={() => handlePrioritySelect(p.id)}
                                            className={`flex items-center gap-3 p-3 text-left border rounded-[6px] transition-all
                                                ${isSelected 
                                                    ? 'border-teal-500 bg-teal-50 shadow-sm ring-1 ring-teal-500' 
                                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`flex items-center justify-center w-4 h-4 rounded-full border ${isSelected ? 'border-teal-600' : 'border-slate-300'}`}>
                                                {isSelected && <div className="w-2 h-2 rounded-full bg-teal-600"></div>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${p.dot}`}></span>
                                                <span className={`text-sm font-semibold ${isSelected ? 'text-teal-900' : 'text-slate-700'}`}>
                                                    {p.label}
                                                </span>
                                            </div>
                                            <span className={`ml-auto text-xs ${isSelected ? 'text-teal-600' : 'text-slate-500'}`}>
                                                {p.sla}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={6}
                                required
                                placeholder="Please provide as much detail as possible to help us resolve your issue quickly."
                                className="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-[6px] text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-colors resize-y"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-[6px] hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500/20 active:scale-[0.98] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.title.trim() || !formData.description.trim()}
                                className="inline-flex justify-center items-center px-6 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-[6px] hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                            >
                                {loading ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Priority Guide Panel */}
                <div className="w-full lg:w-[320px] shrink-0">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden sticky top-20">
                        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
                            <Info className="w-4 h-4 text-slate-500" />
                            <h3 className="text-sm font-semibold text-slate-800">Priority Guide</h3>
                        </div>
                        
                        <div className="divide-y divide-slate-100">
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    <span className="text-sm font-semibold text-slate-900">CRITICAL</span>
                                    <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded ml-auto">2h SLA</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed pl-4">
                                    System outage, massive data loss, or severe security vulnerability.
                                </p>
                            </div>
                            
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                    <span className="text-sm font-semibold text-slate-900">HIGH</span>
                                    <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded ml-auto">8h SLA</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed pl-4">
                                    Major feature broken preventing core business operations.
                                </p>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    <span className="text-sm font-semibold text-slate-900">MEDIUM</span>
                                    <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded ml-auto">24h SLA</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed pl-4">
                                    General issues, questions, or non-critical bugs.
                                </p>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                    <span className="text-sm font-semibold text-slate-900">LOW</span>
                                    <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded ml-auto">48h SLA</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed pl-4">
                                    Minor issues, cosmetic bugs, or feature requests.
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-blue-50/50 border-t border-blue-100">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    SLA times are calculated in business hours. Priority may be adjusted by a support agent after review.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CreateTicket;
