
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Edit, Ban, CheckCircle, Eye, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AdminOrganizations = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
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

    const handleViewOrg = (org) => {
        setSelectedOrg(org);
        setIsViewOpen(true);
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
                                            <Button variant="outline" size="sm" onClick={() => handleViewOrg(org)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
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

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Organization Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about the selected organization.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrg && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4">
                                {selectedOrg.organizationDetails?.logo ? (
                                    <img 
                                        src={selectedOrg.organizationDetails.logo} 
                                        alt="Logo" 
                                        className="h-16 w-16 object-contain rounded border bg-muted/50"
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded border bg-muted/50 flex items-center justify-center">
                                        <Building2 className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedOrg.organizationDetails?.institutionName}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedOrg.organizationDetails?.planDetails || 'No plan details'}</p>
                                </div>
                            </div>
                            
                            <div className="grid gap-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <UserIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Incharge Name</p>
                                        <p className="text-muted-foreground">{selectedOrg.organizationDetails?.inchargeName || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Mail className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <p className="text-muted-foreground">{selectedOrg.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Phone className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Phone</p>
                                        <p className="text-muted-foreground">{selectedOrg.organizationDetails?.inchargePhone || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <MapPin className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Address</p>
                                        <p className="text-muted-foreground">{selectedOrg.organizationDetails?.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                             {selectedOrg.organizationDetails?.documents?.length > 0 && selectedOrg.organizationDetails.documents.some(d => d) && (
                                <div className="pt-2">
                                     <p className="text-sm font-medium mb-2">Documents</p>
                                     <div className="flex flex-wrap gap-2">
                                         {selectedOrg.organizationDetails.documents.map((doc, index) => (
                                             doc && (
                                                <a 
                                                    key={index}
                                                    href={doc} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs border rounded-full px-3 py-1 hover:bg-muted transition-colors"
                                                >
                                                    <FileText className="h-3 w-3" />
                                                    View Document {index + 1}
                                                </a>
                                             )
                                         ))}
                                     </div>
                                </div>
                             )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

function UserIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  }

export default AdminOrganizations;
