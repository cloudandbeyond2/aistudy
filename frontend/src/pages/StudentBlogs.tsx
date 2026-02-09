
import React from 'react';
import Blog from './Blog'; // Reusing the existing Blog component
import SEO from '@/components/SEO';

const StudentBlogs = () => {
    return (
        <div className="container mx-auto py-8 space-y-6">
            <SEO title="Blogs" description="Read the latest articles." />

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">Blogs</h1>
            </div>

            {/* Reusing the public blog component, but we might want to wrap it or customize it if needed. 
                For now, rendering it directly inside the dashboard layout is fine. 
                However, Blog.tsx might have its own container/layout. Let's check Blog.tsx later if it needs adjustment. 
                Assuming Blog.tsx fetches and displays blogs.
            */}
            <Blog />
        </div>
    );
};

export default StudentBlogs;
