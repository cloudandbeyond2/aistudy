
// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Separator } from '@/components/ui/separator';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select';
// import { useToast } from '@/hooks/use-toast';
// import { FilePlus, Image, Check } from 'lucide-react';
// import SEO from '@/components/SEO';
// import { MinimalTiptapEditor } from '../../minimal-tiptap'
// import { Content } from '@tiptap/react'
// import { serverURL } from '@/constants';
// import axios from 'axios';

// const AdminCreateBlog = () => {
//   const [title, setTitle] = useState('');
//   const [excerpt, setExcerpt] = useState('');
//   const [content, setContent] = useState<Content>('');
//   const [category, setCategory] = useState('');
//   const [tags, setTags] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const { toast } = useToast();

//   // Handle image upload
//   const [coverImage, setCoverImage] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);

//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];

//       // Convert to Base64
//       const base64 = await convertToBase64(file);
//       setPreview(base64);
//       setCoverImage(file);
//     }
//   };

//   const convertToBase64 = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result as string);
//       reader.onerror = error => reject(error);
//     });
//   };

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const postURL = serverURL + '/api/createblog';
//       const response = await axios.post(postURL, { title, excerpt, content, image: preview, category, tags });
//       if (response.data.success) {
//         toast({
//           title: "Blog post created",
//           description: "Your blog post has been published successfully.",
//         });
//         // Reset form
//         setTitle('');
//         setExcerpt('');
//         setContent('');
//         setCategory('');
//         setTags('');
//         setCoverImage(null);
//         setIsSubmitting(false);
//       } else {
//         setIsSubmitting(false);
//         toast({
//           title: "Error",
//           description: "Internal Server Error",
//         });
//       }
//     } catch (error) {
//       console.error(error);
//       setIsSubmitting(false);
//       toast({
//         title: "Error",
//         description: "Internal Server Error",
//       });
//     }
//   };

//   return (
//     <>
//       <SEO
//         title="Create Blog Post"
//         description="Create and publish new blog content"
//         keywords="blog creation, content management, admin panel"
//       />

//       <div className="space-y-6">
//         <div>
//           <h1 className="text-2xl font-bold">Create Blog Post</h1>
//           <p className="text-muted-foreground">Create and publish new blog content</p>
//         </div>

//         <Separator />

//         <Card className="p-6">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="title">Blog Title</Label>
//                 <Input
//                   id="title"
//                   placeholder="Enter a compelling title..."
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   required
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="excerpt">Excerpt</Label>
//                 <Textarea
//                   id="excerpt"
//                   placeholder="Write a short summary..."
//                   value={excerpt}
//                   onChange={(e) => setExcerpt(e.target.value)}
//                   required
//                   rows={3}
//                 />
//                 <p className="text-sm text-muted-foreground mt-1">
//                   A brief description that appears in blog previews. Max 160 characters.
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="category">Category</Label>
//                   <Select value={category} onValueChange={setCategory} required>
//                     <SelectTrigger id="category">
//                       <SelectValue placeholder="Select a category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="technology">Technology</SelectItem>
//                       <SelectItem value="education">Education</SelectItem>
//                       <SelectItem value="ai">Artificial Intelligence</SelectItem>
//                       <SelectItem value="programming">Programming</SelectItem>
//                       <SelectItem value="design">Design</SelectItem>
//                       <SelectItem value="business">Business</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <Label htmlFor="tags">Tags</Label>
//                   <Input
//                     id="tags"
//                     placeholder="e.g. AI, learning, online courses"
//                     value={tags}
//                     onChange={(e) => setTags(e.target.value)}
//                   />
//                   <p className="text-sm text-muted-foreground mt-1">
//                     Separate tags with commas
//                   </p>
//                 </div>
//               </div>

