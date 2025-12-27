import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email: formData.email,
                password: formData.password
            });

            // Store token and user data
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (error: any) {
            if (error.response?.status === 401) {
                // Invalid credentials
                const errorMsg = error.response.data.error;
                if (errorMsg.includes('email')) {
                    setErrors({ email: 'Account does not exist' });
                } else {
                    setErrors({ password: 'Invalid password' });
                }
            } else if (error.response?.status === 403) {
                setErrors({ general: 'Account is inactive. Please contact support.' });
            } else {
                setErrors({ general: error.response?.data?.error || 'Login failed. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 overflow-y-auto">
            {/* Back to Home */}
            <Link
                to="/"
                className="fixed top-6 left-6 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-10"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Home</span>
            </Link>

            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-600 rounded-xl">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">GearGuard</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-600 dark:text-slate-400">Sign in to continue to your dashboard</p>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* General Error */}
                        {errors.general && (
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium flex items-start gap-2">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{errors.general}</span>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border ${errors.email
                                    ? 'border-red-300 dark:border-red-700'
                                    : 'border-slate-200 dark:border-slate-700'
                                    } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none`}
                                placeholder="john@example.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 pr-12 rounded-lg bg-slate-50 dark:bg-slate-900 border ${errors.password
                                        ? 'border-red-300 dark:border-red-700'
                                        : 'border-slate-200 dark:border-slate-700'
                                        } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="mt-6 space-y-3">
                        <div className="text-center">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
