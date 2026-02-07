
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, Save, FileText } from 'lucide-react';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const AdminOrganizationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        institutionName: '',
        inchargeName: '',
        inchargeEmail: '',
        inchargePhone: '',
        address: '',
        planDetails: '',
        logo: '',
        documents: ['', ''] // 2 document slots
    });

    useEffect(() => {
        fetchOrgDetails();
    }, [id]);

    const fetchOrgDetails = async () => {
        try {
            // In a real app we might have a specific endpoint for single org, 
            // but here we can filter from list or add a new endpoint. 
            // For now let's assume we can get it or we filter.
            // Actually, let's just fetch all and find (optimizable later)
            // Or better, standard GET /organization/:id
            // Since I didn't make GET /organization/:id, I'll use the list for now or quickly add it?
            // Wait, I didn't add GET /organization/:id in backend. 
            // I'll assume we can use the list endpoint and filter client side for quickness, 
            // OR I can just use the update endpoint to GET? No.
            // Let's implement efficient fetch later, for now let's use the list endpoint which is standard in this codebase so far.
            const response = await axios.get(`${serverURL}/api/organizations`);
            const org = response.data.find(o => o._id === id);

            if (org && org.organizationDetails) {
                setFormData({
                    institutionName: org.organizationDetails.institutionName || '',
                    inchargeName: org.organizationDetails.inchargeName || '',
                    inchargeEmail: org.organizationDetails.inchargeEmail || '',
                    inchargePhone: org.organizationDetails.inchargePhone || '',
                    address: org.organizationDetails.address || '',
                    planDetails: org.organizationDetails.planDetails || '',
                    logo: org.organizationDetails.logo || '',
                    documents: [
                        org.organizationDetails.documents?.[0] || '',
                        org.organizationDetails.documents?.[1] || ''
                    ]
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch details",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDocChange = (index, value) => {
        const newDocs = [...formData.documents];
        newDocs[index] = value;
        setFormData(prev => ({ ...prev, documents: newDocs }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`${serverURL}/api/organization/${id}`, {
                ...formData
            });
            toast({
                title: "Success",
                description: "Organization details updated successfully"
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update details",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/admin/organizations')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <h1 className="text-2xl font-bold">Edit Organization</h1>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Institution Details</CardTitle>
                        <CardDescription>Basic information about the organization.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Institution Name</Label>
                                <Input
                                    value={formData.institutionName}
                                    onChange={(e) => handleChange('institutionName', e.target.value)}
                                    placeholder="e.g. Acme University"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Incharge Name</Label>
                                <Input
                                    value={formData.inchargeName}
                                    onChange={(e) => handleChange('inchargeName', e.target.value)}
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Incharge Email</Label>
                                <Input
                                    value={formData.inchargeEmail}
                                    onChange={(e) => handleChange('inchargeEmail', e.target.value)}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Incharge Phone</Label>
                                <Input
                                    value={formData.inchargePhone}
                                    onChange={(e) => handleChange('inchargePhone', e.target.value)}
                                    placeholder="+1 234..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Textarea
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Full address of the institution"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Plan Details</Label>
                            <Input
                                value={formData.planDetails}
                                onChange={(e) => handleChange('planDetails', e.target.value)}
                                placeholder="e.g. Enterprise Plan - 500 Students"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Branding & Documents</CardTitle>
                        <CardDescription>Upload assets and verification documents.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Logo URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={formData.logo}
                                    onChange={(e) => handleChange('logo', e.target.value)}
                                    placeholder="https://..."
                                />
                                {formData.logo && <img src={formData.logo} alt="Logo Preview" className="h-10 w-10 object-contain border rounded bg-white" />}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Document 1 (Registration/Certificate)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={formData.documents[0]}
                                    onChange={(e) => handleDocChange(0, e.target.value)}
                                    placeholder="Document URL"
                                />
                                <Button variant="outline" size="icon">
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Document 2 (Other)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={formData.documents[1]}
                                    onChange={(e) => handleDocChange(1, e.target.value)}
                                    placeholder="Document URL"
                                />
                                <Button variant="outline" size="icon">
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving} size="lg">
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminOrganizationDetails;
