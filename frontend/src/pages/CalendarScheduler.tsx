import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { type DayContentProps } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SEO from '@/components/SEO';
import { serverURL } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Layers3,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Edit3,
  User,
  Building2,
  RefreshCw,
  Link2,
  Link2Off,
  Lock,
  ExternalLink,
} from 'lucide-react';

type ScheduleVisibility = 'organization' | 'personal' | 'public';
type ScheduleCategory = 'Lecture' | 'Lab' | 'Meeting' | 'Workshop' | 'Deadline' | 'Study';
type ActiveTab = 'personal' | 'organization';

interface ScheduleItem {
  _id?: string;
  linkedMeetingId?: string;
  date?: string;
  day: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  room: string;
  location?: string;
  type: ScheduleCategory;
  visibility?: ScheduleVisibility;
  organizationId?: string;
  ownerId?: string;
  ownerRole?: string;
  color?: string;
  status?: 'planned' | 'in-progress' | 'done';
  sourceType?: 'schedule' | 'meeting';
  readOnly?: boolean;
}

interface FormState {
  date: string;
  day: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  room: string;
  location: string;
  type: ScheduleCategory;
  visibility: ScheduleVisibility;
  color: string;
  status: 'planned' | 'in-progress' | 'done';
}

interface GoogleCalStatus {
  isPremium: boolean;
  connected: boolean;
  lastSyncAt: string | null;
  configured: boolean;
}

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CATEGORY_OPTIONS: ScheduleCategory[] = ['Lecture', 'Lab', 'Meeting', 'Workshop', 'Deadline', 'Study'];
const VISIBILITY_OPTIONS: ScheduleVisibility[] = ['organization', 'personal', 'public'];
const dayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long' });
const dateInput = (date: Date) => format(date, 'yyyy-MM-dd');
const defaultVisibility = () =>
  sessionStorage.getItem('role') === 'student' || sessionStorage.getItem('role') === 'dept_admin' || sessionStorage.getItem('isOrganization') !== 'true'
    ? 'personal'
    : 'organization';
