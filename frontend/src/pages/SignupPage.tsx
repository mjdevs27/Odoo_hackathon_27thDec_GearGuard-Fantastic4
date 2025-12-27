import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const SignupPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    // Password validation checks
    const passwordChecks = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)
    };

    const allPasswordChecksPassed = Object.values(passwordChecks).every(Boolean);

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

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!allPasswordChecksPassed) {
            newErrors.password = 'Password does not meet requirements';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/signup', {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password
            });

            // Store token
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (error: any) {
            if (error.response?.data?.field) {
                setErrors({ [error.response.data.field]: error.response.data.error });
            } else {
                setErrors({ general: error.response?.data?.error || 'Signup failed. Please try again.' });
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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
                    <p className="text-slate-600 dark:text-slate-400">Join GearGuard to manage your maintenance</p>
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

                        {/* Name Field */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border ${errors.fullName
                                    ? 'border-red-300 dark:border-red-700'
                                    : 'border-slate-200 dark:border-slate-700'
                                    } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none`}
                                placeholder="John Doe"
                            />
                            {errors.fullName && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
                            )}
                        </div>

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
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
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

                            {/* Password Requirements */}
                            {(passwordFocused || formData.password) && (
                                <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Password must contain:</p>
                                    <div className="space-y-1">
                                        <PasswordCheck label="At least 8 characters" checked={passwordChecks.length} />
                                        <PasswordCheck label="One uppercase letter" checked={passwordChecks.uppercase} />
                                        <PasswordCheck label="One lowercase letter" checked={passwordChecks.lowercase} />
                                        <PasswordCheck label="One special character" checked={passwordChecks.special} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 pr-12 rounded-lg bg-slate-50 dark:bg-slate-900 border ${errors.confirmPassword
                                        ? 'border-red-300 dark:border-red-700'
                                        : 'border-slate-200 dark:border-slate-700'
                                        } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Password Check Component
const PasswordCheck = ({ label, checked }: { label: string; checked: boolean }) => (
    <div className="flex items-center gap-2">
        <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${checked ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}>
            {checked && <Check className="w-3 h-3 text-white" />}
            {!checked && <X className="w-2.5 h-2.5 text-slate-500" />}
        </div>
        <span className={`text-xs ${checked ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-500'
            }`}>
            {label}
        </span>
    </div>
);

export default SignupPage;
