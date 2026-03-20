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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Edit, Ban, CheckCircle, Eye, Phone, Mail, MapPin, FileText, Trash2, Loader2 } from 'lucide-react';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminOrganizations = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [orgToToggle, setOrgToToggle] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${serverURL}/api/organizations`);
            setOrganizations(response.data);
        } catch (error) {
            console.error('Fetch organizations error:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to fetch organizations",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleBlock = async (id, currentStatus) => {
        try {
            const response = await axios.post(`${serverURL}/api/organization/${id}/block`, {
                isBlocked: !currentStatus
            });
            
            // Show success message with SweetAlert
            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: `Organization ${!currentStatus ? 'blocked' : 'unblocked'} successfully`,
                timer: 2000,
                showConfirmButton: false,
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))'
            });
            
            setIsConfirmOpen(false);
            setOrgToToggle(null);
            fetchOrganizations();
        } catch (error) {
            console.error('Toggle block error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to update status',
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))'
            });
        }
    };

    const handleToggleClick = (id, currentStatus) => {
        if (!currentStatus) {
            // If they are NOT blocked, we are about to block them. show confirmation.
            setOrgToToggle({ id, currentStatus });
            setIsConfirmOpen(true);
        } else {
            // Unblocking can be direct
            toggleBlock(id, currentStatus);
        }
    };

const handleDelete = async (orgId, orgName) => {
    if (deleteLoading) return;
    
    try {
        console.log('Attempting to delete organization with ID:', orgId);
        
        // Show SweetAlert confirmation
        const result = await Swal.fire({
            title: 'Are you sure?',
            html: `
                <div class="text-left">
                    <p class="mb-2">You are about to delete <strong>${orgName}</strong>.</p>
                    <p class="text-red-500 font-semibold">This action cannot be undone!</p>
                    <p class="mt-2 text-sm text-muted-foreground">This will permanently delete:</p>
                    <ul class="list-disc list-inside text-sm text-muted-foreground mt-1">
                        <li>The organization admin account</li>
                        <li>All associated users and their data</li>
                        <li>All courses and content</li>
                        <li>All records and history</li>
                    </ul>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete everything!',
            cancelButtonText: 'Cancel',
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            iconColor: '#d33',
            reverseButtons: true,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                setDeleteLoading(true);
                try {
                    // Based on your routes, use the deleteuser endpoint
                    const response = await axios.post(`${serverURL}/api/admin/deleteuser`, {
                        userId: orgId  // Send the organization ID as userId
                    });
                    
                    console.log('Delete response:', response?.data);
                    return response;
                } catch (error) {
                    Swal.showValidationMessage(
                        error.response?.data?.message || 'Failed to delete organization'
                    );
                    throw error;
                } finally {
                    setDeleteLoading(false);
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (result.isConfirmed) {
            // Show success message
            await Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Organization has been deleted successfully.',
                timer: 2000,
                showConfirmButton: false,
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))'
            });

            // Refresh the list
            fetchOrganizations();
        }
    } catch (error) {
        console.error('Full delete error:', error);
        console.error('Error response:', error.response);
        console.error('Error data:', error.response?.data);
        
        // Show error message with more details
        Swal.fire({
            icon: 'error',
            title: 'Error',
            html: `
                <div class="text-left">
                    <p class="mb-2">${error.response?.data?.message || 'Failed to delete organization'}</p>
                    ${error.response?.data?.details ? `<p class="text-sm text-muted-foreground">${error.response.data.details}</p>` : ''}
                </div>
            `,
            confirmButtonColor: '#3085d6',
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))'
        });
    } finally {
        setDeleteLoading(false);
    }
};

    const handleViewOrg = (org) => {
        setSelectedOrg(org);
        setIsViewOpen(true);
    };

    const filteredOrgs = organizations.filter(org =>
        org.organizationDetails?.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get current admin ID from localStorage or context
    const getCurrentAdminId = () => {
        return localStorage.getItem('adminId') || localStorage.getItem('userId') || 'admin';
    };

    return (
        <div className="space-y-6 animate-fade-in p-6">
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
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Loading organizations...
                                    </div>
                                </TableCell>
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
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => handleViewOrg(org)}
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => navigate(`/admin/organization/${org._id}`)}
                                                title="Edit Organization"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant={org.organizationDetails?.isBlocked ? "outline" : "destructive"}
                                                size="sm"
                                                onClick={() => handleToggleClick(org._id, org.organizationDetails?.isBlocked)}
                                                title={org.organizationDetails?.isBlocked ? "Unblock" : "Block"}
                                            >
                                                {org.organizationDetails?.isBlocked ? 
                                                    <CheckCircle className="h-4 w-4" /> : 
                                                    <Ban className="h-4 w-4" />
                                                }
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(org._id, org.organizationDetails?.institutionName || 'this organization')}
                                                disabled={deleteLoading}
                                                title="Delete Organization"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* View Organization Dialog */}
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

            {/* Block Confirmation Dialog */}
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to block this organization?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will prevent all users from this organization from accessing their courses and the platform.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setOrgToToggle(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => orgToToggle && toggleBlock(orgToToggle.id, orgToToggle.currentStatus)}
                        >
                            Block Organization
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

// User Icon Component
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