import { useEffect, useRef, useState } from 'react';
import GLOBE from 'vanta/dist/vanta.globe.min';
import * as THREE from 'three';
import { Moon, Sun, ArrowRight, Shield, Wrench, Users, BarChart3, Calendar, ClipboardList, Cog } from 'lucide-react';

const LandingPage = () => {
    const vantaRef = useRef<HTMLDivElement>(null);
    const [vantaEffect, setVantaEffect] = useState<any>(null);
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Initialize and update Vanta effect
    useEffect(() => {
        if (vantaEffect) {
            vantaEffect.destroy();
        }

        if (vantaRef.current) {
            const effect = GLOBE({
                el: vantaRef.current,
                THREE: THREE,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: window.innerHeight,
                minWidth: window.innerWidth,
                scale: 1.00,
                scaleMobile: 1.00,
                color: isDarkMode ? 0x3b82f6 : 0x1e40af,
                backgroundColor: isDarkMode ? 0x0f172a : 0xcbd5e1
            });
            setVantaEffect(effect);
        }

        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [isDarkMode]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (vantaEffect) vantaEffect.resize();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [vantaEffect]);

    return (
        <div className="relative min-h-screen w-full bg-slate-300 dark:bg-slate-900">
            {/* Vanta Background */}
            <div ref={vantaRef} className="fixed inset-0 z-0" style={{ width: '100vw', height: '100vh' }} />

            {/* Capsule Navbar */}
            <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-2 py-2 flex items-center gap-2 backdrop-blur-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-full shadow-lg">
                <div className="flex items-center gap-2 px-3">
                    <div className="p-1.5 bg-blue-600 rounded-lg">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">GearGuard</span>
                </div>

                <div className="hidden md:flex items-center gap-1 px-2">
                    <a href="#features" className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/10">Features</a>
                    <a href="#workflow" className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/10">Workflow</a>
                    <a href="#about" className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/10">About</a>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-all"
                        aria-label="Toggle Theme"
                    >
                        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all">
                        Login
                    </button>
                </div>
            </nav>

            {/* Content Container */}
            <div className="relative z-10">

                {/* Hero Section */}
                <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none">
                            <span style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}>Maintenance</span>
                            <br />
                            <span style={{ color: isDarkMode ? '#3b82f6' : '#1d4ed8' }}>Reimagined</span>
                        </h1>

                        <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>
                            The ultimate platform connecting equipment, teams, and requests.
                            Streamline your maintenance workflow with intelligent tracking.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <button className="group px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-xl shadow-blue-600/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                                Get Started
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                className="px-8 py-4 rounded-full backdrop-blur-sm font-semibold text-lg transition-all"
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(30,64,175,0.1)',
                                    border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(30,64,175,0.3)',
                                    color: isDarkMode ? '#ffffff' : '#1e40af'
                                }}
                            >
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Powerful Features</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">Everything you need to manage your equipment and maintenance workflows.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { icon: <Wrench className="w-6 h-6" />, title: "Equipment Tracking", desc: "Track all assets by department or employee with complete history and warranty info." },
                                { icon: <Users className="w-6 h-6" />, title: "Team Management", desc: "Organize specialized teams and auto-assign technicians to specific workflows." },
                                { icon: <BarChart3 className="w-6 h-6" />, title: "Smart Analytics", desc: "Get insights into request patterns and optimize your maintenance schedule." },
                                { icon: <Calendar className="w-6 h-6" />, title: "Calendar View", desc: "Visualize all scheduled maintenance on an interactive calendar." },
                                { icon: <ClipboardList className="w-6 h-6" />, title: "Request Lifecycle", desc: "Track requests from creation to completion with intuitive Kanban boards." },
                                { icon: <Cog className="w-6 h-6" />, title: "Automation", desc: "Auto-fill equipment details and team assignments when creating requests." }
                            ].map((feature, idx) => (
                                <div key={idx} className="group p-6 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-lg transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Workflow Section */}
                <section id="workflow" className="py-24 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">A simple yet powerful workflow to manage all your maintenance needs.</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { step: "01", title: "Create Request", desc: "Any user can submit a maintenance request. Simply select the equipment and describe the issue." },
                                { step: "02", title: "Auto-Assignment", desc: "The system automatically fetches the equipment category and assigns the right maintenance team." },
                                { step: "03", title: "Track Progress", desc: "Move requests through stages: New → In Progress → Repaired. Visualize everything on a Kanban board." },
                                { step: "04", title: "Complete & Report", desc: "Record hours spent, mark as complete, and get insights into your maintenance operations." }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-6 p-6 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:shadow-lg transition-all">
                                    <div className="text-5xl font-black text-blue-200 dark:text-blue-600/50">{item.step}</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer id="about" className="py-12 px-6 border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-transparent backdrop-blur-sm">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-600 rounded-lg">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">GearGuard</span>
                        </div>
                        <p className="text-slate-500 text-sm">© 2024 GearGuard. The Ultimate Maintenance Tracker.</p>
                    </div>
                </footer>

            </div>
        </div>
    );
};

export default LandingPage;
