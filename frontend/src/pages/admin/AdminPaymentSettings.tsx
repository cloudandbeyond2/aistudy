
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AdminPaymentSettings = () => {
    const [settings, setSettings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/payment-settings`);
            setSettings(res.data);
        } catch (err) {
            console.error(err);
            toast({
                title: 'Error',
                description: 'Failed to load payment settings',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (provider: string, data: any) => {
        setSavingMap((prev) => ({ ...prev, [provider]: true }));
        try {
            await axios.post(`${serverURL}/api/payment-settings`, {
                provider,
                ...data,
            });
            toast({
                title: 'Success',
                description: `${provider} settings updated successfully`,
            });
            fetchSettings();
        } catch (err) {
            console.error(err);
            toast({
                title: 'Error',
                description: 'Failed to update settings',
                variant: 'destructive',
            });
        } finally {
            setSavingMap((prev) => ({ ...prev, [provider]: false }));
        }
    };

    const getSetting = (provider: string) => {
        return settings.find((s) => s.provider === provider) || { provider, isEnabled: false, isLive: false, publicKey: '', secretKey: '', webhookSecret: '' };
    };

    const providers = ['stripe', 'paypal', 'razorpay', 'flutterwave', 'paystack'];

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payment Gateways</h1>
                <p className="text-muted-foreground mt-1">
                    Configure API keys and settings for payment providers
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="grid gap-6">
                    {providers.map((provider) => (
                        <PaymentProviderCard
                            key={provider}
                            provider={provider}
                            initialData={getSetting(provider)}
                            onSave={handleSave}
                            isSaving={savingMap[provider]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const PaymentProviderCard = ({ provider, initialData, onSave, isSaving }: any) => {
    const [data, setData] = useState(initialData);

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    const handleChange = (field: string, value: any) => {
        setData((prev: any) => ({ ...prev, [field]: value }));
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="capitalize">{provider}</CardTitle>
                        <CardDescription>Manage {provider} integration</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor={`${provider}-enabled`}>Enable</Label>
                        <Switch
                            id={`${provider}-enabled`}
                            checked={data.isEnabled}
                            onCheckedChange={(c) => handleChange('isEnabled', c)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                    <Switch
                        id={`${provider}-live`}
                        checked={data.isLive}
                        onCheckedChange={(c) => handleChange('isLive', c)}
                    />
                    <Label htmlFor={`${provider}-live`}>Live Mode</Label>
                </div>

                <div className="grid gap-2">
                    <Label>Public Key / Client ID</Label>
                    <Input
                        value={data.publicKey || ''}
                        onChange={(e) => handleChange('publicKey', e.target.value)}
                        type="password"
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Secret Key</Label>
                    <Input
                        value={data.secretKey || ''}
                        onChange={(e) => handleChange('secretKey', e.target.value)}
                        type="password"
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Webhook Secret (Optional)</Label>
                    <Input
                        value={data.webhookSecret || ''}
                        onChange={(e) => handleChange('webhookSecret', e.target.value)}
                        type="password"
                    />
                </div>

                {provider === 'razorpay' && (
                    <>
                        <div className="grid gap-2">
                            <Label>Monthly Plan ID</Label>
                            <Input
                                value={data.monthlyPlanId || ''}
                                onChange={(e) => handleChange('monthlyPlanId', e.target.value)}
                                placeholder="plan_..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Yearly Plan ID</Label>
                            <Input
                                value={data.yearlyPlanId || ''}
                                onChange={(e) => handleChange('yearlyPlanId', e.target.value)}
                                placeholder="plan_..."
                            />
                        </div>
                    </>
                )}
                <Button onClick={() => onSave(provider, data)} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </CardContent>
        </Card>
    );
}

export default AdminPaymentSettings;
