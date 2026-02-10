// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import generatePDF from 'react-to-pdf';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

import { CheckCircle, ArrowRight, Receipt } from 'lucide-react';
import { appLogo, companyName, serverURL, websiteURL,FreeCost,MonthCost ,YearCost,FreeType,MonthType,YearType} from '@/constants';


const plans = {
  free: { name: FreeType, price: FreeCost },
  monthly: { name: MonthType, price: MonthCost },
  yearly: { name: YearType, price: YearCost }
};

const plansFeartures = [
  {
    name: FreeType,
    features: [
      "Generate 5 Sub-Topics",
      "Lifetime access",
      "Theory & Image Course",
      "Ai Teacher Chat",
    ],
  },
  {
    name: MonthType,
    features: [
      "Generate 10 Sub-Topics",
      "1 Month Access",
      "Theory & Image Course",
      "Ai Teacher Chat",
      "Course In 23+ Languages",
      "Create Unlimited Course",
      "Video & Theory Course",
    ],
  },
  {
    name: YearType,
    features: [
      "Generate 10 Sub-Topics",
      "1 Year Access",
      "Theory & Image Course",
      "Ai Teacher Chat",
      "Course In 23+ Languages",
      "Create Unlimited Course",
      "Video & Theory Course",
    ],
  }
];



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

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    if (!planId) {
      toast({
        title: 'Invalid payment',
        description: 'Missing payment reference'
      });
      return;
    }

    // Read once from sessionStorage
    const storedPlan = sessionStorage.getItem('plan');
    const storedPrice = sessionStorage.getItem('price');
    const storedCurrency = sessionStorage.getItem('planCurrency');
    const storedMethod = sessionStorage.getItem('method');

    setReceiptId(planId);
    setPlanName(storedPlan || '');
    setPrice(storedPrice || '');
    setCurrency(storedCurrency || '');
    setMethod(storedMethod || '');
    setName(sessionStorage.getItem('mName') || '');
    setEmail(sessionStorage.getItem('email') || '');

    await verifyPayment(storedMethod);
  };

  const verifyPayment = async (method) => {
    try {
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
        case 'razorpay':
          endpoint = '/api/razorapydetails';
          break;
        default:
          return;
      }

      await axios.post(serverURL + endpoint, {
        subscriberId: planId,
        uid: sessionStorage.getItem('uid'),
        email,
        plan: planName
      });

      sendEmail();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Payment verification failed'
      });
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
    new Date().toLocaleDateString('en-GB');

  const sendEmail = async () => {
    try {
      const html = `
        <h2>Payment Successful</h2>
        <p>Your payment was successful.</p>
        <p><strong>Plan:</strong> ${planName}</p>
        <p><strong>Amount:</strong> ${currency} ${price}</p>
        <p>Thanks for choosing ${companyName}</p>
      `;

      await axios.post(serverURL + '/api/sendreceipt', {
        html,
        email,
        plan: planName,
        subscription: receiptId,
        method
      });
    } catch (error) {
      console.error(error);
    }
  };

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
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receipt</p>
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
            <p className="text-sm text-muted-foreground">
              Payment Method: {method}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Billing Details</h3>
            <p>{name}</p>
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
