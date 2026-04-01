import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Brand Panel */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#1e2433] to-[#0f3460] flex-col justify-between p-12 text-white relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
                    <div className="absolute bottom-[20%] left-[10%] w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center shrink-0 shadow-lg">
                            <span className="text-white text-sm font-bold">C</span>
                        </div>
                        <span className="text-xl font-bold tracking-wide">CRM Portal</span>
                    </div>

                    <h1 className="text-4xl font-bold leading-tight mb-6">
                        Customer support<br />made effortless.
                    </h1>
                    <p className="text-slate-300 text-lg max-w-md">
                        The all-in-one workspace for your support team. Resolve tickets faster and keep your customers happy.
                    </p>
                </div>

                {/* Decorative mockups */}
                <div className="relative z-10 space-y-4 my-12 hidden xl:block">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 max-w-sm mr-auto transform -rotate-2 hover:rotate-0 transition-transform cursor-default">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full bg-red-400"></span>
                            <span className="text-xs font-semibold tracking-wider text-rose-200 uppercase">Critical</span>
                            <span className="text-xs text-slate-300 ml-auto">2m ago</span>
                        </div>
                        <p className="font-medium text-white text-sm">Login page not loading on mobile Safari</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 max-w-sm ml-auto transform rotate-2 hover:rotate-0 transition-transform cursor-default">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                            <span className="text-xs font-semibold tracking-wider text-orange-200 uppercase">High</span>
                            <span className="text-xs text-slate-300 ml-auto">1h ago</span>
                        </div>
                        <p className="font-medium text-white text-sm">Password reset email delayed</p>
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-sm text-slate-400 font-medium">Trusted by support teams everywhere</p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-32 relative">
                <div className="mx-auto w-full max-w-sm lg:hidden mb-8 text-center flex flex-col items-center">
                    <div className="w-10 h-10 bg-teal-600 rounded flex items-center justify-center shrink-0 shadow-md mb-4">
                        <span className="text-white text-base font-bold">C</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-900 tracking-wide">CRM Portal</span>
                </div>

                <div className="mx-auto w-full max-w-sm">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
                        <p className="text-slate-500">Sign in to your account to continue</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="username">
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 outline-none bg-white border border-slate-300 rounded-[6px] text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                                        placeholder="your-username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 outline-none bg-white border border-slate-300 rounded-[6px] text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm border border-red-200 rounded-[6px]">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 bg-teal-600 text-white text-sm font-semibold rounded-[6px] hover:bg-teal-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
                            Create one now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
