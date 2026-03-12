// import React, { useEffect, useState, useMemo } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Search, Download, Eye, RefreshCw } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { appName, appLogo, companyName, serverURL, websiteURL } from '@/constants';
// import axios from 'axios';
// import { useToast } from '@/hooks/use-toast';
// import { format } from 'date-fns';

// const AdminOrders = () => {
//   const [data, setData] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [providerFilter, setProviderFilter] = useState('all');
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [taxPercentage, setTaxPercentage] = useState(0);
//   const [selectedReceipt, setSelectedReceipt] = useState(null);
//   const [isDownloading, setIsDownloading] = useState(false);

//   const { toast } = useToast();

//   useEffect(() => {
//     fetchOrders();
//     fetchSettings();
//   }, []);

//   const fetchSettings = async () => {
//     try {
//       const res = await axios.get(`${serverURL}/api/settings`);
//       setTaxPercentage(res.data.taxPercentage || 0);
//     } catch (err) {
//       console.error('Failed to fetch tax settings');
//     }
//   };

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery, statusFilter, providerFilter]);

//   const fetchOrders = async () => {
//     try {
//       const res = await axios.get(`${serverURL}/api/orders`);
//       setData(res.data);
//     } catch (err) {
//       toast({
//         title: 'Error',
//         description: 'Failed to load orders',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   };

//   const handleDownloadReceipt = (order) => {
//     if (isDownloading) return;

//     const totalPaid = order.price || order.amount || 0;
//     const subtotalCalc = totalPaid / (1 + taxPercentage / 100);
//     const taxCalc = totalPaid - subtotalCalc;

//     const receiptData = {
//       ...order,
//       subtotal: subtotalCalc.toFixed(2),
//       taxAmount: taxCalc.toFixed(2),
//       totalPrice: totalPaid.toFixed(2),
//       formattedDate: format(new Date(order.createdAt || order.date), 'dd/MM/yyyy')
//     };

//     setSelectedReceipt(receiptData);
//     setIsDownloading(true);

//     toast({
//       title: 'Preparing Receipt',
//       description: 'Please wait while we generate the PDF...',
//     });

//     // Increased delay to ensure React renders the data and browser paints it
//     setTimeout(() => {
//       const element = document.getElementById('premium-receipt-admin-content');
//       if (!element) {
//         console.error('Receipt content element not found');
//         setIsDownloading(false);
//         return;
//       }

//       const opt = {
//         margin: [0.3, 0.3],
//         filename: `receipt-${order.subscriptionId || order._id}.pdf`,
//         image: { type: 'jpeg', quality: 0.98 },
//         html2canvas: {
//           scale: 2,
//           useCORS: true,
//           letterRendering: true,
//           scrollY: 0,
//           scrollX: 0,
//           windowWidth: 800
//         },
//         jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
//       };

//       import('html2pdf.js').then(html2pdf => {
//         html2pdf.default().from(element).set(opt).save().then(() => {
//           setIsDownloading(false);
//           toast({
//             title: 'Success',
//             description: 'Receipt downloaded successfully',
//           });
//         });
//       }).catch(err => {
//         console.error('PDF generation error:', err);
//         setIsDownloading(false);
//         toast({
//           title: 'Error',
//           description: 'Failed to generate PDF',
//           variant: 'destructive',
//         });
//       });
//     }, 2000);
//   };

//   const filteredData = useMemo(() => {
//     let filtered = data;

//     if (searchQuery) {
//       const q = searchQuery.toLowerCase();
//       filtered = filtered.filter(
//         (order) =>
//           order.userName?.toLowerCase().includes(q) ||
//           order.userEmail?.toLowerCase().includes(q) ||
//           order.transactionId?.toLowerCase().includes(q) ||
//           order.subscriptionId?.toLowerCase().includes(q)
//       );
//     }

//     if (statusFilter !== 'all') {
//       filtered = filtered.filter((o) => o.status === statusFilter);
//     }

//     if (providerFilter !== 'all') {
//       filtered = filtered.filter((o) => o.provider === providerFilter);
//     }

//     return filtered;
//   }, [data, searchQuery, statusFilter, providerFilter]);

