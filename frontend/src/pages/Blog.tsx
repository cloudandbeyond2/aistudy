// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { AnimatePresence, motion } from 'framer-motion';
// import {
//   ArrowLeft,
//   ArrowRight,
//   Calendar,
//   Clock,
//   Filter,
//   Search,
//   Sparkles,
//   TrendingUp,
//   BookOpen,
//   Tag,
// } from 'lucide-react';
// import SEO from '@/components/SEO';
// import Footer from '@/components/Footer';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardFooter } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';
// import { appName, serverURL } from '@/constants';

// interface BlogPost {
//   _id: string;
//   title: string;
//   excerpt: string;
//   category: string;
//   date: string;
//   image: {
//     data: {
//       data: Uint8Array;
//       type: string;
//     };
//     contentType: string;
//   };
//   imageContentType: string;
//   imageUrl: string;
//   content: string;
//   tags: string;
//   featured: boolean;
//   popular: boolean;
// }

// const stats = [
//   { label: 'Categories', value: '10+' },
//   { label: 'Insights', value: 'Weekly' },
//   { label: 'Readers', value: 'Growing' },
// ];

// const Blog = () => {
//   const [data, setData] = useState<BlogPost[]>([]);
//   const [featured, setFeatured] = useState<BlogPost | null>(null);
//   const [popular, setPopular] = useState<BlogPost[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const navigate = useNavigate();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   useEffect(() => {
//     async function loadBlogs() {
//       try {
//         const response = await axios.get(`${serverURL}/api/getblogs`);
//         const processedData = response.data.map((post: BlogPost) => ({
//           ...post,
//           imageUrl: getImage(post.image, post.imageContentType),
//         }));

//         setData(processedData);
//         setFeatured(processedData.find((post: BlogPost) => post.featured) || processedData[0] || null);
//         const popularBlogs = processedData.filter((post: BlogPost) => post.popular);
//         setPopular(popularBlogs.length > 0 ? popularBlogs : processedData.slice(0, 3));
//       } catch (error) {
//         console.error('Error fetching blogs:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     loadBlogs();
//   }, []);

//   function getImage(image: { data: any; contentType: any }, imageContentType?: string) {
//     if (!image || !image.data) return '/placeholder.svg';
//     const byteArray = image.data.data || image.data;
//     const base64String = byteArrayToBase64(byteArray);
//     const mimeType = imageContentType || image.contentType || 'image/jpeg';
//     return `data:${mimeType};base64,${base64String}`;
//   }

//   const byteArrayToBase64 = (byteArray: Uint8Array | number[]) => {
//     let binary = '';
//     const bytes = new Uint8Array(byteArray);
//     for (let i = 0; i < bytes.byteLength; i += 1) {
//       binary += String.fromCharCode(bytes[i]);
//     }
//     return window.btoa(binary);
//   };

//   const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//   });

//   const readMore = (post: BlogPost) => {
//     navigate(`/blog/${post._id}`, {
//       state: {
//         id: post._id,
//         category: post.category,
//         date: post.date,
//         excerpt: post.excerpt,
//         imageUrl: post.imageUrl,
//         title: post.title,
//         tags: post.tags,
//         content: post.content,
//       },
//     });
//   };

//   const filteredBlogs = data.filter((post) => {
//     const matchesSearch =
//       post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   const categories = ['All', ...Array.from(new Set(data.map((post) => post.category)))];

//   return (
//     <>
//       <SEO
//         title="Blog"
//         description={`Insights, updates, and learning guidance from the ${appName} team.`}
//         keywords="blog, education, AI learning, courses, student updates"
//       />

//       <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(30,138,138,0.08),transparent_25%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]">
//         <section className="relative overflow-hidden bg-slate-950 text-white">
//           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,138,138,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_30%)]" />
//           <div
//             className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-screen"
//             style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }}
//           />

//           <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8 lg:py-24">
//             <div className="mb-8">
//               <Link to="/" className="inline-flex items-center text-sm text-slate-300 hover:text-white">
//                 <ArrowLeft className="mr-2 h-4 w-4" />
//                 Back to Home
//               </Link>
//             </div>

