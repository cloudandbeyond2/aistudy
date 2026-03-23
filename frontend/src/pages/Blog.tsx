/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Search, Calendar, Tag, ArrowRight, Clock, Filter, Sparkles } from 'lucide-react';
import SEO from '@/components/SEO';
import { appName, serverURL } from '@/constants';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useBranding } from '@/contexts/BrandingContext';

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: {
    data: {
      data: Uint8Array;
      type: string;
    };
    contentType: string;
  };
  imageContentType: string;
  imageUrl: string;
  content: string;
  tags: string;
  featured: boolean;
  popular: boolean;
}

const Blog = () => {
  const [data, setData] = useState<BlogPost[]>([]);
  const [featured, setFeatured] = useState<BlogPost | null>(null);
  const [popular, setPopular] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();
  const { appName } = useBranding();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function dashboardData() {
      try {
        const postURL = serverURL + `/api/getblogs`;
        const response = await axios.get(postURL);
        const processedData = response.data.map((post: BlogPost) => ({
          ...post,
          imageUrl: getImage(post.image, post.imageContentType)
        }));

        setData(processedData);
        setIsLoading(false);

        const featuredBlog = processedData.find((post: BlogPost) => post.featured);
        setFeatured(featuredBlog || processedData[0]);

        const popularBlogs = processedData.filter((post: BlogPost) => post.popular);
        setPopular(popularBlogs.length > 0 ? popularBlogs : [processedData[0]]);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setIsLoading(false);
      }
    }
    dashboardData();
  }, []);

  function getImage(image: { data: any; contentType: any; }, imageContentType?: string) {
    if (!image || !image.data) return '/placeholder.svg';
    const byteArray = image.data.data || image.data;
    const base64String = byteArrayToBase64(byteArray);
    // Use stored imageContentType first, then image.contentType, then fallback to image/jpeg
    const mimeType = imageContentType || image.contentType || 'image/jpeg';
    return `data:${mimeType};base64,${base64String}`;
  }

  const byteArrayToBase64 = (byteArray: Uint8Array | number[]) => {
    let binary = '';
    const bytes = new Uint8Array(byteArray);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  function readMore(id: string, category: string, date: string, excerpt: string, imageUrl: string, title: string, tags: string, content: string) {
    navigate("/blog/" + id, {
      state: { id, category, date, excerpt, imageUrl, title, tags, content }
    });
  }

  const filteredBlogs = data.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(data.map(post => post.category)))];

  return (
    <>
      <SEO
        title="Blog"
        description="Insights, tips, and updates from the team on education, technology, and the future of learning."
        keywords="education blog, online learning, AI education, course creation, learning tips"
      />
      
      <div className="min-h-screen bg-transparent relative overflow-hidden">
        {/* Background blobs for premium feel */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] -z-10" />

        <div className="container max-w-7xl mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </motion.div>

          {/* Header Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/20 bg-primary/5 text-primary">
                Our Blog
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Insights & Innovations
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Stay updated with the latest trends in education technology and AI-powered learning.
              </p>
            </motion.div>
          </div>

          {/* Featured Post */}
          <div className="mb-20">
            {isLoading ? (
              <Skeleton className="h-[450px] w-full rounded-2xl" />
            ) : featured && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden border-none shadow-2xl bg-card/40 backdrop-blur-xl group cursor-pointer relative" onClick={() => readMore(featured._id, featured.category, featured.date, featured.excerpt, featured.imageUrl, featured.title, featured.tags, featured.content)}>
                  <div className="md:grid md:grid-cols-5 h-full">
                    <div className="md:col-span-3 overflow-hidden">
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                        src={featured.imageUrl}
                        alt={featured.title}
                        className="h-full w-full object-cover aspect-video md:aspect-auto"
                      />
                    </div>
                    <div className="md:col-span-2 p-8 md:p-12 flex flex-col justify-center">
                      <div className="mb-4">
                        <Badge className="bg-primary text-primary-foreground">Featured Post</Badge>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-6 group-hover:text-primary transition-colors duration-300">
                        {featured.title}
                      </h2>
                      <p className="text-muted-foreground mb-8 text-lg line-clamp-3">
                        {featured.excerpt}
                      </p>
                      <div className="flex items-center text-sm font-medium text-muted-foreground mb-8">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(featured.date)}
                        <span className="mx-3">•</span>
                        <Clock className="h-4 w-4 mr-2" />
                        5 min read
                      </div>
                      <Button className="w-fit rounded-full px-8 py-6 text-lg hover:shadow-lg hover:shadow-primary/20 transition-all">
                        Read Full Story
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-10 h-12 rounded-full border-primary/10 bg-card/50 backdrop-blur-sm focus-visible:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className={`rounded-full px-6 transition-all duration-300 ${
                    selectedCategory === cat 
                      ? "shadow-md shadow-primary/20" 
                      : "hover:bg-primary/5 hover:text-primary border-primary/10"
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Blog Posts */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Latest Articles</h2>
                <div className="h-px flex-grow mx-4 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>

              <div className="grid gap-10 md:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />
                    ))
                  ) : filteredBlogs.length > 0 ? (
                    filteredBlogs.map((post, index) => (
                      <motion.div
                        layout
                        key={post._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <Card className="flex flex-col h-full border-none bg-card/40 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <motion.img
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.6 }}
                              src={post.imageUrl}
                              alt={post.title}
                              className="h-full w-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                            />
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-card/80 backdrop-blur-md text-foreground border-none px-3 py-1">
                                {post.category}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="flex-grow p-6">
                            <div className="flex items-center text-xs text-muted-foreground mb-3 font-medium">
                              <Calendar className="h-3 w-3 mr-1.5 text-primary" />
                              {formatDate(post.date)}
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                              {post.excerpt}
                            </p>
                          </CardContent>
                          <CardFooter className="p-6 pt-0">
                            <Button 
                              onClick={() => readMore(post._id, post.category, post.date, post.excerpt, post.imageUrl, post.title, post.tags, post.content)} 
                              variant="ghost" 
                              className="p-0 h-auto hover:bg-transparent text-primary font-bold group/btn flex items-center"
                            >
                              Explore Post
                              <motion.span
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                              >
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </motion.span>
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <div className="bg-primary/5 p-6 rounded-full w-fit mx-auto mb-4">
                        <Search className="h-10 w-10 text-primary/40" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No articles found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
                      <Button variant="outline" className="mt-6 rounded-full" onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}>
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-12">
              {/* Popular Posts */}
              <div>
                <div className="flex items-center mb-6">
                  <Sparkles className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-xl font-bold">Recommended</h3>
                </div>
                <div className="space-y-6">
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
                  ) : (
                    popular.map((post) => (
                      <motion.div 
                        whileHover={{ x: 5 }}
                        key={`popular-${post._id}`} 
                        className="flex gap-4 items-center group cursor-pointer"
                        onClick={() => readMore(post._id, post.category, post.date, post.excerpt, post.imageUrl, post.title, post.tags, post.content)}
                      >
                        <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden shadow-lg">
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 font-bold opacity-70">
                            {formatDate(post.date)}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Newsletter or Info Card */}
              <Card className="p-8 border-none bg-primary text-primary-foreground relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">Level Up Your Skills</h3>
                  <p className="text-primary-foreground/80 mb-6 text-sm">
                    Join thousands of students and get the latest educational insights delivered to your inbox.
                  </p>
                  <div className="space-y-3">
                    <Input placeholder="email@example.com" className="bg-primary-foreground/10 border-primary-foreground/20 placeholder:text-primary-foreground/40 text-primary-foreground h-11" />
                    <Button variant="secondary" className="w-full font-bold h-11">Subscribe Now</Button>
                  </div>
                </div>
                {/* Decorative circle */}
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
