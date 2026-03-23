import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { serverURL } from '@/constants';
import axios from 'axios';
import { Key, Save, AlertCircle, Upload, HandCoins, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AdminSettings = () => {
    const [aiProvider, setAiProvider] = useState<'gemini' | 'openai'>('gemini');
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
    const [openaiApiKey, setOpenaiApiKey] = useState('');
    const [openaiModel, setOpenaiModel] = useState('gpt-4.1-mini');
    const [unsplashApiKey, setUnsplashApiKey] = useState('');
    const [websiteName, setWebsiteName] = useState('');
    const [websiteLogo, setWebsiteLogo] = useState('');
    const [taxPercentage, setTaxPercentage] = useState<number>(0);
    const [notebookEnabled, setNotebookEnabled] = useState({
        free: false,
        monthly: true,
        yearly: true,
        forever: true,
        org_admin: true,
        student: false
    });
    const [resumeEnabled, setResumeEnabled] = useState({
        free: false,
        monthly: true,
        yearly: true,
        forever: true,
        org_admin: true,
        student: false
    });
    const [careerEnabled, setCareerEnabled] = useState({
        free: false,
        monthly: true,
        yearly: true,
        forever: true,
        org_admin: true,
        student: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/settings`);
            setAiProvider(res.data.aiProvider || 'gemini');
            setGeminiApiKey(res.data.geminiApiKey || '');
            setGeminiModel(res.data.geminiModel || 'gemini-2.5-flash');
            setOpenaiApiKey(res.data.openaiApiKey || '');
            setOpenaiModel(res.data.openaiModel || 'gpt-4.1-mini');
            setUnsplashApiKey(res.data.unsplashApiKey || '');
            setWebsiteName(res.data.websiteName || 'Colossus IQ');
            setWebsiteLogo(res.data.websiteLogo || '/logo.png');
            setTaxPercentage(res.data.taxPercentage || 0);
            if (res.data.notebookEnabled) {
                setNotebookEnabled(res.data.notebookEnabled);
            }
            if (res.data.resumeEnabled) {
                setResumeEnabled(res.data.resumeEnabled);
            }
            if (res.data.careerEnabled) {
                setCareerEnabled(res.data.careerEnabled);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast({
                title: "Error",
                description: "Failed to load settings",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Invalid file type",
                description: "Please upload a JPEG, PNG, or SVG image",
                variant: "destructive"
            });
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Image size should be less than 5MB",
                variant: "destructive"
            });
            return;
        }

        const formData = new FormData();
        formData.append('logo', file);

        setIsUploading(true);
        try {
            const res = await axios.post(`${serverURL}/api/settings/upload-logo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                setWebsiteLogo(res.data.url);
                toast({
                    title: "Logo Uploaded",
                    description: "Logo uploaded successfully. Don't forget to save settings.",
                });
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            toast({
                title: "Upload Failed",
                description: error.response?.data?.message || "Failed to upload image",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await axios.post(`${serverURL}/api/settings`, {
                aiProvider,
                geminiApiKey,
                geminiModel,
                openaiApiKey,
                openaiModel,
                unsplashApiKey,
                websiteName,
                websiteLogo,
                taxPercentage: Number(taxPercentage),
                notebookEnabled,
                resumeEnabled,
                careerEnabled
            });
            if (res.data.success) {
                toast({
                    title: "Success",
                    description: "Settings updated successfully",
                });
                // Reload page to apply branding changes globally
                window.location.reload();
            }
        } catch (error: any) {
            console.error('Save error:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to save settings",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleNotebookToggle = (role: keyof typeof notebookEnabled) => {
        setNotebookEnabled(prev => ({
            ...prev,
            [role]: !prev[role]
        }));
    };

    const handleResumeToggle = (role: keyof typeof resumeEnabled) => {
        setResumeEnabled(prev => ({
            ...prev,
            [role]: !prev[role]
        }));
    };

    const handleCareerToggle = (role: keyof typeof careerEnabled) => {
        setCareerEnabled(prev => ({
            ...prev,
            [role]: !prev[role]
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-500">Settings</h1>
                <p className="text-muted-foreground mt-1">Configure platform-wide settings and API integrations</p>
            </div>

            <div className="max-w-5xl">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-border/50 shadow-lg h-full">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Save className="h-5 w-5 text-primary" />
                                    <CardTitle>General Branding</CardTitle>
                                </div>
                                <CardDescription>
                                    Customize your website's appearance and identity.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="website-name">Website Name</Label>
                                    <Input
                                        id="website-name"
                                        placeholder="e.g. Colossus IQ"
                                        value={websiteName}
                                        onChange={(e) => setWebsiteName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website-logo">Logo</Label>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    id="website-logo"
                                                    placeholder="e.g. /logo.png or https://..."
                                                    value={websiteLogo}
                                                    onChange={(e) => setWebsiteLogo(e.target.value)}
                                                />
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        id="logo-upload"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleLogoUpload}
                                                        disabled={isUploading}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="shrink-0"
                                                        asChild
                                                    >
                                                        <label htmlFor="logo-upload" className="cursor-pointer">
                                                            {isUploading ? (
                                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                                                            ) : (
                                                                <Upload className="h-4 w-4" />
                                                            )}
                                                        </label>
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground italic">
                                                Recommended: Square image or SVG with transparent background.
                                            </p>
                                        </div>

                                        {websiteLogo && (
                                            <div className="h-20 w-20 rounded-xl border border-border/50 bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
                                                <img
                                                    src={
                                                        websiteLogo.startsWith('/uploads/')
                                                            ? `${serverURL}${websiteLogo}`
                                                            : websiteLogo.startsWith('http')
                                                                ? websiteLogo
                                                                : websiteLogo // Assume it's a public frontend asset if it's any other relative path
                                                    }
                                                    alt="Logo Preview"
                                                    className="max-h-full max-w-full object-contain p-2"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Logo';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-border/30">
                                    <Label htmlFor="tax-percentage" className="flex items-center gap-2">
                                        <div className="bg-primary/10 p-1.5 rounded-md text-primary">
                                            <HandCoins className="h-4 w-4" />
                                        </div>
                                        Tax Percentage (%)
                                    </Label>
                                    <div className="max-w-[200px]">
                                        <div className="relative">
                                            <Input
                                                id="tax-percentage"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                placeholder="e.g. 18"
                                                value={taxPercentage}
                                                onChange={(e) => setTaxPercentage(Number(e.target.value))}
                                                className="pl-4 pr-10"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">%</div>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-1.5 italic">
                                            This tax will be added to all plan prices during checkout.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-border/50 shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Key className="h-5 w-5 text-primary" />
                                    <CardTitle>AI Configuration</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Choose the platform-wide AI provider for course generation, notebook, exams, and other text AI features.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ai-provider">Active AI Provider</Label>
                                        <select
                                            id="ai-provider"
                                            value={aiProvider}
                                            onChange={(e) => setAiProvider(e.target.value as 'gemini' | 'openai')}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="gemini">Google Gemini</option>
                                            <option value="openai">OpenAI GPT</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground">
                                            Admin can switch the whole platform between Gemini and OpenAI without changing the frontend course flow.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gemini-api-key">Gemini API Key</Label>
                                        <div className="relative">
                                            <Input
                                                id="gemini-api-key"
                                                type="password"
                                                placeholder="Enter your Gemini API key"
                                                value={geminiApiKey}
                                                onChange={(e) => setGeminiApiKey(e.target.value)}
                                                className="pr-10"
                                            />
                                            <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Used when the active provider is Gemini.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gemini-model">Gemini Model</Label>
                                        <Input
                                            id="gemini-model"
                                            placeholder="e.g. gemini-2.5-flash"
                                            value={geminiModel}
                                            onChange={(e) => setGeminiModel(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2 pt-3 border-t border-border/30">
                                        <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                                        <div className="relative">
                                            <Input
                                                id="openai-api-key"
                                                type="password"
                                                placeholder="Enter your OpenAI API key"
                                                value={openaiApiKey}
                                                onChange={(e) => setOpenaiApiKey(e.target.value)}
                                                className="pr-10"
                                            />
                                            <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Optional backup key. If Gemini is the active provider and Gemini fails, the system can continue on OpenAI.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="openai-model">OpenAI Model</Label>
                                        <Input
                                            id="openai-model"
                                            placeholder="e.g. gpt-4.1-mini"
                                            value={openaiModel}
                                            onChange={(e) => setOpenaiModel(e.target.value)}
                                        />
                                    </div>

                                    <Alert className="bg-primary/5 border-primary/20">
                                        <AlertCircle className="h-4 w-4 text-primary" />
                                        <AlertTitle className="text-primary">Important</AlertTitle>
                                        <AlertDescription className="text-xs">
                                            If a key is left empty, the system will fallback to the matching server environment variable when available.
                                        </AlertDescription>
                                    </Alert>

                                    <Alert className="bg-muted/40 border-border/50">
                                        <AlertCircle className="h-4 w-4 text-primary" />
                                        <AlertTitle>Implementation Idea</AlertTitle>
                                        <AlertDescription className="text-xs">
                                            Recommended setup: keep Gemini as the primary provider and configure OpenAI as backup continuity when Gemini is down or rate-limited.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Key className="h-5 w-5 text-indigo-500" />
                                        <CardTitle>Image Content (Unsplash)</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Manage your Unsplash API settings for fetching high-quality course cover images.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="unsplash-api-key">Unsplash Access Key</Label>
                                        <div className="relative">
                                            <Input
                                                id="unsplash-api-key"
                                                type="password"
                                                placeholder="Enter your Unsplash Access Key"
                                                value={unsplashApiKey}
                                                onChange={(e) => setUnsplashApiKey(e.target.value)}
                                                className="pr-10"
                                            />
                                            <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            This key is used to fetch relevant background images for newly generated courses.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Card className="border-border/50 shadow-lg border-primary/20">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <CardTitle>Feature Management</CardTitle>
                            </div>
                            <CardDescription>
                                Enable or disable specific features for different types of users.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-4 border-border/30">
                                    <div>
                                        <Label className="text-base font-semibold">AI Notebook Visibility</Label>
                                        <p className="text-sm text-muted-foreground">Control which users can see the AI Notebook in their sidemenu.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="nb-free" className="cursor-pointer font-medium">Free Users</Label>
                                        <input
                                            type="checkbox"
                                            id="nb-free"
                                            checked={notebookEnabled.free}
                                            onChange={() => handleNotebookToggle('free')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="nb-monthly" className="cursor-pointer font-medium">Monthly Paid</Label>
                                        <input
                                            type="checkbox"
                                            id="nb-monthly"
                                            checked={notebookEnabled.monthly}
                                            onChange={() => handleNotebookToggle('monthly')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="nb-yearly" className="cursor-pointer font-medium">Yearly Paid</Label>
                                        <input
                                            type="checkbox"
                                            id="nb-yearly"
                                            checked={notebookEnabled.yearly}
                                            onChange={() => handleNotebookToggle('yearly')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="nb-forever" className="cursor-pointer font-medium">Lifetime Access</Label>
                                        <input
                                            type="checkbox"
                                            id="nb-forever"
                                            checked={notebookEnabled.forever}
                                            onChange={() => handleNotebookToggle('forever')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="nb-org" className="cursor-pointer font-medium">Organization Admins</Label>
                                        <input
                                            type="checkbox"
                                            id="nb-org"
                                            checked={notebookEnabled.org_admin}
                                            onChange={() => handleNotebookToggle('org_admin')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="nb-student" className="cursor-pointer font-medium">Organization Students</Label>
                                        <input
                                            type="checkbox"
                                            id="nb-student"
                                            checked={notebookEnabled.student}
                                            onChange={() => handleNotebookToggle('student')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-b pb-4 border-border/30 pt-4">
                                    <div>
                                        <Label className="text-base font-semibold">Resume Builder Visibility</Label>
                                        <p className="text-sm text-muted-foreground">Control which users can see the Resume Builder in their sidemenu.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="rb-free" className="cursor-pointer font-medium">Free Users</Label>
                                        <input
                                            type="checkbox"
                                            id="rb-free"
                                            checked={resumeEnabled.free}
                                            onChange={() => handleResumeToggle('free')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="rb-monthly" className="cursor-pointer font-medium">Monthly Paid</Label>
                                        <input
                                            type="checkbox"
                                            id="rb-monthly"
                                            checked={resumeEnabled.monthly}
                                            onChange={() => handleResumeToggle('monthly')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="rb-yearly" className="cursor-pointer font-medium">Yearly Paid</Label>
                                        <input
                                            type="checkbox"
                                            id="rb-yearly"
                                            checked={resumeEnabled.yearly}
                                            onChange={() => handleResumeToggle('yearly')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="rb-forever" className="cursor-pointer font-medium">Lifetime Access</Label>
                                        <input
                                            type="checkbox"
                                            id="rb-forever"
                                            checked={resumeEnabled.forever}
                                            onChange={() => handleResumeToggle('forever')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="rb-org" className="cursor-pointer font-medium">Organization Admins</Label>
                                        <input
                                            type="checkbox"
                                            id="rb-org"
                                            checked={resumeEnabled.org_admin}
                                            onChange={() => handleResumeToggle('org_admin')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="rb-student" className="cursor-pointer font-medium">Organization Students</Label>
                                        <input
                                            type="checkbox"
                                            id="rb-student"
                                            checked={resumeEnabled.student}
                                            onChange={() => handleResumeToggle('student')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-b pb-4 border-border/30 pt-4">
                                    <div>
                                        <Label className="text-base font-semibold">Career & Placement Visibility</Label>
                                        <p className="text-sm text-muted-foreground">Control which users can see the Career & Placement section in their sidemenu.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="cp-free" className="cursor-pointer font-medium">Free Users</Label>
                                        <input
                                            type="checkbox"
                                            id="cp-free"
                                            checked={careerEnabled.free}
                                            onChange={() => handleCareerToggle('free')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="cp-monthly" className="cursor-pointer font-medium">Monthly Paid</Label>
                                        <input
                                            type="checkbox"
                                            id="cp-monthly"
                                            checked={careerEnabled.monthly}
                                            onChange={() => handleCareerToggle('monthly')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="cp-yearly" className="cursor-pointer font-medium">Yearly Paid</Label>
                                        <input
                                            type="checkbox"
                                            id="cp-yearly"
                                            checked={careerEnabled.yearly}
                                            onChange={() => handleCareerToggle('yearly')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="cp-forever" className="cursor-pointer font-medium">Lifetime Access</Label>
                                        <input
                                            type="checkbox"
                                            id="cp-forever"
                                            checked={careerEnabled.forever}
                                            onChange={() => handleCareerToggle('forever')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="cp-org" className="cursor-pointer font-medium">Organization Admins</Label>
                                        <input
                                            type="checkbox"
                                            id="cp-org"
                                            checked={careerEnabled.org_admin}
                                            onChange={() => handleCareerToggle('org_admin')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <Label htmlFor="cp-student" className="cursor-pointer font-medium">Organization Students</Label>
                                        <input
                                            type="checkbox"
                                            id="cp-student"
                                            checked={careerEnabled.student}
                                            onChange={() => handleCareerToggle('student')}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving} className="px-8 shadow-md">
                            {isSaving ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="h-4 w-4" />
                                    Save Settings
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminSettings;
