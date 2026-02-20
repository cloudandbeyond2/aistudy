// import React, { useEffect, useState, useMemo } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Search, Download, Eye, RefreshCw } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from '@/components/ui/select';
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
// } from '@/components/ui/dialog';
// import { serverURL } from '@/constants';
// import axios from 'axios';
// import { useToast } from '@/hooks/use-toast';
// import { format } from 'date-fns';

// const AdminOrders = () => {
//     const [data, setData] = useState([]);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [statusFilter, setStatusFilter] = useState('all');
//     const [providerFilter, setProviderFilter] = useState('all');
//     const [isLoading, setIsLoading] = useState(true);
//     const [isRefreshing, setIsRefreshing] = useState(false);
//     const [selectedOrder, setSelectedOrder] = useState(null);
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const { toast } = useToast();

//     const filteredData = useMemo(() => {
//         let filtered = data;

//         // Search filter
//         if (searchQuery) {
//             const q = searchQuery.toLowerCase().trim();
//             filtered = filtered.filter(
//                 (order) =>
//                     order.user?.toLowerCase().includes(q) ||
//                     order.email?.toLowerCase().includes(q) ||
//                     order.transactionId?.toLowerCase().includes(q) ||
//                     order.subscriptionId?.toLowerCase().includes(q)
//             );
//         }

//         // Status filter
//         if (statusFilter !== 'all') {
//             filtered = filtered.filter(order => order.status === statusFilter);
//         }

//         // Provider filter
//         if (providerFilter !== 'all') {
//             filtered = filtered.filter(order => order.provider === providerFilter);
//         }

//         return filtered;
//     }, [data, searchQuery, statusFilter, providerFilter]);
// // Inside the component, add this function
// const handleManualUpdate = async (orderId, subscriptionId) => {
//   try {
//     const response = await axios.post(`${serverURL}/api/orders/manual-update`, {
//       orderId,
//       subscriptionId,
//       status: 'success',
//       amount: 3999,
//       userName: 'Star bala',
//       planName: 'Yearly Plan'
//     });
    
//     if (response.data.success) {
//       toast({
//         title: 'Success',
//         description: 'Order updated successfully',
//       });
//       fetchOrders(); // Refresh the list
//     }
//   } catch (error) {
//     console.error(error);
//     toast({
//       title: 'Error',
//       description: 'Failed to update order',
//       variant: 'destructive',
//     });
//   }
// };

// // Add this button to your table row
// const handleFixAllPending = async () => {
//   try {
//     const response = await axios.post(`${serverURL}/api/orders/fix-pending`);
    
//     toast({
//       title: 'Success',
//       description: `Fixed ${response.data.updates?.length || 0} pending orders`,
//     });
    
//     fetchOrders(); // Refresh the list
//   } catch (error) {
//     console.error(error);
//     toast({
//       title: 'Error',
//       description: 'Failed to fix pending orders',
//       variant: 'destructive',
//     });
//   }
// };

//     useEffect(() => {
//         fetchOrders();
//     }, []);

//     const fetchOrders = async () => {
//         try {
//             const res = await axios.get(`${serverURL}/api/orders`);
//             setData(res.data);
//         } catch (err) {
//             console.error(err);
//             toast({
//                 title: 'Error',
//                 description: 'Failed to load orders',
//                 variant: 'destructive',
//             });
//         } finally {
//             setIsLoading(false);
//             setIsRefreshing(false);
//         }
//     };

//     const handleRefresh = () => {
//         setIsRefreshing(true);
//         fetchOrders();
//     };

//     const handleViewOrder = async (orderId) => {
//         try {
//             const res = await axios.get(`${serverURL}/api/orders/${orderId}`);
//             setSelectedOrder(res.data);
//             setIsDialogOpen(true);
//         } catch (err) {
//             console.error(err);
//             toast({
//                 title: 'Error',
//                 description: 'Failed to fetch order details',
//                 variant: 'destructive',
//             });
//         }
//     };

