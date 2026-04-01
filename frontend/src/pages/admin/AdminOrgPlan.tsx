// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {
  BellRing,
  CalendarClock,
  CircleDollarSign,
  CreditCard,
  Download,
  Landmark,
  Loader2,
  FileDown,
  Plus,
  Search,
  ShieldAlert,
  SquarePen,
  Wallet,
} from 'lucide-react';

import { serverURL } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const emptyForm = {
  organizationId: '',
  planName: '1months',
  additionalRequestSlots: 0,
  studentSlotPrice: 1000,
  paymentMode: 'online',
  paymentStatus: 'paid',
  paidByName: '',
  paidByEmail: '',
  transactionId: '',
  paymentDate: new Date().toISOString().slice(0, 10),
};

const getPlanLabel = (planName) => {
  const map = {
    '1months': '1 Month',
    '3months': '3 Months',
    '6months': '6 Months',
  };
  return map[planName] || planName || 'No Plan';
};

const getLifecycleStatus = (record) => {
  if (!record.planName || !record.endDate) return 'no-plan';

  const diffDays = Math.ceil((new Date(record.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 15) return 'expiring-soon';
  return 'active';
};

const getLifecycleBadgeClass = (status) => {
  switch (status) {
    case 'expired':
      return 'border-rose-200 text-rose-700';
    case 'expiring-soon':
      return 'border-amber-200 text-amber-700';
    case 'active':
      return 'border-emerald-200 text-emerald-700';
    default:
      return 'border-slate-200 text-slate-700';
  }
};

const getPaymentBadgeClass = (status) => {
  switch (status) {
    case 'paid':
      return 'border-emerald-200 text-emerald-700';
    case 'partial':
      return 'border-sky-200 text-sky-700';
    case 'pending':
      return 'border-amber-200 text-amber-700';
    case 'failed':
      return 'border-rose-200 text-rose-700';
    default:
      return 'border-slate-200 text-slate-700';
  }
};

const getRowClassName = (record) => {
  const lifecycle = getLifecycleStatus(record);
  if (record.paymentStatus === 'failed') return 'bg-rose-50/70';
  if (record.paymentStatus === 'pending' || lifecycle === 'expiring-soon') return 'bg-amber-50/70';
  if (lifecycle === 'expired') return 'bg-rose-50/50';
  if (record.paymentStatus === 'partial') return 'bg-sky-50/60';
  return '';
};

const AdminOrgPlan = () => {
  const { toast } = useToast();

  const [organizations, setOrganizations] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [lifecycleFilter, setLifecycleFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [paymentDateFrom, setPaymentDateFrom] = useState('');
  const [paymentDateTo, setPaymentDateTo] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [reminderLoadingId, setReminderLoadingId] = useState('');
  const [isBulkReminderLoading, setIsBulkReminderLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [orgsRes, plansRes] = await Promise.all([
        axios.get(`${serverURL}/api/organizations`),
        axios.get(`${serverURL}/api/admin/org-plans`),
      ]);

      setOrganizations(orgsRes.data || []);
      setPlans(plansRes.data?.plans || []);
    } catch (error) {
      console.error('Fetch organization collections error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load organization collections',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mergedRecords = useMemo(() => {
    const planMap = new Map();

    plans.forEach((plan) => {
      const organizationId = String(plan.organization?._id || plan.organization);
      planMap.set(organizationId, plan);
    });

    return organizations.map((org) => {
      const organizationId = String(org.organization);
      const plan = planMap.get(organizationId);

      return {
        rootUserId: org._id,
        organizationId,
        institutionName: org.organizationDetails?.institutionName || org.mName || plan?.organization?.name || 'Unnamed organization',
        adminEmail: org.email || plan?.organization?.email || '',
        inchargeName: org.organizationDetails?.inchargeName || '',
        inchargePhone: org.organizationDetails?.inchargePhone || '',
        planName: plan?.planName || org.planName || '',
        additionalRequestSlots: plan?.additionalRequestSlots || 0,
        studentSlotPrice: plan?.studentSlotPrice || 1000,
        totalPrice: plan?.totalPrice || 0,
        totalStudentSlots: plan?.totalStudentSlots || 0,
        paymentMode: plan?.paymentMode || 'online',
        paymentStatus: plan?.paymentStatus || 'pending',
        paidByName: plan?.paidByName || org.organizationDetails?.inchargeName || '',
        paidByEmail: plan?.paidByEmail || org.email || '',
        transactionId: plan?.transactionId || '',
        paymentDate: plan?.paymentDate || plan?.startDate || null,
        startDate: plan?.startDate || null,
        endDate: plan?.endDate || org.planEndDate || null,
        isActive: plan?.isActive ?? false,
        isBlocked: Boolean(org.organizationDetails?.isBlocked),
      };
    });
  }, [organizations, plans]);

  const planOptions = useMemo(() => {
    return ['1months', '3months', '6months'];
  }, []);

  const stats = useMemo(() => {
    return {
      total: mergedRecords.length,
      paid: mergedRecords.filter((record) => record.paymentStatus === 'paid').length,
      pending: mergedRecords.filter((record) => record.paymentStatus === 'pending').length,
      expiringSoon: mergedRecords.filter((record) => getLifecycleStatus(record) === 'expiring-soon').length,
      collected: mergedRecords.reduce((sum, record) => sum + Number(record.totalPrice || 0), 0),
    };
  }, [mergedRecords]);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return mergedRecords.filter((record) => {
      const lifecycle = getLifecycleStatus(record);
      const paymentDateValue = record.paymentDate || record.startDate || null;
      const paymentDate = paymentDateValue ? new Date(paymentDateValue) : null;
      const fromDate = paymentDateFrom ? new Date(`${paymentDateFrom}T00:00:00`) : null;
      const toDate = paymentDateTo ? new Date(`${paymentDateTo}T23:59:59`) : null;
      const matchesSearch =
        !query ||
        record.institutionName.toLowerCase().includes(query) ||
        record.adminEmail.toLowerCase().includes(query) ||
        record.paidByName.toLowerCase().includes(query) ||
        record.paidByEmail.toLowerCase().includes(query) ||
        record.transactionId.toLowerCase().includes(query);
      const matchesFromDate = !fromDate || (paymentDate && paymentDate >= fromDate);
      const matchesToDate = !toDate || (paymentDate && paymentDate <= toDate);

      return (
        matchesSearch &&
        (paymentStatusFilter === 'all' || record.paymentStatus === paymentStatusFilter) &&
        (lifecycleFilter === 'all' || lifecycle === lifecycleFilter) &&
        (planFilter === 'all' || record.planName === planFilter) &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [lifecycleFilter, mergedRecords, paymentDateFrom, paymentDateTo, paymentStatusFilter, planFilter, searchTerm]);

  const remindableFilteredRecords = useMemo(() => {
    return filteredRecords.filter((record) => {
      const lifecycle = getLifecycleStatus(record);
      return lifecycle === 'expiring-soon' || lifecycle === 'expired';
    });
  }, [filteredRecords]);

  const handleOpenDialog = (record = null) => {
    setSelectedRecord(record);

    if (record) {
      setFormData({
        organizationId: record.organizationId,
        planName: record.planName || '1months',
        additionalRequestSlots: Number(record.additionalRequestSlots || 0),
        studentSlotPrice: Number(record.studentSlotPrice || 1000),
        paymentMode: record.paymentMode || 'online',
        paymentStatus: record.paymentStatus || 'paid',
        paidByName: record.paidByName || '',
        paidByEmail: record.paidByEmail || '',
        transactionId: record.transactionId || '',
        paymentDate: record.paymentDate ? new Date(record.paymentDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      });
    } else {
      setFormData(emptyForm);
    }

    setIsDialogOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${serverURL}/api/admin/org-plan/create`, {
        ...formData,
        additionalRequestSlots: Number(formData.additionalRequestSlots || 0),
        studentSlotPrice: Number(formData.studentSlotPrice || 1000),
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Organization collection details saved successfully',
        });
        setIsDialogOpen(false);
        fetchData();
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to save organization collection details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Save organization collection error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save organization collection details',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCsv = () => {
    if (!filteredRecords.length) {
      toast({
        title: 'Nothing to export',
        description: 'There are no filtered organization collections to export.',
      });
      return;
    }

    const headers = [
      'Institution',
      'Admin Email',
      'Paid By',
      'Payer Email',
      'Plan',
      'Slots',
      'Total Price',
      'Payment Mode',
      'Payment Status',
      'Transaction ID',
      'Payment Date',
      'Plan Start',
      'Plan End',
      'Lifecycle',
    ];

    const rows = filteredRecords.map((record) => [
      record.institutionName,
      record.adminEmail,
      record.paidByName,
      record.paidByEmail,
      getPlanLabel(record.planName),
      record.totalStudentSlots || 0,
      record.totalPrice || 0,
      record.paymentMode || '',
      record.paymentStatus || '',
      record.transactionId || '',
      record.paymentDate ? format(new Date(record.paymentDate), 'yyyy-MM-dd') : '',
      record.startDate ? format(new Date(record.startDate), 'yyyy-MM-dd') : '',
      record.endDate ? format(new Date(record.endDate), 'yyyy-MM-dd') : '',
      getLifecycleStatus(record),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'organization-collections.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPdf = async () => {
    if (!filteredRecords.length || isExportingPdf) return;

    setIsExportingPdf(true);
    try {
      const element = document.getElementById('org-collection-pdf-content');
      if (!element) throw new Error('PDF content not found');

      const html2pdf = await import('html2pdf.js');
      await html2pdf.default()
        .from(element)
        .set({
          margin: [0.3, 0.3],
          filename: 'organization-collections.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
        })
        .save();
    } catch (error) {
      console.error('Organization collection PDF export failed:', error);
      toast({
        title: 'Export failed',
        description: 'Could not generate the PDF export.',
        variant: 'destructive',
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const sendReminder = async (record) => {
    try {
      setReminderLoadingId(record.organizationId);
      const response = await axios.post(`${serverURL}/api/admin/org-plan/${record.organizationId}/reminder`);

      if (response.data.success) {
        toast({
          title: 'Reminder sent',
          description: `Renewal reminder sent for ${record.institutionName}.`,
        });
        fetchData();
      }
    } catch (error) {
      console.error('Send reminder failed:', error);
      toast({
        title: 'Reminder failed',
        description: error.response?.data?.message || 'Could not send the reminder email.',
        variant: 'destructive',
      });
    } finally {
      setReminderLoadingId('');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPaymentStatusFilter('all');
    setLifecycleFilter('all');
    setPlanFilter('all');
    setPaymentDateFrom('');
    setPaymentDateTo('');
  };

  const sendBulkReminders = async () => {
    if (!remindableFilteredRecords.length || isBulkReminderLoading) return;

    try {
      setIsBulkReminderLoading(true);
      const response = await axios.post(`${serverURL}/api/admin/org-plans/reminders`, {
        organizationIds: remindableFilteredRecords.map((record) => record.organizationId),
        lifecycle: 'all',
      });

      const sentCount = response.data?.sent?.length || 0;
      const failedCount = response.data?.failed?.length || 0;

      toast({
        title: 'Bulk reminders processed',
        description: `Sent ${sentCount} reminder(s) and ${failedCount} failed.`,
      });

      fetchData();
    } catch (error) {
      console.error('Bulk reminder failed:', error);
      toast({
        title: 'Bulk reminder failed',
        description: error.response?.data?.message || 'Could not send reminder emails for the filtered organizations.',
        variant: 'destructive',
      });
    } finally {
      setIsBulkReminderLoading(false);
    }
  };

  const collectionPreview = (Number(formData.studentSlotPrice || 1000) * (20 + Number(formData.additionalRequestSlots || 0)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Organization Payment Collection</h1>
          <p className="text-muted-foreground">
            Track institutional plan collections, payment mode, paid-by details, status, and expiry health in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={sendBulkReminders}
            disabled={isBulkReminderLoading || !remindableFilteredRecords.length}
          >
            {isBulkReminderLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellRing className="mr-2 h-4 w-4" />}
            Remind Expiring ({remindableFilteredRecords.length})
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportPdf} disabled={isExportingPdf || !filteredRecords.length}>
            {isExportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            Export PDF
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Collection
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Total institutions</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Paid</CardDescription>
            <CardTitle className="text-3xl text-emerald-600">{stats.paid}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Pending payment</CardDescription>
            <CardTitle className="text-3xl text-amber-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Expiring soon</CardDescription>
            <CardTitle className="text-3xl text-rose-600">{stats.expiringSoon}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Tracked collection</CardDescription>
            <CardTitle className="text-3xl">INR {stats.collected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-2xl">Collection ledger</CardTitle>
            <CardDescription>
              Colored rows highlight pending, expiring, and failed payment states so super-admins can act quickly.
            </CardDescription>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.8fr_repeat(5,minmax(0,220px))]">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search institution, paid by, email, transaction..."
                className="pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Payment status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All payment status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
              <SelectTrigger><SelectValue placeholder="Plan lifecycle" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All lifecycle</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring-soon">Expiring soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="no-plan">No plan</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger><SelectValue placeholder="Plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                {planOptions.map((plan) => (
                  <SelectItem key={plan} value={plan}>{getPlanLabel(plan)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={paymentDateFrom}
              onChange={(event) => setPaymentDateFrom(event.target.value)}
              placeholder="Payment from"
            />

            <Input
              type="date"
              value={paymentDateTo}
              onChange={(event) => setPaymentDateTo(event.target.value)}
              placeholder="Payment to"
            />
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>Filtered institutions: {filteredRecords.length}</span>
              <span>Need reminder: {remindableFilteredRecords.length}</span>
              {(paymentDateFrom || paymentDateTo) && (
                <span>
                  Payment window: {paymentDateFrom || 'Start'} - {paymentDateTo || 'Today'}
                </span>
              )}
            </div>
            <Button variant="outline" onClick={clearFilters}>Reset filters</Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Paid By</TableHead>
                  <TableHead>Plan & Collection</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Lifecycle</TableHead>
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
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No organization collections matched the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => {
                    const lifecycle = getLifecycleStatus(record);
                    const daysRemaining = record.endDate
                      ? Math.ceil((new Date(record.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null;

                    return (
                      <TableRow key={record.organizationId} className={getRowClassName(record)}>
                        <TableCell className="align-top">
                          <div className="space-y-1">
                            <div className="font-medium">{record.institutionName}</div>
                            <div className="text-sm text-muted-foreground">{record.adminEmail || 'No admin mail'}</div>
                            {record.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                          </div>
                        </TableCell>

                        <TableCell className="align-top text-sm">
                          <div className="space-y-1">
                            <div className="font-medium">{record.paidByName || record.inchargeName || 'Not recorded'}</div>
                            <div className="text-muted-foreground">{record.paidByEmail || 'No payer email'}</div>
                            <div className="text-muted-foreground">{record.inchargePhone || 'No phone'}</div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top text-sm">
                          <div className="space-y-1">
                            <div className="font-medium">{getPlanLabel(record.planName)}</div>
                            <div className="text-muted-foreground">Slots: {record.totalStudentSlots || 0}</div>
                            <div className="text-muted-foreground">INR {record.totalPrice || 0}</div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top text-sm">
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className={getPaymentBadgeClass(record.paymentStatus)}>
                                {record.paymentStatus || 'pending'}
                              </Badge>
                              <Badge variant="outline">{record.paymentMode || 'online'}</Badge>
                            </div>
                            <div className="text-muted-foreground">{record.transactionId || 'No transaction ref'}</div>
                            <div className="text-muted-foreground">
                              {record.paymentDate ? format(new Date(record.paymentDate), 'PPP') : 'No payment date'}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top text-sm">
                          <div className="space-y-1">
                            <Badge variant="outline" className={getLifecycleBadgeClass(lifecycle)}>
                              {lifecycle}
                            </Badge>
                            <div className="text-muted-foreground">Start: {record.startDate ? format(new Date(record.startDate), 'PPP') : 'N/A'}</div>
                            <div className="text-muted-foreground">End: {record.endDate ? format(new Date(record.endDate), 'PPP') : 'N/A'}</div>
                            <div className="text-muted-foreground">
                              {daysRemaining === null ? 'No active plan' : `${daysRemaining} day(s) remaining`}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            {(lifecycle === 'expiring-soon' || lifecycle === 'expired') && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={reminderLoadingId === record.organizationId}
                                onClick={() => sendReminder(record)}
                              >
                                {reminderLoadingId === record.organizationId ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <BellRing className="mr-2 h-4 w-4" />
                                )}
                                Remind
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleOpenDialog(record)}>
                              <SquarePen className="mr-2 h-4 w-4" />
                              Manage
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRecord ? 'Update collection details' : 'Add organization collection'}</DialogTitle>
            <DialogDescription>
              Capture plan, payment mode, paid-by identity, and current collection status for the institution.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Organization</Label>
                <Select
                  value={formData.organizationId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, organizationId: value }))}
                  disabled={Boolean(selectedRecord)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.organization} value={String(org.organization)}>
                        {org.organizationDetails?.institutionName || org.mName || org.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={formData.planName} onValueChange={(value) => setFormData((prev) => ({ ...prev, planName: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1months">1 Month</SelectItem>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Additional Slots</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.additionalRequestSlots}
                  onChange={(event) => setFormData((prev) => ({ ...prev, additionalRequestSlots: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Student Slot Price</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.studentSlotPrice}
                  onChange={(event) => setFormData((prev) => ({ ...prev, studentSlotPrice: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select value={formData.paymentMode} onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMode: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={formData.paymentStatus} onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentStatus: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Paid By</Label>
                <Input
                  value={formData.paidByName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, paidByName: event.target.value }))}
                  placeholder="Person name"
                />
              </div>

              <div className="space-y-2">
                <Label>Payer Email</Label>
                <Input
                  type="email"
                  value={formData.paidByEmail}
                  onChange={(event) => setFormData((prev) => ({ ...prev, paidByEmail: event.target.value }))}
                  placeholder="billing@institution.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Transaction ID / Ref</Label>
                <Input
                  value={formData.transactionId}
                  onChange={(event) => setFormData((prev) => ({ ...prev, transactionId: event.target.value }))}
                  placeholder="UTR / receipt / cheque no."
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(event) => setFormData((prev) => ({ ...prev, paymentDate: event.target.value }))}
                />
              </div>
            </div>

            <div className="rounded-lg border bg-slate-50 p-4 text-sm">
              <div className="mb-2 font-medium">Collection preview</div>
              <div className="grid gap-2 md:grid-cols-3">
                <div>Plan: {getPlanLabel(formData.planName)}</div>
                <div>Slots: {20 + Number(formData.additionalRequestSlots || 0)}</div>
                <div>Total: INR {collectionPreview}</div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.organizationId}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CircleDollarSign className="mr-2 h-4 w-4" />}
                Save collection
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div id="org-collection-pdf-container" style={{ position: 'fixed', left: '-2000px', width: '1200px', background: '#fff' }}>
        <div id="org-collection-pdf-content" style={{ padding: '24px', backgroundColor: '#fff', color: '#111827' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '24px' }}>Organization Payment Collection</h1>
          <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '12px' }}>
            Exported on {format(new Date(), 'PPP p')}
          </p>
          <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '12px' }}>
            Filters: Payment status {paymentStatusFilter}, Lifecycle {lifecycleFilter}, Plan {planFilter},
            Payment date {paymentDateFrom || 'Start'} to {paymentDateTo || 'Today'}
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Institution', 'Paid By', 'Plan', 'Amount', 'Payment', 'Lifecycle'].map((heading) => (
                  <th key={heading} style={{ border: '1px solid #e5e7eb', padding: '8px', textAlign: 'left' }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.organizationId}>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>
                    <div>{record.institutionName}</div>
                    <div style={{ color: '#6b7280' }}>{record.adminEmail}</div>
                  </td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>
                    <div>{record.paidByName || record.inchargeName || 'Not recorded'}</div>
                    <div style={{ color: '#6b7280' }}>{record.paidByEmail || 'No payer email'}</div>
                  </td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>
                    <div>{getPlanLabel(record.planName)}</div>
                    <div style={{ color: '#6b7280' }}>Slots: {record.totalStudentSlots || 0}</div>
                  </td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>INR {record.totalPrice || 0}</td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>
                    <div>{record.paymentStatus || 'pending'} / {record.paymentMode || 'online'}</div>
                    <div style={{ color: '#6b7280' }}>{record.transactionId || 'No transaction ref'}</div>
                  </td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>
                    <div>{getLifecycleStatus(record)}</div>
                    <div style={{ color: '#6b7280' }}>End: {record.endDate ? format(new Date(record.endDate), 'PPP') : 'N/A'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrgPlan;
