import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ExternalLink, CheckCircle, Home, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { serverURL, websiteURL } from '@/constants';
import axios from 'axios';
// import logopayment from '../../public/pwa-512x512.png'
import logopayment from "@/assets/images/pwa-512x512.png";

const PaymentPending = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { state } = useLocation();
    const { sub, link, planName, planCost, currency, orderId } = state || {};
    const [processing, setProcessing] = useState(false);

    const formatAmount = (currency, amount) => {
        if (!currency || amount === undefined || amount === null) return "";
        try {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency
            }).format(amount);
        } catch {
            return `${currency} ${amount}`;
        }
    };
    
    const handleVerifyPayment = async () => {
        if (!sub) {
            toast({
                title: "Error",
                description: "No subscription ID found",
                variant: "destructive"
            });
            return;
        }

        const dataToSend = { sub: sub };
        
        try {
            toast({
                title: "Verifying payment",
                description: "Checking your payment status...",
            });
            setProcessing(true);
            
            const postURL = serverURL + '/api/razorapypending';
            const res = await axios.post(postURL, dataToSend);
            
            if (res.data.status === 'active' || res.data.status === 'authenticated' || res.data.status === 'charged') {
                toast({
                    title: "Payment successful",
                    description: "Redirecting to success page...",
                });
                
                // Store subscription ID for success page
                sessionStorage.setItem('subscriptionId', sub);
                sessionStorage.setItem('method', 'razorpay');
                
                const successUrl = websiteURL + '/payment-success/' + sub;
                window.location.href = successUrl;
            } else if (res.data.status === 'expired' || res.data.status === 'cancelled') {
                const failedUrl = websiteURL + '/payment-failed';
                window.location.href = failedUrl;
            } else {
                toast({
                    title: "Payment pending",
                    description: "Payment is still pending. Please complete the payment.",
                });
                setProcessing(false);
            }
        } catch (error) {
            console.error('Verification error:', error);
            setProcessing(false);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to verify payment",
                variant: "destructive"
            });
        }
    };

    const handlePaymentLink = () => {
        if (!link) {
            toast({
                title: "Error",
                description: "No payment link available",
                variant: "destructive"
            });
            return;
        }
        
        toast({
            title: "Opening payment page",
            description: "Redirecting you to complete your payment...",
        });
        window.open(link, '_blank');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
            <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center pb-6">
  <div className="flex justify-center mb-6">
    <img
      src={logopayment}
      alt="Payment Pending"
      className="h-24 w-24 object-contain drop-shadow-md"
    />
  </div>

  <CardTitle className="text-3xl font-bold">
    Payment Pending
  </CardTitle>

  <p className="text-muted-foreground mt-2 text-base">
    We're waiting for your payment to be confirmed.
  </p>
</CardHeader>

                <CardContent className="pt-6">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Plan</p>
                                <p className="font-medium">{planName || 'Subscription'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="font-medium">{formatAmount(currency || "INR", planCost)}</p>
                            </div>
                        </div>

                        {sub && (
                            <div className="bg-muted/20 p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">Subscription ID</p>
                                <p className="text-sm font-mono break-all">{sub}</p>
                            </div>
                        )}

                        <Separator />

                        <div className="bg-muted/50 p-4 rounded-lg">
                            <h3 className="font-medium mb-2">What happens next?</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                1. Complete your payment in the opened window
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                                2. Click "Verify Payment" to check status
                            </p>
                            <p className="text-sm text-muted-foreground">
                                3. You'll be redirected to success page
                            </p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
                    <Button 
                        variant="outline" 
                        onClick={handlePaymentLink}
                        disabled={!link}
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Payment Link
                    </Button>

                    <div className="flex gap-2">
                        {/* <Button 
                            variant="ghost"
                            onClick={handleGoHome}
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Home
                        </Button> */}
                        
                        <Button 
                            onClick={handleVerifyPayment}
                            disabled={processing || !sub}
                        >
                            {processing ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            {processing ? 'Verifying...' : 'Verify Payment'}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PaymentPending;