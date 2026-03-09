import React, { useState } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react';
import SEO from '@/components/SEO';

export default function StudentAttendance() {
  const [stats, setStats] = useState({
    present: 42,
    absent: 3,
    late: 2,
    total: 47,
    percentage: 94
  });

  const [recentAttendance, setRecentAttendance] = useState([
    { id: 1, date: 'Mar 05, 2026', class: 'CS 101', status: 'Present', time: '09:00 AM' },
    { id: 2, date: 'Mar 04, 2026', class: 'Data Structures', status: 'Present', time: '11:00 AM' },
    { id: 3, date: 'Mar 03, 2026', class: 'Web Dev', status: 'Late', time: '02:15 PM' },
    { id: 4, date: 'Mar 02, 2026', class: 'CS 101', status: 'Absent', time: '-' },
    { id: 5, date: 'Feb 28, 2026', class: 'Data Structures', status: 'Present', time: '11:00 AM' },
  ]);

  const [todaysClass, setTodaysClass] = useState({
    id: 101,
    name: 'Advanced AI Systems',
    time: '02:00 PM - 03:30 PM',
    room: 'Lab 304',
    status: 'Pending' // Pending, Present, Late
  });

  const handleAttendance = (status: 'Present' | 'Late') => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    // Update Today's Class Status
    setTodaysClass(prev => ({ ...prev, status }));

    // Add to History
    const newRecord = {
      id: Date.now(),
      date: dateString,
      class: todaysClass.name,
      status: status,
      time: timeString
    };
    setRecentAttendance(prev => [newRecord, ...prev]);

    // Update Stats
    setStats(prev => {
      const newStats = { ...prev };
      if (status === 'Present') newStats.present++;
      if (status === 'Late') newStats.late++;
      newStats.total++;
      newStats.percentage = Math.round(((newStats.present + (newStats.late * 0.5)) / newStats.total) * 100);
      return newStats;
    });
  };

  return (
    <div className="container mx-auto py-8 animate-fade-in space-y-8">
      <SEO title="My Attendance" description="Track your attendance record across all classes." />
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">My Attendance</h1>
        <p className="text-muted-foreground mt-1">Track your attendance record across all classes.</p>
      </div>

      {/* Active Class Check-in */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Today's Schedule</h2>
            <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>

          {todaysClass.status === 'Pending' ? (
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wide animate-pulse">Happening Now</span>
                  <span className="text-muted-foreground text-sm flex items-center gap-1 font-medium"><Clock size={14} /> {todaysClass.time}</span>
                </div>
                <h3 className="text-xl font-bold mb-1">{todaysClass.name}</h3>
                <p className="text-muted-foreground flex items-center gap-1"><MapPin size={16} /> {todaysClass.room}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAttendance('Present')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                >
                  <CheckCircle2 size={18} />
                  Mark Present
                </button>
                <button
                  onClick={() => handleAttendance('Late')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                >
                  <Clock size={18} />
                  Mark Late
                </button>
              </div>
            </div>
          ) : (
            <div className={`border rounded-xl p-6 flex items-center gap-4 ${todaysClass.status === 'Present' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'
              }`}>
              <div className={`p-3 rounded-full ${todaysClass.status === 'Present' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'
                }`}>
                {todaysClass.status === 'Present' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
              </div>
              <div>
                <h3 className={`text-lg font-bold ${todaysClass.status === 'Present' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                  Marked as {todaysClass.status}
                </h3>
                <p className={`${todaysClass.status === 'Present' ? 'text-emerald-600/80' : 'text-amber-600/80'
                  }`}>
                  You have successfully checked in for {todaysClass.name}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">On Track</span>
          </div>
          <h3 className="text-2xl font-bold">{stats.percentage}%</h3>
          <p className="text-sm text-muted-foreground">Overall Attendance</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
              <Calendar size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold">{stats.present}</h3>
          <p className="text-sm text-muted-foreground">Days Present</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <Clock size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold">{stats.late}</h3>
          <p className="text-sm text-muted-foreground">Days Late</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-500/10 text-red-600 rounded-lg">
              <XCircle size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold">{stats.absent}</h3>
          <p className="text-sm text-muted-foreground">Days Absent</p>
        </div>
      </div>

      {/* Recent Attendance List */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent History</h2>
          <button className="text-sm text-primary hover:underline font-medium">View Full Report</button>
        </div>
        <div className="divide-y divide-border">
          {recentAttendance.map((record) => (
            <div key={record.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600' :
                  record.status === 'Late' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                  {record.status === 'Present' ? <CheckCircle2 size={16} /> :
                    record.status === 'Late' ? <Clock size={16} /> :
                      <XCircle size={16} />}
                </div>
                <div>
                  <h4 className="font-medium">{record.class}</h4>
                  <p className="text-xs text-muted-foreground">{record.date}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-1 ${record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-700' :
                  record.status === 'Late' ? 'bg-amber-500/10 text-amber-700' :
                    'bg-red-500/10 text-red-700'
                  }`}>
                  {record.status}
                </span>
                <p className="text-xs text-muted-foreground/60">{record.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
