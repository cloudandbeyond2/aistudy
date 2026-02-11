// // @ts-nocheck
// import React, { useEffect, useRef, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import axios from 'axios';
// import generatePDF from 'react-to-pdf';

// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { useToast } from '@/hooks/use-toast';

// import { CheckCircle, ArrowRight, Receipt } from 'lucide-react';
// import { appLogo, companyName, serverURL, websiteURL,FreeCost,MonthCost ,YearCost,FreeType,MonthType,YearType} from '@/constants';


// const plans = {
//   free: { name: FreeType, price: FreeCost },
//   monthly: { name: MonthType, price: MonthCost },
//   yearly: { name: YearType, price: YearCost }
// };

// const plansFeartures = [
//   {
//     name: FreeType,
//     features: [
//       "Generate 5 Sub-Topics",
//       "Lifetime access",
//       "Theory & Image Course",
//       "Ai Teacher Chat",
//     ],
//   },
//   {
//     name: MonthType,
//     features: [
//       "Generate 10 Sub-Topics",
//       "1 Month Access",
//       "Theory & Image Course",
//       "Ai Teacher Chat",
//       "Course In 23+ Languages",
//       "Create Unlimited Course",
//       "Video & Theory Course",
//     ],
//   },
//   {
//     name: YearType,
//     features: [
//       "Generate 10 Sub-Topics",
//       "1 Year Access",
//       "Theory & Image Course",
//       "Ai Teacher Chat",
//       "Course In 23+ Languages",
//       "Create Unlimited Course",
//       "Video & Theory Course",
//     ],
//   }
// ];



// const PaymentSuccess = () => {
//   const { planId } = useParams();
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const pdfRef = useRef(null);

//   const [receiptId, setReceiptId] = useState('');
//   const [planName, setPlanName] = useState('');
//   const [price, setPrice] = useState('');
//   const [currency, setCurrency] = useState('');
//   const [method, setMethod] = useState('');
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');

//   useEffect(() => {
//     init();
//   }, []);

//   const init = async () => {
//     if (!planId) {
//       toast({
//         title: 'Invalid payment',
//         description: 'Missing payment reference'
//       });
//       return;
//     }

//     // Read once from sessionStorage
//     const storedPlan = sessionStorage.getItem('plan');
//     const storedPrice = sessionStorage.getItem('price');
//     const storedCurrency = sessionStorage.getItem('planCurrency');
//     const storedMethod = sessionStorage.getItem('method');

//     setReceiptId(planId);
//     setPlanName(storedPlan || '');
//     setPrice(storedPrice || '');
//     setCurrency(storedCurrency || '');
//     setMethod(storedMethod || '');
//     setName(sessionStorage.getItem('mName') || '');
//     setEmail(sessionStorage.getItem('email') || '');

//     await verifyPayment(storedMethod);
//   };

//   // const verifyPayment = async (method) => {
//   //   try {
//   //     let endpoint = '';

//   //     switch (method) {
//   //       case 'stripe':
//   //         endpoint = '/api/stripedetails';
//   //         break;
//   //       case 'paystack':
//   //         endpoint = '/api/paystackfetch';
//   //         break;
//   //       case 'flutterwave':
//   //         endpoint = '/api/flutterdetails';
//   //         break;
//   //       case 'paypal':
//   //         endpoint = '/api/paypaldetails';
//   //         break;
//   //       case 'razorpay':
//   //         endpoint = '/api/razorapydetails';
//   //         break;
//   //       default:
//   //         return;
//   //     }

//   //     await axios.post(serverURL + endpoint, {
//   //       subscriberId: planId,
//   //       uid: sessionStorage.getItem('uid'),
//   //       email,
//   //       plan: planName
//   //     });

//   //     sendEmail();
//   //   } catch (error) {
//   //     console.error(error);
//   //     toast({
//   //       title: 'Error',
//   //       description: 'Payment verification failed'
//   //     });
//   //   }
//   // };

//   const verifyPayment = async (method) => {
//   try {
//     const uid = sessionStorage.getItem('uid');
    
//     if (!uid) {
//       console.error('No user ID found in session');
//       toast({
//         title: 'Error',
//         description: 'User not logged in. Please login again.',
//         variant: 'destructive'
//       });
//       navigate('/login');
//       return;
//     }

//     let endpoint = '';
//     let payload = {};

//     switch (method) {
//       case 'razorpay':
//         endpoint = '/api/razorapydetails';
//         payload = {
//           uid: uid,
//           subscriptionId: receiptId,
//           subscriberId: receiptId,
//           plan: planName,
//           email: email,
//           amount: parseFloat(price),
//           currency: currency
//         };
//         break;
//       case 'stripe':
//         endpoint = '/api/stripedetails';
//         payload = {
//           uid: uid,
//           subscriberId: receiptId,
//           plan: planName,
//           email: email,
//           amount: parseFloat(price),
//           currency: currency
//         };
//         break;
//       case 'paystack':
//         endpoint = '/api/paystackfetch';
//         payload = {
//           uid: uid,
//           subscriberId: receiptId,
//           plan: planName,
//           email: email,
//           amount: parseFloat(price),
//           currency: currency
//         };
//         break;
//       case 'flutterwave':
//         endpoint = '/api/flutterdetails';
//         payload = {
//           uid: uid,
//           subscriberId: receiptId,
//           plan: planName,
//           email: email,
//           amount: parseFloat(price),
//           currency: currency
//         };
//         break;
//       case 'paypal':
//         endpoint = '/api/paypaldetails';
//         payload = {
//           uid: uid,
//           subscriberId: receiptId,
//           plan: planName,
//           email: email,
//           amount: parseFloat(price),
//           currency: currency
//         };
//         break;
//       default:
//         console.error('Unknown payment method:', method);
//         return;
//     }

