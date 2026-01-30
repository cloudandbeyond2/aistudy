// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DollarSign, Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PricingData {
  planType: 'free' | 'monthly' | 'yearly';
  planName: string;
  price: number;
  currency: string;
  billingPeriod: string;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

const PLAN_CONFIGS = {
  free: { name: 'Free Plan', period: 'Lifetime' },
  monthly: { name: 'Monthly Plan', period: 'Month' },
  yearly: { name: 'Yearly Plan', period: 'Year' },
};

const AdminPricing = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'monthly' | 'yearly'>('monthly');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [pricingData, setPricingData] = useState<Record<string, PricingData>>({
    free: { planType: 'free', planName: 'Free Plan', price: 0, currency: 'USD', billingPeriod: 'Lifetime' },
    monthly: { planType: 'monthly', planName: 'Monthly Plan', price: 9, currency: 'USD', billingPeriod: 'Month' },
    yearly: { planType: 'yearly', planName: 'Yearly Plan', price: 99, currency: 'USD', billingPeriod: 'Year' },
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${serverURL}/api/admin/pricing`);
      if (response.data.pricing) {
        setPricingData(response.data.pricing);
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pricing data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(e.target.value) || 0;
    setPricingData((prev) => ({
      ...prev,
      [selectedPlan]: {
        ...prev[selectedPlan],
        price: newPrice,
      },
    }));
    setHasChanges(true);
    setSubmitStatus('idle');
  };

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    setPricingData((prev) => ({
      ...prev,
      [selectedPlan]: {
        ...prev[selectedPlan],
        currency: value,
      },
    }));
    setHasChanges(true);
    setSubmitStatus('idle');
  };

  const handlePlanNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPricingData((prev) => ({
      ...prev,
      [selectedPlan]: {
        ...prev[selectedPlan],
        planName: e.target.value,
      },
    }));
    setHasChanges(true);
    setSubmitStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setSubmitStatus('idle');

      const response = await axios.post(`${serverURL}/api/admin/pricing/update`, {
        pricing: pricingData,
      });

      if (response.data.success) {
        setHasChanges(false);
        setSubmitStatus('success');
        toast({
          title: 'Success',
          description: 'Pricing updated successfully',
        });
        setTimeout(() => setSubmitStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error updating pricing:', error);
      setSubmitStatus('error');
      toast({
        title: 'Error',
        description: 'Failed to update pricing',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPricingData((prev) => ({
      ...prev,
      [selectedPlan]: {
        planType: selectedPlan,
        planName: PLAN_CONFIGS[selectedPlan as keyof typeof PLAN_CONFIGS].name,
        price: selectedPlan === 'free' ? 0 : selectedPlan === 'monthly' ? 9 : 99,
        currency: 'USD',
        billingPeriod: PLAN_CONFIGS[selectedPlan as keyof typeof PLAN_CONFIGS].period,
      },
    }));
    setHasChanges(false);
    setSubmitStatus('idle');
  };

  const currentPricing = pricingData[selectedPlan];
  const currentCurrency = CURRENCIES.find((c) => c.code === currentPricing?.currency) || CURRENCIES[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pricing Management</h1>
        <p className="text-muted-foreground mt-2">
          Update pricing plans, manage currencies, and adjust billing cycles
        </p>
      </div>

      {/* Status Alerts */}
      {submitStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Pricing updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === 'error' && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            Failed to update pricing. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Select Plan to Update
            </CardTitle>
            <CardDescription>
              Choose which pricing plan you want to modify
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['free', 'monthly', 'yearly'] as const).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => {
                    setSelectedPlan(plan);
                    setSelectedCurrency(pricingData[plan]?.currency || 'USD');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPlan === plan
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-semibold capitalize">{plan} Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {PLAN_CONFIGS[plan].period}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Details */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Details</CardTitle>
            <CardDescription>
              Update the pricing information for {PLAN_CONFIGS[selectedPlan].name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Name */}
            <div className="space-y-2">
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input
                id="plan-name"
                type="text"
                value={currentPricing?.planName || ''}
                onChange={handlePlanNameChange}
                placeholder="e.g., Premium Plan"
                disabled={isLoading}
              />
            </div>

            {/* Price and Currency Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price Input */}
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    {currentCurrency.symbol}
                  </span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentPricing?.price || 0}
                    onChange={handlePriceChange}
                    disabled={selectedPlan === 'free' || isLoading}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
                {selectedPlan === 'free' && (
                  <p className="text-xs text-muted-foreground">
                    Free plan price cannot be changed
                  </p>
                )}
              </div>

              {/* Currency Selector */}
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={selectedCurrency}
                  onValueChange={handleCurrencyChange}
                  disabled={isLoading}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Billing Period Info */}
            <div className="space-y-2">
              <Label>Billing Period</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{PLAN_CONFIGS[selectedPlan].period}</p>
              </div>
            </div>

            {/* Price Preview */}
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Price Preview</p>
              <p className="text-2xl font-bold mt-2">
                {currentCurrency.symbol}{currentPricing?.price.toFixed(2)} / {PLAN_CONFIGS[selectedPlan].period}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Currency Overview */}
        <Card>
          <CardHeader>
            <CardTitle>All Plans Overview</CardTitle>
            <CardDescription>
              Quick view of all pricing plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(['free', 'monthly', 'yearly'] as const).map((plan) => {
                const planData = pricingData[plan];
                const planCurrency = CURRENCIES.find((c) => c.code === planData?.currency);
                return (
                  <div
                    key={plan}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium capitalize">{plan} Plan</p>
                      <p className="text-sm text-muted-foreground">{planData?.planName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {planCurrency?.symbol || '$'}
                        {planData?.price.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-muted-foreground">{PLAN_CONFIGS[plan].period}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || isLoading}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={!hasChanges || isLoading}
            className="gap-2 min-w-[120px]"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminPricing;
