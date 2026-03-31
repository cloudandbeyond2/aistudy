import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from '@/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Users, 
    Award, 
    Building2, 
    ArrowRight, 
    CheckCircle2, 
    ShieldCheck,
    Globe,
    Zap
} from 'lucide-react';

const OrgLandingPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [landing, setLanding] = useState<any>(null);

    useEffect(() => {
        const fetchLandingData = async () => {
            try {
                const response = await axios.get(`${serverURL}/api/org-landing/public/${slug}`);
                if (response.data.success) {
                    setLanding(response.data.landing);
                    document.title = `${response.data.landing.organization.name} | Official Portal`;
                }
            } catch (error) {
                console.error('Error fetching landing data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLandingData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="relative">
                    <div className="w-24 h-24 border-2 border-primary/20 rounded-full animate-ping absolute inset-0"></div>
                    <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin relative"></div>
                </div>
            </div>
        );
    }

    if (!landing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white p-4">
                <div className="text-8xl font-black text-primary/20 mb-4 tracking-tighter">404</div>
                <h1 className="text-2xl font-bold mb-2">Portal Not Found</h1>
                <p className="text-slate-400 mb-8 max-w-sm text-center">The custom URL for this organization may have changed or does not exist.</p>
                <Button onClick={() => navigate('/')} size="lg" className="rounded-full px-8">Return Home</Button>
            </div>
        );
    }

    const { organization, heroTitle, heroSubtitle, aboutUs, primaryColor, secondaryColor, statistics, placementCompanies } = landing;

    return (
        <div 
            className="min-h-screen bg-[#020617] text-slate-200 selection:bg-primary/30 selection:text-white overflow-hidden" 
            style={{ 
                '--primary': primaryColor || '#3b82f6',
                '--secondary': secondaryColor || '#1e3a8a'
            } as React.CSSProperties}
        >
            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/10 blur-[100px] rounded-full" />
            </div>

            {/* Premium Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-6">
                <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 h-20 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="relative">
                            <div className="absolute -inset-2 bg-primary/40 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
                            {organization.logo ? (
                                <img src={organization.logo} alt={organization.name} className="h-10 w-auto object-contain relative rounded-lg" />
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl relative">
                                    {organization.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xl tracking-tight text-white">{organization.name}</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold group-hover:text-primary transition-colors">Educational Portal</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5 hidden md:flex" onClick={() => navigate('/login')}>
                            Institution Login
                        </Button>
                        <Button onClick={() => navigate('/login')} className="bg-primary hover:bg-primary/80 text-white rounded-xl px-6 h-12 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                            Access Portal
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="relative pt-32 pb-20">
                {/* Modern Hero Section */}
                <section className="container mx-auto px-4 py-20 lg:py-32 relative text-center">
                    <div className="max-w-5xl mx-auto space-y-12">
                        {/* Status Batch */}
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-semibold animate-bounce-slow">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="tracking-wide">AI-POWERED LEARNING ECOSYSTEM</span>
                        </div>
                        
                        {/* Massive Typography */}
                        <h1 className="text-6xl lg:text-9xl font-black tracking-tighter leading-[0.95] text-white">
                            {heroTitle}
                        </h1>
                        
                        <p className="text-xl lg:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
                            {heroSubtitle}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                            <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/40 group overflow-hidden relative" onClick={() => navigate('/login')}>
                                <span className="relative z-10 flex items-center gap-2">
                                    Student Entrance <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </Button>
                            
                            <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/20" onClick={() => navigate('/login')}>
                                Staff Area
                            </Button>
                        </div>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="mt-32 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
                        {[
                            { label: 'Active Learners', value: statistics.studentsCount || 0, icon: Users, color: 'text-blue-400' },
                            { label: 'Placements Done', value: statistics.placementsCount || 0, icon: Award, color: 'text-emerald-400' },
                            { label: 'Success Velocity', value: '98%', icon: Zap, color: 'text-amber-400' },
                            { label: 'Global Ranking', value: '#Top-Tier', icon: Globe, color: 'text-indigo-400' }
                        ].map((stat, i) => (
                            <div key={i} className="group relative p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
                                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color} mb-4 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-4xl font-black text-white mb-1">
                                    {typeof stat.value === 'number' && stat.value > 0 ? `${stat.value}+` : stat.value}
                                </div>
                                <div className="text-xs uppercase tracking-widest font-bold text-slate-500 group-hover:text-slate-300 transition-colors">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* About & Values Grid */}
                {aboutUs && (
                    <section className="py-32 relative overflow-hidden">
                        <div className="container mx-auto px-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                                <div className="space-y-8 relative">
                                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 blur-3xl rounded-full" />
                                    <div className="space-y-4">
                                        <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">Pioneering Education excellence.</h2>
                                        <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-transparent rounded-full" />
                                    </div>
                                    <p className="text-lg lg:text-xl text-slate-400 leading-relaxed font-normal">
                                        {aboutUs}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 pt-4">
                                        {[
                                            'Advanced AI Mentorship',
                                            'Industry Real-time Projects',
                                            'Strategic Careers Roadmap',
                                            'Global Alumni Network'
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="font-semibold text-slate-300">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <Card className="relative border-white/5 overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-900 to-black shadow-2xl p-1">
                                    <div className="aspect-[4/5] bg-slate-800/20 flex items-center justify-center group overflow-hidden">
                                        <Building2 className="w-32 h-32 text-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
                                        <div className="absolute bottom-12 left-12 right-12 p-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl space-y-2">
                                            <div className="text-white font-bold text-xl uppercase tracking-tighter">Established Infrastructure</div>
                                            <div className="text-slate-400 text-sm italic">"Shaping the visionaries of tomorrow through state-of-the-art facilities."</div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </section>
                )}

                {/* Companies: Sliding Modern Logo Cloud */}
                {placementCompanies && placementCompanies.length > 0 && (
                    <section className="py-32 bg-white/[0.02] border-y border-white/5 relative">
                        <div className="container mx-auto px-4 text-center space-y-16">
                            <div className="space-y-4">
                                <h3 className="text-3xl font-bold text-white tracking-tight">Our Talent Partners</h3>
                                <p className="text-slate-400 max-w-xl mx-auto">Connecting you to elite companies globally for the career you deserve.</p>
                            </div>
                            
                            <div className="flex flex-wrap justify-center gap-12 lg:gap-20">
                                {placementCompanies.map((company: any, i: number) => (
                                    <div key={i} className="flex flex-col items-center gap-4 group">
                                        <div className="relative">
                                            <div className="absolute -inset-4 bg-white opacity-0 group-hover:opacity-5 blur-2xl rounded-full transition-opacity" />
                                            <div className="h-20 w-40 flex items-center justify-center bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-white/20 transition-all duration-300 scale-100 group-hover:scale-110">
                                                {company.logoUrl ? (
                                                    <img src={company.logoUrl} alt={company.name} className="max-h-full max-w-full object-contain brightness-0 invert opacity-40 group-hover:opacity-100 transition-all duration-500" />
                                                ) : (
                                                    <span className="font-black text-slate-600 group-hover:text-white transition-colors">{company.name}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[9px] uppercase tracking-[0.3em] font-black text-slate-600 group-hover:text-primary transition-colors">{company.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Final CTA: Modern Gradient Box */}
                <section className="py-32 container mx-auto px-4">
                    <div className="relative group p-1 rounded-[3.5rem] bg-gradient-to-r from-primary via-indigo-500 to-primary/50 animate-gradient-xy overflow-hidden shadow-2xl shadow-primary/20">
                        <div className="absolute inset-0 bg-[#020617]/90 rounded-[3.4rem]" />
                        <div className="relative z-10 px-8 py-20 md:p-24 text-center space-y-10">
                            <h2 className="text-4xl lg:text-7xl font-black text-white leading-tight">Your future begins<br/>inside the portal.</h2>
                            <p className="text-xl text-slate-400 max-w-lg mx-auto">Join thousands of students achieving their dreams within our ecosystem.</p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button size="lg" className="h-16 px-12 text-xl font-bold bg-white text-[#020617] hover:bg-slate-200 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all" onClick={() => navigate('/login')}>
                                    Enter Student Login
                                </Button>
                                <Button size="lg" variant="outline" className="h-16 px-12 text-lg font-bold bg-transparent text-white border-white/20 hover:bg-white/10 rounded-2xl" onClick={() => window.scrollTo(0, 0)}>
                                    Contact Institution
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-12 border-t border-white/5 text-slate-500 relative z-10">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 font-semibold tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white font-bold">{organization.name.charAt(0)}</div>
                        <span className="text-sm">© 2026 {organization.name}. <span className="text-slate-600">Powered by </span><span className="text-primary hover:text-white transition-colors cursor-pointer">Colossus IQ</span></span>
                    </div>
                    <div className="flex gap-10 text-xs font-bold uppercase tracking-widest leading-none">
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary transition-colors">Help</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default OrgLandingPage;
