
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const AdminOrders = () => {
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const filteredData = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return data.filter(
            (order: any) =>
                order.user?.toLowerCase().includes(q) ||
                order.email?.toLowerCase().includes(q) ||
                order.transactionId?.toLowerCase().includes(q)
        );
    }, [data, searchQuery]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/orders`);
            setData(res.data);
        } catch (err) {
            console.error(err);
            toast({
                title: 'Error',
                description: 'Failed to load orders',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
                <p className="text-muted-foreground mt-1">
                    View all payment transactions
                </p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <CardTitle>Transactions</CardTitle>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search orders..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>User / Email</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Provider</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Transaction ID</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={7}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : filteredData.length > 0 ? (
                                filteredData.map((order: any) => (
                                    <TableRow key={order._id}>
                                        <TableCell>
                                            {order.date ? format(new Date(order.date), 'PPP') : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{order.email}</span>
                                                <span className="text-xs text-muted-foreground">{order.user}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{order.plan}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {order.currency} {order.amount}
                                        </TableCell>
                                        <TableCell className="capitalize">{order.provider}</TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === 'success' ? 'default' : 'destructive'}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs">
                                            {order.transactionId}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        No orders found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminOrders;
