import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Ban,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  MoreHorizontal,
  Search,
  Settings,
  Trash2,
  UserCheck,
  Wallet,
} from 'lucide-react';

import { serverURL } from '@/constants';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type AdminOrder = {
  price?: number;
  currency?: string;
  provider?: string;
  paymentMethod?: string;
  status?: string;
  subscriptionId?: string;
  razorpayPaymentId?: string;
  date?: string;
  planName?: string;
};

type PaidUser = {
  _id: string;
  mName?: string;
  email?: string;
  type?: string;
  role?: string;
  isBlocked?: boolean;
  organizationName?: string | null;
  departmentName?: string | null;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  latestOrder?: AdminOrder | null;
};

const ITEMS_PER_PAGE = 10;

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : format(date, 'PPP');
};

const getStatus = (user: PaidUser) => {
  if (user.isBlocked) return 'blocked';
  if (user.type === 'forever' || !user.subscriptionEnd) return 'active';
  return new Date(user.subscriptionEnd).getTime() < Date.now() ? 'expired' : 'active';
};

const getPlanLabel = (type?: string) => {
  if (!type) return 'Free';
  if (type === 'forever') return 'Lifetime';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const getStatusClassName = (status: string) => {
  switch (status) {
    case 'active':
      return 'border-emerald-200 text-emerald-700';
    case 'expired':
      return 'border-amber-200 text-amber-700';
    case 'blocked':
      return 'border-rose-200 text-rose-700';
    default:
      return 'border-slate-200 text-slate-700';
  }
};

const getRowClassName = (user: PaidUser) => {
  const status = getStatus(user);

  if (status === 'blocked') return 'bg-rose-50/70';
  if (status === 'expired') return 'bg-amber-50/70';

  if (user.subscriptionEnd && user.type !== 'forever') {
    const diffDays = Math.ceil((new Date(user.subscriptionEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 7) {
      return 'bg-sky-50/70';
    }
  }

  return '';
};

const AdminPaidUsers = () => {
  const { toast } = useToast();

  const [data, setData] = useState<PaidUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent-payment');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PaidUser | null>(null);
  const [paymentUser, setPaymentUser] = useState<PaidUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editType, setEditType] = useState('monthly');

  const fetchData = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/getpaid`);
      setData(response.data || []);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to load paid users.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const providerOptions = useMemo(() => {
    return Array.from(new Set(data.map((user) => user.latestOrder?.provider).filter(Boolean))) as string[];
  }, [data]);

  const stats = useMemo(() => {
    const active = data.filter((user) => getStatus(user) === 'active').length;
    const expired = data.filter((user) => getStatus(user) === 'expired').length;
    const blocked = data.filter((user) => user.isBlocked).length;
    const revenue = data.reduce((sum, user) => sum + Number(user.latestOrder?.price || 0), 0);

    return { active, expired, blocked, revenue };
  }, [data]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = data.filter((user) => {
      const status = getStatus(user);
      const provider = user.latestOrder?.provider || 'unknown';
      const haystack = [
        user.mName,
        user.email,
        user.organizationName,
        user.departmentName,
        user.type,
        provider,
        user.role,
        user.latestOrder?.paymentMethod,
        user.latestOrder?.price ? String(user.latestOrder.price) : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (!query || haystack.includes(query)) &&
        (statusFilter === 'all' || status === statusFilter) &&
        (planFilter === 'all' || user.type === planFilter) &&
        (providerFilter === 'all' || provider === providerFilter)
      );
    });

    return [...filtered].sort((left, right) => {
      if (sortBy === 'amount') {
        return Number(right.latestOrder?.price || 0) - Number(left.latestOrder?.price || 0);
      }
      if (sortBy === 'alphabetical') {
        return String(left.mName || '').localeCompare(String(right.mName || ''));
      }
      if (sortBy === 'expiry') {
        const leftExpiry = left.subscriptionEnd ? new Date(left.subscriptionEnd).getTime() : Number.MAX_SAFE_INTEGER;
        const rightExpiry = right.subscriptionEnd ? new Date(right.subscriptionEnd).getTime() : Number.MAX_SAFE_INTEGER;
        return leftExpiry - rightExpiry;
      }

      return new Date(right.latestOrder?.date || right.subscriptionStart || 0).getTime() -
        new Date(left.latestOrder?.date || left.subscriptionStart || 0).getTime();
    });
  }, [data, planFilter, providerFilter, searchQuery, sortBy, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [planFilter, providerFilter, searchQuery, sortBy, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages: Array<number | 'ellipsis-left' | 'ellipsis-right'> = [1];

    if (currentPage > 3) pages.push('ellipsis-left');

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    for (let page = startPage; page <= endPage; page += 1) pages.push(page);

    if (currentPage < totalPages - 2) pages.push('ellipsis-right');
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const handleEditClick = (user: PaidUser) => {
    setSelectedUser(user);
    setEditName(user.mName || '');
    setEditEmail(user.email || '');
    setEditType(user.type || 'monthly');
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await axios.post(`${serverURL}/api/admin/updateuser`, {
        userId: selectedUser._id,
        mName: editName,
        email: editEmail,
        type: editType,
      });
      toast({ title: 'User updated successfully' });
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Update failed.', variant: 'destructive' });
    }
  };

  const handleBlockToggle = async (userId: string, currentBlockedStatus = false) => {
    try {
      const response = await axios.post(`${serverURL}/api/admin/block-user`, {
        userId,
        isBlocked: !currentBlockedStatus,
      });

      if (response.data.success) {
        toast({ title: `User ${currentBlockedStatus ? 'unblocked' : 'blocked'} successfully` });
        fetchData();
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Server error', variant: 'destructive' });
    }
  };

  const handleDeleteClick = async (userId: string) => {
    if (!window.confirm('Delete this paid user permanently?')) return;

    try {
      await axios.post(`${serverURL}/api/admin/deleteuser`, { userId });
      toast({ title: 'User deleted successfully' });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Delete failed.', variant: 'destructive' });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPlanFilter('all');
    setProviderFilter('all');
    setSortBy('recent-payment');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Paid Users</h1>
        <p className="text-muted-foreground">
          Super-admin billing visibility for subscriptions, payment references, organization mapping, and account health.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Total paid accounts</CardDescription>
            <CardTitle className="text-3xl">{data.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Active subscriptions</CardDescription>
            <CardTitle className="text-3xl text-emerald-600">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Expired or blocked</CardDescription>
            <CardTitle className="text-3xl text-amber-600">{stats.expired + stats.blocked}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Visible billed value</CardDescription>
            <CardTitle className="text-3xl">INR {stats.revenue}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-2xl">Subscription accounts</CardTitle>
            <CardDescription>
              {filteredData.length} paid users match the current super-admin filters.
            </CardDescription>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.8fr_repeat(4,minmax(0,1fr))]">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by user, mail, organization, department, provider, amount..."
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger><SelectValue placeholder="Plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="forever">Lifetime</SelectItem>
              </SelectContent>
            </Select>

            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger><SelectValue placeholder="Provider" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All providers</SelectItem>
                {providerOptions.map((provider) => (
                  <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent-payment">Recent payment</SelectItem>
                <SelectItem value="expiry">Expiry soon</SelectItem>
                <SelectItem value="amount">Highest amount</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters}>Reset filters</Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Account Context</TableHead>
                  <TableHead>Billing Snapshot</TableHead>
                  <TableHead>Subscription Window</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedData.length ? (
                  paginatedData.map((user) => {
                    const status = getStatus(user);

                    return (
                      <TableRow key={user._id} className={getRowClassName(user)}>
                        <TableCell className="align-top">
                          <div className="space-y-1">
                            <div className="font-medium">{user.mName || 'Unnamed user'}</div>
                            <div className="text-sm text-muted-foreground">{user.email || 'No email'}</div>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <Badge>{getPlanLabel(user.type)}</Badge>
                              {user.role && <Badge variant="outline">{user.role}</Badge>}
                              <Badge variant="outline" className={cn('capitalize', getStatusClassName(status))}>
                                {status}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top text-sm">
                          <div className="space-y-1">
                            <div className="font-medium">{user.organizationName || 'Individual premium user'}</div>
                            <div className="text-muted-foreground">{user.departmentName || 'No department assigned'}</div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top text-sm">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {user.latestOrder ? `${user.latestOrder.currency || 'INR'} ${user.latestOrder.price ?? 0}` : 'N/A'}
                            </div>
                            <div className="text-muted-foreground capitalize">
                              {user.latestOrder?.provider || 'No provider'} • {user.latestOrder?.paymentMethod || 'Method N/A'}
                            </div>
                            <div className="text-muted-foreground">
                              {formatDate(user.latestOrder?.date || user.subscriptionStart)}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top text-sm">
                          <div className="space-y-1">
                            <div><span className="font-medium">Start:</span> {formatDate(user.subscriptionStart)}</div>
                            <div>
                              <span className="font-medium">End:</span>{' '}
                              {user.type === 'forever' ? 'Lifetime' : formatDate(user.subscriptionEnd)}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPaymentUser(user)}>
                              <CreditCard className="mr-2 h-4 w-4" />
                              View details
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleBlockToggle(user._id, user.isBlocked)}>
                              {user.isBlocked ? <UserCheck className="h-4 w-4 text-emerald-600" /> : <Ban className="h-4 w-4 text-rose-600" />}
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleEditClick(user)}>
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-rose-600" onClick={() => handleDeleteClick(user._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No paid users found for the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {visiblePages.map((page, index) =>
                typeof page === 'number' ? (
                  <Button key={page} size="sm" variant={currentPage === page ? 'default' : 'outline'} onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>
                ) : (
                  <span key={`${page}-${index}`} className="flex h-9 w-9 items-center justify-center text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                )
              )}
              <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(paymentUser)} onOpenChange={(open) => !open && setPaymentUser(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Paid user details</DialogTitle>
            <DialogDescription>
              Full billing, subscription, and account context for the selected premium user.
            </DialogDescription>
          </DialogHeader>

          {paymentUser && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-slate-200 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Account profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div><span className="text-muted-foreground">Name</span><div className="font-medium">{paymentUser.mName || 'Unnamed user'}</div></div>
                  <div><span className="text-muted-foreground">Mail</span><div className="font-medium">{paymentUser.email || 'No email'}</div></div>
                  <div><span className="text-muted-foreground">Plan</span><div className="font-medium">{getPlanLabel(paymentUser.type)}</div></div>
                  <div><span className="text-muted-foreground">Organization</span><div className="font-medium">{paymentUser.organizationName || 'Independent user'}</div></div>
                  <div><span className="text-muted-foreground">Department</span><div className="font-medium">{paymentUser.departmentName || 'No department assigned'}</div></div>
                  <div><span className="text-muted-foreground">Status</span><div><Badge variant="outline" className={cn('capitalize', getStatusClassName(getStatus(paymentUser)))}>{getStatus(paymentUser)}</Badge></div></div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Billing detail</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Wallet className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <div className="text-muted-foreground">Amount</div>
                      <div className="font-medium">
                        {paymentUser.latestOrder ? `${paymentUser.latestOrder.currency || 'INR'} ${paymentUser.latestOrder.price ?? 0}` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <div className="text-muted-foreground">Provider / Method</div>
                      <div className="font-medium capitalize">
                        {paymentUser.latestOrder?.provider || 'N/A'} • {paymentUser.latestOrder?.paymentMethod || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CalendarClock className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <div className="text-muted-foreground">Paid date</div>
                      <div className="font-medium">{formatDate(paymentUser.latestOrder?.date || paymentUser.subscriptionStart)}</div>
                    </div>
                  </div>
                  <div><span className="text-muted-foreground">Subscription start</span><div className="font-medium">{formatDate(paymentUser.subscriptionStart)}</div></div>
                  <div><span className="text-muted-foreground">Subscription end</span><div className="font-medium">{paymentUser.type === 'forever' ? 'Lifetime' : formatDate(paymentUser.subscriptionEnd)}</div></div>
                  <div><span className="text-muted-foreground">Subscription ID</span><div className="font-medium break-all">{paymentUser.latestOrder?.subscriptionId || 'N/A'}</div></div>
                  <div><span className="text-muted-foreground">Payment reference</span><div className="font-medium break-all">{paymentUser.latestOrder?.razorpayPaymentId || 'N/A'}</div></div>
                  <div><span className="text-muted-foreground">Payment status</span><div className="font-medium capitalize">{paymentUser.latestOrder?.status || getStatus(paymentUser)}</div></div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Paid User</DialogTitle>
            <DialogDescription>Update user info and subscription plan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="Name" />
            <Input value={editEmail} onChange={(event) => setEditEmail(event.target.value)} placeholder="Email" />
            <Select value={editType} onValueChange={setEditType}>
              <SelectTrigger><SelectValue placeholder="Plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="forever">Lifetime</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateUser}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPaidUsers;
