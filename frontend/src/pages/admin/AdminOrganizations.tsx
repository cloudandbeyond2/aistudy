
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Edit, Ban, CheckCircle } from 'lucide-react';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AdminOrganizations = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const response = await axios.get(`${serverURL}/api/organizations`);
            setOrganizations(response.data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch organizations",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleBlock = async (id, currentStatus) => {
        try {
            await axios.post(`${serverURL}/api/organization/${id}/block`, {
                isBlocked: !currentStatus
            });
            toast({
                title: "Success",
                description: `Organization ${!currentStatus ? 'blocked' : 'unblocked'} successfully`
            });
            fetchOrganizations();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive"
            });
        }
    };

    const filteredOrgs = organizations.filter(org =>
        org.organizationDetails?.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
                    <p className="text-muted-foreground mt-1">Manage institutional accounts</p>
                </div>
                <Button onClick={() => navigate('/admin/create-organization')}>
                    <Building2 className="mr-2 h-4 w-4" /> Add Organization
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search organizations..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Institution Name</TableHead>
                            <TableHead>Incharge</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : filteredOrgs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No organizations found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrgs.map((org) => (
                                <TableRow key={org._id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <span>{org.organizationDetails?.institutionName || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{org.organizationDetails?.inchargeName || 'N/A'}</TableCell>
                                    <TableCell>{org.email}</TableCell>
                                    <TableCell>
                                        {org.organizationDetails?.isBlocked ? (
                                            <Badge variant="destructive">Blocked</Badge>
                                        ) : (
                                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/organization/${org._id}`)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant={org.organizationDetails?.isBlocked ? "outline" : "destructive"}
                                                size="sm"
                                                onClick={() => toggleBlock(org._id, org.organizationDetails?.isBlocked)}
                                            >
                                                {org.organizationDetails?.isBlocked ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AdminOrganizations;
