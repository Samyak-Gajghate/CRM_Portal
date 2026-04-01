import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/ui/Toast';
import { Search, ChevronDown, HelpCircle, BookOpen } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';

const FAQList = () => {
    const toast = useToast();
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchFAQs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchFAQs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/faqs');
            setFaqs(response.data?.data || response.data || []);
        } catch (error) {
            toast.error("Failed to load FAQs");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            fetchFAQs();
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/faqs/search?keyword=${searchQuery}`);
            setFaqs(response.data?.data || response.data || []);
        } catch (error) {
            toast.error("Search failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Group FAQs by category
    const groupedFaqs = faqs.reduce((acc, faq) => {
        const cat = faq.category || 'GENERAL';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(faq);
        return acc;
    }, {});

    return (
        <div className="animate-in fade-in duration-300 w-full">
            
            {/* Hero Section */}
            <div className="w-full bg-gradient-to-br from-[#1e2433] to-[#0f3460] rounded-2xl p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
                
                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl mb-6 shadow-sm border border-white/20">
                        <BookOpen className="w-8 h-8 text-teal-300" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Knowledge Base</h1>
                    <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
                        Find answers to common questions, troubleshooting guides, and helpful tips.
                    </p>

                    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-24 py-4 bg-white border-0 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-teal-500/30 text-base lg:text-lg shadow-xl outline-none transition-all"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button 
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 rounded-lg text-sm transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto px-4 md:px-0 pb-12">
                {loading ? (
                    <div className="flex h-40 items-center justify-center text-slate-500">Loading FAQs...</div>
                ) : Object.keys(groupedFaqs).length === 0 ? (
                    <EmptyState 
                        icon={HelpCircle}
                        title="No results found"
                        description={searchQuery ? `We couldn't find any FAQs matching "${searchQuery}".` : "No FAQs are currently available."}
                        action={searchQuery ? (
                            <button onClick={() => { setSearchQuery(''); fetchFAQs(); }} className="mt-4 text-teal-600 hover:text-teal-700 font-semibold text-sm">
                                Clear search
                            </button>
                        ) : null}
                    />
                ) : (
                    <div className="space-y-12">
                        {Object.entries(groupedFaqs).map(([category, items]) => (
                            <div key={category} className="mb-8">
                                <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-6 flex items-center gap-3">
                                    {category}
                                    <span className="h-px flex-1 bg-slate-200"></span>
                                    <span className="bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full text-xs">{items.length}</span>
                                </h2>
                                
                                <div className="space-y-3">
                                    {items.map((faq) => {
                                        const isExpanded = expandedId === faq.id;
                                        return (
                                            <div 
                                                key={faq.id} 
                                                className={`bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden ${
                                                    isExpanded ? 'border-teal-500 ring-1 ring-teal-500 shadow-md' : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <button
                                                    onClick={() => toggleExpand(faq.id)}
                                                    className="w-full px-5 py-4 flex items-center justify-between bg-white focus:outline-none"
                                                >
                                                    <div className="flex items-center text-left gap-3">
                                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${isExpanded ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                                                            <HelpCircle className="h-4 w-4" />
                                                        </div>
                                                        <span className={`text-base font-semibold ${isExpanded ? 'text-teal-900' : 'text-slate-800'}`}>
                                                            {faq.question}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isExpanded ? 'text-teal-500 rotate-180' : 'text-slate-400'}`} />
                                                </button>
                                                
                                                {isExpanded && (
                                                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50">
                                                        <div className="pl-11 pr-4">
                                                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                                {faq.answer}
                                                            </p>
                                                            <div className="mt-4 flex items-center gap-2">
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase bg-teal-100 text-teal-700">
                                                                    {faq.category || 'General'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FAQList;
