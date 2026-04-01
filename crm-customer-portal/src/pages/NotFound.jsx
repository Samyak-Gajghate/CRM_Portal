import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <AlertCircle className="w-64 h-64 text-slate-400" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <h1 className="text-9xl font-extrabold text-slate-900 tracking-tight">404</h1>
                        <p className="text-2xl font-bold text-slate-800 tracking-tight sm:text-3xl mb-2 mt-4">
                            Page not found
                        </p>
                        <p className="text-slate-500 mb-8">
                            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                        </p>
                        <div className="flex gap-4">
                            <Link 
                                to="/" 
                                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-[6px] hover:bg-teal-700 transition-colors shadow-sm active:scale-[0.98]"
                            >
                                <Home className="w-4 h-4" />
                                Go back home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
