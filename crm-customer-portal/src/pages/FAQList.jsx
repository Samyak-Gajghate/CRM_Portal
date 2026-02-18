import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQList = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            const response = await api.get('/faqs');
            setFaqs(response.data?.data || []);
        } catch (error) {
            console.error("Error fetching FAQs", error);
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
            setFaqs(response.data.data);
        } catch (error) {
            console.error("Error searching FAQs", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
                <p className="mt-4 text-lg text-gray-500">
                    Find answers to common questions about our services.
                </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
                    placeholder="Search for answers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </form>

            {/* FAQ List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10">Loading FAQs...</div>
                ) : faqs.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No FAQs found matching your search.</div>
                ) : (
                    faqs.map((faq) => (
                        <div key={faq.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <button
                                onClick={() => toggleExpand(faq.id)}
                                className="w-full px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 hover:bg-gray-100 focus:outline-none"
                            >
                                <div className="flex items-center text-left">
                                    <HelpCircle className="h-5 w-5 text-blue-500 mr-3 hidden sm:block" />
                                    <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                                </div>
                                {expandedId === faq.id ? (
                                    <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                )}
                            </button>
                            {expandedId === faq.id && (
                                <div className="px-4 py-5 sm:p-6 border-t border-gray-200 bg-white">
                                    <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap">
                                        {faq.answer}
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-gray-500">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {faq.category}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FAQList;