//     const handleStatusUpdate = async (orderId, newStatus) => {
//         try {
//             await axios.patch(`${serverURL}/api/orders/${orderId}/status`, {
//                 status: newStatus
//             });
            
//             toast({
//                 title: 'Success',
//                 description: 'Order status updated',
//             });
            
//             fetchOrders(); // Refresh data
//         } catch (err) {
//             console.error(err);
//             toast({
//                 title: 'Error',
//                 description: 'Failed to update status',
//                 variant: 'destructive',
//             });
//         }
//     };

//     const exportToCSV = () => {
//         const headers = ['Date', 'User', 'Email', 'Plan', 'Amount', 'Currency', 'Provider', 'Status', 'Transaction ID', 'Subscription ID'];
//         const csvData = filteredData.map(order => [
//             format(new Date(order.date), 'yyyy-MM-dd HH:mm:ss'),
//             order.user,
//             order.email,
//             order.plan,
//             order.amount,
//             order.currency,
//             order.provider,
//             order.status,
//             order.transactionId,
//             order.subscriptionId || 'N/A'
//         ]);

//         const csvContent = [
//             headers.join(','),
//             ...csvData.map(row => row.join(','))
//         ].join('\n');

//         const blob = new Blob([csvContent], { type: 'text/csv' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
//         a.click();
//         window.URL.revokeObjectURL(url);
//     };

//     const getStatusColor = (status) => {
//         switch (status) {
//             case 'success': return 'bg-green-100 text-green-800 border-green-200';
//             case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//             case 'failed': return 'bg-red-100 text-red-800 border-red-200';
//             case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
//             default: return 'bg-gray-100 text-gray-800 border-gray-200';
//         }
//     };

//     return (
//         <div className="space-y-6 animate-fade-in">
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
//                     <p className="text-muted-foreground mt-1">
//                         View and manage all payment transactions
//                     </p>
//                 </div>
//                 <div className="flex gap-2">
//                     <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={exportToCSV}
//                         disabled={filteredData.length === 0}
//                     >
//                         <Download className="h-4 w-4 mr-2" />
//                         Export CSV
//                     </Button>
//                     <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={handleRefresh}
//                         disabled={isRefreshing}
//                     >
//                         <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
//                         Refresh
//                     </Button>
                    

// <Button
//   variant="outline"
//   size="sm"
//   onClick={handleFixAllPending}
//   disabled={isRefreshing}
// >
//   <RefreshCw className="h-4 w-4 mr-2" />
//   Fix Pending Orders
// </Button>
//                 </div>
//             </div>

//             <Card>
//                 <CardHeader className="pb-3">
//                     <div className="flex flex-col sm:flex-row justify-between gap-4">
//                         <CardTitle>Transactions ({filteredData.length})</CardTitle>
//                         <div className="flex flex-col sm:flex-row gap-3">
//                             <div className="relative w-full sm:w-64">
//                                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                                 <Input
//                                     type="search"
//                                     placeholder="Search orders..."
//                                     className="pl-8"
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                 />
//                             </div>
//                             <Select value={statusFilter} onValueChange={setStatusFilter}>
//                                 <SelectTrigger className="w-full sm:w-40">
//                                     <SelectValue placeholder="Status" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="all">All Status</SelectItem>
//                                     <SelectItem value="success">Success</SelectItem>
//                                     <SelectItem value="pending">Pending</SelectItem>
//                                     <SelectItem value="failed">Failed</SelectItem>
//                                     <SelectItem value="cancelled">Cancelled</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                             <Select value={providerFilter} onValueChange={setProviderFilter}>
//                                 <SelectTrigger className="w-full sm:w-40">
//                                     <SelectValue placeholder="Provider" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="all">All Providers</SelectItem>
//                                     <SelectItem value="razorpay">Razorpay</SelectItem>
//                                     <SelectItem value="stripe">Stripe</SelectItem>
//                                     <SelectItem value="paypal">PayPal</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </div>
//                 </CardHeader>