//             <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.7 }}
//                 className="space-y-6"
//               >
//                 <Badge className="rounded-full bg-white/10 px-4 py-1.5 text-cyan-100 hover:bg-white/10">
//                   <Sparkles className="mr-2 h-3.5 w-3.5" />
//                   Public blog
//                 </Badge>
//                 <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
//                   Corporate learning insights, product updates, and practical guidance.
//                 </h1>
//                 <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
//                   Explore platform updates, learning ideas, and articles that help users, students, staff,
//                   and organizations work more effectively.
//                 </p>
//                 <div className="grid gap-2 sm:grid-cols-3">
//                   {stats.map((item) => (
//                     <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
//                       <div className="text-2xl font-semibold text-white">{item.value}</div>
//                       <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">{item.label}</div>
//                     </div>
//                   ))}
//                 </div>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, scale: 0.96 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.8, delay: 0.1 }}
//                 className="relative"
//               >
//                 <div className="absolute -inset-1 rounded-[34px] bg-gradient-to-tr from-primary/50 via-cyan-400/30 to-blue-500/40 blur-2xl opacity-60" />
//                 <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-2 backdrop-blur">
//                   <img
//                     src="/bexon/images/hero-img.webp"
//                     alt="Blog preview"
//                     className="h-[420px] w-full rounded-[26px] object-cover"
//                   />
//                   <div className="absolute bottom-5 left-5 right-5 rounded-[24px] border border-white/10 bg-slate-950/80 p-4 backdrop-blur">
//                     <div className="grid gap-3 sm:grid-cols-3">
//                       {[
//                         { label: 'Articles', value: 'Fresh updates', icon: BookOpen },
//                         { label: 'Search', value: 'Fast filters', icon: Search },
//                         { label: 'Insights', value: 'Practical tips', icon: TrendingUp },
//                       ].map((item) => (
//                         <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
//                           <div className="flex items-center gap-2 text-cyan-100">
//                             <item.icon className="h-4 w-4" />
//                             <span className="text-xs uppercase tracking-[0.25em] text-slate-300">{item.label}</span>
//                           </div>
//                           <div className="mt-2 text-sm font-semibold text-white">{item.value}</div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </section>

//         <section className="px-4 py-20 md:px-6 lg:px-8">
//           <div className="mx-auto max-w-7xl">
//             <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
//               <div className="max-w-2xl">
//                 <Badge variant="secondary" className="rounded-full px-4 py-1.5">
//                   <Filter className="mr-2 h-3.5 w-3.5" />
//                   Browse articles
//                 </Badge>
//                 <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
//                   Articles organized for fast reading.
//                 </h2>
//                 <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
//                   Use search and categories to move through the content quickly on desktop or mobile.
//                 </p>
//               </div>

//               <div className="relative w-full lg:max-w-md">
//                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   placeholder="Search articles..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="h-12 rounded-full border-primary/10 bg-white pl-10 shadow-sm focus-visible:ring-primary/20"
//                 />
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-2">
//               {categories.map((cat) => (
//                 <Button
//                   key={cat}
//                   variant={selectedCategory === cat ? 'default' : 'outline'}
//                   onClick={() => setSelectedCategory(cat)}
//                   className={`rounded-full px-5 ${selectedCategory === cat ? 'shadow-md shadow-primary/20' : 'border-primary/10 hover:bg-primary/5 hover:text-primary'}`}
//                 >
//                   <Tag className="mr-2 h-3.5 w-3.5" />
//                   {cat}
//                 </Button>
//               ))}
//             </div>