//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);

//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredData.slice(start, start + itemsPerPage);
//   }, [filteredData, currentPage, itemsPerPage]);

//   const handleRefresh = () => {
//     setIsRefreshing(true);
//     fetchOrders();
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'success':
//         return 'bg-green-100 text-green-800';
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'failed':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="space-y-6 animate-fade-in relative">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold">Order History</h1>
//           <p className="text-muted-foreground">
//             View and manage all payment transactions
//           </p>
//         </div>

//         <div className="flex gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={handleRefresh}
//             disabled={isRefreshing}
//           >
//             <RefreshCw
//               className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
//             />
//             Refresh
//           </Button>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <div className="flex flex-col sm:flex-row justify-between gap-4">
//             <CardTitle>Transactions ({filteredData.length})</CardTitle>

//             <div className="flex gap-3">
//               <Input
//                 placeholder="Search..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />

//               <Select
//                 value={statusFilter}
//                 onValueChange={setStatusFilter}
//               >
//                 <SelectTrigger className="w-40">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All</SelectItem>
//                   <SelectItem value="success">Success</SelectItem>
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="failed">Failed</SelectItem>
//                 </SelectContent>
//               </Select>

//               <Select
//                 value={String(itemsPerPage)}
//                 onValueChange={(val) => {
//                   setItemsPerPage(Number(val));
//                   setCurrentPage(1);
//                 }}
//               >
//                 <SelectTrigger className="w-24">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="10">10</SelectItem>
//                   <SelectItem value="25">25</SelectItem>
//                   <SelectItem value="50">50</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Date</TableHead>
//                 <TableHead>User</TableHead>
//                 <TableHead>Plan</TableHead>
//                 <TableHead>Amount</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {isLoading ? (
//                 <TableRow>
//                   <TableCell colSpan={6}>
//                     <Skeleton className="h-5 w-full" />
//                   </TableCell>
//                 </TableRow>
//               ) : paginatedData.length > 0 ? (
//                 paginatedData.map((order) => (
//                   <TableRow key={order._id}>
//                     <TableCell>
//                       {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
//                     </TableCell>
//                     <TableCell>
//                       {order.userName} <br />
//                       <span className="text-xs text-muted-foreground">
//                         {order.userEmail}
//                       </span>
//                     </TableCell>
//                     <TableCell>{order.planName}</TableCell>
//                     <TableCell>
//                       {order.currency} {order.amount}
//                     </TableCell>
//                     <TableCell>
//                       <Badge className={`${getStatusColor(order.status)} capitalize`}>
//                         {order.status}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleDownloadReceipt(order)}
//                         title="Download Receipt"
//                         disabled={isDownloading}
//                         className="text-primary hover:text-primary hover:bg-primary/10"
//                       >
//                         <Download className="h-4 w-4" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center py-6">
//                     No orders found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex justify-between items-center mt-6">
//               <div className="text-sm text-muted-foreground">
//                 Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
//                 {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
//               </div>

//               <div className="flex gap-2">
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   disabled={currentPage === 1}
//                   onClick={() => setCurrentPage((prev) => prev - 1)}
//                 >
//                   Previous
//                 </Button>

//                 {[...Array(totalPages)].map((_, index) => (
//                   <Button
//                     key={index}
//                     size="sm"
//                     variant={currentPage === index + 1 ? 'default' : 'outline'}
//                     onClick={() => setCurrentPage(index + 1)}
//                   >
//                     {index + 1}
//                   </Button>
//                 ))}

