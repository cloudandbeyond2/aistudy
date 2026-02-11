import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { serverURL } from '@/constants';
import axios from 'axios';
import { Key, Save, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AdminSettings = () => {
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [unsplashApiKey, setUnsplashApiKey] = useState('');
    const [websiteName, setWebsiteName] = useState('');
    const [websiteLogo, setWebsiteLogo] = useState('');
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
            setGeminiApiKey(res.data.geminiApiKey || '');
            setUnsplashApiKey(res.data.unsplashApiKey || '');
            setWebsiteName(res.data.websiteName || 'AIstudy');
            setWebsiteLogo(res.data.websiteLogo || '/logo.png');
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
                geminiApiKey,
                unsplashApiKey,
                websiteName,
                websiteLogo
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

            <div className="max-w-2xl">
                <form onSubmit={handleSave} className="space-y-6">
                    <Card className="border-border/50 shadow-lg">
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
                                    placeholder="e.g. AIstudy"
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
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" />
                                <CardTitle>AI Configuration</CardTitle>
                            </div>
                            <CardDescription>
                                Manage your Google Gemini API settings for course generation and AI features.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                    This key is used for all AI-powered features including course and exam generation.
                                </p>
                            </div>

                            <Alert className="bg-primary/5 border-primary/20">
                                <AlertCircle className="h-4 w-4 text-primary" />
                                <AlertTitle className="text-primary">Important</AlertTitle>
                                <AlertDescription className="text-xs">
                                    If left empty, the system will fallback to the key defined in the server's environment variables.
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