//             <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
//               <div className="space-y-8">
//                 {isLoading ? (
//                   <Skeleton className="h-[450px] w-full rounded-[32px]" />
//                 ) : featured ? (
//                   <motion.div
//                     initial={{ opacity: 0, y: 24 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6 }}
//                   >
//                     <Card className="overflow-hidden border-none bg-slate-950 text-white shadow-[0_34px_100px_-50px_rgba(15,23,42,0.9)]">
//                       <div className="grid md:grid-cols-5">
//                         <div className="md:col-span-3 overflow-hidden">
//                           <img src={featured.imageUrl} alt={featured.title} className="h-full w-full object-cover" />
//                         </div>
//                         <CardContent className="md:col-span-2 space-y-4 p-6 md:p-8">
//                           <Badge className="rounded-full bg-white/10 px-3 py-1 text-cyan-100 hover:bg-white/10">
//                             Featured article
//                           </Badge>
//                           <h3 className="text-3xl font-semibold leading-tight">{featured.title}</h3>
//                           <p className="text-sm leading-7 text-slate-300">{featured.excerpt}</p>
//                           <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-slate-400">
//                             <span>{formatDate(featured.date)}</span>
//                             <span>•</span>
//                             <span>{featured.category}</span>
//                           </div>
//                           <Button onClick={() => readMore(featured)} className="h-11 rounded-full bg-primary px-5 text-white hover:bg-primary/90">
//                             Read article
//                             <ArrowRight className="ml-2 h-4 w-4" />
//                           </Button>
//                         </CardContent>
//                       </div>
//                     </Card>
//                   </motion.div>
//                 ) : (
//                   <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-10 text-center text-muted-foreground">
//                     No blog posts available yet.
//                   </div>
//                 )}

//                 <div>
//                   <div className="mb-5 flex items-center gap-3">
//                     <h3 className="text-2xl font-semibold">Latest articles</h3>
//                     <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
//                   </div>

//                   <div className="grid gap-5 md:grid-cols-2">
//                     <AnimatePresence mode="popLayout">
//                       {isLoading ? (
//                         Array.from({ length: 4 }).map((_, index) => (
//                           <Skeleton key={index} className="h-[360px] w-full rounded-[28px]" />
//                         ))
//                       ) : filteredBlogs.length > 0 ? (
//                         filteredBlogs.map((post, index) => (
//                           <motion.div
//                             key={post._id}
//                             layout
//                             initial={{ opacity: 0, y: 18 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             exit={{ opacity: 0, y: 18 }}
//                             transition={{ duration: 0.4, delay: index * 0.05 }}
//                           >
//                             <Card className="group h-full overflow-hidden border-slate-200/80 bg-white/90 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-1">
//                               <div className="relative aspect-[16/10] overflow-hidden">
//                                 <img
//                                   src={post.imageUrl}
//                                   alt={post.title}
//                                   className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
//                                   onError={(e) => {
//                                     (e.target as HTMLImageElement).src = '/placeholder.svg';
//                                   }}
//                                 />
//                                 <Badge className="absolute left-4 top-4 rounded-full bg-slate-950/75 px-3 py-1 text-white backdrop-blur">
//                                   {post.category}
//                                 </Badge>
//                               </div>

//                               <CardContent className="space-y-3 p-6">
//                                 <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
//                                   <Calendar className="h-3.5 w-3.5 text-primary" />
//                                   {formatDate(post.date)}
//                                 </div>
//                                 <h4 className="text-xl font-semibold leading-tight">{post.title}</h4>
//                                 <p className="text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
//                               </CardContent>