const resolveDate = (item: ScheduleItem, baseDate: Date) => {
  if (item.date) {
    const parsed = new Date(item.date);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const index = WEEK_DAYS.indexOf(item.day);
  if (index >= 0) return addDays(startOfWeek(baseDate, { weekStartsOn: 1 }), index);
  return null;
};
const sameDay = (item: ScheduleItem, targetDate: Date) => {
  const resolved = resolveDate(item, targetDate);
  return resolved ? isSameDay(resolved, targetDate) : false;
};
const categoryTone = (type: ScheduleCategory) => {
  switch (type) {
    case 'Lecture': return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'Lab': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
    case 'Workshop': return 'bg-violet-500/10 text-violet-700 border-violet-200';
    case 'Meeting': return 'bg-amber-500/10 text-amber-700 border-amber-200';
    case 'Deadline': return 'bg-rose-500/10 text-rose-700 border-rose-200';
    default: return 'bg-cyan-500/10 text-cyan-700 border-cyan-200';
  }
};
const visibilityTone = (visibility?: ScheduleVisibility) =>
  visibility === 'personal'
    ? 'bg-slate-500/10 text-slate-700 border-slate-200'
    : visibility === 'public'
      ? 'bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-200'
      : 'bg-indigo-500/10 text-indigo-700 border-indigo-200';
const sourceTone = (sourceType?: ScheduleItem['sourceType']) =>
  sourceType === 'meeting'
    ? 'bg-cyan-500/10 text-cyan-700 border-cyan-200'
    : 'bg-slate-500/10 text-slate-700 border-slate-200';

const compactCalendarClasses = {
  months: 'flex flex-col',
  month: 'space-y-3',
  caption: 'flex justify-center pt-1 relative items-center',
  caption_label: 'text-sm font-semibold',
  nav: 'space-x-1 flex items-center',
  nav_button:
    'h-7 w-7 rounded-md border border-border/60 bg-background/70 p-0 opacity-70 hover:opacity-100',
  nav_button_previous: 'absolute left-1',
  nav_button_next: 'absolute right-1',
  table: 'w-full border-collapse space-y-0.5',
  head_row: 'flex',
  head_cell: 'text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]',
  row: 'flex w-full mt-1',
  cell: 'h-8 w-8 text-center text-xs p-0 relative',
  day: 'h-8 w-8 p-0 font-normal text-xs aria-selected:opacity-100',
  day_selected:
    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md',
  day_today: 'bg-accent text-accent-foreground rounded-md',
  day_outside:
    'text-muted-foreground/40 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
  day_disabled: 'text-muted-foreground opacity-50',
  day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
  day_range_end: 'day-range-end',
  day_hidden: 'invisible',
};

export default function CalendarScheduler() {
  const { toast } = useToast();
  const uid = sessionStorage.getItem('uid') || '';
  const role = sessionStorage.getItem('role') || 'user';
  const orgId = sessionStorage.getItem('orgId') || '';
  const plan = sessionStorage.getItem('type') || 'free';
  const isPremium = ['monthly', 'yearly', 'forever'].includes(plan)
    || sessionStorage.getItem('isOrganization') === 'true'
    || !!orgId;
  const hasOrg = !!orgId || sessionStorage.getItem('isOrganization') === 'true';

  const [activeTab, setActiveTab] = useState<ActiveTab>(hasOrg ? 'organization' : 'personal');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<ScheduleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ScheduleCategory>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Google Calendar state
  const [googleStatus, setGoogleStatus] = useState<GoogleCalStatus | null>(null);
  const [googleSyncing, setGoogleSyncing] = useState(false);

  const [form, setForm] = useState<FormState>({
    date: dateInput(new Date()),
    day: dayName(new Date()),
    name: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    location: '',
    type: 'Lecture',
    visibility: defaultVisibility(),
    color: '#2563eb',
    status: 'planned',
  });

  useEffect(() => {
    fetchSchedules();
    fetchGoogleStatus();
  }, [uid]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, date: dateInput(selectedDate), day: dayName(selectedDate) }));
  }, [selectedDate]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverURL}/api/schedule`, {
        params: { ownerId: uid || undefined },
      });
      setEvents(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error('schedule fetch error', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoogleStatus = async () => {
    if (!uid) return;
    try {
      const res = await axios.get(`${serverURL}/api/google-calendar/status`, { params: { userId: uid } });
      if (res.data.success) setGoogleStatus(res.data.data);
    } catch (_) {
      // ignore — Google Calendar status is non-critical
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/google-calendar/auth-url`, { params: { userId: uid } });
      if (res.data.success && res.data.url) {
        window.open(res.data.url, '_blank', 'width=600,height=700');
        toast({ title: 'Google Calendar', description: 'Complete the sign-in in the popup window, then click "Sync Now".' });
      } else {
        toast({ title: res.data.message || 'Could not get auth URL', variant: 'destructive' });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to connect Google Calendar';
      toast({ title: msg, variant: 'destructive' });
    }
  };

  const handleGoogleSync = async () => {
    setGoogleSyncing(true);
    try {
      const res = await axios.post(`${serverURL}/api/google-calendar/sync`, { userId: uid });
      if (res.data.success) {
        toast({ title: 'Sync Complete', description: res.data.message });
        await fetchSchedules();
        await fetchGoogleStatus();
      } else {
        toast({ title: res.data.message, variant: 'destructive' });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Sync failed';
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setGoogleSyncing(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      await axios.delete(`${serverURL}/api/google-calendar/disconnect`, { params: { userId: uid } });
      toast({ title: 'Disconnected', description: 'Google Calendar has been disconnected.' });
      await fetchGoogleStatus();
    } catch (_) {
      toast({ title: 'Disconnect failed', variant: 'destructive' });
    }
  };

  const resetForm = (keepOpen = false) => {
    setEditingId(null);
    setForm({
      date: dateInput(selectedDate),
      day: dayName(selectedDate),
      name: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      room: '',
      location: '',
      type: activeTab === 'organization' ? 'Meeting' : 'Lecture',
      visibility: activeTab === 'organization' ? 'organization' : 'personal',
      color: '#2563eb',
      status: 'planned',
    });
    setIsFormOpen(keepOpen);
  };

  const openNewEvent = () => {
    setEditingId(null);
    setForm({
      date: dateInput(selectedDate),
      day: dayName(selectedDate),
      name: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      room: '',
      location: '',
      type: activeTab === 'organization' ? 'Meeting' : 'Lecture',
      visibility: activeTab === 'organization' ? 'organization' : 'personal',
      color: '#2563eb',
      status: 'planned',
    });
    setIsFormOpen(true);
  };

  const onFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value } as FormState));
    if (name === 'date') {
      const next = new Date(value);
      if (!Number.isNaN(next.getTime())) setSelectedDate(next);
    }
  };

  const submitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.room.trim()) {
      toast({ title: 'Missing fields', description: 'Title and room/location are required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        room: form.room.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        date: form.date,
        day: dayName(new Date(form.date)),
        organizationId: orgId || undefined,
        ownerId: uid || undefined,
        ownerRole: role,
      };

      if (editingId) {
        await axios.put(`${serverURL}/api/schedule/update/${editingId}`, payload);
        toast({ title: 'Schedule updated', description: 'The calendar entry was updated.' });
      } else {
        await axios.post(`${serverURL}/api/schedule/add`, payload);
        toast({ title: 'Schedule created', description: 'The event is now on the calendar.' });
      }

      await fetchSchedules();
      setIsFormOpen(false);
      resetForm(false);
    } catch (error) {
      console.error('schedule save error', error);
      toast({ title: 'Save failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const editSchedule = (item: ScheduleItem) => {
    if (item.readOnly) {
      toast({ title: 'Meeting event', description: 'Scheduled meetings can be managed from the meetings module.' });
      return;
    }
    setEditingId(item._id || null);
    const nextDate = item.date ? new Date(item.date) : selectedDate;
    if (!Number.isNaN(nextDate.getTime())) setSelectedDate(nextDate);
    setForm({
      date: item.date ? dateInput(new Date(item.date)) : dateInput(nextDate),
      day: item.day || dayName(nextDate),
      name: item.name || '',
      description: item.description || '',
      startTime: item.startTime || '09:00',
      endTime: item.endTime || '10:00',
      room: item.room || '',
      location: item.location || '',
      type: item.type || 'Lecture',
      visibility: item.visibility || defaultVisibility(),
      color: item.color || '#2563eb',
      status: item.status || 'planned',
    });
    setIsFormOpen(true);
  };

  const deleteSchedule = async (id?: string) => {
    if (!id) return;
    try {
      await axios.delete(`${serverURL}/api/schedule/delete/${id}`);
      toast({ title: 'Schedule removed', description: 'The event was deleted.' });
      if (editingId === id) resetForm();
      await fetchSchedules();
    } catch (error) {
      console.error('schedule delete error', error);
      toast({ title: 'Delete failed', description: 'Unable to remove the event.', variant: 'destructive' });
    }
  };

  // Tab-aware event filter
  const tabFilteredEvents = events.filter((item) => {
    if (activeTab === 'personal') return item.visibility === 'personal';
    return item.visibility === 'organization' || item.visibility === 'public' || item.sourceType === 'meeting';
  });

  const filteredEvents = tabFilteredEvents.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.room?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getEventCountForDate = (date: Date) => filteredEvents.filter((item) => sameDay(item, date)).length;

  const CalendarDayContent = ({ date }: DayContentProps) => {
    const count = getEventCountForDate(date);
    const displayCount = count > 9 ? '9+' : String(count);
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        <span>{format(date, 'd')}</span>
        {count > 0 && (
          <span
            className="absolute bottom-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-none text-primary-foreground shadow-sm"
            title={`${count} schedule${count === 1 ? '' : 's'}`}
          >
            {displayCount}
          </span>
        )}
      </div>
    );
  };

  const selectedEvents = filteredEvents
    .filter((item) => sameDay(item, selectedDate))
    .sort((a, b) => `${a.startTime}`.localeCompare(`${b.startTime}`));

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const counts = {
    today: filteredEvents.filter((item) => sameDay(item, new Date())).length,
    week: filteredEvents.filter((item) => {
      const resolved = resolveDate(item, selectedDate);
      if (!resolved) return false;
      const end = addDays(weekStart, 6);
      return resolved >= weekStart && resolved <= end;
    }).length,
    org: events.filter((item) => item.visibility !== 'personal').length,
    personal: events.filter((item) => item.visibility === 'personal').length,
  };

  const heroStats = [
    { label: 'Today', value: `${counts.today} items` },
    { label: 'Week load', value: `${counts.week} items` },
  ];

  return (
    <div className="relative space-y-6 sm:space-y-8 animate-fade-in px-2 sm:px-2 lg:px-4 max-w-[1400px] mx-auto relative pt-0 lg:pt-[55px]">

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      <SEO title="Calendar Scheduler" description="Plan calendar events and daily schedules across all panels." />

      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-slate-950 px-6 py-7 text-white shadow-[0_32px_90px_-55px_rgba(15,23,42,0.9)] md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.16),transparent_30%)]" />
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Shared calendar workflow
            </div>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Calendar scheduler built for daily planning and team rhythm.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Plan classes, meetings, deadlines, and personal blocks from one interactive dashboard.
                Every event stays scoped to the logged-in account and the calendar stays compact, fast, and readable.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={openNewEvent} className="bg-white text-slate-950 hover:bg-slate-100">
                <Plus className="mr-2 h-4 w-4" />
                Create Schedule
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedDate(new Date())}
                className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                Today
              </Button>
              <Button
                className="inline-flex items-center whitespace-nowrap rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-10 px-4 py-2 w-full sm:w-auto justify-center gap-2 text-sm font-medium bg-gradient-to-r from-[#11405f] to-[#11a5e4] text-white hover:opacity-90 transition-all"
                onClick={() => setSelectedDate(startOfWeek(selectedDate, { weekStartsOn: 1 }))}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                This Week
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Selected Day</p>
              <p className="mt-2 text-lg font-semibold">{format(selectedDate, 'EEEE')}</p>
              <p className="text-sm text-slate-300">{format(selectedDate, 'MMMM d, yyyy')}</p>
            </div>
            {heroStats.map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-300">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

  {/* ── STAT CARDS ── */}
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
  {[
    { label: 'Today', value: counts.today, icon: CalendarDays, tone: 'text-primary' },
    { label: 'This Week', value: counts.week, icon: Clock, tone: 'text-amber-500' },
    { label: 'Organization', value: counts.org, icon: Layers3, tone: 'text-indigo-600' },
    { label: 'Personal', value: counts.personal, icon: CheckCircle2, tone: 'text-emerald-600' },
  ].map((item) => (
    <Card key={item.label} className="overflow-hidden border-slate-200/80 bg-white/90 shadow-[0_18px_60px_-45px_rgba(15,23,42,0.45)]">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{item.label}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-2xl font-semibold text-slate-950">{item.value}</span>
          <span className="rounded-2xl bg-slate-950/5 p-2">
            <item.icon className={`h-5 w-5 ${item.tone}`} />
          </span>
        </div>
      </CardContent>
    </Card>
  ))}
</div>

      {/* ── TAB SWITCHER ── */}
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'personal'
              ? 'bg-gradient-to-r from-slate-950 to-primary text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="h-4 w-4" />
          Personal
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === 'personal' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {counts.personal}
          </span>
        </button>
        {hasOrg && (
          <button
            onClick={() => setActiveTab('organization')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              activeTab === 'organization'
                ? 'bg-gradient-to-r from-slate-950 to-cyan-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Organization
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === 'organization' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {counts.org}
            </span>
          </button>
        )}
      </div>

      {/* ── CALENDAR + QUICK ACTIONS ── */}
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="overflow-hidden border-slate-200/80 bg-white/90 shadow-[0_28px_90px_-55px_rgba(15,23,42,0.38)]">
          <CardHeader className="space-y-1 border-b border-slate-200/70 bg-slate-50/80">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarDays className="h-5 w-5 text-primary" />
              Calendar View
              <Badge variant="outline" className={`ml-auto text-[10px] font-semibold ${activeTab === 'personal' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-indigo-200 bg-indigo-50 text-indigo-700'}`}>
                {activeTab === 'personal' ? 'Personal' : 'Organization'}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Pick a date to view or edit the day&apos;s plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="mx-auto max-w-[340px] rounded-[28px] border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white p-4 shadow-[0_24px_70px_-50px_rgba(15,23,42,0.35)]">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="mx-auto"
                classNames={compactCalendarClasses}
                modifiers={{ hasEvents: (date) => getEventCountForDate(date) > 0 }}
                modifiersClassNames={{
                  hasEvents: 'rounded-md bg-primary/5 text-foreground',
                }}
                components={{ DayContent: CalendarDayContent }}
              />
            </div>

            <div className="space-y-3 rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{format(selectedDate, 'EEEE, MMM d')}</p>
                  <p className="text-xs text-muted-foreground">{selectedEvents.length} events on the selected day</p>
                </div>
                <Badge variant="outline">Live agenda</Badge>
              </div>

              {selectedEvents.length > 0 ? selectedEvents.map((item) => (
                <div key={item._id} className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">{item.name}</p>
                        <Badge className={`border ${categoryTone(item.type)}`}>{item.type}</Badge>
                        <Badge className={`border ${visibilityTone(item.visibility)}`}>
                          {item.visibility || defaultVisibility()}
                        </Badge>
                        {item.sourceType === 'meeting' && (
                          <Badge className={`border ${sourceTone(item.sourceType)}`}>Meeting Sync</Badge>
                        )}
                        {item.color === '#4285F4' && (
                          <Badge className="border bg-blue-50 text-blue-700 border-blue-200 text-[10px]">Google</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.startTime} - {item.endTime}
                        {item.room ? ` - ${item.room}` : ''}
                        {item.location ? ` - ${item.location}` : ''}
                      </p>
                    </div>
                    {!item.readOnly && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => editSchedule(item)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteSchedule(item._id)}>
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {item.description && <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>}
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white p-5 text-center text-sm text-muted-foreground">
                  No events scheduled for this date.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="overflow-hidden border-slate-200/80 bg-white/90 shadow-[0_28px_90px_-55px_rgba(15,23,42,0.38)]">
          <CardHeader className="space-y-1 border-b border-slate-200/70 bg-slate-50/80">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Open the popup editor or jump into a filtered view.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <Button
              className="h-12 w-full justify-start rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-primary text-white shadow-lg shadow-primary/20 hover:from-primary hover:to-slate-950"
              onClick={openNewEvent}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Event Popup
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Current View</p>
                <p className="mt-2 text-sm font-semibold text-slate-950 capitalize">{activeTab}</p>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Selected Day</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{format(selectedDate, 'EEE, MMM d')}</p>
              </div>
            </div>

            {/* Google Calendar Sync Section */}
            <div className="rounded-3xl border border-slate-200/80 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-200/70 bg-slate-50/80 px-4 py-3">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Google Calendar Sync</p>
                {isPremium && googleStatus?.connected && (
                  <Badge className="ml-auto border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]">Connected</Badge>
                )}
                {isPremium && !googleStatus?.connected && googleStatus !== null && (
                  <Badge className="ml-auto border-slate-200 bg-slate-50 text-slate-500 text-[10px]">Not Connected</Badge>
                )}
              </div>

              {!isPremium ? (
                /* FREE USER — upgrade prompt */
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <Lock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Premium Feature</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Sync your Google Calendar events directly into this scheduler. Available on monthly, yearly &amp; forever plans.</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-orange-500 hover:to-amber-500"
                    onClick={() => window.location.href = '/dashboard/pricing'}
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              ) : googleStatus?.connected ? (
                /* CONNECTED */
                <div className="p-4 space-y-3">
                  {googleStatus.lastSyncAt && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {new Date(googleStatus.lastSyncAt).toLocaleString()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 rounded-xl bg-[#4285F4] text-white hover:bg-[#3574e0]"
                      onClick={handleGoogleSync}
                      disabled={googleSyncing}
                    >
                      <RefreshCw className={`mr-2 h-3.5 w-3.5 ${googleSyncing ? 'animate-spin' : ''}`} />
                      {googleSyncing ? 'Syncing...' : 'Sync Now'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={handleGoogleDisconnect}
                    >
                      <Link2Off className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Imports upcoming 30-day events from your primary Google Calendar.</p>
                </div>
              ) : !googleStatus?.configured ? (
                /* SERVER NOT CONFIGURED */
                <div className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground">Google Calendar API is not yet configured on this server. Add <code className="bg-slate-100 px-1 rounded text-[10px]">GOOGLE_CLIENT_ID</code> and <code className="bg-slate-100 px-1 rounded text-[10px]">GOOGLE_CLIENT_SECRET</code> to your server <code className="bg-slate-100 px-1 rounded text-[10px]">.env</code> file to enable this feature.</p>
                  <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" />
                    Google Cloud Console
                  </a>
                </div>
              ) : (
                /* NOT CONNECTED — connect button */
                <div className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground">Connect your Google account to import your Google Calendar events automatically.</p>
                  <Button
                    size="sm"
                    className="w-full rounded-xl bg-[#4285F4] text-white hover:bg-[#3574e0]"
                    onClick={handleGoogleConnect}
                  >
                    <Link2 className="mr-2 h-3.5 w-3.5" />
                    Connect Google Calendar
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-950">Upcoming events</p>
              {filteredEvents
                .filter((item) => {
                  const resolved = resolveDate(item, selectedDate);
                  return resolved ? resolved >= new Date(new Date().setHours(0, 0, 0, 0)) : false;
                })
                .slice(0, 3)
                .map((item) => (
                  <button
                    key={item._id}
                    onClick={() => {
                      setSelectedDate(resolveDate(item, selectedDate) || selectedDate);
                      if (!item.readOnly) editSchedule(item);
                    }}
                    className="w-full rounded-3xl border border-slate-200/80 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{item.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.startTime} - {item.endTime}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.sourceType === 'meeting' && (
                          <Badge className={`border ${sourceTone(item.sourceType)}`}>Sync</Badge>
                        )}
                        <Badge className={`border ${categoryTone(item.type)}`}>{item.type}</Badge>
                      </div>
                    </div>
                  </button>
                ))}
              {filteredEvents.filter((item) => {
                const resolved = resolveDate(item, selectedDate);
                return resolved ? resolved >= new Date(new Date().setHours(0, 0, 0, 0)) : false;
              }).length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/80 p-4 text-sm text-muted-foreground">
                  No upcoming events yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) resetForm(false);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Schedule' : 'Create Schedule'}</DialogTitle>
            <DialogDescription>
              Add a calendar event, lesson block, meeting, or task with a single popup form.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitSchedule} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event title</label>
              <Input name="name" value={form.name} onChange={onFieldChange} placeholder="Class, meeting, task, deadline..." />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" name="date" value={form.date} onChange={onFieldChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Day</label>
                <Input value={form.day} readOnly className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start time</label>
                <Input type="time" name="startTime" value={form.startTime} onChange={onFieldChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End time</label>
                <Input type="time" name="endTime" value={form.endTime} onChange={onFieldChange} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Room / location</label>
              <Input name="room" value={form.room} onChange={onFieldChange} placeholder="Room A1, Zoom, Lab 2..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                name="description"
                value={form.description}
                onChange={onFieldChange}
                className="min-h-24"
                placeholder="Agenda, reminder, join link, or instructions."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={onFieldChange}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <select
                  name="visibility"
                  value={form.visibility}
                  onChange={onFieldChange}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {VISIBILITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Accent</label>
                <Input type="color" name="color" value={form.color} onChange={onFieldChange} className="h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Progress status</label>
              <select
                name="status"
                value={form.status}
                onChange={onFieldChange}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground">
              {form.visibility === 'personal'
                ? '🔒 This event will only be visible to you (Personal).'
                : form.visibility === 'organization'
                  ? '🏢 This event will be shared with your organization.'
                  : '🌐 This event is publicly visible.'}
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); resetForm(false); }}>
                Cancel
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-rose-600 hover:text-rose-700"
                  onClick={() => deleteSchedule(editingId)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button type="submit" className="bg-gradient-to-r from-primary to-indigo-500 text-white hover:from-indigo-500 hover:to-primary" disabled={saving}>
                <Plus className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : editingId ? 'Update Event' : 'Save Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── WEEK OVERVIEW ── */}
      <Card className="overflow-hidden border-slate-200/80 bg-white/90 shadow-[0_28px_90px_-55px_rgba(15,23,42,0.38)]">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-200/70 bg-slate-50/80 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers3 className="h-5 w-5 text-primary" />
              Week Overview
              <Badge variant="outline" className={`ml-2 text-[10px] ${activeTab === 'personal' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-indigo-200 bg-indigo-50 text-indigo-700'}`}>
                {activeTab === 'personal' ? 'Personal' : 'Organization'}
              </Badge>
            </CardTitle>
            <CardDescription>Interactive seven-day snapshot anchored to the selected date.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search schedules..." className="w-full md:w-64" />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as 'all' | ScheduleCategory)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All categories</option>
              {CATEGORY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }}>
              <Search className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/80 p-6 text-center text-sm text-muted-foreground">Loading schedules...</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
              {weekDays.map((day) => {
                const dayItems = filteredEvents.filter((item) => sameDay(item, day));
                return (
                  <div key={format(day, 'yyyy-MM-dd')} className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{format(day, 'EEE')}</p>
                        <p className="text-xs text-muted-foreground">{format(day, 'MMM d')}</p>
                      </div>
                      <Badge variant="secondary">{dayItems.length}</Badge>
                    </div>
                    <div className="mt-3 space-y-2">
                      {dayItems.length > 0 ? dayItems.slice(0, 3).map((item) => (
                        <button
                          key={item._id}
                          onClick={() => {
                            setSelectedDate(day);
                            if (!item.readOnly) editSchedule(item);
                          }}
                          className="w-full rounded-2xl border border-slate-200/80 bg-white p-2 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color || '#2563eb' }} />
                            <p className="truncate text-xs font-medium text-slate-950">{item.name}</p>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">{item.startTime} - {item.endTime}</p>
                        </button>
                      )) : (
                        <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white p-3 text-xs text-muted-foreground">No events</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
