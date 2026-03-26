import React, { useEffect, useState } from 'react';
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
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Edit3,
} from 'lucide-react';

type ScheduleVisibility = 'organization' | 'personal' | 'public';
type ScheduleCategory = 'Lecture' | 'Lab' | 'Meeting' | 'Workshop' | 'Deadline' | 'Study';

interface ScheduleItem {
  _id?: string;
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<ScheduleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ScheduleCategory>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | ScheduleVisibility>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
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
  }, [orgId, uid]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, date: dateInput(selectedDate), day: dayName(selectedDate) }));
  }, [selectedDate]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverURL}/api/schedule`, {
        params: { organizationId: orgId || undefined, ownerId: uid || undefined },
      });
      setEvents(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error('schedule fetch error', error);
      setEvents([]);
    } finally {
      setLoading(false);
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
      type: 'Lecture',
      visibility: defaultVisibility(),
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
      type: 'Lecture',
      visibility: defaultVisibility(),
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

  const filteredEvents = events.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.room?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.type === categoryFilter;
    const matchesVisibility = visibilityFilter === 'all' || item.visibility === visibilityFilter;
    return matchesSearch && matchesCategory && matchesVisibility;
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
    org: filteredEvents.filter((item) => item.visibility !== 'personal').length,
    personal: filteredEvents.filter((item) => item.visibility === 'personal').length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
      <SEO title="Calendar Scheduler" description="Plan calendar events and daily schedules across all panels." />

      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-indigo-500/10 to-cyan-500/10 p-6 shadow-sm">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Shared calendar workflow
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendar Scheduler</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Build daily schedules, recurring blocks, meetings, deadlines, and organization-wide events
              from one interactive planner.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setSelectedDate(new Date())}>Today</Button>
            <Button variant="secondary" onClick={openNewEvent}>New Event</Button>
            <Button
              className="bg-gradient-to-r from-primary to-indigo-500 text-white hover:from-indigo-500 hover:to-primary"
              onClick={() => setSelectedDate(startOfWeek(selectedDate, { weekStartsOn: 1 }))}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              This Week
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Today', value: counts.today, icon: CalendarDays, tone: 'text-primary' },
          { label: 'This Week', value: counts.week, icon: Clock, tone: 'text-amber-500' },
          { label: 'Organization', value: counts.org, icon: Layers3, tone: 'text-indigo-600' },
          { label: 'Personal', value: counts.personal, icon: CheckCircle2, tone: 'text-emerald-600' },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.label}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-2xl font-bold">{item.value}</span>
                <item.icon className={`h-5 w-5 ${item.tone}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>Pick a date to view or edit the day&apos;s plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mx-auto max-w-[340px] rounded-2xl border border-border/60 bg-background/80 p-3 shadow-sm">
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

            <div className="space-y-3 rounded-2xl border border-border/60 bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{format(selectedDate, 'EEEE, MMM d')}</p>
                  <p className="text-xs text-muted-foreground">{selectedEvents.length} events on the selected day</p>
                </div>
                <Badge variant="outline">Live agenda</Badge>
              </div>

              {selectedEvents.length > 0 ? selectedEvents.map((item) => (
                <div key={item._id} className="rounded-xl border border-border/60 bg-background/80 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{item.name}</p>
                        <Badge className={`border ${categoryTone(item.type)}`}>{item.type}</Badge>
                        <Badge className={`border ${visibilityTone(item.visibility)}`}>
                          {item.visibility || defaultVisibility()}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.startTime} - {item.endTime}
                        {item.room ? ` - ${item.room}` : ''}
                        {item.location ? ` - ${item.location}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => editSchedule(item)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteSchedule(item._id)}>
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  </div>
                  {item.description && <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>}
                </div>
              )) : (
                <div className="rounded-xl border border-dashed border-border/70 p-5 text-center text-sm text-muted-foreground">
                  No events scheduled for this date.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Open the popup editor or jump into a filtered view.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full justify-start bg-gradient-to-r from-primary to-indigo-500 text-white hover:from-indigo-500 hover:to-primary"
              onClick={openNewEvent}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Event Popup
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/60 bg-card/60 p-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Default Mode</p>
                <p className="mt-2 text-sm font-semibold">{defaultVisibility() === 'personal' ? 'Personal' : 'Organization'}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/60 p-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Selected Day</p>
                <p className="mt-2 text-sm font-semibold">{format(selectedDate, 'EEE, MMM d')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Upcoming events</p>
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
                      editSchedule(item);
                    }}
                    className="w-full rounded-2xl border border-border/60 bg-background/80 p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.startTime} - {item.endTime}
                        </p>
                      </div>
                      <Badge className={`border ${categoryTone(item.type)}`}>{item.type}</Badge>
                    </div>
                  </button>
                ))}
              {filteredEvents.filter((item) => {
                const resolved = resolveDate(item, selectedDate);
                return resolved ? resolved >= new Date(new Date().setHours(0, 0, 0, 0)) : false;
              }).length === 0 && (
                <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                  No upcoming events yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            resetForm(false);
          }
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
              {role === 'student' || role === 'user'
                ? 'Default visibility is personal for private planning.'
                : 'Default visibility is organization for shared scheduling.'}
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

      <Card className="border-border/60">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers3 className="h-5 w-5 text-primary" />
              Week Overview
            </CardTitle>
            <CardDescription>Interactive seven-day snapshot anchored to the selected date.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search schedules..." className="w-full md:w-64" />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as 'all' | ScheduleCategory)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All categories</option>
              {CATEGORY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value as 'all' | ScheduleVisibility)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All visibility</option>
              {VISIBILITY_OPTIONS.map((option) => <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>)}
            </select>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setVisibilityFilter('all'); }}>
              <Search className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="rounded-2xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">Loading schedules...</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
              {weekDays.map((day) => {
                const dayItems = filteredEvents.filter((item) => sameDay(item, day));
                return (
                  <div key={format(day, 'yyyy-MM-dd')} className="rounded-2xl border border-border/60 bg-background/80 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{format(day, 'EEE')}</p>
                        <p className="text-xs text-muted-foreground">{format(day, 'MMM d')}</p>
                      </div>
                      <Badge variant="secondary">{dayItems.length}</Badge>
                    </div>
                    <div className="mt-3 space-y-2">
                      {dayItems.length > 0 ? dayItems.slice(0, 3).map((item) => (
                        <button
                          key={item._id}
                          onClick={() => { setSelectedDate(day); editSchedule(item); }}
                          className="w-full rounded-xl border border-border/60 bg-card/80 p-2 text-left transition hover:-translate-y-0.5 hover:border-primary/30"
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color || '#2563eb' }} />
                            <p className="truncate text-xs font-medium">{item.name}</p>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">{item.startTime} - {item.endTime}</p>
                        </button>
                      )) : (
                        <div className="rounded-xl border border-dashed border-border/70 p-3 text-xs text-muted-foreground">No events</div>
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