//                 <CardContent>
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Date</TableHead>
//                                 <TableHead>User / Email</TableHead>
//                                 <TableHead>Plan</TableHead>
//                                 <TableHead>Amount</TableHead>
//                                 <TableHead>Provider</TableHead>
//                                 <TableHead>Status</TableHead>
//                                 <TableHead className="text-right">Actions</TableHead>
//                             </TableRow>
//                         </TableHeader>

//                         <TableBody>
//                             {isLoading ? (
//                                 [...Array(5)].map((_, i) => (
//                                     <TableRow key={i}>
//                                         <TableCell colSpan={7}>
//                                             <Skeleton className="h-5 w-full" />
//                                         </TableCell>
//                                     </TableRow>
//                                 ))
//                             ) : filteredData.length > 0 ? (
//                                 filteredData.map((order) => (
//                        // In the table body, replace the TableRow with this:
// <TableRow key={order._id} className="hover:bg-muted/50">
//   <TableCell>
//     {order.createdAt ? format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm') : 
//      order.date ? format(new Date(order.date), 'dd/MM/yyyy HH:mm') : 'N/A'}
//   </TableCell>
//   <TableCell>
//     <div className="flex flex-col">
//       <span className="font-medium">{order.userMName || order.userName || order.userData?.mName || order.userData?.name || 'N/A'}</span>
//       <span className="text-xs text-muted-foreground">{order.userEmail}</span>
//       {order.userId && (
//         <span className="text-xs text-blue-600 mt-1">
//           ID: {typeof order.userId === 'object' ? order.userId._id?.slice(-6) : order.userId?.slice(-6)}
//         </span>
//       )}
//     </div>
//   </TableCell>
//   <TableCell>
//     <div className="flex flex-col">
//       <Badge variant="outline" className="capitalize">
//         {order.plan || 'N/A'}
//       </Badge>
//       <span className="text-xs text-muted-foreground mt-1">
//         {order.planName}
//       </span>
//     </div>
//   </TableCell>
//   <TableCell className="font-medium">
//     <span className="font-mono">
//       {order.currency || 'INR'} {order.price || order.amount || 0}
//     </span>
//   </TableCell>
//   <TableCell>
//     <Badge variant="secondary" className="capitalize">
//       {order.provider || 'razorpay'}
//     </Badge>
//   </TableCell>
//   <TableCell>
//     <div className="flex flex-col gap-1">
//       <Badge className={`${getStatusColor(order.status)} capitalize`}>
//         {order.status}
//       </Badge>
//       {order.subscriptionStartDate && (
//         <div className="text-xs text-muted-foreground">
//           Starts: {format(new Date(order.subscriptionStartDate), 'dd/MM/yy')}
//         </div>
//       )}
//       {order.subscriptionEndDate && (
//         <div className="text-xs text-muted-foreground">
//           Ends: {format(new Date(order.subscriptionEndDate), 'dd/MM/yy')}
//         </div>
//       )}
//     </div>
//   </TableCell>
//   <TableCell className="text-right">
//     <div className="flex justify-end gap-2">
//       <Button
//         variant="ghost"
//         size="sm"
//         onClick={() => handleViewOrder(order._id)}
//         title="View Details"
//       >
//         <Eye className="h-4 w-4" />
//       </Button>
//       {order.status === 'pending' && (
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => handleManualUpdate(order._id, order.subscriptionId)}
//           className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
//           title="Fix Order"
//         >
//           Fix
//         </Button>
//       )}
//     </div>
//   </TableCell>
// </TableRow>
//                                 ))
//                             ) : (
//                                 <TableRow>
//                                     <TableCell colSpan={7} className="text-center py-8">
//                                         <div className="flex flex-col items-center justify-center">
//                                             <p className="text-muted-foreground">No orders found</p>
//                                             {searchQuery || statusFilter !== 'all' || providerFilter !== 'all' ? (
//                                                 <Button
//                                                     variant="link"
//                                                     onClick={() => {
//                                                         setSearchQuery('');
//                                                         setStatusFilter('all');
//                                                         setProviderFilter('all');
//                                                     }}
//                                                 >
//                                                     Clear filters
//                                                 </Button>
//                                             ) : null}
//                                         </div>
//                                     </TableCell>
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </CardContent>
//             </Card>

