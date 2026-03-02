import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { serverURL } from '@/constants';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 10;

const AdminAdmins = () => {
  const [admins, setAdmin] = useState([]);
  const [users, setUser] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('all');

  /* ---------------- COMBINE AND FILTER DATA ---------------- */
  const combinedData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    // Add role tag to distinguish during filtering/rendering
    const taggedAdmins = admins.map(a => ({ ...a, role: 'admin' }));
    const taggedUsers = users.map(u => ({ ...u, role: 'user' }));

    let combined = [...taggedAdmins, ...taggedUsers];

    // Filter by role
    if (roleFilter !== 'all') {
      combined = combined.filter(item => item.role === roleFilter);
    }

    // Filter by search query (applies to both admins and users now)
    if (query) {
      combined = combined.filter(
        (u) =>
          u.mName?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query)
      );
    }

    return combined;
  }, [admins, users, searchQuery, roleFilter]);

  /* Reset page on search */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(combinedData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return combinedData.slice(start, start + ITEMS_PER_PAGE);
  }, [combinedData, currentPage]);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    async function dashboardData() {
      const res = await axios.get(`${serverURL}/api/getadmins`);
      setAdmin(res.data.admins);
      setUser(res.data.users);
      setIsLoading(false);
    }
    dashboardData();
  }, []);

  async function removeAdmin(email: string) {
    const res = await axios.post(`${serverURL}/api/removeadmin`, { email });
    if (res.data.success) {
      toast({ title: 'Admin Removed', description: email });
      location.reload();
    }
  }

  async function addAdmin(email: string) {
    const res = await axios.post(`${serverURL}/api/addadmin`, { email });
    if (res.data.success) {
      toast({ title: 'Admin Added', description: email });
      location.reload();
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admins</h1>
        <p className="text-muted-foreground mt-1">
          Promoting a user to admin also upgrades them to paid
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>All Administrators</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedData.length ? (
                paginatedData.map((row) => {
                  const isAdmin = row.role === 'admin';

                  return (
                    <TableRow key={row._id}>
                      <TableCell className="font-medium">{row.mName}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>
                        <Badge variant={isAdmin ? 'default' : 'outline'}>
                          {isAdmin ? 'Admin' : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.type !== 'free' ? 'default' : 'secondary'}>
                          {row.type !== 'free' ? 'Paid' : 'Free'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {isAdmin ? (
                              <DropdownMenuItem
                                onClick={() => removeAdmin(row.email)}
                              >
                                <CrossCircledIcon className="mr-2 h-4 w-4" />
                                Remove Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => addAdmin(row.email)}
                              >
                                <CheckCircledIcon className="mr-2 h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* ---------------- PAGINATION ---------------- */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>

              <div className="flex gap-1 flex-wrap justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={page === currentPage ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[36px]"
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAdmins;
