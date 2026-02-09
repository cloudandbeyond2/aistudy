
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';
import SEO from '@/components/SEO';

const StudentNews = () => {
    return (
        <div className="container mx-auto py-8 space-y-6">
            <SEO title="News" description="Latest news and updates." />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">News</h1>
            </div>

            <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-lg text-center">
                <Newspaper className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">News Section Coming Soon</h2>
                <p className="text-muted-foreground max-w-md">
                    We are working on bringing you the latest news and updates relevant to your studies. Stay tuned!
                </p>
            </div>
        </div>
    );
};

export default StudentNews;