//             {/* Order Details Dialog */}
//             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                 <DialogContent className="max-w-3xl">
//                     <DialogHeader>
//                         <DialogTitle>Order Details</DialogTitle>
//                         <DialogDescription>
//                             Complete transaction information
//                         </DialogDescription>
//                     </DialogHeader>
                    
//                     {selectedOrder && (
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div className="space-y-2">
//                                 <h4 className="font-semibold">Customer Information</h4>
//                                 <p><strong>User:</strong> {selectedOrder.userId?.mName || selectedOrder.userName}</p>
//                                 <p><strong>Email:</strong> {selectedOrder.userEmail}</p>
//                                 <p><strong>User ID:</strong> {selectedOrder.userId?._id || 'N/A'}</p>
//                             </div>
                            
//                             <div className="space-y-2">
//                                 <h4 className="font-semibold">Order Information</h4>
//                                 <p><strong>Order ID:</strong> {selectedOrder._id}</p>
//                                 <p><strong>Date:</strong> {format(new Date(selectedOrder.createdAt), 'PPpp')}</p>
//                                 <p><strong>Status:</strong> 
//                                     <Badge className={`ml-2 ${getStatusColor(selectedOrder.status)}`}>
//                                         {selectedOrder.status}
//                                     </Badge>
//                                 </p>
//                             </div>
                            
//                             <div className="space-y-2">
//                                 <h4 className="font-semibold">Payment Information</h4>
//                                 <p><strong>Amount:</strong> {selectedOrder.currency} {selectedOrder.amount}</p>
//                                 <p><strong>Plan:</strong> {selectedOrder.planName} ({selectedOrder.plan})</p>
//                                 <p><strong>Provider:</strong> {selectedOrder.provider}</p>
//                                 <p><strong>Subscription ID:</strong> {selectedOrder.subscriptionId || 'N/A'}</p>
//                                 <p><strong>Payment ID:</strong> {selectedOrder.razorpayPaymentId || 'N/A'}</p>
//                             </div>
                            
//                             <div className="space-y-2">
//                                 <h4 className="font-semibold">Additional Information</h4>
//                                 <p><strong>Address:</strong> {selectedOrder.address || 'N/A'}</p>
//                                 {selectedOrder.notes && (
//                                     <div>
//                                         <strong>Notes:</strong>
//                                         <pre className="text-xs mt-1 p-2 bg-muted rounded">
//                                             {JSON.stringify(selectedOrder.notes, null, 2)}
//                                         </pre>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     )}
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// };

// export default AdminOrders;

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, Eye, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const AdminOrders = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, providerFilter]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/orders`);
      setData(res.data);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredData = useMemo(() => {
    let filtered = data;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.userName?.toLowerCase().includes(q) ||
          order.userEmail?.toLowerCase().includes(q) ||
          order.transactionId?.toLowerCase().includes(q) ||
          order.subscriptionId?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (providerFilter !== 'all') {
      filtered = filtered.filter((o) => o.provider === providerFilter);
    }

    return filtered;
  }, [data, searchQuery, statusFilter, providerFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Order History</h1>
          <p className="text-muted-foreground">
            View and manage all payment transactions
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>Transactions ({filteredData.length})</CardTitle>

            <div className="flex gap-3">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={String(itemsPerPage)}
                onValueChange={(val) => {
                  setItemsPerPage(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      {format(
                        new Date(order.createdAt),
                        'dd/MM/yyyy HH:mm'
                      )}
                    </TableCell>
                    <TableCell>
                      {order.userName} <br />
                      <span className="text-xs text-muted-foreground">
                        {order.userEmail}
                      </span>
                    </TableCell>
                    <TableCell>{order.planName}</TableCell>
                    <TableCell>
                      {order.currency} {order.amount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(
                          order.status
                        )} capitalize`}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredData.length
                )}{' '}
                of {filteredData.length}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => prev - 1)
                  }
                >
                  Previous
                </Button>

                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={
                      currentPage === index + 1
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}

                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => prev + 1)
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
