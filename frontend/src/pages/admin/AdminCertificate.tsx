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
        qrCodeUrl: '',
        backgroundImage: '',
        organizationName: '',
        organizationLogo: '',
        partnerLogo: '',
        certificateDescription: '',
        signatureTitle: '',
        showOrganization: true,
        showPartnerLogo: true,
        positions: {
            organizationLogo: { top: '5%', left: 'auto', right: '10%', bottom: 'auto' },
            organizationName: { top: '15%', left: '50%', right: 'auto', bottom: 'auto' },
            name: { top: '46%', left: '50%', right: 'auto', bottom: 'auto' },
            description: { top: '56%', left: '50%', right: 'auto', bottom: 'auto' },
            courseName: { top: '64%', left: '50%', right: 'auto', bottom: 'auto' },
            signature: { bottom: '22%', left: '12%', right: 'auto', top: 'auto' },
            date: { bottom: '22%', right: '12%', left: 'auto', top: 'auto' },
            qrCode: { bottom: '12%', right: '8%', left: 'auto', top: 'auto' }
        },
        sizes: {
            organizationLogoHeight: '60px',
            signatureHeight: '40px',
            qrCodeSize: '80px'
        }
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePositionChange = (element: string, position: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            positions: {
                ...prev.positions,
                [element]: {
                    ...(prev.positions as any)[element],
                    [position]: value
                }
            }
        }));
    };

    const handleSizeChange = (size: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            sizes: {
                ...prev.sizes,
                [size]: value
            }
        }));
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

                            {/* Organization Section */}
                            <div className="space-y-4 border p-4 rounded-lg">
                                <h3 className="font-semibold">Organization Details</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="organizationName">Organization Name</Label>
                                    <Input
                                        id="organizationName"
                                        name="organizationName"
                                        value={formData.organizationName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., AI Study Institute"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="organizationLogo">Organization Logo</Label>
                                    <div className="flex items-center gap-4">
                                        {formData.organizationLogo && (
                                            <img src={formData.organizationLogo} alt="Organization Logo" className="h-12 object-contain border rounded p-1" />
                                        )}
                                        <Input
                                            id="organizationLogo"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'organizationLogo')}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="showOrganization">Show Organization</Label>
                                    <input
                                        id="showOrganization"
                                        type="checkbox"
                                        checked={formData.showOrganization}
                                        onChange={(e) => setFormData(prev => ({ ...prev, showOrganization: e.target.checked }))}
                                    />
                                </div>
                            </div>

                            {/* Partner & Branding Section */}
                            <div className="space-y-4 border p-4 rounded-lg">
                                <h3 className="font-semibold">Partner & Branding</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="partnerLogo">Partner Logo</Label>
                                    <div className="flex items-center gap-4">
                                        {formData.partnerLogo && (
                                            <img src={formData.partnerLogo} alt="Partner Logo" className="h-12 object-contain border rounded p-1" />
                                        )}
                                        <Input
                                            id="partnerLogo"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'partnerLogo')}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="showPartnerLogo">Show Partner Logo</Label>
                                    <input
                                        id="showPartnerLogo"
                                        type="checkbox"
                                        checked={formData.showPartnerLogo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, showPartnerLogo: e.target.checked }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="backgroundImage">Background Image</Label>
                                    <div className="flex items-center gap-4">
                                        {formData.backgroundImage && (
                                            <img src={formData.backgroundImage} alt="Background" className="h-12 object-contain border rounded p-1" />
                                        )}
                                        <Input
                                            id="backgroundImage"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'backgroundImage')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Certificate Content */}
                            <div className="space-y-4 border p-4 rounded-lg md:col-span-2">
                                <h3 className="font-semibold">Certificate Content</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="certificateDescription">Certificate Description</Label>
                                    <textarea
                                        id="certificateDescription"
                                        name="certificateDescription"
                                        value={formData.certificateDescription}
                                        onChange={handleInputChange}
                                        placeholder="This certificate is awarded for successfully completing the course with distinction."
                                        className="w-full p-2 border rounded-md"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signatureTitle">Signature Title</Label>
                                    <Input
                                        id="signatureTitle"
                                        name="signatureTitle"
                                        value={formData.signatureTitle}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Director, CEO, etc."
                                    />
                                </div>
                            </div>

                            {/* Company Logo Section */}
                            <div className="space-y-4 border p-4 rounded-lg md:col-span-2">
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

                            {/* Dynamic Positions Section */}
                            <div className="md:col-span-2 border p-4 rounded-lg space-y-4">
                                <h3 className="font-semibold">Dynamic Element Positions</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Name Position */}
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-sm">Student Name Position</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs">Top</Label>
                                                <Input
                                                    value={(formData.positions as any).name?.top || ''}
                                                    onChange={(e) => handlePositionChange('name', 'top', e.target.value)}
                                                    placeholder="e.g., 46%"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Left</Label>
                                                <Input
                                                    value={(formData.positions as any).name?.left || ''}
                                                    onChange={(e) => handlePositionChange('name', 'left', e.target.value)}
                                                    placeholder="e.g., 50%"
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Course Position */}
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-sm">Course Name Position</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs">Top</Label>
                                                <Input
                                                    value={(formData.positions as any).courseName?.top || ''}
                                                    onChange={(e) => handlePositionChange('courseName', 'top', e.target.value)}
                                                    placeholder="e.g., 64%"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Left</Label>
                                                <Input
                                                    value={(formData.positions as any).courseName?.left || ''}
                                                    onChange={(e) => handlePositionChange('courseName', 'left', e.target.value)}
                                                    placeholder="e.g., 50%"
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Signature Position */}
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-sm">Signature Position</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs">Bottom</Label>
                                                <Input
                                                    value={(formData.positions as any).signature?.bottom || ''}
                                                    onChange={(e) => handlePositionChange('signature', 'bottom', e.target.value)}
                                                    placeholder="e.g., 22%"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Left</Label>
                                                <Input
                                                    value={(formData.positions as any).signature?.left || ''}
                                                    onChange={(e) => handlePositionChange('signature', 'left', e.target.value)}
                                                    placeholder="e.g., 12%"
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date Position */}
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-sm">Date Position</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs">Bottom</Label>
                                                <Input
                                                    value={(formData.positions as any).date?.bottom || ''}
                                                    onChange={(e) => handlePositionChange('date', 'bottom', e.target.value)}
                                                    placeholder="e.g., 22%"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Right</Label>
                                                <Input
                                                    value={(formData.positions as any).date?.right || ''}
                                                    onChange={(e) => handlePositionChange('date', 'right', e.target.value)}
                                                    placeholder="e.g., 12%"
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Code Position */}
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-sm">QR Code Position</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs">Bottom</Label>
                                                <Input
                                                    value={(formData.positions as any).qrCode?.bottom || ''}
                                                    onChange={(e) => handlePositionChange('qrCode', 'bottom', e.target.value)}
                                                    placeholder="e.g., 12%"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Right</Label>
                                                <Input
                                                    value={(formData.positions as any).qrCode?.right || ''}
                                                    onChange={(e) => handlePositionChange('qrCode', 'right', e.target.value)}
                                                    placeholder="e.g., 8%"
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Organization Logo Position */}
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-sm">Organization Logo Position</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs">Top</Label>
                                                <Input
                                                    value={(formData.positions as any).organizationLogo?.top || ''}
                                                    onChange={(e) => handlePositionChange('organizationLogo', 'top', e.target.value)}
                                                    placeholder="e.g., 5%"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Right</Label>
                                                <Input
                                                    value={(formData.positions as any).organizationLogo?.right || ''}
                                                    onChange={(e) => handlePositionChange('organizationLogo', 'right', e.target.value)}
                                                    placeholder="e.g., 10%"
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Sizes Section */}
                            <div className="md:col-span-2 border p-4 rounded-lg space-y-4">
                                <h3 className="font-semibold">Element Sizes</h3>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="sigHeight">Signature Height</Label>
                                        <Input
                                            id="sigHeight"
                                            value={(formData.sizes as any).signatureHeight || ''}
                                            onChange={(e) => handleSizeChange('signatureHeight', e.target.value)}
                                            placeholder="e.g., 40px"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="orgLogoHeight">Organization Logo Height</Label>
                                        <Input
                                            id="orgLogoHeight"
                                            value={(formData.sizes as any).organizationLogoHeight || ''}
                                            onChange={(e) => handleSizeChange('organizationLogoHeight', e.target.value)}
                                            placeholder="e.g., 60px"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="qrSize">QR Code Size</Label>
                                        <Input
                                            id="qrSize"
                                            value={(formData.sizes as any).qrCodeSize || ''}
                                            onChange={(e) => handleSizeChange('qrCodeSize', e.target.value)}
                                            placeholder="e.g., 80px"
                                        />
                                    </div>
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