//               <div>
//                 <Label htmlFor="coverImage">Cover Image</Label>
//                 <div className="mt-1 flex items-center">
//                   <label htmlFor="coverImage" className="cursor-pointer">
//                     <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-md overflow-hidden bg-muted/50 hover:bg-muted transition-colors">
//                       {coverImage ? (
//                         <div className="flex items-center">
//                           <Check className="h-5 w-5 text-green-500 mr-2" />
//                           <span>{coverImage.name}</span>
//                         </div>
//                       ) : (
//                         <div className="flex flex-col items-center text-muted-foreground">
//                           <Image className="h-12 w-12 mb-2" />
//                           <span className='px-2'>Upload cover image</span>
//                           <span className="text-xs mt-1">1200 x 630px</span>
//                         </div>
//                       )}
//                     </div>
//                     <input
//                       id="coverImage"
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                       className="sr-only"
//                     />
//                   </label>
//                 </div>
//               </div>

//               <div>
//                 <Label htmlFor="content">Blog Content</Label>
//                 <MinimalTiptapEditor
//                   value={content}
//                   onChange={setContent}
//                   className="w-full"
//                   editorContentClassName="p-5"
//                   output="html"
//                   placeholder="Start writing Blog Content."
//                   autofocus={true}
//                   editable={true}
//                   editorClassName="focus:outline-none"
//                 />
//                 <p className="text-sm text-muted-foreground mt-1">
//                   You can use Markdown formatting
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-4 justify-end">
//               <Button type="submit" disabled={isSubmitting}>
//                 {isSubmitting ? (
//                   "Publishing..."
//                 ) : (
//                   <>
//                     <FilePlus className="mr-2 h-4 w-4" />
//                     Publish Post
//                   </>
//                 )}
//               </Button>
//             </div>
//           </form>
//         </Card>
//       </div>
//     </>
//   );
// };

// export default AdminCreateBlog;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Image, Sparkles, Wand2, RefreshCw, Loader2 } from 'lucide-react';
import SEO from '@/components/SEO';
import { MinimalTiptapEditor } from '../../minimal-tiptap';
import { Content } from '@tiptap/react';
import { serverURL } from '@/constants';
import axios from 'axios';

const AdminCreateBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState<Content>('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // AI States
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);

  // =========================
  // LOAD SINGLE BLOG (EDIT MODE)
  // =========================
  useEffect(() => {
    if (!isEditMode) return;

    const fetchBlog = async () => {
      try {
        setIsLoading(true);

        // Better: you should create /api/getblog/:id in backend
        const res = await axios.get(`${serverURL}/api/getblogs`);
        const blog = res.data.find((b: any) => b._id === id);

        if (!blog) {
          toast({
            title: "Error",
            description: "Blog not found",
            variant: "destructive"
          });
          navigate('/admin/blogs');
          return;
        }

        setTitle(blog.title || '');
        setExcerpt(blog.excerpt || '');
        setContent(blog.content || '');
        setCategory(blog.category || '');
        setTags(blog.tags || '');
        if (blog.image) {
          setPreview(getImage(blog.image, blog.imageContentType));
        }

      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load blog",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [id, isEditMode, navigate, toast]);

  // =========================
  // AI FUNCTIONS
  // =========================
  const handleAIGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const res = await axios.post(`${serverURL}/api/generate-blog-content`, { prompt: aiPrompt });
      if (res.data.success) {
        const { title, excerpt, content, category, tags } = res.data.data;
        setTitle(title);
        setExcerpt(excerpt);
        setContent(content);
        setCategory(category.toLowerCase());
        setTags(tags);
        toast({
          title: "Blog Content Generated",
          description: "AI has successfully prepared your blog post.",
        });
        setIsAIModalOpen(false);
      } else {
        throw new Error(res.data.message);
      }
    } catch (error: any) {
      toast({
        title: "AI Generation Failed",
        description: error.message || "Failed to connect to AI service.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAISuggestTags = async () => {
    if (!title && !content) {
        toast({
            title: "Input Required",
            description: "Please enter a title or content first.",
            variant: "destructive"
        });
        return;
    }
    setIsSuggestingTags(true);
    try {
      const res = await axios.post(`${serverURL}/api/suggest-blog-tags`, { title, content });
      if (res.data.success) {
        setTags(res.data.tags);
        toast({
          title: "Tags Suggested",
          description: "Optimized SEO tags have been added.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to suggest tags",
        variant: "destructive"
      });
    } finally {
      setIsSuggestingTags(false);
    }
  };

  function getImage(image: any, imageContentType?: string) {
    if (!image) return null;
    const byteArray = image.data?.data || image.data || image;
    if (!byteArray || (Array.isArray(byteArray) && byteArray.length === 0)) return null;
    
    const base64String = byteArrayToBase64(byteArray);
    const mimeType = imageContentType || 'image/jpeg';
    return `data:${mimeType};base64,${base64String}`;
  }

  const byteArrayToBase64 = (byteArray: any) => {
    let binary = '';
    const bytes = new Uint8Array(byteArray);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // =========================
  // IMAGE HANDLING
  // =========================
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

    setPreview(base64);
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      toast({
        title: "Category required",
        description: "Please select a category",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isEditMode
        ? `${serverURL}/api/updateblogs`
        : `${serverURL}/api/createblog`;

      const payload = isEditMode
        ? { id, title, excerpt, content, image: preview, category, tags }
        : { title, excerpt, content, image: preview, category, tags };

      const response = await axios.post(endpoint, payload);

      if (!response.data.success) throw new Error();

      toast({
        title: isEditMode ? "Blog Updated" : "Blog Created",
        description: isEditMode
          ? "Blog updated successfully."
          : "Blog published successfully.",
      });

      navigate('/admin/blogs');

    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title={isEditMode ? "Edit Blog Post" : "Create Blog Post"}
        description="Create and manage blog content"
        keywords="blog, admin, content management"
      />

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {isEditMode ? "Edit Blog Post" : "Create Blog Post"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Update existing blog content"
                : "Create and publish new blog content"}
            </p>
          </div>
          {!isEditMode && (
              <Button 
                onClick={() => setIsAIModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none shadow-lg shadow-purple-500/20"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
          )}
        </div>

        <Separator />

        <Card className="p-6">
          {isLoading ? (
            <p className="text-muted-foreground">Loading blog...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* TITLE */}
              <div>
                <Label>Blog Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. The Future of AI in Education"
                />
              </div>

              {/* EXCERPT */}
              <div>
                <Label>Excerpt</Label>
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  required
                  placeholder="A short summary for previews..."
                />
              </div>

              {/* CATEGORY + TAGS */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="ai">Artificial Intelligence</SelectItem>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label>Tags</Label>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            onClick={handleAISuggestTags}
                            disabled={isSuggestingTags}
                        >
                            {isSuggestingTags ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Wand2 className="h-3 w-3 mr-1" />}
                            Suggest with AI
                        </Button>
                    </div>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="AI, LMS, certification (Comma separated)"
                  />
                </div>
              </div>

              {/* COVER IMAGE */}
              <div>
                <Label>Cover Image (1200x630)</Label>
                <label className="cursor-pointer block">
                  <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-xl bg-muted/50 overflow-hidden hover:bg-muted transition-colors mt-2">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Image className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="font-medium">Click to upload cover image</p>
                        <p className="text-xs opacity-60 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* CONTENT */}
              <div>
                <Label>Blog Content</Label>
                <div className="mt-2 border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <MinimalTiptapEditor
                    value={content}
                    onChange={setContent}
                    output="html"
                    placeholder="Start writing or use AI to generate content..."
                    />
                </div>
              </div>

              {/* BUTTON */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting} size="lg" className="px-8 font-bold rounded-full">
                  {isSubmitting
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                    : isEditMode
                      ? "Update Blog Post"
                      : "Publish Blog Post"}
                </Button>
              </div>

            </form>
          )}
        </Card>
      </div>

      {/* AI PROMPT DIALOG */}
      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Generate Blog with AI
            </DialogTitle>
            <DialogDescription>
              Describe the topic you want to write about. AI will generate a title, excerpt, category, and full content for you.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
                placeholder="e.g. Write a blog about the benefits of online learning for working professionals in 2025."
                className="min-h-[120px]"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAIModalOpen(false)}>Cancel</Button>
            <Button 
                onClick={handleAIGenerate} 
                disabled={!aiPrompt || isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Start Generation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminCreateBlog;