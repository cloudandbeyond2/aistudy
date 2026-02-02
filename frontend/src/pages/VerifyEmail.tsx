
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { serverURL } from '@/constants';
import axios from 'axios';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await axios.get(`${serverURL}/api/verify-email/${token}`);
                if (response.data.success) {
                    setStatus('success');
                    setMessage(response.data.message);
                } else {
                    setStatus('error');
                    setMessage(response.data.message);
                }
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Something went wrong during verification.');
            }
        };

        if (token) {
            verifyToken();
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-background/80">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            {status === 'loading' && (
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                </div>
                            )}
                            {status === 'success' && (
                                <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <XCircle className="h-10 w-10 text-destructive" />
                                </div>
                            )}
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {status === 'loading' && 'Verifying Email...'}
                            {status === 'success' && 'Email Verified!'}
                            {status === 'error' && 'Verification Failed'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground text-lg">
                            {status === 'loading' && 'Please wait while we verify your account...'}
                            {status === 'success' && (message || 'Your account has been successfully activated. you can now sign in.')}
                            {status === 'error' && (message || 'The verification link is invalid or has expired.')}
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        {status !== 'loading' && (
                            <Button asChild className="w-full h-12 rounded-xl text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20">
                                <Link to="/login">
                                    {status === 'success' ? 'Go to Sign In' : 'Try Signing In'}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        )}
                        <Button asChild variant="ghost" className="w-full h-12 rounded-xl text-base font-medium">
                            <Link to="/">
                                <Home className="mr-2 h-5 w-5" />
                                Back to Home
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