//                 <Button
//                   size="sm"
//                   variant="outline"
//                   disabled={currentPage === totalPages}
//                   onClick={() => setCurrentPage((prev) => prev + 1)}
//                 >
//                   Next
//                 </Button>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* 
//           OFF-SCREEN RECEIPT CONTAINER
//           This is always in the DOM but positioned far off-screen.
//           We render the content only when selectedReceipt has data.
//       */}
//       <div
//         id="premium-receipt-admin-container"
//         style={{
//           position: 'fixed',
//           top: 0,
//           left: '-2000px', // Far off-screen but valid
//           width: '800px',
//           zIndex: -1000,
//           background: '#fff'
//         }}
//       >
//         <div id="premium-receipt-admin-content" style={{ padding: '40px', backgroundColor: '#fff', minHeight: '800px' }}>
//           {selectedReceipt ? (
//             <div style={{ color: '#1a1a1a', fontFamily: 'Arial, sans-serif' }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #efefef', paddingBottom: '20px', marginBottom: '30px' }}>
//                 <div>
//                   <img src={appLogo} alt="Logo" style={{ height: '50px', marginBottom: '10px' }} />
//                   <h1 style={{ margin: 0, fontSize: '24px', color: '#000' }}>{appName}</h1>
//                   <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>{companyName}</p>
//                   <p style={{ margin: '3px 0', fontSize: '12px', color: '#666' }}>{websiteURL}</p>
//                 </div>
//                 <div style={{ textAlign: 'right' }}>
//                   <h2 style={{ margin: 0, fontSize: '28px', color: '#ddd' }}>RECEIPT</h2>
//                   <p style={{ margin: '15px 0 5px', fontSize: '12px', color: '#666' }}><b>Receipt #:</b> {selectedReceipt.subscriptionId || selectedReceipt._id}</p>
//                   <p style={{ margin: '3px 0', fontSize: '12px', color: '#666' }}><b>Date:</b> {selectedReceipt.formattedDate}</p>
//                 </div>
//               </div>

//               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
//                 <div style={{ width: '50%' }}>
//                   <h4 style={{ margin: '0 0 10px', fontSize: '14px', textTransform: 'uppercase', color: '#999' }}>Bill To:</h4>
//                   <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold' }}>{selectedReceipt.userName || 'Customer'}</p>
//                   <p style={{ margin: '3px 0', fontSize: '14px', color: '#444' }}>{selectedReceipt.userEmail || 'N/A'}</p>
//                 </div>
//                 <div style={{ width: '40%', textAlign: 'right' }}>
//                   <h4 style={{ margin: '0 0 10px', fontSize: '14px', textTransform: 'uppercase', color: '#999' }}>Payment Details:</h4>
//                   <p style={{ margin: '5px 0', fontSize: '14px', color: '#444' }}><b>Method:</b> <span style={{ textTransform: 'capitalize' }}>{selectedReceipt.provider || 'Gateway'}</span></p>
//                   <p style={{ margin: '3px 0', fontSize: '14px', color: '#444' }}><b>Currency:</b> {selectedReceipt.currency}</p>
//                   <p style={{ margin: '3px 0', fontSize: '14px', color: '#444' }}><b>Status:</b> <span style={{ textTransform: 'capitalize' }}>{selectedReceipt.status}</span></p>
//                 </div>
//               </div>

//               <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
//                 <thead>
//                   <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #efefef' }}>
//                     <th style={{ textAlign: 'left', padding: '15px', fontSize: '13px', color: '#666' }}>Description</th>
//                     <th style={{ textAlign: 'right', padding: '15px', fontSize: '13px', color: '#666' }}>Unit Price</th>
//                     <th style={{ textAlign: 'center', padding: '15px', fontSize: '13px', color: '#666' }}>Qty</th>
//                     <th style={{ textAlign: 'right', padding: '15px', fontSize: '13px', color: '#666' }}>Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr style={{ borderBottom: '1px solid #f1f1f1' }}>
//                     <td style={{ padding: '20px 15px', fontSize: '15px' }}>
//                       <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedReceipt.planName}</p>
//                       <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#888' }}>Full access to premium features</p>
//                     </td>
//                     <td style={{ textAlign: 'right', padding: '20px 15px', fontSize: '15px' }}>{selectedReceipt.currency} {selectedReceipt.subtotal}</td>
//                     <td style={{ textAlign: 'center', padding: '20px 15px', fontSize: '15px' }}>1</td>
//                     <td style={{ textAlign: 'right', padding: '20px 15px', fontSize: '15px', fontWeight: 'bold' }}>{selectedReceipt.currency} {selectedReceipt.subtotal}</td>
//                   </tr>
//                 </tbody>
//               </table>

