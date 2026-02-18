import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Clock, MessageSquare, Send, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const fetchTicketData = async () => {
            try {
                const [ticketRes, commentsRes] = await Promise.all([
                    api.get(`/tickets/${id}`),
                    api.get(`/tickets/${id}/comments`)
                ]);
                setTicket(ticketRes.data.data);
                setComments(commentsRes.data.data);
            } catch (err) {
                console.error("Error fetching ticket details", err);
                setError(err.response?.status === 403 ? "Access denied" : "Failed to load ticket");
            } finally {
                setLoading(false);
            }
        };

        fetchTicketData();
    }, [id]);

    useEffect(() => {
        if (!ticket || !ticket.dueTime || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
            setTimeLeft('');
            return;
        }

        const updateTimer = () => {
            const due = new Date(ticket.dueTime).getTime();
            const now = new Date().getTime();
            const diff = due - now;

            if (diff <= 0) {
                setTimeLeft('Overdue');
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${hours}h ${minutes}m remaining`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [ticket]);

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await api.post(`/tickets/${id}/comments`, { content: newComment });
            setComments([response.data.data, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error("Error adding comment", err);
            alert("Failed to add comment");
        }
    };

    const handleCloseTicket = async () => {
        if (!window.confirm("Are you sure you want to close this ticket?")) return;
        try {
            await api.put(`/tickets/${id}/status?status=CLOSED`);
            setTicket(prev => ({ ...prev, status: 'CLOSED' }));
        } catch (err) {
            console.error("Error closing ticket", err);
            alert("Failed to close ticket");
        }
    };

    if (loading) return <div className="text-center py-10">Loading ticket details...</div>;
    if (error) return (
        <div className="text-center py-10">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => navigate('/tickets')} className="text-blue-600 hover:text-blue-500">
                Back to Tickets
            </button>
        </div>
    );
    if (!ticket) return <div className="text-center py-10">Ticket not found</div>;

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate('/tickets')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Tickets
            </button>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                            {ticket.title}
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${ticket.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                    ticket.status === 'ESCALATED' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'}`}>
                                {ticket.status}
                            </span>
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Ticket #{ticket.id} • Created {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    {(ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED') && (
                        <button
                            onClick={handleCloseTicket}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Close Ticket
                        </button>
                    )}
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Priority</dt>
                            <dd className={`mt-1 text-sm font-semibold 
                                ${ticket.priority === 'CRITICAL' ? 'text-red-600' :
                                    ticket.priority === 'HIGH' ? 'text-orange-600' : 'text-gray-900'}`}>
                                {ticket.priority}
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">SLA Due Time</dt>
                            <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                                {new Date(ticket.dueTime).toLocaleString()}
                                {timeLeft && (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                        ${timeLeft === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        <Clock className="w-3 h-3 mr-1" />
                                        {timeLeft}
                                    </span>
                                )}
                            </dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                {ticket.description}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-gray-500" />
                        Comments
                    </h3>
                </div>

                <div className="px-4 py-5 sm:p-6">
                    {/* Comment Form */}
                    <form onSubmit={handleSubmitComment} className="mb-8">
                        <div>
                            <label htmlFor="comment" className="sr-only">Add a comment</label>
                            <textarea
                                id="comment"
                                rows={3}
                                className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md border p-2"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                        </div>
                        <div className="mt-3 flex justify-end">
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Post Comment
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="flow-root">
                        <ul className="-mb-8">
                            {comments.map((comment, commentIdx) => (
                                <li key={comment.id}>
                                    <div className="relative pb-8">
                                        {commentIdx !== comments.length - 1 ? (
                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex space-x-3">
                                            <div className="relative">
                                                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center ring-8 ring-white">
                                                    <span className="font-medium text-gray-500 text-xs">
                                                        {comment.user?.username?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        <span className="font-medium text-gray-900 mr-2">{comment.user?.username}</span>
                                                        commented
                                                    </p>
                                                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                                                        <p>{comment.content}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                    <time dateTime={comment.createdAt}>
                                                        {new Date(comment.createdAt).toLocaleString()}
                                                    </time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {comments.length === 0 && (
                                <li className="text-center text-gray-500 py-4">No comments yet</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