//     console.log('Verifying payment with payload:', payload);
    
//     const response = await axios.post(serverURL + endpoint, payload);
    
//     if (response.data.success) {
//       console.log('Payment verified successfully:', response.data);
      
//       // Clear session storage after successful verification
//       sessionStorage.removeItem('plan');
//       sessionStorage.removeItem('price');
//       sessionStorage.removeItem('planCurrency');
//       sessionStorage.removeItem('method');
//       sessionStorage.removeItem('subscriptionId');
//       sessionStorage.removeItem('orderId');
      
//       toast({
//         title: 'Success',
//         description: 'Payment verified successfully! Your account has been upgraded.',
//         variant: 'default'
//       });
      
//       // Send email after successful verification
//       await sendEmail();
//     } else {
//       console.error('Payment verification failed:', response.data);
//       toast({
//         title: 'Error',
//         description: response.data.message || 'Payment verification failed',
//         variant: 'destructive'
//       });
//     }
//   } catch (error) {
//     console.error('Payment verification error:', error);
//     toast({
//       title: 'Error',
//       description: error.response?.data?.message || error.message || 'Payment verification failed',
//       variant: 'destructive'
//     });
//   }
// };
//   const handleDownload = () => {
//     generatePDF(pdfRef, {
//       filename: `receipt-${receiptId}.pdf`
//     });

//     toast({
//       title: 'Receipt downloaded',
//       description: 'Your receipt has been saved'
//     });
//   };

//   const getCurrentDate = () =>
//     new Date().toLocaleDateString('en-GB');

//   const sendEmail = async () => {
//     try {
//       const html = `
//         <h2>Payment Successful</h2>
//         <p>Your payment was successful.</p>
//         <p><strong>Plan:</strong> ${planName}</p>
//         <p><strong>Amount:</strong> ${currency} ${price}</p>
//         <p>Thanks for choosing ${companyName}</p>
//       `;

//       await axios.post(serverURL + '/api/sendreceipt', {
//         html,
//         email,
//         plan: planName,
//         subscription: receiptId,
//         method
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <div
//       ref={pdfRef}
//       className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4 flex justify-center"
//     >
//       <Card className="w-full max-w-2xl shadow-lg">
//         <CardHeader className="text-center border-b">
//           <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
//             <CheckCircle className="h-8 w-8 text-primary" />
//           </div>
//           <CardTitle className="text-2xl font-bold">
//             Payment Successful
//           </CardTitle>
//           <p className="text-muted-foreground mt-2">
//             Your payment has been processed successfully.
//           </p>
//         </CardHeader>

//         <CardContent className="pt-6 space-y-6">
//           <div className="flex justify-between">
//             <div>
//               <p className="text-sm text-muted-foreground">Receipt</p>
//               <p className="font-medium">{receiptId}</p>
//             </div>
//             <div className="text-right">
//               <p className="text-sm text-muted-foreground">Date</p>
//               <p className="font-medium">{getCurrentDate()}</p>
//             </div>
//           </div>

//           <Separator />

//           <div>
//             <h3 className="font-medium mb-2">Plan Details</h3>
//             <div className="flex justify-between">
//               <p>{planName}</p>
//               <p className="font-bold">
//                 {currency} {price}
//               </p>
//             </div>
//             <p className="text-sm text-muted-foreground">
//               Payment Method: {method}
//             </p>
//           </div>

//           <Separator />

//           <div>
//             <h3 className="font-medium mb-2">Billing Details</h3>
//             <p>{name}</p>
//             <p className="text-sm text-muted-foreground">{email}</p>
//           </div>
//         </CardContent>

//         <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between border-t pt-4">
//           <Button variant="outline" onClick={handleDownload}>
//             <Receipt className="mr-2 h-4 w-4" />
//             Download Receipt
//           </Button>

//           <Button onClick={() => navigate('/dashboard')}>
//             Go to Dashboard
//             <ArrowRight className="ml-2 h-4 w-4" />
//           </Button>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// };

// export default PaymentSuccess;
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
import { appLogo, companyName, serverURL, websiteURL, FreeCost, MonthCost, YearCost, FreeType, MonthType, YearType } from '@/constants';

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

  useEffect(() => {
    init();
  }, []);

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

    setReceiptId(planId);
    setPlanName(storedPlan);
    setPrice(storedPrice);
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
          await axios.post(serverURL + endpoint, {
            subscriberId: planId,
            uid: uid,
            email: email,
            plan: planType
          });
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
    generatePDF(pdfRef, {
      filename: `receipt-${receiptId}.pdf`
    });

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
    <div
      ref={pdfRef}
      className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4 flex justify-center"
    >
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center border-b">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Payment Successful
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Your payment has been processed successfully.
          </p>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {isVerifying && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-center">
              Verifying payment and activating subscription...
            </div>
          )}
          
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receipt ID</p>
              <p className="font-medium">{receiptId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{getCurrentDate()}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Plan Details</h3>
            <div className="flex justify-between">
              <p>{planName}</p>
              <p className="font-bold">
                {currency} {price}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Payment Method: {method}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Billing Details</h3>
            <p>{name || 'Customer'}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between border-t pt-4">
          <Button variant="outline" onClick={handleDownload}>
            <Receipt className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>

          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;