//               <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//                 <div style={{ width: '250px' }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f1f1' }}>
//                     <span style={{ fontSize: '14px', color: '#666' }}>Subtotal</span>
//                     <span style={{ fontSize: '14px' }}>{selectedReceipt.currency} {selectedReceipt.subtotal}</span>
//                   </div>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f1f1' }}>
//                     <span style={{ fontSize: '14px', color: '#666' }}>Tax ({taxPercentage}%)</span>
//                     <span style={{ fontSize: '14px' }}>{selectedReceipt.currency} {selectedReceipt.taxAmount}</span>
//                   </div>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0' }}>
//                     <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Grand Total</span>
//                     <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#000' }}>{selectedReceipt.currency} {selectedReceipt.totalPrice}</span>
//                   </div>
//                 </div>
//               </div>

//               <div style={{ marginTop: '100px', textAlign: 'center', borderTop: '1px solid #f1f1f1', paddingTop: '40px' }}>
//                 <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>Thank you for your business!</p>
//                 <p style={{ margin: '5px 0 0', color: '#ccc', fontSize: '11px' }}>This is a computer generated receipt.</p>
//               </div>
//             </div>
//           ) : (
//             <div style={{ textAlign: 'center', padding: '100px', color: '#ccc' }}>
//               No receipt selected
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminOrders;
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Search, Download, RefreshCw, Save } from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { appName, appLogo, companyName, serverURL, websiteURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const AdminOrders = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/settings`);
      setTaxPercentage(res.data.taxPercentage || 0);
    } catch (err) {
      console.error('Failed to fetch tax settings');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/orders`);
      setData(res.data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!editOrder) return;
    setIsUpdating(true);
    const cleanUserId = editOrder.userId && typeof editOrder.userId === 'object' 
      ? editOrder.userId._id 
      : editOrder.userId;

    try {
      const payload = {
        userId: cleanUserId,
        status: editOrder.status,
        planName: editOrder.planName,
        userName: editOrder.userName,
        userEmail: editOrder.userEmail,
        price: Number(editOrder.amount || editOrder.price)
      };
      const res = await axios.put(`${serverURL}/api/orders/${editOrder._id}`, payload);
      if (res.data.success || res.status === 200) {
        toast({ title: 'Success', description: 'Order updated successfully' });
        fetchOrders(); 
        setIsEditModalOpen(false);
      }
    } catch (err) {
      toast({ title: 'Update Failed', description: err.response?.data?.message || 'Error', variant: 'destructive' });
    } finally { setIsUpdating(false); }
  };

  const handleDownloadReceipt = (order) => {
    if (isDownloading) return;
    const totalPaid = order.price || order.amount || 0;
    const subtotalCalc = totalPaid / (1 + taxPercentage / 100);
    const taxCalc = totalPaid - subtotalCalc;

    const receiptData = {
      ...order,
      subtotal: subtotalCalc.toFixed(2),
      taxAmount: taxCalc.toFixed(2),
      totalPrice: totalPaid.toFixed(2),
      formattedDate: format(new Date(order.createdAt || order.date), 'dd/MM/yyyy')
    };

    setSelectedReceipt(receiptData);
    setIsDownloading(true);
    toast({ title: 'Preparing Receipt', description: 'Generating PDF...' });

    setTimeout(() => {
      const element = document.getElementById('premium-receipt-admin-content');
      if (!element) { setIsDownloading(false); return; }

      const opt = {
        margin: [0.3, 0.3],
        filename: `receipt-${order.subscriptionId || order._id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      import('html2pdf.js').then(html2pdf => {
        html2pdf.default().from(element).set(opt).save().then(() => {
          setIsDownloading(false);
          toast({ title: 'Success', description: 'Receipt downloaded' });
        });
      }).catch(() => setIsDownloading(false));
    }, 2000);
  };

  const filteredData = useMemo(() => {
    let filtered = data;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(order => order.userName?.toLowerCase().includes(q) || order.userEmail?.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') filtered = filtered.filter(o => o.status === statusFilter);
    return filtered;
  }, [data, searchQuery, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Order History</h1>
          <p className="text-muted-foreground">Manage all payment transactions</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setIsRefreshing(true); fetchOrders(); }} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>Transactions ({filteredData.length})</CardTitle>
            <div className="flex gap-3">
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6}><Skeleton className="h-5 w-full" /></TableCell></TableRow>
              ) : paginatedData.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{format(new Date(order.createdAt), 'dd/MM/yy HH:mm')}</TableCell>
                  <TableCell>{order.userName}<br/><span className="text-xs text-muted-foreground">{order.userEmail}</span></TableCell>
                  <TableCell>{order.planName}</TableCell>
                  <TableCell>{order.currency} {order.amount}</TableCell>
                  <TableCell>
                    <Badge className={`capitalize ${order.status === 'success' ? 'bg-green-100 text-green-800' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditOrder(order); setIsEditModalOpen(true); }}>
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadReceipt(order)} disabled={isDownloading}>
                        <Download className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {/* --- PAGINATION CONTROLS --- */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(filteredData.length, currentPage * itemsPerPage)} of {filteredData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center mr-4">
              <span className="text-sm text-muted-foreground mr-2">Rows per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(val) => {
                  setItemsPerPage(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center justify-center min-w-[32px] text-sm font-medium">
                {currentPage}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage * itemsPerPage >= filteredData.length}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* --- EDIT MODAL --- */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Edit Order</DialogTitle></DialogHeader>
          {editOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>User Name</Label><Input value={editOrder.userName} onChange={(e) => setEditOrder({...editOrder, userName: e.target.value})} /></div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={editOrder.status} onValueChange={(val) => setEditOrder({...editOrder, status: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Plan</Label><Input value={editOrder.planName} onChange={(e) => setEditOrder({...editOrder, planName: e.target.value})} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={handleUpdateOrder} disabled={isUpdating}>{isUpdating ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- RECEIPT PDF CONTENT --- */}
      <div id="premium-receipt-admin-container" style={{ position: 'fixed', left: '-2000px', width: '800px', background: '#fff' }}>
        <div id="premium-receipt-admin-content" style={{ padding: '40px', backgroundColor: '#fff' }}>
          {selectedReceipt ? (
            <div style={{ color: '#1a1a1a', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #efefef', paddingBottom: '20px', marginBottom: '30px' }}>
                <div>
                  <img src={appLogo} alt="Logo" style={{ height: '50px', marginBottom: '10px' }} />
                  <h1 style={{ margin: 0, fontSize: '24px' }}>{appName}</h1>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>{companyName}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ margin: 0, fontSize: '28px', color: '#ddd' }}>RECEIPT</h2>
                  <p style={{ margin: '15px 0 5px', fontSize: '12px' }}><b>Receipt #:</b> {selectedReceipt.subscriptionId || selectedReceipt._id}</p>
                  <p style={{ margin: '3px 0', fontSize: '12px' }}><b>Date:</b> {selectedReceipt.formattedDate}</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: '#999' }}>BILL TO:</h4>
                  <p style={{ margin: '0', fontWeight: 'bold' }}>{selectedReceipt.userName}</p>
                  <p style={{ margin: '0', fontSize: '14px' }}>{selectedReceipt.userEmail}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: '#999' }}>PAYMENT:</h4>
                  <p style={{ margin: '0' }}><b>Method:</b> {selectedReceipt.provider || 'Online'}</p>
                  <p style={{ margin: '0' }}><b>Status:</b> {selectedReceipt.status}</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Description</th>
                    <th style={{ textAlign: 'right', padding: '12px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px' }}>{selectedReceipt.planName} Subscription</td>
                    <td style={{ textAlign: 'right', padding: '12px' }}>{selectedReceipt.currency} {selectedReceipt.subtotal}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ width: '200px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}><span>Subtotal:</span><span>{selectedReceipt.currency} {selectedReceipt.subtotal}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}><span>Tax ({taxPercentage}%):</span><span>{selectedReceipt.currency} {selectedReceipt.taxAmount}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #000', marginTop: '10px', fontWeight: 'bold', fontSize: '18px' }}>
                    <span>Total:</span><span>{selectedReceipt.currency} {selectedReceipt.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;