//                               <CardFooter className="px-6 pb-6 pt-0">
//                                 <Button
//                                   onClick={() => readMore(post)}
//                                   variant="ghost"
//                                   className="h-10 px-0 text-primary hover:bg-transparent"
//                                 >
//                                   Explore post
//                                   <ArrowRight className="ml-2 h-4 w-4" />
//                                 </Button>
//                               </CardFooter>
//                             </Card>
//                           </motion.div>
//                         ))
//                       ) : (
//                         <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center">
//                           <h4 className="text-lg font-semibold">No articles found</h4>
//                           <p className="mt-2 text-sm text-muted-foreground">Try a different search or category.</p>
//                           <Button
//                             variant="outline"
//                             className="mt-6 rounded-full"
//                             onClick={() => {
//                               setSearchTerm('');
//                               setSelectedCategory('All');
//                             }}
//                           >
//                             Clear filters
//                           </Button>
//                         </div>
//                       )}
//                     </AnimatePresence>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-8">
//                 <Card className="border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)]">
//                   <div className="flex items-center gap-2">
//                     <TrendingUp className="h-5 w-5 text-primary" />
//                     <h3 className="text-xl font-semibold">Recommended</h3>
//                   </div>
//                   <div className="mt-5 space-y-4">
//                     {isLoading ? (
//                       Array.from({ length: 3 }).map((_, index) => (
//                         <Skeleton key={index} className="h-20 w-full rounded-xl" />
//                       ))
//                     ) : (
//                       popular.map((post) => (
//                         <button
//                           type="button"
//                           key={post._id}
//                           onClick={() => readMore(post)}
//                           className="flex w-full gap-4 rounded-2xl border border-slate-200/80 p-3 text-left transition hover:border-primary/20 hover:bg-primary/5"
//                         >
//                           <img
//                             src={post.imageUrl}
//                             alt={post.title}
//                             className="h-16 w-16 rounded-xl object-cover"
//                           />
//                           <div className="min-w-0 flex-1">
//                             <h4 className="text-sm font-semibold leading-snug text-slate-950 line-clamp-2">
//                               {post.title}
//                             </h4>
//                             <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
//                               {formatDate(post.date)}
//                             </p>
//                           </div>
//                         </button>
//                       ))
//                     )}
//                   </div>
//                 </Card>

//                 <Card className="relative overflow-hidden border-none bg-slate-950 p-6 text-white shadow-[0_34px_100px_-50px_rgba(15,23,42,0.9)]">
//                   <div className="relative z-10">
//                     <Badge className="rounded-full bg-white/10 px-3 py-1 text-cyan-100 hover:bg-white/10">
//                       <Clock className="mr-2 h-3.5 w-3.5" />
//                       Weekly insights
//                     </Badge>
//                     <h3 className="mt-4 text-2xl font-semibold">Stay updated with {appName}</h3>
//                     <p className="mt-3 text-sm leading-7 text-slate-300">
//                       Get articles about learning workflows, AI tools, scheduling, and product updates.
//                     </p>
//                     <div className="mt-5 space-y-3">
//                       <Input
//                         placeholder="email@example.com"
//                         className="h-11 border-white/10 bg-white/10 text-white placeholder:text-slate-400"
//                       />
//                       <Button className="h-11 w-full rounded-full bg-white text-slate-950 hover:bg-slate-100">
//                         Subscribe
//                       </Button>
//                     </div>
//                   </div>
//                   <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
//                 </Card>
//               </div>
//             </div>
//           </div>
//         </section>

//         <Footer />
//       </div>
//     </>
//   );
// };

// export default Blog;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
  BookOpen,
  Tag,
} from 'lucide-react';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { appName, serverURL } from '@/constants';
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: {
    data: { data: Uint8Array; type: string };
    contentType: string;
  };
  imageContentType: string;
  imageUrl: string;
  content: string;
  tags: string;
  featured: boolean;
  popular: boolean;
}

const stats = [
  { label: 'Categories', value: '10+' },
  { label: 'Insights', value: 'Weekly' },
  { label: 'Readers', value: 'Growing' },
];

