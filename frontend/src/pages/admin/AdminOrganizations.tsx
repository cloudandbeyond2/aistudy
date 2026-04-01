import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Ban,
  Building2,
  CheckCircle,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  SquarePen,
  Trash2,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { serverURL } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const getOrgName = (org) =>
  org.organizationDetails?.institutionName || org.mName || 'Unnamed organization';

const getBlockStatus = (org) => Boolean(org.organizationDetails?.isBlocked);

const AdminOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [confirmBlockOrg, setConfirmBlockOrg] = useState(null);
  const [confirmDeleteOrg, setConfirmDeleteOrg] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverURL}/api/organizations`);
      setOrganizations(response.data || []);
    } catch (error) {
      console.error('Fetch organizations error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch organizations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const planOptions = useMemo(() => {
    return Array.from(new Set(organizations.map((org) => org.planName).filter(Boolean)));
  }, [organizations]);

  const stats = useMemo(() => {
    const active = organizations.filter((org) => !getBlockStatus(org)).length;
    const blocked = organizations.filter((org) => getBlockStatus(org)).length;
    const expiringSoon = organizations.filter((org) => {
      if (!org.planEndDate) return false;
      const diff = new Date(org.planEndDate).getTime() - Date.now();
      return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 30;
    }).length;

    return { total: organizations.length, active, blocked, expiringSoon };
  }, [organizations]);

  const filteredOrgs = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return organizations.filter((org) => {
      const matchesSearch =
        !query ||
        getOrgName(org).toLowerCase().includes(query) ||
        org.email?.toLowerCase().includes(query) ||
        org.organizationDetails?.inchargeName?.toLowerCase().includes(query) ||
        org.organizationDetails?.address?.toLowerCase().includes(query);

      const orgStatus = getBlockStatus(org) ? 'blocked' : 'active';

      return (
        matchesSearch &&
        (statusFilter === 'all' || statusFilter === orgStatus) &&
        (planFilter === 'all' || org.planName === planFilter)
      );
    });
  }, [organizations, planFilter, searchTerm, statusFilter]);

  const toggleBlock = async (org) => {
    try {
      setActionLoading(org._id);
      const response = await axios.post(`${serverURL}/api/organization/${org._id}/block`, {
        isBlocked: !getBlockStatus(org),
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: `Organization ${getBlockStatus(org) ? 'unblocked' : 'blocked'} successfully`,
        });
        fetchOrganizations();
      }
    } catch (error) {
      console.error('Toggle block error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update organization status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading('');
      setConfirmBlockOrg(null);
    }
  };

  const handleDelete = async (org) => {
    try {
      setActionLoading(org._id);
      const response = await axios.post(`${serverURL}/api/admin/deleteuser`, {
        userId: org._id,
      });

      if (response.data.success) {
        toast({
          title: 'Deleted',
          description: 'Organization and linked records were removed successfully.',
        });
        fetchOrganizations();
      }
    } catch (error) {
      console.error('Delete organization error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete organization',
        variant: 'destructive',
      });
    } finally {
      setActionLoading('');
      setConfirmDeleteOrg(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPlanFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Super-admin control for institutional accounts, plan coverage, access status, and contact ownership.
          </p>
        </div>
        <Button onClick={() => navigate('/admin/create-organization')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Organization
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Total organizations</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-3xl text-emerald-600">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Blocked</CardDescription>
            <CardTitle className="text-3xl text-rose-600">{stats.blocked}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Expiring within 30 days</CardDescription>
            <CardTitle className="text-3xl text-amber-600">{stats.expiringSoon}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-2xl">Institution directory</CardTitle>
            <CardDescription>
              Review plans, contact details, and access state before editing, blocking, or deleting.
            </CardDescription>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.8fr_repeat(2,minmax(0,220px))]">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organization, admin mail, incharge, address..."
                className="pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger><SelectValue placeholder="Plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                {planOptions.map((plan) => (
                  <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters}>Reset filters</Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredOrgs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No organizations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrgs.map((org) => (
                    <TableRow key={org._id}>
                      <TableCell className="align-top">
                        <div className="flex items-start gap-3">
                          {org.organizationDetails?.logo ? (
                            <img
                              src={org.organizationDetails.logo}
                              alt={getOrgName(org)}
                              className="h-14 w-14 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-slate-100">
                              <Building2 className="h-5 w-5 text-slate-500" />
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className="font-medium">{getOrgName(org)}</div>
                            <div className="text-sm text-muted-foreground">{org.organizationDetails?.address || 'No address provided'}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="align-top text-sm">
                        <div className="space-y-1">
                          <div className="font-medium">{org.organizationDetails?.inchargeName || 'N/A'}</div>
                          <div className="text-muted-foreground">{org.email}</div>
                          <div className="text-muted-foreground">{org.organizationDetails?.inchargePhone || 'No phone'}</div>
                        </div>
                      </TableCell>

                      <TableCell className="align-top">
                        <Badge variant="outline" className="capitalize">
                          {org.planName || 'No Plan'}
                        </Badge>
                      </TableCell>

                      <TableCell className="align-top text-sm">
                        {org.planEndDate ? format(new Date(org.planEndDate), 'PPP') : 'N/A'}
                      </TableCell>

                      <TableCell className="align-top">
                        {getBlockStatus(org) ? (
                          <Badge variant="destructive">Blocked</Badge>
                        ) : (
                          <Badge className="bg-emerald-600 hover:bg-emerald-600">Active</Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrg(org)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/organization/${org._id}`)}>
                            <SquarePen className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant={getBlockStatus(org) ? 'outline' : 'destructive'}
                            size="sm"
                            disabled={actionLoading === org._id}
                            onClick={() => setConfirmBlockOrg(org)}
                          >
                            {getBlockStatus(org) ? <CheckCircle className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                            {getBlockStatus(org) ? 'Unblock' : 'Block'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={actionLoading === org._id}
                            onClick={() => setConfirmDeleteOrg(org)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedOrg)} onOpenChange={(open) => !open && setSelectedOrg(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Organization details</DialogTitle>
            <DialogDescription>
              Super-admin view of institutional identity, contact ownership, plan, and uploaded documentation.
            </DialogDescription>
          </DialogHeader>

          {selectedOrg && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-slate-200 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Institution profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div><span className="text-muted-foreground">Institution</span><div className="font-medium">{getOrgName(selectedOrg)}</div></div>
                  <div><span className="text-muted-foreground">Plan</span><div className="font-medium">{selectedOrg.planName || 'No Plan'}</div></div>
                  <div><span className="text-muted-foreground">Plan expires</span><div className="font-medium">{selectedOrg.planEndDate ? format(new Date(selectedOrg.planEndDate), 'PPP') : 'N/A'}</div></div>
                  <div><span className="text-muted-foreground">Status</span><div>{getBlockStatus(selectedOrg) ? <Badge variant="destructive">Blocked</Badge> : <Badge className="bg-emerald-600 hover:bg-emerald-600">Active</Badge>}</div></div>
                  <div><span className="text-muted-foreground">Address</span><div className="font-medium">{selectedOrg.organizationDetails?.address || 'N/A'}</div></div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Admin contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-4 w-4 text-primary" />
                    <div><div className="text-muted-foreground">Incharge</div><div className="font-medium">{selectedOrg.organizationDetails?.inchargeName || 'N/A'}</div></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-primary" />
                    <div><div className="text-muted-foreground">Email</div><div className="font-medium">{selectedOrg.email || 'N/A'}</div></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-primary" />
                    <div><div className="text-muted-foreground">Phone</div><div className="font-medium">{selectedOrg.organizationDetails?.inchargePhone || 'N/A'}</div></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                    <div><div className="text-muted-foreground">Location</div><div className="font-medium">{selectedOrg.organizationDetails?.address || 'N/A'}</div></div>
                  </div>
                </CardContent>
              </Card>

              {selectedOrg.organizationDetails?.documents?.length > 0 && selectedOrg.organizationDetails.documents.some(Boolean) && (
                <Card className="border-slate-200 shadow-none md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Uploaded documents</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {selectedOrg.organizationDetails.documents.map((doc, index) =>
                      doc ? (
                        <a
                          key={index}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-full border px-3 py-1 text-sm hover:bg-slate-50"
                        >
                          Document {index + 1}
                        </a>
                      ) : null
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(confirmBlockOrg)} onOpenChange={(open) => !open && setConfirmBlockOrg(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmBlockOrg && getBlockStatus(confirmBlockOrg) ? 'Unblock organization?' : 'Block organization?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmBlockOrg && getBlockStatus(confirmBlockOrg)
                ? 'This restores platform access for the institution account and linked users.'
                : 'This blocks access for the institution account and dependent users until it is unblocked.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmBlockOrg && toggleBlock(confirmBlockOrg)}>
              {confirmBlockOrg && getBlockStatus(confirmBlockOrg) ? 'Unblock' : 'Block'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(confirmDeleteOrg)} onOpenChange={(open) => !open && setConfirmDeleteOrg(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete organization permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the organization admin account, linked users, courses, and associated institutional records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDeleteOrg && handleDelete(confirmDeleteOrg)}
            >
              Delete organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOrganizations;
