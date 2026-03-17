import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Tag, Clock, Share2, Facebook, Twitter, Linkedin, MessageCircle, ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO';
import StyledText from '@/components/styledText';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import axios from "axios";
import { serverURL } from "@/constants";
import { useToast } from "@/hooks/use-toast";

const BlogPost = () => {
    const { id: blogId } = useParams();
    const { state } = useLocation();
    const { id, category, date, excerpt, imageUrl, title, tags, content } = state || {};
    const [isLoading, setIsLoading] = useState(true);
    const [blogExists, setBlogExists] = useState(true);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        if (blogId === id) {
            setBlogExists(true);
            setIsLoading(false);
        } else {
            // Ideally fetch from API if state is missing
            setBlogExists(false);
            setIsLoading(false);
        }
        window.scrollTo(0, 0);
    }, [blogId, id]);

    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const shareUrl = window.location.href;
    const shareTitle = title;

    const shareLinks = [
        { name: 'Twitter', icon: <Twitter className="h-4 w-4" />, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, color: 'hover:text-[#1DA1F2]' },
        { name: 'Facebook', icon: <Facebook className="h-4 w-4" />, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, color: 'hover:text-[#4267B2]' },
        { name: 'LinkedIn', icon: <Linkedin className="h-4 w-4" />, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, color: 'hover:text-[#0077b5]' },
        { name: 'WhatsApp', icon: <MessageCircle className="h-4 w-4" />, url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`, color: 'hover:text-[#25D366]' },
    ];

    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);

        try {
            const res = await axios.post(`${serverURL}/api/subscribe`, { email });

            if (res.data.success) {
                toast({
                    title: "Subscribed!",
                    description: "Thank you for joining our newsletter.",
                });
                setEmail("");
            }

        } catch (error: any) {
            toast({
                title: "Error",
                description:
                    error.response?.data?.message ||
                    "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <SEO
                title={isLoading || !blogExists ? "Loading Blog..." : title}
                description={isLoading || !blogExists ? "Loading blog content..." : excerpt}
                keywords={`education blog, online learning, AI education, ${isLoading || !blogExists ? '' : category}`}
                ogImage={imageUrl}
            />

            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-primary origin-left z-50"
                style={{ scaleX }}
            />

            <div className="min-h-screen bg-transparent relative overflow-hidden py-12 md:py-20">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[100px] -z-10" />

                <div className="container max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-10"
                    >
                        <Link to="/blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group">
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Articles
                        </Link>
                    </motion.div>

                    {isLoading ? (
                        <div className="space-y-8">
                            <Skeleton className="h-12 w-3/4" />
                            <div className="flex space-x-4">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-[400px] w-full rounded-2xl" />
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    ) : blogExists ? (
                        <article>
                            <motion.header
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-12 text-center"
                            >
                                <Badge variant="secondary" className="mb-6 px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                                    {category}
                                </Badge>
                                <h1 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight leading-tight">
                                    {title}
                                </h1>
                                <div className="flex flex-wrap justify-center items-center text-sm text-muted-foreground gap-6 font-medium">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                                        {formatDate(date)}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-primary" />
                                        5 min read
                                    </div>
                                    <div className="flex items-center">
                                        <Tag className="h-4 w-4 mr-2 text-primary" />
                                        {tags?.split(',')[0] || category}
                                    </div>
                                </div>
                            </motion.header>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mb-12 rounded-3xl overflow-hidden shadow-2xl border-4 border-card"
                            >
                                <img
                                    src={imageUrl}
                                    alt={title}
                                    className="w-full h-auto object-cover max-h-[500px]"
                                />
                            </motion.div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
                                {/* Social Share Sidebar (Desktop) */}
                                <aside className="hidden lg:block lg:col-span-1 sticky top-32 h-fit">
                                    <div className="flex flex-col gap-6 items-center">
                                        <div className="text-[10px] uppercase font-bold tracking-tighter opacity-40 rotate-180 [writing-mode:vertical-lr]">
                                            Share This
                                        </div>
                                        {shareLinks.map((link) => (
                                            <a
                                                key={link.name}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-3 rounded-full bg-card hover:bg-card/80 transition-all border border-primary/5 shadow-sm ${link.color}`}
                                                title={`Share on ${link.name}`}
                                            >
                                                {link.icon}
                                            </a>
                                        ))}
                                    </div>
                                </aside>

                                {/* Content */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="lg:col-span-10 lg:col-start-2 prose prose-lg dark:prose-invert max-w-none"
                                >
                                    <div className="blog-content leading-relaxed text-foreground/90">
                                        <StyledText text={content} />
                                    </div>

                                    {/* Mobile Share */}
                                    <div className="lg:hidden mt-12 p-8 bg-card/40 backdrop-blur-md rounded-2xl border border-primary/10">
                                        <h4 className="text-lg font-bold mb-6 flex items-center">
                                            <Share2 className="h-5 w-5 mr-3 text-primary" />
                                            Share this article
                                        </h4>
                                        <div className="flex flex-wrap gap-4">
                                            {shareLinks.map((link) => (
                                                <Button key={link.name} variant="outline" size="lg" asChild className={`rounded-full gap-2 ${link.color}`}>
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                                                        {link.icon}
                                                        {link.name}
                                                    </a>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {tags && (
                                        <div className="mt-12 pt-8 border-t flex flex-wrap gap-2">
                                            {tags.split(',').map(tag => (
                                                <Badge key={tag} variant="outline" className="px-4 py-1.5 rounded-full bg-primary/5 border-primary/10 hover:bg-primary/10 transition-colors">
                                                    #{tag.trim()}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Footer / CTA */}
                                    {/* Footer / Newsletter CTA */}
                                    <div className="mt-16 p-10 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl border border-primary/10">

                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold mb-2">Did you enjoy this?</h3>
                                            <p className="text-muted-foreground">
                                                Subscribe to our newsletter for more insights.
                                            </p>
                                        </div>

                                        <form onSubmit={handleSubscribe} className="max-w-xl">

                                            <div className="relative group">

                                                <input
                                                    type="email"
                                                    placeholder="Your email address"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl px-6 py-4 pr-40 focus:outline-none focus:border-primary transition-all text-lg"
                                                />

                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                                                >
                                                    {isSubmitting ? "Joining..." : "Join Our Community"}
                                                </button>

                                            </div>

                                            <p className="text-xs text-muted-foreground italic mt-2">
                                                We respect your privacy. Unsubscribe at any time.
                                            </p>

                                        </form>

                                    </div>

                                    <div className="mt-12 flex justify-center">
                                        <Button variant="ghost" asChild className="group">
                                            <Link to="/blog" className="flex items-center gap-2">
                                                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                                Return to all articles
                                            </Link>
                                        </Button>
                                    </div>
                                </motion.div>
                            </div>
                        </article>
                    ) : (
                        <Card className="p-12 text-center bg-card/40 backdrop-blur-xl border-none shadow-2xl">
                            <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto mb-6">
                                <ArrowLeft className="h-12 w-12 text-primary" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Article Not Found</h2>
                            <p className="text-muted-foreground mb-8 max-w-md mx-auto">The blog post you're looking for doesn't exist or has been removed from our archives.</p>
                            <Button asChild size="lg" className="rounded-full px-10 h-14">
                                <Link to="/blog">
                                    <ArrowLeft className="mr-2 h-5 w-5" />
                                    Back to Blog
                                </Link>
                            </Button>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
};

export default BlogPost;
