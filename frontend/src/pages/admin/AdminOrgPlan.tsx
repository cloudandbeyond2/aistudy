// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Edit2, Plus, Calendar, Users, IndianRupee, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';

const AdminOrgPlan = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [orgPlan, setOrgPlan] = useState(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        planName: '1months',
        additionalRequestSlots: 0,
        studentSlotPrice: 1000
    });

    const fetchOrganizations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${serverURL}/api/admin/orgs`);
            console.log('Organizations fetched:', response.data);
            const orgs = response.data?.organizations || response.data || [];
            setOrganizations(Array.isArray(orgs) ? orgs : []);
        } catch (error) {
            console.error('Fetch organizations error:', error);
            const errorMsg = error.response?.data?.message || error.message || "Failed to fetch organizations";
            setError(errorMsg);
            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive"
            });
            setOrganizations([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

    const handleSelectOrg = async (org) => {
        setSelectedOrg(org);
        setFormData({
            planName: '1months',
            additionalRequestSlots: 0,
            studentSlotPrice: 1000
        });

        // Fetch existing plan if any
        try {
            const response = await axios.get(`${serverURL}/api/admin/org-plan`, {
                params: { organizationId: org._id }
            });
            if (response.data.plan) {
                setOrgPlan(response.data.plan);
                setFormData({
                    planName: response.data.plan.planName,
                    additionalRequestSlots: response.data.plan.additionalRequestSlots,
                    studentSlotPrice: response.data.plan.studentSlotPrice
                });
            } else {
                setOrgPlan(null);
            }
        } catch (error) {
            console.error('Fetch org plan error:', error);
        }

        setIsDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOrg) return;

        try {
            setIsAssigning(true);

            const response = await axios.post(`${serverURL}/api/admin/org-plan/create`, {
                organizationId: selectedOrg._id,
                ...formData
            });

            console.log('Plan assignment response:', response.data);

            if (response.data.success) {
                toast({
                    title: "Success",
                    description: "Plan assigned successfully",
                });

                // Update the selected org in the state immediately
                setSelectedOrg({
                    ...selectedOrg,
                    plan: formData.planName
                });

                // Small delay to ensure DB is updated, then refresh
                setTimeout(() => {
                    fetchOrganizations();
                }, 500);

                setIsDialogOpen(false);
            } else {
                toast({
                    title: "Error",
                    description: response.data.message || "Failed to assign plan",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Assign plan error:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || error.message || "Failed to assign plan",
                variant: "destructive"
            });
        } finally {
            setIsAssigning(false);
        }
    };

    const getPlanDurationText = (planName) => {
        const durations = {
            '1months': '1 Month',
            '3months': '3 Months',
            '6months': '6 Months'
        };
        return durations[planName] || planName;
    };

    const calculatePrice = () => {
        const slots = 20 + (formData.additionalRequestSlots || 0);
        return slots * formData.studentSlotPrice;
    };

    const filteredOrganizations = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Organization Plans</h1>
                <p className="text-muted-foreground mt-2">
                    Assign and manage subscription plans for organizations
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                        {error}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={fetchOrganizations}
                            className="ml-4 h-8 gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col justify-center items-center h-96 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading organizations...</p>
                </div>
            )}

            {/* Content - Only show when not loading */}
            {!loading && (
                <>
                    {/* Search */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                placeholder="Search organizations by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10"
                            />
                        </div>
                    </div>

                    {/* Organizations Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOrganizations.map(org => (
                            <Card key={org._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{org.name}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">{org.email}</p>
                                        </div>
                                        {org.plan && (
                                            <Badge className="bg-blue-100 text-blue-800">
                                                {getPlanDurationText(org.plan)}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Contact Info */}
                                    <div className="space-y-2 text-sm">
                                        {org.contactNumber && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                Contact: {org.contactNumber}
                                            </div>
                                        )}
                                        {org.address && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                {org.address}
                                            </div>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex items-center gap-1">
                                            <span className={org.allowAICreation ? 'text-green-600' : 'text-red-600'}>●</span>
                                            AI Creation {org.allowAICreation ? '✓' : '✗'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className={org.allowManualCreation ? 'text-green-600' : 'text-red-600'}>●</span>
                                            Manual {org.allowManualCreation ? '✓' : '✗'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className={org.allowCareerPlacement ? 'text-green-600' : 'text-red-600'}>●</span>
                                            Placement {org.allowCareerPlacement ? '✓' : '✗'}
                                        </div>
                                    </div>

                                    {/* Assign Plan Button */}
                                    <Button
                                        onClick={() => handleSelectOrg(org)}
                                        className="w-full gap-2"
                                        variant="default"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        {org.plan ? 'Edit Plan' : 'Assign Plan'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredOrganizations.length === 0 && (
                        <Card>
                            <CardContent className="py-12">
                                <p className="text-center text-muted-foreground">
                                    {searchTerm ? 'No organizations found' : 'No organizations available'}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Plan Assignment Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Assign Organization Plan</DialogTitle>
                        <DialogDescription>
                            {selectedOrg?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Plan Duration */}
                        <div className="space-y-2">
                            <Label htmlFor="plan">Subscription Duration</Label>
                            <Select
                                value={formData.planName}
                                onValueChange={(value) => setFormData({ ...formData, planName: value })}
                            >
                                <SelectTrigger id="plan">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1months">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            1 Month
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="3months">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            3 Months
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="6months">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            6 Months
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* AI Course Slots */}
                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Users className="h-4 w-4" />
                                <span>AI Course Slots</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Default: 20 slots
                            </p>
                        </div>

                        {/* Additional Request Slots */}
                        <div className="space-y-2">
                            <Label htmlFor="additional">Additional Request Slots</Label>
                            <Input
                                id="additional"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.additionalRequestSlots}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    additionalRequestSlots: parseInt(e.target.value) || 0
                                })}
                                placeholder="Enter additional slots"
                                className="h-10"
                            />
                            <p className="text-xs text-muted-foreground">
                                Total slots will be 20 + additional slots
                            </p>
                        </div>

                        {/* Student Slot Price */}
                        <div className="space-y-2">
                            <Label htmlFor="price">Price Per Student Slot (₹)</Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="price"
                                    type="number"
                                    min="100"
                                    value={formData.studentSlotPrice}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        studentSlotPrice: parseInt(e.target.value) || 1000
                                    })}
                                    placeholder="1000"
                                    className="h-10 pl-10"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Default: ₹1000 (customizable in future)
                            </p>
                        </div>

                        {/* Price Calculation */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4 rounded-lg">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm">Total Slots:</span>
                                    <span className="font-semibold">{20 + (formData.additionalRequestSlots || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Price Per Slot:</span>
                                    <span className="font-semibold">₹{formData.studentSlotPrice}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between">
                                    <span className="font-medium">Total Price:</span>
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                        ₹{calculatePrice().toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Plan Duration */}
                        <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <p className="text-sm">
                                <span className="font-medium">{getPlanDurationText(formData.planName)}</span>
                                {' '}subscription plan
                            </p>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-3 justify-end pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isAssigning}
                                className="gap-2"
                            >
                                {isAssigning && <Loader2 className="h-4 w-4 animate-spin" />}
                                {orgPlan ? 'Update Plan' : 'Assign Plan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminOrgPlan;
