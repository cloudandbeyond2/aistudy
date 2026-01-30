import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import { Loader2, Upload } from 'lucide-react';

const AdminCertificate = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        ceoName: '',
        ceoSignature: '',
        vpName: '',
        vpSignature: '',
        logo: '',
        qrCodeUrl: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${serverURL}/api/certificate-settings`);
            setFormData(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast({
                title: "Error",
                description: "Failed to load certificate settings.",
                variant: "destructive"
            });
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await axios.post(`${serverURL}/api/admin/certificate-settings`, formData);
            if (response.data.success) {
                toast({
                    title: "Success",
                    description: "Certificate settings updated successfully.",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update settings.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            toast({
                title: "Error",
                description: "Internal Server Error",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Certificate Settings</h2>
                <p className="text-muted-foreground">
                    Manage the signatures and details that appear on course certificates.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Certificate Details</CardTitle>
                    <CardDescription>
                        Update the names and signatures for the certificate.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* CEO Section */}
                            <div className="space-y-4 border p-4 rounded-lg">
                                <h3 className="font-semibold">Chief Executive Officer</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="ceoName">Name</Label>
                                    <Input
                                        id="ceoName"
                                        name="ceoName"
                                        value={formData.ceoName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Sumit Saha"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ceoSignature">Signature</Label>
                                    <div className="flex items-center gap-4">
                                        {formData.ceoSignature && (
                                            <img src={formData.ceoSignature} alt="CEO Signature" className="h-12 object-contain border rounded p-1" />
                                        )}
                                        <Input
                                            id="ceoSignature"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'ceoSignature')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* VP Section */}
                            <div className="space-y-4 border p-4 rounded-lg">
                                <h3 className="font-semibold">Vice President / Instructor</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="vpName">Name</Label>
                                    <Input
                                        id="vpName"
                                        name="vpName"
                                        value={formData.vpName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Dr. Shruti Awasthi"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vpSignature">Signature</Label>
                                    <div className="flex items-center gap-4">
                                        {formData.vpSignature && (
                                            <img src={formData.vpSignature} alt="VP Signature" className="h-12 object-contain border rounded p-1" />
                                        )}
                                        <Input
                                            id="vpSignature"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'vpSignature')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Company Logo Section */}
                            <div className="space-y-4 border p-4 rounded-lg">
                                <h3 className="font-semibold">Company Branding</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="logo">Company Logo (Bottom)</Label>
                                    <div className="flex items-center gap-4">
                                        {formData.logo && (
                                            <img src={formData.logo} alt="Company Logo" className="h-12 object-contain border rounded p-1" />
                                        )}
                                        <Input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'logo')}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="qrCodeUrl">Verification URL</Label>
                                    <Input
                                        id="qrCodeUrl"
                                        name="qrCodeUrl"
                                        value={formData.qrCodeUrl}
                                        onChange={handleInputChange}
                                        placeholder="e.g., https://vlearny.com/verify"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminCertificate;
