import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { serverURL } from '@/constants';
import { Separator } from '@/components/ui/separator';

const CertificateVerification = () => {
    const [certificateId, setCertificateId] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const [searchParams] = useSearchParams();
    const queryId = searchParams.get('id');

    const handleVerify = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const idToVerify = certificateId || queryId;
        if (!idToVerify?.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);
        setSearched(false);

        try {
            const response = await axios.get(`${serverURL}/api/verify-certificate/${idToVerify.trim()}`);
            if (response.data.success) {
                setResult(response.data.certificate);
                if (!certificateId) setCertificateId(idToVerify);
            } else {
                setError('Certificate not found. Please check the ID and try again.');
            }
        } catch (err) {
            setError('An error occurred while verifying the certificate. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    useEffect(() => {
        if (queryId) {
            setCertificateId(queryId);
            handleVerify();
        }
    }, [queryId]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Certificate Verification</h1>
                    <p className="mt-2 text-gray-600">Enter the certificate ID to verify its authenticity</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Verify Certificate</CardTitle>
                        <CardDescription>Enter the unique certificate ID found on the document.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="certificateId">Certificate ID</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="certificateId"
                                        placeholder="e.g. CERT-X7Y8Z9"
                                        value={certificateId}
                                        onChange={(e) => setCertificateId(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="submit" disabled={loading}>
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {searched && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {result ? (
                            <Card className="border-green-200 bg-green-50">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <CheckCircle className="h-6 w-6" />
                                        <CardTitle className="text-xl">Valid Certificate</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Student Name</p>
                                            <p className="font-semibold text-gray-900">{result.studentName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Course Name</p>
                                            <p className="font-semibold text-gray-900">{result.courseName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Issue Date</p>
                                            <p className="font-semibold text-gray-900">{new Date(result.date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Certificate ID</p>
                                            <p className="font-semibold text-gray-900">{result.certificateId}</p>
                                        </div>
                                    </div>
                                    <Separator className="bg-green-200" />
                                    <p className="text-xs text-green-800 text-center">
                                        This certificate was officially issued by AIstudy.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-red-200 bg-red-50">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <XCircle className="h-6 w-6" />
                                        <CardTitle className="text-xl">Invalid Certificate</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="text-red-800">{error}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificateVerification;
