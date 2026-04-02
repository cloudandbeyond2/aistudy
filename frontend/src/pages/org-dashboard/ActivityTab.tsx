import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Users, Clock, Activity, TrendingUp, Shield, Calendar, MapPin, ChevronRight, Search, Filter, Download, UserCheck, Eye, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface StaffLoginLog {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    ipAddress: string;
}

// Color mapping for stats
const colorMap = {
    blue: { 
        bg: "bg-blue-100 dark:bg-blue-900/30", 
        text: "text-blue-600 dark:text-blue-400",
        gradient: "from-blue-500 to-blue-600"
    },
    emerald: { 
        bg: "bg-emerald-100 dark:bg-emerald-900/30", 
        text: "text-emerald-600 dark:text-emerald-400",
        gradient: "from-emerald-500 to-teal-600"
    },
    purple: { 
        bg: "bg-purple-100 dark:bg-purple-900/30", 
        text: "text-purple-600 dark:text-purple-400",
        gradient: "from-purple-500 to-pink-600"
    },
    amber: { 
        bg: "bg-amber-100 dark:bg-amber-900/30", 
        text: "text-amber-600 dark:text-amber-400",
        gradient: "from-amber-500 to-orange-600"
    }
};

const ActivityTab: React.FC = () => {
    const { toast } = useToast();
    const [staffLoginLogs, setStaffLoginLogs] = useState<StaffLoginLog[]>([]);
    const [staffLoginLoading, setStaffLoginLoading] = useState(false);
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    const role = sessionStorage.getItem('role');
    const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');
    const requesterId = sessionStorage.getItem('uid');

    const fetchStaffLoginActivity = async () => {
        if (role !== 'org_admin' || !orgId || !requesterId) return;
        setStaffLoginLoading(true);
        try {
            const res = await axios.get(`${serverURL}/api/org/staff/activity`, {
                params: { organizationId: orgId, requesterId: requesterId, limit: 200 }
            });
            if (res.data?.success) {
                setStaffLoginLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
                // Reset to first page when new data loads
                setCurrentPage(1);
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to load staff activity", variant: "destructive" });
        } finally {
            setStaffLoginLoading(false);
        }
    };

    const filterByDateRange = (logs: StaffLoginLog[]) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch(dateRange) {
            case 'today':
                return logs.filter(log => {
                    const logDate = new Date(log.createdAt);
                    return logDate >= today;
                });
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return logs.filter(log => new Date(log.createdAt) >= weekAgo);
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return logs.filter(log => new Date(log.createdAt) >= monthAgo);
            default:
                return logs;
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(dateString);
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NA';
    };

    useEffect(() => {
        if (role === 'org_admin') fetchStaffLoginActivity();
    }, [orgId, role]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [dateRange, searchTerm, selectedRole]);

    if (role !== 'org_admin') return null;

    let filteredLogs = filterByDateRange(staffLoginLogs);
    
    // Apply search filter
    if (searchTerm) {
        filteredLogs = filteredLogs.filter(log => 
            log.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // Apply role filter
    if (selectedRole !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.role === selectedRole);
    }

    // Pagination calculations
    const totalItems = filteredLogs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLogs = filteredLogs.slice(startIndex, endIndex);

    // Pagination controls
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            // Scroll to top of table
            document.getElementById('activity-table-top')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            document.getElementById('activity-table-top')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const goToPage = (page: number) => {
        setCurrentPage(page);
        document.getElementById('activity-table-top')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            const start = Math.max(1, currentPage - 2);
            const end = Math.min(totalPages, start + maxPagesToShow - 1);
            
            if (start > 1) {
                pageNumbers.push(1);
                if (start > 2) pageNumbers.push('...');
            }
            
            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }
            
            if (end < totalPages) {
                if (end < totalPages - 1) pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }
        
        return pageNumbers;
    };

    const totalLogins = filteredLogs.length;
    const uniqueStaff = new Set(filteredLogs.map(log => log.email)).size;
    const uniqueRoles = [...new Set(staffLoginLogs.map(log => log.role).filter(Boolean))];
    
    // Get today's logins
    const todayLogins = filteredLogs.filter(log => {
        const logDate = new Date(log.createdAt).toDateString();
        return logDate === new Date().toDateString();
    }).length;

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { 
                type: "spring" as const,
                stiffness: 100, 
                damping: 12 
            }
        }
    };

    const tableRowVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 15
            }
        },
        hover: {
            scale: 1.01,
            backgroundColor: "rgba(59, 130, 246, 0.05)",
            transition: { 
                type: "spring" as const,
                stiffness: 300 
            }
        }
    };

    const statsCardVariants = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 200,
                damping: 15
            }
        },
        hover: {
            y: -5,
            transition: { 
                type: "spring" as const,
                stiffness: 300 
            }
        }
    };

    const statsData = [
        { 
            label: "Total Logins", 
            value: totalLogins, 
            icon: Activity, 
            color: "blue",
            trend: "+12%",
            period: "vs last week"
        },
        { 
            label: "Active Staff", 
            value: uniqueStaff, 
            icon: Users, 
            color: "emerald",
            trend: "+2",
            period: "new this week"
        },
        { 
            label: "Today's Logins", 
            value: todayLogins, 
            icon: Clock, 
            color: "purple",
            trend: `${todayLogins > 0 ? '+' : ''}${todayLogins}`,
            period: "today"
        },
        { 
            label: "Active Roles", 
            value: uniqueRoles.length, 
            icon: TrendingUp, 
            color: "amber",
            trend: "active",
            period: "different roles"
        }
    ];

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                            Staff Activity Monitor
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Track and monitor staff login activity across your organization
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {statsData.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        custom={idx}
                        variants={statsCardVariants}
                        whileHover="hover"
                        initial="hidden"
                        animate="visible"
                    >
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 overflow-hidden group">
                            <CardContent className="p-6 relative">
                                <motion.div 
                                    className={`absolute inset-0 bg-gradient-to-r ${colorMap[stat.color as keyof typeof colorMap].gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                                />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                        <motion.p 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring" as const, delay: idx * 0.1 }}
                                            className="text-3xl font-bold"
                                        >
                                            {stat.value}
                                        </motion.p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
                                            <span className="text-xs text-muted-foreground">{stat.period}</span>
                                        </div>
                                    </div>
                                    <motion.div 
                                        whileHover={{ rotate: 12, scale: 1.1 }}
                                        className={`${colorMap[stat.color as keyof typeof colorMap].bg} rounded-xl flex items-center justify-center h-12 w-12`}
                                    >
                                        <stat.icon className={`h-6 w-6 ${colorMap[stat.color as keyof typeof colorMap].text}`} />
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Search and Filter Bar */}
            <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                />
                            </div>
                            <div className="flex gap-3">
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                >
                                    <option value="all">All Roles</option>
                                    {uniqueRoles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                                <div className="flex gap-1 bg-muted rounded-lg p-1">
                                    {['today', 'week', 'month', 'all'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setDateRange(range as any)}
                                            className={`px-3 py-1.5 text-sm rounded-md transition-all duration-300 ${
                                                dateRange === range 
                                                    ? 'bg-background text-foreground shadow-sm font-medium' 
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {range.charAt(0).toUpperCase() + range.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <Button 
                                    variant="outline" 
                                    onClick={fetchStaffLoginActivity} 
                                    disabled={staffLoginLoading}
                                    className="gap-2"
                                >
                                    <RefreshCw className={`h-4 w-4 ${staffLoginLoading ? 'animate-spin' : ''}`} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Main Activity Table */}
            <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <UserCheck className="h-6 w-6 text-blue-500" />
                                    Staff Login History
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Complete login records with timestamps and IP addresses
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="gap-1">
                                    <Eye className="h-3 w-3" />
                                    {filteredLogs.length} records
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    Page {currentPage} of {totalPages || 1}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div id="activity-table-top"></div>
                        <AnimatePresence mode="wait">
                            {staffLoginLoading ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-center py-20"
                                >
                                    <div className="text-center">
                                        <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                                        <p className="text-muted-foreground">Loading activity data...</p>
                                    </div>
                                </motion.div>
                            ) : filteredLogs.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-20"
                                >
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                                        <Activity className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No Records Found</h3>
                                    <p className="text-muted-foreground">
                                        {searchTerm || selectedRole !== 'all' 
                                            ? 'Try adjusting your search or filters' 
                                            : 'No login activity recorded yet'}
                                    </p>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-muted/30 border-b">
                                                <tr>
                                                    <th className="text-left p-5 text-sm font-semibold">Staff Member</th>
                                                    <th className="text-left p-5 text-sm font-semibold">Role</th>
                                                    <th className="text-left p-5 text-sm font-semibold">Login Time</th>
                                                    <th className="text-left p-5 text-sm font-semibold">IP Address</th>
                                                    <th className="text-left p-5 text-sm font-semibold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {currentLogs.map((log, index) => (
                                                    <motion.tr
                                                        key={log._id}
                                                        variants={tableRowVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        whileHover="hover"
                                                        custom={index}
                                                        onHoverStart={() => setHoveredRow(log._id)}
                                                        onHoverEnd={() => setHoveredRow(null)}
                                                        className="transition-all duration-300 cursor-pointer"
                                                    >
                                                        <td className="p-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                                                    {getInitials(log.name)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-foreground">
                                                                        {log.name || 'Unknown Staff'}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {log.email || 'No email'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-5">
                                                            <Badge 
                                                                className={`capitalize ${
                                                                    log.role === 'org_admin' 
                                                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                }`}
                                                            >
                                                                {log.role || 'Staff'}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-5">
                                                            <div className="space-y-1">
                                                                <div className="text-sm font-medium">
                                                                    {formatDate(log.createdAt)}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {getRelativeTime(log.createdAt)}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-5">
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                                                    {log.ipAddress || '-'}
                                                                </code>
                                                            </div>
                                                        </td>
                                                        <td className="p-5">
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></div>
                                                                Active
                                                            </Badge>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="border-t px-6 py-4 bg-muted/10">
                                            <div className="flex items-center justify-between flex-wrap gap-4">
                                                <div className="text-sm text-muted-foreground">
                                                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} records
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={goToPreviousPage}
                                                        disabled={currentPage === 1}
                                                        className="gap-1"
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                        Previous
                                                    </Button>
                                                    
                                                    <div className="flex items-center gap-1">
                                                        {getPageNumbers().map((page, index) => (
                                                            page === '...' ? (
                                                                <span key={`ellipsis-${index}`} className="px-3 py-1 text-sm text-muted-foreground">
                                                                    ...
                                                                </span>
                                                            ) : (
                                                                <Button
                                                                    key={page}
                                                                    variant={currentPage === page ? "default" : "outline"}
                                                                    size="sm"
                                                                    onClick={() => goToPage(page as number)}
                                                                    className={`min-w-[2.5rem] ${
                                                                        currentPage === page 
                                                                            ? 'bg-blue-600 hover:bg-blue-700' 
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    {page}
                                                                </Button>
                                                            )
                                                        ))}
                                                    </div>
                                                    
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={goToNextPage}
                                                        disabled={currentPage === totalPages}
                                                        className="gap-1"
                                                    >
                                                        Next
                                                        <ChevronRightIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={itemsPerPage}
                                                        onChange={(e) => {
                                                            // If you want to make items per page configurable
                                                            // setItemsPerPage(Number(e.target.value));
                                                            // setCurrentPage(1);
                                                        }}
                                                        className="text-sm border rounded-md px-2 py-1"
                                                        disabled
                                                    >
                                                        <option value={10}>10 per page</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default ActivityTab;