const Blog = () => {
  const [data, setData] = useState<BlogPost[]>([]);
  const [featured, setFeatured] = useState<BlogPost | null>(null);
  const [popular, setPopular] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Newsletter Subscription States
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const response = await axios.get(`${serverURL}/api/getblogs`);
        const processedData = response.data.map((post: BlogPost) => ({
          ...post,
          imageUrl: getImage(post.image, post.imageContentType),
        }));

        setData(processedData);
        setFeatured(processedData.find((post: BlogPost) => post.featured) || processedData[0] || null);
        
        const popularBlogs = processedData.filter((post: BlogPost) => post.popular);
        setPopular(popularBlogs.length > 0 ? popularBlogs : processedData.slice(0, 3));
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadBlogs();
  }, []);

  function getImage(image: { data: any; contentType: any }, imageContentType?: string) {
    if (!image || !image.data) return '/placeholder.svg';
    const byteArray = image.data.data || image.data;
    const base64String = byteArrayToBase64(byteArray);
    const mimeType = imageContentType || image.contentType || 'image/jpeg';
    return `data:${mimeType};base64,${base64String}`;
  }

  const byteArrayToBase64 = (byteArray: Uint8Array | number[]) => {
    let binary = '';
    const bytes = new Uint8Array(byteArray);
    for (let i = 0; i < bytes.byteLength; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const formatDate = (date: string) => 
    new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const readMore = (post: BlogPost) => {
    navigate(`/blog/${post._id}`, {
      state: {
        id: post._id,
        category: post.category,
        date: post.date,
        excerpt: post.excerpt,
        imageUrl: post.imageUrl,
        title: post.title,
        tags: post.tags,
        content: post.content,
      },
    });
  };

  // Working Subscribe Handler
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      const res = await axios.post(`${serverURL}/api/subscribe`, { email });
      console.log('--- AI TOKEN USAGE (Blog Subscription) ---');
      console.table(res.data.usage);
      if (res.data.success) {
        toast({
          title: "Subscribed!",
          description: "Thank you for joining our weekly insights.",
        });
        setEmail("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBlogs = data.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(data.map((post) => post.category)))];

  return (
    <>
      <SEO
        title="Blog"
        description={`Insights, updates, and learning guidance from the ${appName} team.`}
        keywords="blog, education, AI learning, courses, student updates"
      />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(30,138,138,0.08),transparent_25%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,138,138,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_30%)]" />
          <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-screen" style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }} />

          <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8 lg:py-24">
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center text-sm text-slate-300 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="space-y-6">
                <Badge className="rounded-full bg-white/10 px-4 py-1.5 text-cyan-100 hover:bg-white/10">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Public blog
                </Badge>
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                  Corporate learning insights, product updates, and practical guidance.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  Explore platform updates, learning ideas, and articles that help users, students, staff, and organizations work more effectively.
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                      <div className="text-2xl font-semibold text-white">{item.value}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">{item.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }} className="relative">
                <div className="absolute -inset-1 rounded-[34px] bg-gradient-to-tr from-primary/50 via-cyan-400/30 to-blue-500/40 blur-2xl opacity-60" />
                <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-2 backdrop-blur">
                  <img src="/bexon/images/hero-img.webp" alt="Blog preview" className="h-[420px] w-full rounded-[26px] object-cover" />
                  <div className="absolute bottom-5 left-5 right-5 rounded-[24px] border border-white/10 bg-slate-950/80 p-4 backdrop-blur">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: 'Articles', value: 'Fresh updates', icon: BookOpen },
                        { label: 'Search', value: 'Fast filters', icon: Search },
                        { label: 'Insights', value: 'Practical tips', icon: TrendingUp },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-center gap-2 text-cyan-100">
                            <item.icon className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-[0.25em] text-slate-300">{item.label}</span>
                          </div>
                          <div className="mt-2 text-sm font-semibold text-white">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="px-4 py-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <Badge variant="secondary" className="rounded-full px-4 py-1.5">
                  <Filter className="mr-2 h-3.5 w-3.5" />
                  Browse articles
                </Badge>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Articles organized for fast reading.
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                  Use search and categories to move through the content quickly on desktop or mobile.
                </p>
              </div>

              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 rounded-full border-primary/10 bg-white pl-10 shadow-sm focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-5 ${selectedCategory === cat ? 'shadow-md shadow-primary/20' : 'border-primary/10 hover:bg-primary/5 hover:text-primary'}`}
                >
                  <Tag className="mr-2 h-3.5 w-3.5" />
                  {cat}
                </Button>
              ))}
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Left Column - Featured + Latest */}
              <div className="space-y-8">
                {/* Featured Article */}
                {isLoading ? (
                  <Skeleton className="h-[450px] w-full rounded-[32px]" />
                ) : featured ? (
                  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Card className="overflow-hidden border-none bg-slate-950 text-white shadow-[0_34px_100px_-50px_rgba(15,23,42,0.9)]">
                      <div className="grid md:grid-cols-5">
                        <div className="md:col-span-3 overflow-hidden">
                          <img src={featured.imageUrl} alt={featured.title} className="h-full w-full object-cover" />
                        </div>
                        <CardContent className="md:col-span-2 space-y-4 p-6 md:p-8">
                          <Badge className="rounded-full bg-white/10 px-3 py-1 text-cyan-100">Featured article</Badge>
                          <h3 className="text-3xl font-semibold leading-tight">{featured.title}</h3>
                          <p className="text-sm leading-7 text-slate-300">{featured.excerpt}</p>
                          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-slate-400">
                            <span>{formatDate(featured.date)}</span>
                            <span>•</span>
                            <span>{featured.category}</span>
                          </div>
                          <Button onClick={() => readMore(featured)} className="h-11 rounded-full bg-primary px-5 text-white hover:bg-primary/90">
                            Read article <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                ) : null}

                {/* Latest Articles */}
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <h3 className="text-2xl font-semibold">Latest articles</h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <AnimatePresence mode="popLayout">
                      {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[360px] w-full rounded-[28px]" />)
                      ) : filteredBlogs.length > 0 ? (
                        filteredBlogs.map((post, index) => (
                          <motion.div key={post._id} layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
                            <Card className="group h-full overflow-hidden border-slate-200/80 bg-white/90 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-1">
                              <div className="relative aspect-[16/10] overflow-hidden">
                                <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => (e.target as HTMLImageElement).src = '/placeholder.svg'} />
                                <Badge className="absolute left-4 top-4 rounded-full bg-slate-950/75 px-3 py-1 text-white backdrop-blur">{post.category}</Badge>
                              </div>
                              <CardContent className="space-y-3 p-6">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5 text-primary" />
                                  {formatDate(post.date)}
                                </div>
                                <h4 className="text-xl font-semibold leading-tight">{post.title}</h4>
                                <p className="text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
                              </CardContent>
                              <CardFooter className="px-6 pb-6 pt-0">
                               <Button
  onClick={() => readMore(post)}
  variant="ghost"
  className="h-10 px-0 text-primary hover:text-primary hover:bg-transparent focus:bg-transparent active:bg-transparent shadow-none"
>
  Explore post <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
</Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center">
                          <h4 className="text-lg font-semibold">No articles found</h4>
                          <p className="mt-2 text-sm text-muted-foreground">Try a different search or category.</p>
                          <Button variant="outline" className="mt-6 rounded-full" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>
                            Clear filters
                          </Button>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-8">
                {/* Recommended */}
                <Card className="border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)]">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">Recommended</h3>
                  </div>
                  <div className="mt-5 space-y-4">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
                    ) : (
                      popular.map((post) => (
                        <button type="button" key={post._id} onClick={() => readMore(post)} className="flex w-full gap-4 rounded-2xl border border-slate-200/80 p-3 text-left transition hover:border-primary/20 hover:bg-primary/5">
                          <img src={post.imageUrl} alt={post.title} className="h-16 w-16 rounded-xl object-cover" />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold leading-snug text-slate-950 line-clamp-2">{post.title}</h4>
                            <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{formatDate(post.date)}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </Card>

                {/* Weekly Insights - WORKING BUTTON */}
                <Card className="relative overflow-hidden border-none bg-slate-950 p-6 text-white shadow-[0_34px_100px_-50px_rgba(15,23,42,0.9)]">
                  <div className="relative z-10">
                    <Badge className="rounded-full bg-white/10 px-3 py-1 text-cyan-100">
                      <Clock className="mr-2 h-3.5 w-3.5" />
                      Weekly insights
                    </Badge>
                    <h3 className="mt-4 text-2xl font-semibold">Stay updated with {appName}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      Get articles about learning workflows, AI tools, scheduling, and product updates.
                    </p>

                    <form onSubmit={handleSubscribe} className="mt-6 space-y-3">
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-primary"
                      />
                      <Button
                        type="submit"
                        disabled={isSubmitting || !email}
                        className="h-12 w-full rounded-full bg-white text-slate-950 font-semibold hover:bg-slate-100 disabled:opacity-70 transition-all"
                      >
                        {isSubmitting ? "Subscribing..." : "Subscribe"}
                      </Button>
                    </form>

                    <p className="mt-3 text-xs text-slate-400 italic text-center">
                      Weekly digest • Unsubscribe anytime
                    </p>
                  </div>
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                </Card>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Blog;