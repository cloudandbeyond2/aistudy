import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import {
  Ban,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  Edit,
  GraduationCap,
  MoreHorizontal,
  Search,
  Trash,
  UserCheck,
  Users,
} from 'lucide-react';

import { serverURL } from '@/constants';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

type UserSegment = 'all' | 'organization' | 'premium' | 'free' | 'organization_staff' | 'student';

type AdminOrder = {
  price?: number;
  currency?: string;
  provider?: string;
  status?: string;
  paymentMethod?: string;
  subscriptionId?: string;
  razorpayPaymentId?: string;
  date?: string;
  planName?: string;
};

type AdminUser = {
  _id: string;
  mName?: string;
  email?: string;
  type?: string;
  role?: string;
  isOrganization?: boolean;
  isBlocked?: boolean;
  date?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  organizationName?: string | null;
  departmentName?: string | null;
  adminCategory?: UserSegment;
  latestOrder?: AdminOrder | null;
};

const ITEMS_PER_PAGE = 10;

const segmentConfig: Record<UserSegment, { label: string; description: string; icon: any }> = {
  all: {
    label: 'All Users',
    description: 'Full account directory across the platform.',
    icon: Users,
  },
  organization: {
    label: 'Organizations',
    description: 'Institution owner and organization admin accounts.',
    icon: Building2,
  },
  premium: {
    label: 'Premium',
    description: 'Individual paid users with active or past plans.',
    icon: Crown,
  },
  free: {
    label: 'Free',
    description: 'Individual users on the free access plan.',
    icon: Users,
  },
  organization_staff: {
    label: 'Organization Staff',
    description: 'Department and staff-level academic operators.',
    icon: BriefcaseBusiness,
  },
  student: {
    label: 'Students',
    description: 'Students linked to institution learning spaces.',
    icon: GraduationCap,
  },
};

const getPlanLabel = (type?: string) => {
  if (!type) return 'Free';
  if (type === 'forever') return 'Lifetime';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : format(date, 'PPP');
};

const getPaymentBadgeClass = (status?: string) => {
  switch (status) {
    case 'success':
      return 'bg-emerald-500/15 text-emerald-700 border-emerald-200';
    case 'failed':
      return 'bg-rose-500/15 text-rose-700 border-rose-200';
    case 'cancelled':
      return 'bg-amber-500/15 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-500/15 text-slate-700 border-slate-200';
  }
};

const getSubscriptionStatus = (user: AdminUser) => {
  if (user.isBlocked) return 'blocked';
  if (!user.type || user.type === 'free' || user.type === 'forever') return 'active';
  if (!user.subscriptionEnd) return 'active';
  return new Date(user.subscriptionEnd).getTime() < Date.now() ? 'expired' : 'active';
};

const isOrganizationLinked = (user: AdminUser) =>
  Boolean(
    user.isOrganization ||
      user.role === 'org_admin' ||
      user.role === 'dept_admin' ||
      user.role === 'student' ||
      user.organizationName
  );

const getSegment = (user: AdminUser): UserSegment => {
  if (user.adminCategory && user.adminCategory !== 'all') return user.adminCategory;
  if (user.isOrganization || user.role === 'org_admin') return 'organization';
  if (user.role === 'dept_admin') return 'organization_staff';
  if (user.role === 'student') return 'student';
  if (user.type && user.type !== 'free') return 'premium';
  return 'free';
};

const AdminUsers = () => {
  const { toast } = useToast();
  const location = useLocation();

  const [data, setData] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState<UserSegment>('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [paymentUser, setPaymentUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editType, setEditType] = useState('free');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<{ id: string; isBlocked: boolean } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q');
    if (q) setSearchQuery(q);
  }, [location.search]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/getusers`);
      setData(response.data || []);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to load users',
        description: 'The admin directory could not be loaded.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const segmentCounts = useMemo(() => {
    const counts: Record<UserSegment, number> = {
      all: data.length,
      organization: 0,
      premium: 0,
      free: 0,
      organization_staff: 0,
      student: 0,
    };

    data.forEach((user) => {
      counts[getSegment(user)] += 1;
    });

    return counts;
  }, [data]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = data.filter((user) => {
      const segment = getSegment(user);
      const status = getSubscriptionStatus(user);
      const paymentAmount = user.latestOrder?.price ? String(user.latestOrder.price) : '';
      const haystack = [
        user.mName,
        user.email,
        user.organizationName,
        user.departmentName,
        user.role,
        user.type,
        user.latestOrder?.provider,
        user.latestOrder?.paymentMethod,
        user.latestOrder?.status,
        paymentAmount,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSegment = activeSegment === 'all' || segment === activeSegment;
      const matchesPlan = planFilter === 'all' || (user.type || 'free') === planFilter;
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesAccess =
        accessFilter === 'all' ||
        (accessFilter === 'organization' ? isOrganizationLinked(user) : !isOrganizationLinked(user));

      const matchesSearch = !query || haystack.includes(query);

      return matchesSegment && matchesPlan && matchesStatus && matchesAccess && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return String(a.mName || '').localeCompare(String(b.mName || ''));
      }

      if (sortBy === 'oldest') {
        return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
      }

      if (sortBy === 'recent-payment') {
        return new Date(b.latestOrder?.date || 0).getTime() - new Date(a.latestOrder?.date || 0).getTime();
      }

      if (sortBy === 'expiry') {
        const left = a.subscriptionEnd ? new Date(a.subscriptionEnd).getTime() : Number.MAX_SAFE_INTEGER;
        const right = b.subscriptionEnd ? new Date(b.subscriptionEnd).getTime() : Number.MAX_SAFE_INTEGER;
        return left - right;
      }

      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });
  }, [accessFilter, activeSegment, data, planFilter, searchQuery, sortBy, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSegment, accessFilter, planFilter, searchQuery, sortBy, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredData]);

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages: Array<number | 'ellipsis-left' | 'ellipsis-right'> = [1];

    if (currentPage > 3) pages.push('ellipsis-left');

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    if (currentPage < totalPages - 2) pages.push('ellipsis-right');

    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const handleEditClick = (user: AdminUser) => {
    setSelectedUser(user);
    setEditName(user.mName || '');
    setEditEmail(user.email || '');
    setEditType(user.type || 'free');
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await axios.post(`${serverURL}/api/admin/deleteuser`, { userId: userToDelete });
      if (response.data.success) {
        toast({ title: 'User deleted successfully' });
        fetchData();
      } else {
        toast({ title: 'Delete failed', variant: 'destructive' });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Server error', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await axios.post(`${serverURL}/api/admin/updateuser`, {
        userId: selectedUser._id,
        mName: editName,
        email: editEmail,
        type: editType,
      });

      if (response.data.success) {
        toast({ title: 'User updated successfully' });
        setIsEditDialogOpen(false);
        fetchData();
      } else {
        toast({ title: 'Update failed', variant: 'destructive' });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Server error', variant: 'destructive' });
    }
  };

  const handleBlockToggle = (userId: string, currentBlockedStatus = false) => {
    setUserToBlock({ id: userId, isBlocked: currentBlockedStatus });
    setIsBlockDialogOpen(true);
  };

  const confirmBlockToggle = async () => {
    if (!userToBlock) return;

    try {
      const response = await axios.post(`${serverURL}/api/admin/block-user`, {
        userId: userToBlock.id,
        isBlocked: !userToBlock.isBlocked,
      });

      if (response.data.success) {
        toast({
          title: `User ${userToBlock.isBlocked ? 'unblocked' : 'blocked'} successfully`,
        });
        fetchData();
      } else {
        toast({ title: 'Action failed', variant: 'destructive' });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Server error', variant: 'destructive' });
    } finally {
      setIsBlockDialogOpen(false);
      setUserToBlock(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPlanFilter('all');
    setStatusFilter('all');
    setAccessFilter('all');
    setSortBy('newest');
    setActiveSegment('all');
  };

  const activeSegmentMeta = segmentConfig[activeSegment];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Users Directory</h1>
        <p className="text-muted-foreground">
          Separate users by account type, inspect paid activity quickly, and keep admin actions in one clean flow.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(Object.keys(segmentConfig) as UserSegment[]).map((segment) => {
          const Icon = segmentConfig[segment].icon;

          return (
            <button
              key={segment}
              type="button"
              onClick={() => setActiveSegment(segment)}
              className={cn(
                'text-left transition-all',
                activeSegment === segment ? 'scale-[1.01]' : 'hover:-translate-y-0.5'
              )}
            >
              <Card
                className={cn(
                  'h-full border-slate-200 bg-white/90 shadow-sm',
                  activeSegment === segment && 'border-primary shadow-md ring-1 ring-primary/20'
                )}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {segmentCounts[segment]}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{segmentConfig[segment].label}</CardTitle>
                    <CardDescription>{segmentConfig[segment].description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </button>
          );
        })}
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-2xl">{activeSegmentMeta.label}</CardTitle>
              <CardDescription>{activeSegmentMeta.description}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {filteredData.length} matching users
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {data.filter((user) => user.isBlocked).length} blocked
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {data.filter((user) => user.type && user.type !== 'free').length} paid
              </span>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, organization, department, provider, amount..."
                className="pl-9"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="forever">Lifetime</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={accessFilter} onValueChange={setAccessFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All access</SelectItem>
                <SelectItem value="organization">Organization-linked</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="recent-payment">Recent payment</SelectItem>
                <SelectItem value="expiry">Expiry soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters}>
              Reset filters
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Plan & Payment</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  [...Array(6)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((user) => {
                    const segment = getSegment(user);
                    const subscriptionStatus = getSubscriptionStatus(user);

                    return (
                      <TableRow key={user._id}>
                        <TableCell className="align-top">
                          <div className="space-y-1">
                            <div className="font-medium">{user.mName || 'Unnamed user'}</div>
                            <div className="text-sm text-muted-foreground">{user.email || 'No email'}</div>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {user.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                              {user.role && <Badge variant="outline">{user.role}</Badge>}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="space-y-2">
                            <Badge variant="secondary">{segmentConfig[segment].label}</Badge>
                            <div className="text-sm text-muted-foreground">
                              {isOrganizationLinked(user) ? 'Organization-linked' : 'Individual account'}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="space-y-1 text-sm">
                            <div className="font-medium">{user.organizationName || 'Independent user'}</div>
                            <div className="text-muted-foreground">
                              {user.departmentName || 'No department assigned'}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="space-y-2 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={user.type && user.type !== 'free' ? 'default' : 'secondary'}>
                                {getPlanLabel(user.type)}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'capitalize',
                                  subscriptionStatus === 'blocked' && 'border-rose-200 text-rose-700',
                                  subscriptionStatus === 'expired' && 'border-amber-200 text-amber-700',
                                  subscriptionStatus === 'active' && 'border-emerald-200 text-emerald-700'
                                )}
                              >
                                {subscriptionStatus}
                              </Badge>
                            </div>

                            {user.latestOrder ? (
                              <div className="space-y-1 text-muted-foreground">
                                <div className="font-medium text-slate-900">
                                  {(user.latestOrder.currency || 'INR')} {user.latestOrder.price ?? 0}
                                </div>
                                <div className="capitalize">
                                  {user.latestOrder.provider || 'payment'} • {user.latestOrder.paymentMethod || 'method N/A'}
                                </div>
                                <div>{formatDate(user.latestOrder.date)}</div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground">
                                {user.type && user.type !== 'free' ? 'No payment record available' : 'No payment history'}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="font-medium text-slate-900">Joined:</span> {formatDate(user.date)}
                            </div>
                            <div>
                              <span className="font-medium text-slate-900">Start:</span> {formatDate(user.subscriptionStart)}
                            </div>
                            <div>
                              <span className="font-medium text-slate-900">End:</span>{' '}
                              {user.type === 'forever' ? 'Lifetime' : formatDate(user.subscriptionEnd)}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            {(user.latestOrder || (user.type && user.type !== 'free')) && (
                              <Button variant="outline" size="sm" onClick={() => setPaymentUser(user)}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                View payment
                              </Button>
                            )}

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                              title={user.isBlocked ? 'Unblock user' : 'Block user'}
                            >
                              {user.isBlocked ? (
                                <UserCheck className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Ban className="h-4 w-4 text-rose-600" />
                              )}
                            </Button>

                            <Button size="icon" variant="ghost" onClick={() => handleEditClick(user)} title="Edit user">
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteClick(user._id)}
                              title="Delete user"
                            >
                              <Trash className="h-4 w-4 text-rose-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      No users matched the current segment and filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {visiblePages.map((page, index) =>
                  typeof page === 'number' ? (
                    <Button
                      key={page}
                      size="sm"
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ) : (
                    <span
                      key={`${page}-${index}`}
                      className="flex h-9 w-9 items-center justify-center text-muted-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </span>
                  )
                )}

                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(paymentUser)} onOpenChange={(open) => !open && setPaymentUser(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment details</DialogTitle>
            <DialogDescription>
              Review the latest billing and subscription details for this user.
            </DialogDescription>
          </DialogHeader>

          {paymentUser && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-slate-200 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">User profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Name</div>
                    <div className="font-medium">{paymentUser.mName || 'Unnamed user'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium">{paymentUser.email || 'No email'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Category</div>
                    <div className="font-medium">{segmentConfig[getSegment(paymentUser)].label}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Organization</div>
                    <div className="font-medium">{paymentUser.organizationName || 'Independent user'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Department</div>
                    <div className="font-medium">{paymentUser.departmentName || 'No department assigned'}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Subscription & billing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Plan</div>
                    <div className="font-medium">{getPlanLabel(paymentUser.type)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Amount</div>
                    <div className="font-medium">
                      {paymentUser.latestOrder
                        ? `${paymentUser.latestOrder.currency || 'INR'} ${paymentUser.latestOrder.price ?? 0}`
                        : 'No order amount found'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Paid date</div>
                    <div className="font-medium">{formatDate(paymentUser.latestOrder?.date)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Payment status</div>
                    <div>
                      <Badge variant="outline" className={getPaymentBadgeClass(paymentUser.latestOrder?.status)}>
                        {paymentUser.latestOrder?.status || 'No order record'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Provider</div>
                    <div className="font-medium capitalize">{paymentUser.latestOrder?.provider || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Payment method</div>
                    <div className="font-medium capitalize">{paymentUser.latestOrder?.paymentMethod || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Subscription start</div>
                    <div className="font-medium">{formatDate(paymentUser.subscriptionStart)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Subscription end</div>
                    <div className="font-medium">
                      {paymentUser.type === 'forever' ? 'Lifetime' : formatDate(paymentUser.subscriptionEnd)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Subscription ID</div>
                    <div className="font-medium break-all">{paymentUser.latestOrder?.subscriptionId || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Payment reference</div>
                    <div className="font-medium break-all">{paymentUser.latestOrder?.razorpayPaymentId || 'N/A'}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the user profile and subscription plan.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="Name" />
            <Input value={editEmail} onChange={(event) => setEditEmail(event.target.value)} placeholder="Email" />

            <Select value={editType} onValueChange={setEditType}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="forever">Lifetime</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button onClick={handleUpdateUser}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the account and any linked platform data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{userToBlock?.isBlocked ? 'Unblock user?' : 'Block user?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {userToBlock?.isBlocked
                ? 'This restores account access immediately.'
                : 'This prevents the user from signing in until an admin unblocks the account.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBlockToggle}>
              {userToBlock?.isBlocked ? 'Unblock' : 'Block'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
