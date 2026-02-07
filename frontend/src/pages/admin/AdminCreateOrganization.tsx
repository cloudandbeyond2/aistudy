
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const AdminCreateOrganization = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        institutionName: '',
        email: '',
        password: '',
        inchargeName: '',
        inchargeEmail: '',
        inchargePhone: '',
        address: '',
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.email || !formData.password || !formData.institutionName) {
            toast({
                title: "Error",
                description: "Please fill in all required fields (Name, Email, Password)",
                variant: "destructive"
            });
            return;
        }

        setSaving(true);
        try {
            // Corrected URL: /api/organization/create (no /admin prefix based on other routes, let's verify route file)
            // Route file: router.post('/organization/create', ...) in admin.routes.js
            // App.js uses app.use('/api', adminRoutes);
            // Wait, app.js uses adminRoutes. Let's check app.js again.
            // app.js: app.use('/api', adminRoutes); 
            // admin.routes.js: router.post('/organization/create', ...)
            // So final URL is /api/organization/create
            await axios.post(`${serverURL}/api/organization/create`, {
                ...formData
            });
            toast({
                title: "Success",
                description: "Organization created successfully"
            });
            navigate('/admin/organizations');
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create organization",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/admin/organizations')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <h1 className="text-2xl font-bold">Add Organization</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>Create a new institutional account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Institution Name *</Label>
                        <Input
                            value={formData.institutionName}
                            onChange={(e) => handleChange('institutionName', e.target.value)}
                            placeholder="e.g. Acme University"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Login Email *</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="admin@school.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Password *</Label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                placeholder="********"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={saving} size="lg">
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? 'Creating...' : 'Create Organization'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminCreateOrganization;
