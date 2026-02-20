// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useRef as usePdfRef } from 'react';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ArrowRight, Receipt } from 'lucide-react';
import { appName, appLogo, companyName, serverURL, websiteURL, FreeCost, MonthCost, YearCost, FreeType, MonthType, YearType } from '@/constants';

// Generate PDF function
const generatePDF = (target, options) => {
  // Use html2pdf or similar library
  import('html2pdf.js').then(html2pdf => {
    html2pdf.default().from(target.current).set(options).save();
  }).catch(err => console.error('PDF generation error:', err));
};

const PaymentSuccess = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const pdfRef = useRef(null);

  const [receiptId, setReceiptId] = useState('');
  const [planName, setPlanName] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('');
  const [method, setMethod] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [countdown, setCountdown] = useState(7);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [subtotal, setSubtotal] = useState('0');
  const [taxAmount, setTaxAmount] = useState('0');

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    let timer;
    if (shouldRedirect && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (shouldRedirect && countdown === 0) {
      navigate('/dashboard/pricing');
    }
    return () => clearInterval(timer);
  }, [shouldRedirect, countdown, navigate]);

  const init = async () => {
    if (!planId) {
      toast({
        title: 'Invalid payment',
        description: 'Missing payment reference',
        variant: 'destructive'
      });
      return;
    }

    // Get data from sessionStorage
    const storedPlan = sessionStorage.getItem('plan') || 'Monthly Plan';
    const storedPrice = sessionStorage.getItem('price') || '0';
    const storedCurrency = sessionStorage.getItem('planCurrency') || 'INR';
    const storedMethod = sessionStorage.getItem('method') || 'razorpay';
    const storedName = sessionStorage.getItem('mName') || '';
    const storedEmail = sessionStorage.getItem('email') || '';
    const storedUid = sessionStorage.getItem('uid') || '';
    const storedSubtotal = sessionStorage.getItem('subtotal') || '0';
    const storedTaxAmount = sessionStorage.getItem('taxAmount') || '0';

    setReceiptId(planId);
    setPlanName(storedPlan);
    setPrice(storedPrice);
    setSubtotal(storedSubtotal);
    setTaxAmount(storedTaxAmount);
    setCurrency(storedCurrency);
    setMethod(storedMethod);
    setName(storedName);
    setEmail(storedEmail);
    setUid(storedUid);

    await verifyPayment(storedMethod, storedPlan, storedPrice, storedCurrency, storedName, storedEmail, storedUid);
  };

  const verifyPayment = async (method, plan, price, currency, name, email, uid) => {
    try {
      setIsVerifying(true);

      // Determine plan type from plan name
      const planType = plan.includes('Year') ? 'yearly' : 'monthly';

      if (method === 'razorpay') {
        // For Razorpay - send to razorapydetails endpoint
        const response = await axios.post(`${serverURL}/api/razorapydetails`, {
          subscriberId: planId, // This is the subscription ID
          uid: uid,
          email: email,
          plan: planType,
          price: parseFloat(price),
          currency: currency,
          mName: name
        });

        console.log('Verification response:', response.data);

        // 🔥 CRITICAL: Refresh user state in storage so UI updates without logout
        if (response.data?.success && response.data?.data?.user) {
          const updatedUser = response.data.data.user;
          localStorage.setItem('user', JSON.stringify(updatedUser));
          sessionStorage.setItem('type', updatedUser.type);
          console.log('✅ User state refreshed after Razorpay payment:', updatedUser.type);
        }

        toast({
          title: 'Payment verified',
          description: 'Your subscription has been activated',
        });
      } else {
        // Handle other payment methods
        let endpoint = '';
        switch (method) {
          case 'stripe':
            endpoint = '/api/stripedetails';
            break;
          case 'paystack':
            endpoint = '/api/paystackfetch';
            break;
          case 'flutterwave':
            endpoint = '/api/flutterdetails';
            break;
          case 'paypal':
            endpoint = '/api/paypaldetails';
            break;
          default:
            endpoint = '';
        }

        if (endpoint) {
          const response = await axios.post(serverURL + endpoint, {
            subscriberId: planId,
            uid: uid,
            email: email,
            plan: planType
          });

          console.log('Verification response:', response.data);

          // 🔥 CRITICAL: Refresh user state in storage so UI updates without logout
          const updatedUser = response.data?.user || response.data?.details?.user || response.data?.data?.user;
          if (updatedUser) {
            localStorage.setItem('user', JSON.stringify(updatedUser));
            sessionStorage.setItem('type', updatedUser.type);
            console.log(`✅ User state refreshed after ${method} payment:`, updatedUser.type);
          }
        }
      }

      // Send email receipt
      await sendEmail(plan, price, currency, method, email, name, planId);

    } catch (error) {
      console.error('Payment verification error:', error.response?.data || error.message);
      toast({
        title: 'Verification issue',
        description: error.response?.data?.message || 'Payment verification failed, but your payment may still be successful',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
      setShouldRedirect(true);
    }
  };

  const sendEmail = async (plan, price, currency, method, email, name, receiptId) => {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Payment Successful!</h2>
          <p>Thank you for your purchase, ${name}!</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Receipt</h3>
            <p><strong>Receipt ID:</strong> ${receiptId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Amount:</strong> ${currency} ${price}</p>
            <p><strong>Payment Method:</strong> ${method}</p>
          </div>
          
          <p>You can access your courses from your dashboard.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
      `;

      await axios.post(serverURL + '/api/sendreceipt', {
        html,
        email,
        plan,
        subscription: receiptId,
        method
      });

      console.log('Receipt email sent');
    } catch (error) {
      console.error('Email sending error:', error);
    }
  };

  const handleDownload = () => {
    const element = document.getElementById('premium-receipt');
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `receipt-${receiptId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    import('html2pdf.js').then(html2pdf => {
      html2pdf.default().from(element).set(opt).save();
    }).catch(err => console.error('PDF generation error:', err));

    toast({
      title: 'Receipt downloaded',
      description: 'Your receipt has been saved'
    });
  };

  const getCurrentDate = () =>
    new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Success Card */}
        <Card className="shadow-lg border-none bg-background/60 backdrop-blur-sm overflow-hidden">
          <div className="h-2 bg-primary"></div>
          <CardHeader className="text-center pt-8">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
              <CheckCircle className="h-10 w-10 text-green-500 animate-in zoom-in duration-300" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Payment Successful!
            </CardTitle>
            <p className="text-muted-foreground mt-2 text-lg">
              Thank you for choosesing {appName}. Your subscription is now active.
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <div className="grid md:grid-cols-2 gap-8 mt-4">
              {/* Order Info */}
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-xl space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Order Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground italic">Receipt ID</span>
                      <span className="font-mono font-medium text-xs bg-muted p-1 rounded">{receiptId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground italic">Date</span>
                      <span className="font-medium">{getCurrentDate()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground italic">Method</span>
                      <span className="font-medium capitalize">{method}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Plan Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground italic">Plan Name</span>
                      <span className="font-medium">{planName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground italic">Currency</span>
                      <span className="font-medium">{currency}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing breakdown UI */}
              <div className="flex flex-col justify-between">
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 space-y-4">
                  <h3 className="font-semibold text-lg text-primary">Price Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{currency} {subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{currency} {taxAmount}</span>
                    </div>
                    <Separator className="bg-primary/10" />
                    <div className="flex justify-between items-end pt-2">
                      <span className="font-bold text-lg">Total Paid</span>
                      <span className="font-bold text-2xl text-primary">{currency} {price}</span>
                    </div>
                  </div>
                </div>

                {isVerifying && (
                  <div className="mt-6 bg-blue-50/50 border border-blue-100 text-blue-700 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-ping"></div>
                    <span className="text-sm font-medium">Finalizing your subscription...</span>
                  </div>
                )}

                {shouldRedirect && !isVerifying && (
                  <div className="mt-6 bg-green-50/50 border border-green-100 text-green-700 p-4 rounded-xl text-center">
                    <span className="text-sm font-medium">Automatic redirect to dashboard in <span className="font-bold">{countdown}s</span></span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/20 px-8 py-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Button variant="outline" size="lg" className="w-full sm:w-auto hover:bg-muted font-medium" onClick={handleDownload}>
              <Receipt className="mr-2 h-5 w-5" />
              Download PDF Receipt
            </Button>

            <Button
              size="lg"
              className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all"
              onClick={() => {
                sessionStorage.removeItem('method');
                sessionStorage.removeItem('subscriptionId');
                sessionStorage.removeItem('orderId');
                navigate('/dashboard/pricing');
              }}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>

        {/* Hidden Premium Receipt Template for PDF Export */}
        <div id="premium-receipt" style={{ position: 'absolute', left: '-10000px', top: 0, width: '800px', backgroundColor: '#fff', color: '#1a1a1a', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #efefef', paddingBottom: '20px', marginBottom: '30px' }}>
            <div>
              <img src={appLogo} alt="Logo" style={{ height: '50px', marginBottom: '10px' }} />
              <h1 style={{ margin: 0, fontSize: '24px', color: '#000' }}>{appName}</h1>
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>{companyName}</p>
              <p style={{ margin: '3px 0', fontSize: '12px', color: '#666' }}>{websiteURL}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ margin: 0, fontSize: '28px', color: '#ddd' }}>RECEIPT</h2>
              <p style={{ margin: '15px 0 5px', fontSize: '12px', color: '#666' }}><b>Receipt #:</b> {receiptId}</p>
              <p style={{ margin: '3px 0', fontSize: '12px', color: '#666' }}><b>Date:</b> {getCurrentDate()}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div style={{ width: '50%' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '14px', textTransform: 'uppercase', color: '#999' }}>Bill To:</h4>
              <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold' }}>{name || 'Customer'}</p>
              <p style={{ margin: '3px 0', fontSize: '14px', color: '#444' }}>{email}</p>
            </div>
            <div style={{ width: '40%', textAlign: 'right' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '14px', textTransform: 'uppercase', color: '#999' }}>Payment Details:</h4>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#444' }}><b>Method:</b> <span style={{ textTransform: 'capitalize' }}>{method}</span></p>
              <p style={{ margin: '3px 0', fontSize: '14px', color: '#444' }}><b>Currency:</b> {currency}</p>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #efefef' }}>
                <th style={{ textAlign: 'left', padding: '15px', fontSize: '13px', color: '#666' }}>Description</th>
                <th style={{ textAlign: 'right', padding: '15px', fontSize: '13px', color: '#666' }}>Unit Price</th>
                <th style={{ textAlign: 'center', padding: '15px', fontSize: '13px', color: '#666' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '15px', fontSize: '13px', color: '#666' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f1f1' }}>
                <td style={{ padding: '20px 15px', fontSize: '15px' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{planName}</p>
                  <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#888' }}>Full access to premium features</p>
                </td>
                <td style={{ textAlign: 'right', padding: '20px 15px', fontSize: '15px' }}>{currency} {subtotal}</td>
                <td style={{ textAlign: 'center', padding: '20px 15px', fontSize: '15px' }}>1</td>
                <td style={{ textAlign: 'right', padding: '20px 15px', fontSize: '15px', fontWeight: 'bold' }}>{currency} {subtotal}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f1f1' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Subtotal</span>
                <span style={{ fontSize: '14px' }}>{currency} {subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f1f1' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Tax</span>
                <span style={{ fontSize: '14px' }}>{currency} {taxAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Grand Total</span>
                <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#000' }}>{currency} {price}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '100px', textAlign: 'center', borderTop: '1px solid #f1f1f1', paddingTop: '40px' }}>
            <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>Thank you for your business!</p>
            <p style={{ margin: '5px 0 0', color: '#ccc', fontSize: '11px' }}>This is a computer generated receipt and does not require a signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;