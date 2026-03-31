import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Building2, Save, Trash2, Plus, Globe, Sparkles, ExternalLink, Users, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { serverURL, websiteURL } from '@/constants';
import Swal from 'sweetalert2';

const OrgLandingSetup = ({ organizationId }: { organizationId: string }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<any>({
        slug: '',
        heroTitle: 'Welcome to our Learning Portal',
        heroSubtitle: 'Empower your future with quality education and placement support.',
        aboutUs: '',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e3a8a',
        statistics: {
            studentsCount: 0,
            placementsCount: 0
        },
        placementCompanies: []
    });

    const [newCompany, setNewCompany] = useState({ name: '', logoUrl: '' });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await axios.get(`${serverURL}/api/org-landing/config?organizationId=${organizationId}`, {
                    withCredentials: true
                });
                if (response.data.success && response.data.landing) {
                    setConfig(response.data.landing);
                } else if (!response.data.landing) {
                    // Pre-fill slug if first time
                    const orgName = sessionStorage.getItem('orgName') || 'institution';
                    const initialSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                    setConfig((prev: any) => ({ ...prev, slug: initialSlug }));
                }
            } catch (error) {
                console.error('Error fetching landing config:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, [organizationId]);

    const handleSave = async () => {
        console.log('Saving config for org:', organizationId);
        console.log('Config data:', config);

        if (!organizationId) {
            toast({ title: 'Error', description: 'Organization ID is missing. Please refresh and try again.', variant: 'destructive' });
            return;
        }

        if (!config.slug) {
            toast({ title: 'Slug is required', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            const response = await axios.put(`${serverURL}/api/org-landing/config`, {
                organizationId,
                ...config
            }, {
                withCredentials: true
            });
            
            console.log('Save response:', response.data);
            
            if (response.data.success) {
                toast({ title: 'Landing page updated!', description: 'Your public portal is now live with the new changes.' });
            }
        } catch (error: any) {
            console.error('Save error details:', error.response?.data || error.message);
            toast({ 
                title: 'Update failed', 
                description: error.response?.data?.message || 'Something went wrong. Check console for details.',
                variant: 'destructive' 
            });
        } finally {
            setSaving(false);
        }
    };

    const addCompany = () => {
        if (!newCompany.name) return;
        setConfig((prev: any) => ({
            ...prev,
            placementCompanies: [...prev.placementCompanies, newCompany]
        }));
        setNewCompany({ name: '', logoUrl: '' });
    };

    const removeCompany = (index: number) => {
        setConfig((prev: any) => ({
            ...prev,
            placementCompanies: prev.placementCompanies.filter((_: any, i: number) => i !== index)
        }));
    };

    if (loading) return <div>Loading portal configuration...</div>;

    const publicUrl = `${window.location.origin}/${config.slug}`;

    return (
        <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            Public Presence Manager
                        </div>
                        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <Globe className="text-primary w-8 h-8" />
                            Portal Customization
                        </h2>
                        <p className="text-muted-foreground font-medium max-w-md">
                            Design the first experience your students and partners see when visiting your institution's portal.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-xl h-12 px-6 border-primary/20 hover:bg-primary/5" onClick={() => window.open(publicUrl, '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" /> View Live Site
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                            {saving ? 'Synchronizing...' : <><Save className="w-4 h-4 mr-2" /> Publish Changes</>}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b pb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Identity & Branding</CardTitle>
                                    <CardDescription>Configure your institution's core digital profile.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Unique Portal Address (Slug)</Label>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white px-4 py-3 rounded-xl text-sm border font-mono text-slate-400 shadow-sm whitespace-nowrap">
                                        {window.location.host}/
                                    </div>
                                    <Input 
                                        className="h-12 rounded-xl text-lg font-bold border-slate-200 focus:ring-primary shadow-sm"
                                        value={config.slug} 
                                        onChange={(e) => setConfig({ ...config, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        placeholder="e.g. nit-trichy"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 italic">This identifies your organization unique URL. Avoid changing it frequently.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold">Primary Brand Color</Label>
                                    <div className="flex gap-3">
                                        <div className="relative overflow-hidden w-14 h-12 rounded-xl border-2 border-slate-100 shadow-inner">
                                            <Input type="color" className="absolute -inset-2 w-20 h-20 cursor-pointer p-0 border-none" value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} />
                                        </div>
                                        <Input className="h-12 rounded-xl font-mono" value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold">Secondary Accent Color</Label>
                                    <div className="flex gap-3">
                                        <div className="relative overflow-hidden w-14 h-12 rounded-xl border-2 border-slate-100 shadow-inner">
                                            <Input type="color" className="absolute -inset-2 w-20 h-20 cursor-pointer p-0 border-none" value={config.secondaryColor} onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })} />
                                        </div>
                                        <Input className="h-12 rounded-xl font-mono" value={config.secondaryColor} onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <Label className="text-sm font-bold text-slate-700">Hero Section Main Title</Label>
                                <Input className="h-14 text-lg rounded-xl border-slate-200" value={config.heroTitle} onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })} placeholder="E.g., Welcome to NIT Surat" />
                            </div>

                            <div className="grid gap-3">
                                <Label className="text-sm font-bold text-slate-700">Hero Support Subtitle</Label>
                                <Textarea className="rounded-xl border-slate-200 min-h-[100px] resize-none" value={config.heroSubtitle} onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })} placeholder="Briefly describe your institution's mission..." />
                            </div>

                            <div className="grid gap-3">
                                <Label className="text-sm font-bold text-slate-700">About Your Institution</Label>
                                <Textarea className="rounded-xl border-slate-200 min-h-[200px]" value={config.aboutUs} onChange={(e) => setConfig({ ...config, aboutUs: e.target.value })} placeholder="Detailed history, values, or achievements..." />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" /> Placement Ecosystem
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100 items-end">
                                <div className="flex-1 space-y-3">
                                    <Label className="text-sm font-bold">Company Name</Label>
                                    <Input className="h-12 rounded-xl" value={newCompany.name} onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })} placeholder="e.g. Google" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <Label className="text-sm font-bold">Logo URL (Icon)</Label>
                                    <Input className="h-12 rounded-xl" value={newCompany.logoUrl} onChange={(e) => setNewCompany({ ...newCompany, logoUrl: e.target.value })} placeholder="https://..." />
                                </div>
                                <Button onClick={addCompany} className="h-12 w-12 rounded-xl bg-slate-900 shadow-lg" size="icon">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {config.placementCompanies.map((company: any, index: number) => (
                                    <div key={index} className="relative group p-6 border border-slate-100 rounded-[2rem] bg-white flex flex-col items-center gap-3 transition-all hover:shadow-xl hover:border-primary/20">
                                        <div className="w-16 h-16 flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden shadow-inner">
                                            {company.logoUrl ? <img src={company.logoUrl} alt={company.name} className="max-w-[70%] max-h-[70%] object-contain" /> : <Building2 className="text-slate-300 w-8 h-8" />}
                                        </div>
                                        <p className="text-sm font-bold tracking-tight">{company.name}</p>
                                        <button 
                                            onClick={() => removeCompany(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {config.placementCompanies.length === 0 && (
                                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-[2rem] text-slate-300 font-medium italic">
                                        No placement partners added yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Stats & Tips */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="border-none shadow-xl rounded-[2.5rem] bg-[#0f172a] text-white overflow-hidden sticky top-32">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" /> Key Performance Indicators
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-slate-400 font-bold text-xs uppercase tracking-widest">Total Active Students</Label>
                                    <div className="relative">
                                        <Input type="number" className="h-14 bg-white/5 border-white/10 rounded-2xl text-2xl font-black focus:ring-primary pl-4 pr-16" value={config.statistics.studentsCount} onChange={(e) => setConfig({ ...config, statistics: { ...config.statistics, studentsCount: Number(e.target.value) }})} />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">COUNT</div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-slate-400 font-bold text-xs uppercase tracking-widest">Successful Placements</Label>
                                    <div className="relative">
                                        <Input type="number" className="h-14 bg-white/5 border-white/10 rounded-2xl text-2xl font-black focus:ring-primary pl-4 pr-16" value={config.statistics.placementsCount} onChange={(e) => setConfig({ ...config, statistics: { ...config.statistics, placementsCount: Number(e.target.value) }})} />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">TOTAL</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Sparkles className="w-5 h-5" />
                                    <h4 className="font-black text-xs uppercase tracking-widest">Pro Tip</h4>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                    Use high-quality images and specific achievements in your Hero Title to double your student engagement rate.
                                </p>
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-primary/50 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">Optimize Media</p>
                                        <p className="text-[10px] text-slate-500">Keep logo files under 200KB.</p>
                                    </div>
                                </div>
                                <Button variant="ghost" className="w-full h-14 rounded-2xl text-slate-400 hover:text-white mt-4" onClick={() => window.scrollTo(0,0)}>
                                    <Globe className="w-4 h-4 mr-2" /> Restore Default View
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OrgLandingSetup;
