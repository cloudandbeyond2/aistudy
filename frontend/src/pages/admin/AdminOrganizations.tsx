
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Plus, Search, Trash2, Edit, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import SEO from '@/components/SEO';

const AdminOrganizations = () => {
    const { toast } = useToast();
    const [orgs, setOrgs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newOrg, setNewOrg] = useState({ name: '', email: '', password: '', address: '', contactNumber: '', allowAICreation: true, allowManualCreation: true });
    const [editOrg, setEditOrg] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        fetchOrgs();
    }, []);

    const fetchOrgs = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${serverURL}/api/admin/orgs`);
            if (res.data.success) {
                setOrgs(res.data.organizations);
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Failed to fetch organizations" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateOrg = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/signup`, newOrg);
            if (res.data.success) {
                toast({ title: "Success", description: "Organization created successfully" });
                setNewOrg({ name: '', email: '', password: '', address: '', contactNumber: '', allowAICreation: true, allowManualCreation: true });
                setIsOpen(false);
                fetchOrgs();
            } else {
                toast({ title: "Error", description: res.data.message });
            }
        } catch (e: any) {
            console.error(e);
            toast({
                title: "Error",
                description: e.response?.data?.message || "Request failed. Please check console."
            });
        }
    };

    const handleUpdateOrg = async () => {
        if (!editOrg) return;
        try {
            const res = await axios.put(`${serverURL}/api/admin/org/${editOrg._id}`, editOrg);
            if (res.data.success) {
                toast({ title: "Success", description: "Organization updated successfully" });
                setIsEditOpen(false);
                setEditOrg(null);
                fetchOrgs();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to update organization" });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <SEO title="Manage Organizations" description="Admin panel for managing organizations." />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
                    <p className="text-muted-foreground">Manage all registered organizations.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Organization
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Organization</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Organization Name</Label>
                                <Input value={newOrg.name} onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Email (Admin)</Label>
                                <Input value={newOrg.email} onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Password</Label>
                                <Input type="password" value={newOrg.password} onChange={(e) => setNewOrg({ ...newOrg, password: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Address</Label>
                                <Input value={newOrg.address} onChange={(e) => setNewOrg({ ...newOrg, address: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Contact Number</Label>
                                <Input value={newOrg.contactNumber} onChange={(e) => setNewOrg({ ...newOrg, contactNumber: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 my-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="allowAI-new"
                                        checked={newOrg.allowAICreation}
                                        onChange={(e) => setNewOrg({ ...newOrg, allowAICreation: e.target.checked })}
                                    />
                                    <Label htmlFor="allowAI-new">Allow AI Creation</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="allowManual-new"
                                        checked={newOrg.allowManualCreation}
                                        onChange={(e) => setNewOrg({ ...newOrg, allowManualCreation: e.target.checked })}
                                    />
                                    <Label htmlFor="allowManual-new">Allow Manual Creation</Label>
                                </div>
                            </div>
                            <Button onClick={handleCreateOrg} className="w-full">Create Organization</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Organizations</CardTitle>
                    <CardDescription>A list of all organizations on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : orgs.length > 0 ? (
                        <div className="rounded-md border">
                            <div className="w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Email</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Plan</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Created At</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {orgs.map((org: any) => (
                                            <tr key={org._id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-primary" />
                                                        {org.name}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">{org.email}</td>
                                                <td className="p-4 align-middle capitalize">{org.plan}</td>
                                                <td className="p-4 align-middle">{new Date(org.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex gap-2">
                                                        <Dialog open={isEditOpen && editOrg?._id === org._id} onOpenChange={(open) => {
                                                            setIsEditOpen(open);
                                                            if (open) setEditOrg({ ...org });
                                                        }}>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader><DialogTitle>Edit Organization</DialogTitle></DialogHeader>
                                                                <div className="grid gap-4 py-4">
                                                                    <div className="grid gap-2">
                                                                        <Label>Name</Label>
                                                                        <Input value={editOrg?.name} onChange={(e) => setEditOrg({ ...editOrg, name: e.target.value })} />
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        <Label>Address</Label>
                                                                        <Input value={editOrg?.address} onChange={(e) => setEditOrg({ ...editOrg, address: e.target.value })} />
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        <Label>Contact</Label>
                                                                        <Input value={editOrg?.contactNumber} onChange={(e) => setEditOrg({ ...editOrg, contactNumber: e.target.value })} />
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                id="allowAI-edit"
                                                                                checked={editOrg?.allowAICreation}
                                                                                onChange={(e) => setEditOrg({ ...editOrg, allowAICreation: e.target.checked })}
                                                                            />
                                                                            <Label htmlFor="allowAI-edit">Allow AI Creation</Label>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                id="allowManual-edit"
                                                                                checked={editOrg?.allowManualCreation}
                                                                                onChange={(e) => setEditOrg({ ...editOrg, allowManualCreation: e.target.checked })}
                                                                            />
                                                                            <Label htmlFor="allowManual-edit">Allow Manual Creation</Label>
                                                                        </div>
                                                                    </div>
                                                                    <Button onClick={handleUpdateOrg} className="w-full">Save Changes</Button>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No organizations found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminOrganizations;
