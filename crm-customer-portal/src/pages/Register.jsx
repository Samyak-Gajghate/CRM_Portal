import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, AlertCircle } from 'lucide-react';

const calculateStrength = (password) => {
    let score = 0;
    if (!password) return 0;
    if (password.length > 6) score += 1;
    if (password.length > 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(4, score);
};

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const strength = calculateStrength(formData.password);
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-teal-500', 'bg-teal-600'];
    const currentStrengthColor = formData.password ? strengthColors[strength] : 'bg-slate-200';

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Brand Panel */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#1e2433] to-[#0f3460] flex-col justify-between p-12 text-white relative overflow-hidden">
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
                        Join the future<br />of customer support.
                    </h1>
                    <p className="text-slate-300 text-lg max-w-md">
                        Get started in seconds. Empower your agents with the tools they need to resolve issues efficiently.
                    </p>
                </div>

                 {/* Decorative mockups */}
                 <div className="relative z-10 space-y-4 my-12 hidden xl:block">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 max-w-sm mr-auto transform rotate-2 hover:rotate-0 transition-transform cursor-default">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                            <span className="text-xs font-semibold tracking-wider text-teal-200 uppercase">Resolved</span>
                            <span className="text-xs text-slate-300 ml-auto">Just now</span>
                        </div>
                        <p className="font-medium text-white text-sm">Update billing system for EU customers</p>
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-sm text-slate-400 font-medium">Trusted by support teams everywhere</p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-32 py-12 relative overflow-y-auto">
                <div className="mx-auto w-full max-w-sm lg:hidden mb-8 text-center flex flex-col items-center">
                    <div className="w-10 h-10 bg-teal-600 rounded flex items-center justify-center shrink-0 shadow-md mb-4">
                        <span className="text-white text-base font-bold">C</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-900 tracking-wide">CRM Portal</span>
                </div>

                <div className="mx-auto w-full max-w-sm">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Create account</h2>
                        <p className="text-slate-500">Sign up to get started</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
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
                                    placeholder="Choose a username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="email">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 outline-none bg-white border border-slate-300 rounded-[6px] text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                                    placeholder="you@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
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
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                            
                            {/* Password Strength Meter */}
                            {formData.password && (
                                <div className="mt-2 text-xs">
                                    <div className="flex items-center gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
                                        {[...Array(4)].map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`h-full flex-1 transition-colors duration-300 ${i < strength ? currentStrengthColor : 'bg-transparent'}`}
                                            ></div>
                                        ))}
                                    </div>
                                    <div className="text-right text-slate-500 font-medium">
                                        {strengthLabels[Math.max(0, strength - 1)]}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className={`block w-full pl-10 pr-3 py-2.5 outline-none bg-white border rounded-[6px] text-sm text-slate-900 placeholder-slate-400 transition-colors focus:ring-2 ${
                                        formData.confirmPassword && formData.password !== formData.confirmPassword 
                                        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                                        : 'border-slate-300 focus:ring-teal-500/20 focus:border-teal-500'
                                    }`}
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm border border-red-200 rounded-[6px] mt-4">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || (formData.password !== formData.confirmPassword && formData.confirmPassword !== '')}
                            className="w-full mt-6 flex justify-center py-2.5 px-4 bg-teal-600 text-white text-sm font-semibold rounded-[6px] hover:bg-teal-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Registering...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
                            Sign in instead
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
