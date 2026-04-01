import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, Inbox } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import SLATimer from '../components/ui/SLATimer';
import Avatar from '../components/ui/Avatar';

const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchTicketData = async () => {
            try {
                const [ticketRes, commentsRes] = await Promise.all([
                    api.get(`/tickets/${id}`),
                    api.get(`/tickets/${id}/comments`)
                ]);
                setTicket(ticketRes.data?.data || ticketRes.data);
                setComments(commentsRes.data?.data || commentsRes.data || []);
            } catch (err) {
                toast.error(err.response?.status === 403 ? "Access denied" : "Failed to load ticket");
            } finally {
                setLoading(false);
            }
        };

        fetchTicketData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const response = await api.post(`/tickets/${id}/comments`, { content: newComment });
            const newCid = response.data?.data || response.data;
            setComments([newCid, ...comments]);
            setNewComment('');
            toast.success("Comment posted successfully");
        } catch (err) {
            toast.error("Failed to add comment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await api.put(`/tickets/${id}/status?status=${newStatus}`);
            setTicket(prev => ({ ...prev, status: newStatus }));
            toast.success(`Ticket marked as ${newStatus}`);
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleCloseTicket = () => {
        if (!window.confirm("Are you sure you want to close this ticket?")) return;
        handleStatusChange('CLOSED');
    };

    if (loading) return <div className="flex h-[50vh] items-center justify-center text-slate-500">Loading ticket details...</div>;
    if (!ticket) return (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
            <p className="text-slate-500">Ticket not found or access denied.</p>
            <button onClick={() => navigate('/tickets')} className="text-teal-600 hover:text-teal-700 font-medium">
                &larr; Back to Tickets
            </button>
        </div>
    );

    const isResolved = ['RESOLVED', 'CLOSED'].includes(ticket.status);
    const isAgent = user?.role !== 'CUSTOMER';

    return (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
            <button
                onClick={() => navigate('/tickets')}
                className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Tickets
            </button>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Left Panel (Main Content: Header, Body, Comments) */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6">
                    
                    {/* Ticket Header Card */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <PriorityBadge priority={ticket.priority} chip={true} />
                                
                                {isAgent ? (
                                    <div className="relative">
                                        <select
                                            value={ticket.status}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-[4px] px-3 py-1.5 pr-8 focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                                        >
                                            <option value="OPEN">● OPEN</option>
                                            <option value="IN_PROGRESS">● IN PROGRESS</option>
                                            <option value="ESCALATED">● ESCALATED</option>
                                            <option value="RESOLVED">● RESOLVED</option>
                                            <option value="CLOSED">● CLOSED</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                ) : (
                                    <StatusBadge status={ticket.status} />
                                )}
                            </div>
                            
                            <h1 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                                {ticket.title}
                            </h1>
                            <p className="text-sm font-mono text-slate-500">
                                Ticket #{(ticket.id || '').toString().substring(0,8).toUpperCase()}
                            </p>
                        </div>
                        
                        <div className="p-6 bg-slate-50/50">
                            <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                                {ticket.description || 'No description provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            Comments ({comments.length})
                        </h3>
                        
                        <div className="space-y-6">
                            {comments.map((comment, index) => (
                                <div key={comment.id || index} className="relative pl-10">
                                    {/* Vertical line connecting comments */}
                                    {index !== Object.keys(comments).length - 1 && (
                                        <div className="absolute top-8 bottom-[-24px] left-[15px] w-px bg-slate-200 z-0"></div>
                                    )}
                                    
                                    <div className="absolute left-0 top-0 z-10 w-8 h-8 rounded-full ring-4 ring-[#f8f9fb]">
                                        <Avatar username={comment.user?.username} size={32} />
                                    </div>
                                    
                                    <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-sm text-slate-900">
                                                {comment.user?.username}
                                            </span>
                                            <span className="text-xs text-slate-500" title={new Date(comment.createdAt).toLocaleString()}>
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {comments.length === 0 && (
                                <div className="text-center py-8 border border-dashed border-slate-300 rounded-lg">
                                    <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">No comments yet. Be the first to respond.</p>
                                </div>
                            )}
                        </div>

                        {/* Add Comment Form */}
                        <div className="mt-8 bg-white border border-slate-200 shadow-sm rounded-lg p-5">
                            <h4 className="text-sm font-medium text-slate-700 mb-3">Leave a comment</h4>
                            <form onSubmit={handleSubmitComment}>
                                <textarea
                                    rows="4"
                                    className="w-full text-sm p-3 border border-slate-300 rounded-[6px] focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-y"
                                    placeholder="Write your comment here..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={submitting}
                                ></textarea>
                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || submitting}
                                        className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-[6px] hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        {submitting ? 'Posting...' : 'Post Comment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Panel (Info & SLA) */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6 sticky top-20">
                    
                    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                            <h3 className="text-xs font-bold tracking-[0.05em] text-slate-500 uppercase">Ticket Info</h3>
                        </div>
                        <div className="p-5 space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Ticket ID</span>
                                <span className="font-mono text-slate-900">#{(ticket.id || '').toString().substring(0,8).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Priority</span>
                                <PriorityBadge priority={ticket.priority} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Status</span>
                                <span className="font-semibold text-slate-900">{ticket.status}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Created</span>
                                <span className="text-slate-900">{formatDistanceToNow(new Date(ticket.createdAt || Date.now()), { addSuffix: true })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                            <h3 className="text-xs font-bold tracking-[0.05em] text-slate-500 uppercase">SLA Due</h3>
                        </div>
                        <div className="p-5">
                            {isResolved ? (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
                                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                    <span className="text-sm font-medium text-slate-600">SLA Stopped (Resolved)</span>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="text-lg w-full flex">
                                        <SLATimer dueTime={ticket.dueDate || ticket.dueTime} status={ticket.status} />
                                    </div>
                                    {(ticket.dueDate || ticket.dueTime) && (
                                        <span className="text-xs text-slate-500 mt-1">
                                            Due {format(new Date(ticket.dueDate || ticket.dueTime), 'MMM d, yyyy h:mm a')}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {!isResolved && (
                        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
                            <button
                                onClick={handleCloseTicket}
                                className="w-full py-2.5 px-4 bg-white border border-red-200 text-red-600 font-semibold text-sm rounded-[6px] hover:bg-red-50 focus:ring-2 focus:ring-red-500/20 active:scale-[0.98] transition-all"
                            >
                                Close Ticket
                            </button>
                            <p className="text-xs text-slate-500 text-center mt-3">
                                Closing this ticket will mark it as resolved and stop the SLA timer.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TicketDetail;
