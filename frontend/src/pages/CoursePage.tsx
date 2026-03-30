
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Content } from '@tiptap/react'
import { MinimalTiptapEditor } from '../minimal-tiptap'
import YouTube from 'react-youtube';
import { Button } from '@/components/ui/button';
import { ChevronDown, Home, Share, Download, MessageCircle, ClipboardCheck, Menu, Award, Lock, CheckCircle2, Loader2, Sparkles, BookOpen, Image as ImageIcon, Brain, Video, FileText, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCoursePresentationMeta } from '@/lib/coursePresentation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { appLogo, companyName, serverURL, websiteURL } from '@/constants';
import axios from 'axios';
import ShareOnSocial from 'react-share-on-social';
import StyledText from '@/components/styledText';
import html2pdf from 'html2pdf.js';

// Fallback image utility - uses a working placeholder since source.unsplash.com is deprecated
const getFallbackImage = (topic: string, subtopic: string) => {
  // Use a reliable placeholder that displays the subtopic name
  return `https://placehold.co/800x600/4f46e5/ffffff?text=${encodeURIComponent(subtopic.substring(0, 40))}`;
};


// Add this function inside your CoursePage component
const cleanGeneratedHtml = (htmlContent) => {
  if (!htmlContent) return '';
  
  // Remove common unwanted wrapper tags like <html>, <body>, etc.
  let cleaned = htmlContent;
  
  // Remove <html> tags and their contents if they're wrapping everything
  cleaned = cleaned.replace(/<html[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/html>/gi, '');
  
  // Remove <body> tags
  cleaned = cleaned.replace(/<body[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/body>/gi, '');
  
  // Remove <head> tags and their contents
  cleaned = cleaned.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
  
  // Remove DOCTYPE declarations
  cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');
  
  // Remove XML declarations
  cleaned = cleaned.replace(/<\?xml[^>]*\?>/gi, '');
  
  // Remove meta tags
  cleaned = cleaned.replace(/<meta[^>]*>/gi, '');
  
  // Remove title tags
  cleaned = cleaned.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
  
  // Remove style tags
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove script tags
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove link tags
  cleaned = cleaned.replace(/<link[^>]*>/gi, '');
  
  // Remove unnecessary div wrappers if they're just wrapping content without classes
  // This preserves divs that have meaningful content or classes
  cleaned = cleaned.replace(/<div[^>]*>\s*<div[^>]*>/gi, '<div>');
  cleaned = cleaned.replace(/<\/div>\s*<\/div>/gi, '</div>');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
};
// Loading Popup Component
const LoadingPopup = ({ isOpen, stage, subtopic, progress = 0 }) => {
  const getStageContent = () => {
    switch(stage) {
      case 'video':
        return {
          icon: <Video className="w-8 h-8 text-red-500 animate-pulse" />,
          title: 'Searching Video',
          message: `Finding the best tutorial for "${subtopic}"`,
          details: 'Analyzing YouTube for high-quality content...',
          color: 'red'
        };
      case 'transcript':
        return {
          icon: <FileText className="w-8 h-8 text-orange-500 animate-bounce" />,
          title: 'Extracting Knowledge',
          message: `Processing video transcript for "${subtopic}"`,
          details: 'Summarizing key points for fast learning...',
          color: 'orange'
        };
      case 'theory':
        return {
          icon: <BookOpen className="w-8 h-8 text-blue-500 animate-pulse" />,
          title: 'Generating Content',
          message: `AI is creating learning material for "${subtopic}"`,
          details: 'This usually takes a few seconds...',
          color: 'blue'
        };
      case 'image':
        return {
          icon: <ImageIcon className="w-8 h-8 text-green-500 animate-bounce" />,
          title: 'Fetching Visuals',
          message: `Finding the perfect image for "${subtopic}"`,
          details: 'Optimizing visuals for better learning...',
          color: 'green'
        };
      case 'complete':
        return {
          icon: <Sparkles className="w-8 h-8 text-yellow-500 animate-spin" />,
          title: 'Finalizing',
          message: 'Polishing the content for best experience',
          details: 'Almost there...',
          color: 'yellow'
        };
      default:
        return {
          icon: <Brain className="w-8 h-8 text-purple-500 animate-pulse" />,
          title: 'AI is Thinking',
          message: `Preparing your subtopic "${subtopic}"`,
          details: 'This may take a few seconds...',
          color: 'purple'
        };
    }
  };

  const content = getStageContent();

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">
          {content.title}
        </DialogTitle>
        <div className="flex flex-col items-center py-8 px-4">
          {/* Animated Icon */}
          <div className={`relative mb-6`}>
            <div className={`absolute inset-0 rounded-full bg-${content.color}-500/20 animate-ping`}></div>
            <div className={`relative z-10 p-4 rounded-full bg-${content.color}-500/10`}>
              {content.icon}
            </div>
          </div>

          {/* Visible Title */}
          <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {content.title}
          </h2>

          {/* Message */}
          <p className="text-center text-muted-foreground mb-4">
            {content.message}
          </p>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
            <div 
              className={`h-full bg-${content.color}-500 transition-all duration-300 rounded-full`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Percentage */}
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {progress}% Complete
          </p>

          {/* Loading Details */}
          <div className="w-full space-y-3 mt-4">
            <div className="flex items-center gap-3">
              {progress === 100 ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
              <span className="text-sm">
                {progress === 100 ? 'Complete! Loading content...' : content.details}
              </span>
            </div>
            
            {/* Show skeletons only when not complete */}
            {progress < 100 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
            )}
            
            {/* Show success message when complete */}
            {progress === 100 && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400 text-center">
                  ✓ Content generated successfully!
                </p>
              </div>
            )}
          </div>

          {/* Fun Fact or Tip */}
          {progress < 100 && (
            <p className="text-xs text-muted-foreground/60 mt-6 italic">
              ✨ AI is crafting personalized content just for you...
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const QuizLoadingPopup = ({ isOpen, topic }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogTitle className="sr-only">
          Preparing Quiz
        </DialogTitle>
        <div className="flex flex-col items-center py-8 px-4">
          <div className="mb-6 rounded-full bg-primary/10 p-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">
            Preparing Quiz
          </h2>
          <p className="text-center text-muted-foreground mb-4">
            Generating the assessment for {topic || 'this course'}.
          </p>
          <div className="w-full rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
            Please wait while we collect course topics, build questions, and open the quiz page.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CoursePage = () => {
  //ADDED FROM v4.0
  const { state } = useLocation();
  const { courseId: paramCourseId } = useParams();
  const activeCourseId = state?.courseId || paramCourseId;
  const plan = sessionStorage.getItem('type');
  const [courseData, setCourseData] = useState(state || null);
  const [jsonData, setJsonData] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('jsonData'));
    } catch (e) {
      return null;
    }
  });

  // Loading Popup States
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [loadingStage, setLoadingStage] = useState('theory');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingSubtopic, setLoadingSubtopic] = useState('');
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  // OPTIMIZATION: Image cache and preloading
  const imageCache = useRef(new Set());
  const [preloadedImages, setPreloadedImages] = useState(new Map());
  const [imageLoading, setImageLoading] = useState(new Map());

  const mainTopic = courseData?.mainTopic;
  const type = courseData?.type;
  const courseId = courseData?.courseId || activeCourseId;
  const end = courseData?.end;
  const pass = courseData?.pass;
  const lang = courseData?.lang || 'English';
  const contentProfileId =
    jsonData?.course_meta?.contentProfile ||
    courseData?.jsonData?.course_meta?.contentProfile ||
    'learn_format';
  const contentProfileMeta = getCoursePresentationMeta(contentProfileId);
  const ContentProfileIcon = contentProfileMeta.icon;

  const [selected, setSelected] = useState('');
  const [theory, setTheory] = useState('');
  const [media, setMedia] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [isComplete, setIsCompleted] = useState(false);
  const [isQuizPassed, setIsQuizPassed] = useState(pass);
  const [quizAttemptSummary, setQuizAttemptSummary] = useState<any>(null);
  const [selectedTopicTitle, setSelectedTopicTitle] = useState('');
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const defaultMessage = `<p>Hey there! I'm your AI teacher. If you have any questions about your ${mainTopic || 'current'} course, whether it's about videos, images, or theory, just ask me. I'm here to clear your doubts.</p>`;
  const defaultPrompt = `I have a doubt about this topic :- ${mainTopic}. Please clarify my doubt in very short :- `;

  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<Content>('')
  const [completedSubtopics, setCompletedSubtopics] = useState([]);
  const [progressLoading, setProgressLoading] = useState(true);
  const userId = sessionStorage.getItem('uid');
  const userRole = sessionStorage.getItem('role');
  const isOrgAdmin = userRole === 'org_admin' || userRole === 'dept_admin' || sessionStorage.getItem('isOrganization') === 'true';

  // Optimization states
  const [preloadedNextContent, setPreloadedNextContent] = useState(null);
  
  // Simple cache for API responses
  const apiCache = useRef(new Map());

  // Helper function to test image URLs
  const testImageUrl = useCallback((url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Timeout after 3 seconds
      setTimeout(() => resolve(false), 3000);
    });
  }, []);

  // Progress simulation function
  const simulateProgress = useCallback((stage) => {
    setLoadingStage(stage);
    setLoadingProgress(0);
    
    // Clear any existing intervals
    if (window.progressInterval) {
      clearInterval(window.progressInterval);
    }
    
    // Create new interval with snappier progress
    window.progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        // If we're at 90% and stage is complete, let the timeout handle the jump to 100%
        if (stage === 'complete' && prev >= 90) {
          return prev; 
        }
        // Normal increment up to 90%
        if (prev < 90) {
          return prev + 10; // Faster increment for better feel
        }
        return prev; // Stay at 90 until actual completion
      });
    }, 400); // Faster interval (400ms instead of 800ms)

    return () => {
      if (window.progressInterval) {
        clearInterval(window.progressInterval);
      }
    };
  }, []);

  // OPTIMIZATION: Enhanced image preloader with queue and cache
  // const preloadImageWithCache = useCallback((url, subtopicTitle) => {
  //   if (!url || imageCache.current.has(url)) return;
    
  //   imageCache.current.add(url);
  //   setImageLoading(prev => new Map(prev).set(subtopicTitle, true));
    
  //   const img = new Image();
  //   img.onload = () => {
  //     setPreloadedImages(prev => new Map(prev).set(subtopicTitle, url));
  //     setImageLoading(prev => {
  //       const newMap = new Map(prev);
  //       newMap.delete(subtopicTitle);
  //       return newMap;
  //     });
  //   };
  //   img.onerror = () => {
  //     setImageLoading(prev => {
  //       const newMap = new Map(prev);
  //       newMap.delete(subtopicTitle);
  //       return newMap;
  //     });
  //   };
  //   img.src = url;
  // }, []);


  // OPTIMIZATION: Enhanced image preloader with queue and cache
const preloadImageWithCache = useCallback((url, subtopicTitle, topicTitle = '') => {
  if (!url || imageCache.current.has(url)) return;
  
  imageCache.current.add(url);
  setImageLoading(prev => new Map(prev).set(subtopicTitle, true));
  
  const img = new Image();
  img.onload = () => {
    setPreloadedImages(prev => new Map(prev).set(subtopicTitle, url));
    setImageLoading(prev => {
      const newMap = new Map(prev);
      newMap.delete(subtopicTitle);
      return newMap;
    });
  };
  img.onerror = () => {
    // If image fails, use a working placeholder
    const fallbackUrl = getFallbackImage(topicTitle || '', subtopicTitle);
    setPreloadedImages(prev => new Map(prev).set(subtopicTitle, fallbackUrl));
    setImageLoading(prev => {
      const newMap = new Map(prev);
      newMap.delete(subtopicTitle);
      return newMap;
    });
  };
  img.src = url;
}, []);
  // OPTIMIZATION: Preload all images for current and next topics
  const preloadAllImages = useCallback(() => {
    if (!jsonData || !mainTopic || !selected) return;
    
    const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
    if (!topicsList) return;
    
    // Flatten all subtopics
    const allSubtopics = [];
    topicsList.forEach(t => {
      t.subtopics.forEach(s => {
        allSubtopics.push({ 
          topicTitle: t.title, 
          subtopicTitle: s.title,
          image: s.image,
          theory: s.theory
        });
      });
    });

    // Find current index
    const currentIndex = allSubtopics.findIndex(s => s.subtopicTitle === selected);
    
    // Preload next 3 subtopics images
    for (let i = 1; i <= 3; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < allSubtopics.length) {
        const next = allSubtopics[nextIndex];
        if (next.image && !imageCache.current.has(next.image)) {
          preloadImageWithCache(next.image, next.subtopicTitle);
        }
      }
    }
  }, [jsonData, mainTopic, selected, preloadImageWithCache]);

  // Preload next subtopic content
  const preloadNextSubtopic = useCallback(async () => {
    if (!jsonData || !selected || !mainTopic || !lang || !userId) return;
    
    const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
    if (!topicsList) return;
    
    const allSubtopics = [];
    topicsList.forEach(t => {
      t.subtopics.forEach(s => {
        allSubtopics.push({ topicTitle: t.title, subtopicTitle: s.title, subtopic: s });
      });
    });

    const currentIndex = allSubtopics.findIndex(s => s.subtopicTitle === selected);
    if (currentIndex < allSubtopics.length - 1) {
      const next = allSubtopics[currentIndex + 1];
      
      // If next subtopic doesn't have content, pre-generate it
      if (!next.subtopic.theory) {
        if (type === 'video & text course') {
          // Optimization: Background video generation
          if (!next.subtopic.youtube) {
            try {
              const query = `${next.subtopicTitle} ${mainTopic} in english`;
              // Call video search in background (we don't wait for it)
              axios.post(serverURL + '/api/yt', { prompt: query }).then(res => {
                if (res.data?.url) {
                  // Silently update YouTube ID
                  updateLocalCache(next.topicTitle, next.subtopicTitle, { youtube: res.data.url });
                }
              });
            } catch (e) {
              console.error("Background video search failed:", e);
            }
          }
        } else {
          try {
            const res = await axios.post(serverURL + '/api/generate-batch', {
              mainTopic,
              topicsList: [{
                topicTitle: next.topicTitle,
                subtopics: [next.subtopicTitle]
              }],
              lang,
              userId,
              contentProfile: contentProfileId
            });
            
            if (res.data.success && res.data.topics[0]) {
              setPreloadedNextContent({
                topicTitle: next.topicTitle,
                subtopicTitle: next.subtopicTitle,
                theory: res.data.topics[0].subtopics[0].theory
              });
              
              // Also preload image if available
              if (res.data.topics[0].subtopics[0].image) {
                preloadImageWithCache(res.data.topics[0].subtopics[0].image, next.subtopicTitle);
              }
            }
          } catch (error) {
            console.error("Preload failed:", error);
          }
        }
      } else if (next.subtopic.image) {
        // Preload image if content exists
        preloadImageWithCache(next.subtopic.image, next.subtopicTitle);
      }
    }
  }, [contentProfileId, jsonData, selected, mainTopic, lang, userId, preloadImageWithCache]);

  // Cached API call
  const cachedApiCall = async (url, data, cacheKey) => {
    if (apiCache.current.has(cacheKey)) {
      return apiCache.current.get(cacheKey);
    }
    
    const response = await axios.post(url, data);
    apiCache.current.set(cacheKey, response);
    return response;
  };

  const buildStyledTheoryPrompt = useCallback((subtopicTitle, transcriptText = '') => {
    const transcriptSection = transcriptText
      ? `Use the following transcript as supporting context and ignore any intro, outro, like, subscribe, or sponsor filler:\n${transcriptText}\n`
      : '';

    return `Strictly in ${lang}, you are creating lesson content for the course "${mainTopic}".
Presentation style: ${contentProfileMeta.label}
Style guidance: ${contentProfileMeta.promptInstruction}

Create a complete lesson for the subtopic "${subtopicTitle}".
${transcriptSection}
Requirements:
- Keep the content focused on "${subtopicTitle}".
- Use natural, human teaching language instead of generic AI-style phrasing.
- Return clean educational HTML only.
- Include examples in the selected presentation style.
- Do not include external links, image links, or AI disclaimers.`;
  }, [contentProfileMeta.label, contentProfileMeta.promptInstruction, lang, mainTopic]);

  // OPTIMIZATION: Preload when selected changes
  useEffect(() => {
    if (selected && jsonData) {
      preloadNextSubtopic();
      preloadAllImages();
    }
  }, [selected, jsonData, preloadNextSubtopic, preloadAllImages]);

  // OPTIMIZATION: Preload current media if not loaded
  useEffect(() => {
    if (media && !imageCache.current.has(media) && type !== 'video & text course') {
      preloadImageWithCache(media, selected);
    }
  }, [media, selected, preloadImageWithCache, type]);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseData && activeCourseId) {
        const requesterId = sessionStorage.getItem('uid') || '';
        if (!requesterId) {
          window.location.href = `${websiteURL}/login`;
          return;
        }

        setIsLoading(true);
        try {
          const requesterRole = sessionStorage.getItem('role') || '';
          const organizationId = sessionStorage.getItem('orgId') || '';

          const response = await axios.get(`${serverURL}/api/shareable`, {
            params: {
              id: activeCourseId,
              requesterId,
              requesterRole,
              organizationId
            }
          });
          if (response.data && response.data.length > 0) {
            const course = response.data[0];
            const content = JSON.parse(course.content);

            // Fallback: if mainTopic is missing, try to extract from content
            let mainTopicValue = course.mainTopic;
            if (!mainTopicValue) {
              // Try to get from course_topics or first topic
              if (content && content['course_topics'] && content['course_topics'].length > 0) {
                mainTopicValue = content['course_topics'][0].title;
              } else {
                // Find first key that has topics array
                for (const key in content) {
                  if (Array.isArray(content[key]) && content[key].length > 0) {
                    mainTopicValue = content[key][0].title;
                    break;
                  }
                }
              }
            }

            const newCourseData = {
              mainTopic: mainTopicValue,
              type: course.type,
              courseId: course._id,
              end: course.end,
              pass: course.completed,
              lang: 'English'
            };

            setJsonData(content);
            sessionStorage.setItem('jsonData', JSON.stringify(content));
            setCourseData(newCourseData);

            if (content) {
              const mainTopicData = (content['course_topics'] || content[(mainTopicValue || '').toLowerCase()])?.[0];
              if (mainTopicData && mainTopicData.subtopics && mainTopicData.subtopics.length > 0) {
                const firstSubtopic = mainTopicData.subtopics[0];
                setSelectedTopicTitle(mainTopicData.title);
                setSelected(firstSubtopic.title);
                setTheory(firstSubtopic.theory);
                if (course.type === 'video & text course') {
                  setMedia(firstSubtopic.youtube);
                } else {
                  setMedia(firstSubtopic.image);
                  // Preload first image
                  if (firstSubtopic.image) {
                    preloadImageWithCache(firstSubtopic.image, firstSubtopic.title);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch course data:", error);
          if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status || 0)) {
            window.location.href = `${websiteURL}/login`;
            return;
          }
        } finally {
          setIsLoading(false);
        }
      } else if (courseData) {
        setIsLoading(false);
      }
    };
    fetchCourseData();
  }, [activeCourseId, courseData, preloadImageWithCache]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (courseId && userId) {
        try {
          const res = await axios.get(`${serverURL}/api/progress?userId=${userId}&courseId=${courseId}`);
          if (res.data.success) {
            setCompletedSubtopics(res.data.progress.completedSubtopics || []);
            // Set percentage from backend initially
            setPercentage(res.data.progress.percentage || 0);
          }
        } catch (error) {
          console.error("Failed to fetch progress:", error);
        } finally {
          setProgressLoading(false);
        }
      } else {
        setProgressLoading(false);
      }
    };
    fetchProgress();
  }, [courseId, userId]);

  async function getNotes() {
    try {
      const postURL = serverURL + '/api/getnotes';
      const response = await axios.post(postURL, { course: courseId });
      if (response.data.success) {
        setValue(response.data.message);
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSaveNote = async () => {
    setSaving(true);
    const postURL = serverURL + '/api/savenotes';
    const response = await axios.post(postURL, { course: courseId, notes: value });
    if (response.data.success) {
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully.",
      });
      setIsNotesOpen(false); // Close the notes popup after successful save
    } else {
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
    }
    setSaving(false);
  };

  // Loading skeleton for course content
  const CourseContentSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-8 w-3/4 mb-8" />
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-1/2 mb-4" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <div>
          <Skeleton className="h-7 w-1/3 mb-4" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-5/6" />
        </div>
        <div>
          <Skeleton className="h-7 w-2/5 mb-4" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-36 w-full rounded-md bg-muted/30" />
        </div>
      </div>
    </div>
  );

  //FROM v4.0
  const opts = {
    height: '390',
    width: '640',
  };

  const optsMobile = {
    height: '250px',
    width: '100%',
  };

  const isSubtopicUnlocked = (topicTitle, subtopicTitle) => {
    if (isOrgAdmin) return true;
    if (!jsonData) return false;

    const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
    if (!Array.isArray(topicsList)) return false;
    
    // Flatten all subtopics to check order
    const allSubtopics = [];
    topicsList.forEach(t => {
      if (Array.isArray(t.subtopics)) {
        t.subtopics.forEach(s => {
          allSubtopics.push({ topicTitle: t.title, subtopicTitle: s.title });
        });
      }
    });

    const currentIndex = allSubtopics.findIndex(s => s.topicTitle === topicTitle && s.subtopicTitle === subtopicTitle);
    
    // First subtopic is always unlocked
    if (currentIndex === 0) return true;

    // Check if previous subtopic is completed
    const prevSubtopic = allSubtopics[currentIndex - 1];
    const isPrevCompleted = completedSubtopics.some(
      s => s.topicTitle === prevSubtopic.topicTitle && s.subtopicTitle === prevSubtopic.subtopicTitle
    );

    // Also check if current subtopic is already completed (unlock completed lessons)
    const isCurrentCompleted = completedSubtopics.some(
      s => s.topicTitle === topicTitle && s.subtopicTitle === subtopicTitle
    );

    return isPrevCompleted || isCurrentCompleted;
  };

  const handleMarkAsComplete = async () => {
    if (!userId || !courseId || !currentLesson) return;

    const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
    const activeTopicTitle = currentLesson.topicTitle;
    const activeSubtopicTitle = currentLesson.subtopicTitle;
    const alreadyCompleted = completedSubtopics.some(
      (entry) => entry.topicTitle === activeTopicTitle && entry.subtopicTitle === activeSubtopicTitle
    );
    if (alreadyCompleted) {
      if (nextLesson) {
        selectSubtopic(nextLesson.topicTitle, nextLesson.subtopicTitle);
      }
      return;
    }

    let total = 0;
    topicsList.forEach(t => total += t.subtopics.length);

    try {
      const res = await axios.post(`${serverURL}/api/progress/update`, {
        userId,
        courseId,
        topicTitle: activeTopicTitle,
        subtopicTitle: activeSubtopicTitle,
        totalSubtopics: total
      });

      if (res.data.success) {
        const updatedCompletedSubtopics = res.data.progress.completedSubtopics || [];
        setCompletedSubtopics(updatedCompletedSubtopics);
        setPercentage(res.data.progress.percentage);

        // --- LOGIC TO MOVE TO NEXT SUBTOPIC ---
        if (nextLesson) {
          selectSubtopic(nextLesson.topicTitle, nextLesson.subtopicTitle);

          // Scroll to top for the new lesson
          if (mainContentRef.current) {
            mainContentRef.current.scrollTop = 0;
          }
        } else {
          toast({
            title: "Course Completed!",
            description: "You've finished all lessons. You can now take the quiz.",
          });
        }
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const jsonValue = sessionStorage.getItem(mainTopic);
      if (jsonValue !== null) {
        // Ensure all historical messages have an id if they don't already
        const savedMessages = JSON.parse(jsonValue).map((msg, index) => ({
          ...msg,
          id: msg.id || `msg-${Date.now()}-${index}`
        }));
        setMessages(savedMessages);
      } else {
        const initialMessages = [{ id: `msg-${Date.now()}`, text: defaultMessage, sender: 'bot' }];
        setMessages(initialMessages);
        await storeLocal(initialMessages);
      }
    } catch (error) {
      console.error(error);
    }
  };

  async function storeLocal(messages) {
    try {
      sessionStorage.setItem(mainTopic, JSON.stringify(messages));
    } catch (error) {
      console.error(error);
    }
  }

  const sendMessage = async () => {
    if (newMessage.trim() === '' || isChatLoading) return;

    const userMessage = { id: `msg-${Date.now()}`, text: newMessage, sender: 'user' };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await storeLocal(updatedMessages);
    setNewMessage('');
    setIsChatLoading(true);

    const mainPrompt = defaultPrompt + newMessage;
    const dataToSend = { prompt: mainPrompt };
    const url = serverURL + '/api/chat';

    try {
      const response = await axios.post(url, dataToSend);
      if (response.data.success === false) {
        toast({
          title: "Assistant Error",
          description: response.data.message || "Failed to get a response.",
        });
      } else {
        const botMessage = { id: `bot-${Date.now()}`, text: response.data.text, sender: 'bot' };
        const updatedMessagesWithBot = [...updatedMessages, botMessage];
        setMessages(updatedMessagesWithBot);
        await storeLocal(updatedMessagesWithBot);
      }
    } catch (error) {
      toast({
        title: "Assistant Error",
        description: "Communication failure with AI assistant.",
      });
      console.error(error);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (mainTopic) {
      CountDoneTopics();
    }
  }, [isQuizPassed, completedSubtopics, jsonData, isOrgAdmin]);

  const CountDoneTopics = (passed = isQuizPassed) => {
    if (isOrgAdmin || passed) {
      setPercentage(100);
      setIsCompleted(true);
      return;
    }

    if (!jsonData) return;

    let doneCount = 0;
    let totalTopics = 0;

    const topicsData = jsonData['course_topics'] || (mainTopic ? jsonData[mainTopic.toLowerCase()] : []);
    if (!Array.isArray(topicsData)) return;

    topicsData.forEach((topic) => {
      if (Array.isArray(topic.subtopics)) {
        topic.subtopics.forEach((subtopic) => {
          const isDone = completedSubtopics.some(
            s => s.topicTitle === topic.title && s.subtopicTitle === subtopic.title
          );
          if (isDone) {
            doneCount++;
          }
          totalTopics++;
        });
      }
    });

    // Subtopic-only percentage (matches server logic)
    const completionPercentage = totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0;
    const finalPercentage = Math.min(completionPercentage, 99);
    setPercentage(finalPercentage);
    if (finalPercentage >= 100) {
      setIsCompleted(true);
    }
  }

  // Add this helper function outside CoursePage or inside as a useCallback
  const updateLocalCache = (clickedTopic, clickedSub, updates) => {
    const updatedData = { ...jsonData };
    const topicsList = updatedData['course_topics'] || updatedData[mainTopic?.toLowerCase()];
    const targetSub = topicsList?.find(t => t.title === clickedTopic)?.subtopics.find(s => s.title === clickedSub);
    
    if (targetSub) {
      Object.assign(targetSub, updates);
      setJsonData(updatedData);
      sessionStorage.setItem('jsonData', JSON.stringify(updatedData));
    }
  };

  const isSubtopicReadyForDisplay = (subtopic) => {
    if (!subtopic?.theory) return false;
    if (subtopic.theory.length < 300) return false;
    return type === 'video & text course'
      ? !!subtopic.youtube
      : !!subtopic.image;
  };

  const startSubtopicPreparation = (topicTitle, subtopicTitle, subtopicData) => {
    setShowLoadingPopup(true);
    setLoadingSubtopic(subtopicTitle);
    setLoadingProgress(0);
    setSelectedTopicTitle(topicTitle);
    setSelected(subtopicTitle);

    if (subtopicData?.theory) {
      setTheory(subtopicData.theory);
      setMedia(type === 'video & text course' ? subtopicData.youtube || '' : subtopicData.image || '');
    } else {
      setTheory(`<div class="prose dark:prose-invert max-w-none">
        <h2>${subtopicTitle}</h2>
        <p>AI is crafting personalized content for you...</p>
        <div class="flex items-center justify-center p-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>`);
      setMedia(null);
    }

    if (type === 'video & text course') {
      sendVideo(`${subtopicTitle} ${mainTopic}`, topicTitle, subtopicTitle, subtopicTitle);
    } else if (subtopicData?.theory) {
      sendImageForBatch(`${subtopicTitle} in ${mainTopic}`, topicTitle, subtopicTitle, subtopicData.theory);
    } else {
      sendBulkCourseContent(topicTitle, subtopicTitle);
    }
  };

async function sendBulkCourseContent(clickedTopic, clickedSub) {
  setShowLoadingPopup(true);
  setLoadingSubtopic(clickedSub);
  
  // Start theory generation progress
  const clearTheoryProgress = simulateProgress('theory');
  
  // Instant UI Feedback - show loading state
  setSelectedTopicTitle(clickedTopic);
  setSelected(clickedSub);
  setTheory(`<div class="prose dark:prose-invert max-w-none">
    <h2>${clickedSub}</h2>
    <p>AI is crafting personalized content for you...</p>
    <div class="flex items-center justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  </div>`);
  
  // Set a subtle placeholder for image
  setMedia(null);
  
  try {
    // Theory generation
    const theoryPayload = {
      mainTopic,
      topicsList: [{ topicTitle: clickedTopic, subtopics: [clickedSub] }],
      lang,
      userId,
      contentProfile: contentProfileId
    };
    
    const theoryRes = await axios.post(serverURL + '/api/generate-batch', theoryPayload);
    
    // IMPORTANT: Update theory content FIRST before handling images
    if (theoryRes.data && theoryRes.data.success && theoryRes.data.topics && theoryRes.data.topics[0]) {
      const newTheory = theoryRes.data.topics[0].subtopics[0].theory;
      
      // Set theory content immediately - this should display your example text
  // Set theory content immediately - this should display your example text
const cleanedTheory = cleanGeneratedHtml(newTheory);
setTheory(cleanedTheory);
updateLocalCache(clickedTopic, clickedSub, { theory: cleanedTheory, done: true });
    }
    
    // Switch to image loading stage (but don't block content display)
    clearTheoryProgress();
    simulateProgress('image');
    
    // Fetch image in background - don't let image failure block theory display
    const imagePrompt = `${clickedSub} in ${mainTopic}`;
    try {
      const imageRes = await axios.post(serverURL + '/api/image', { prompt: imagePrompt }, { timeout: 10000 });
      if (imageRes.data?.url) {
        setMedia(imageRes.data.url);
        updateLocalCache(clickedTopic, clickedSub, { image: imageRes.data.url });
      } else {
        // Don't set a generic placeholder - just leave media as null
        setMedia(null);
      }
    } catch (imageErr) {
      console.error("Image fetch failed:", imageErr);
      // Keep media as null - theory content will display normally
      setMedia(null);
    }
    
    updateCourse();
    
    // Complete the loading process
    simulateProgress('complete');
    setLoadingProgress(100);
    
    setTimeout(() => {
      setShowLoadingPopup(false);
      if (window.progressInterval) {
        clearInterval(window.progressInterval);
      }
    }, 1500);
    
  } catch (error) {
    console.error("Theory generation failed:", error);
    setTheory(`<div class="prose dark:prose-invert max-w-none">
      <h2>${clickedSub}</h2>
      <p>Sorry, we encountered an error loading the content. Please try again.</p>
    </div>`);
    setShowLoadingPopup(false);
    if (window.progressInterval) {
      clearInterval(window.progressInterval);
    }
  }
}

  // sendImageForBatch is called inside sendBulkCourseContent
      
  //     // Try to get AI-generated image first, but with better error handling
  //     let imageUrl = '';
      
  //     try {
  //       // Add timeout to prevent hanging
  //       const controller = new AbortController();
  //       const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
  //       const postURL = serverURL + '/api/image';
  //       const res = await axios.post(postURL, { prompt: promptImage }, {
  //         signal: controller.signal,
  //         timeout: 8000 // 8 second timeout
  //       }).catch(error => {
  //         console.error("Image API error:", error);
  //         return { data: { url: null } };
  //       });
        
  //       clearTimeout(timeoutId);
  //       imageUrl = res.data?.url || '';
  //     } catch (apiError) {
  //       console.error("Image generation failed:", apiError);
  //       imageUrl = '';
  //     }
      
  //     // If AI image generation failed or returned empty, use Unsplash
  //     if (!imageUrl) {
  //       console.log("Using Unsplash fallback for:", sub);
        
  //       // Try multiple Unsplash queries for better results
  //       const fallbackQueries = [
  //         `${sub} ${mainTopic}`,
  //         sub,
  //         `${mainTopic} concept`,
  //         'education learning'
  //       ];
        
  //       // Use the first one that works
  //       imageUrl = `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(fallbackQueries[0])}`;
  //     }
      
  //     // Update image in cache immediately
  //     if (imageUrl) {
  //       preloadImageWithCache(imageUrl, sub);
  //       setMedia(imageUrl);
  //     }
      
  //     // Find the subtopic and update its image
  //     const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
  //     if (topicsList) {
  //       const mTopic = topicsList.find((t: any) => t.title === topics);
  //       const mSubTopic = mTopic?.subtopics.find((s: any) => s.title === sub);
        
  //       if (mSubTopic) {
  //         mSubTopic.image = imageUrl;
  //         mSubTopic.done = true;
          
  //         // Save to sessionStorage and update course
  //         sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
  //         updateCourse();
  //       }
  //     }
      
  //     setImageLoading(prev => {
  //       const newMap = new Map(prev);
  //       newMap.delete(sub);
  //       return newMap;
  //     });
      
  //     setIsLoading(false);
      
  //   } catch (error) {
  //     console.error("Image generation error:", error);
      
  //     // Multiple fallback strategies
  //     let fallbackUrl = '';
      
  //     try {
  //       // Try Unsplash with different query combinations
  //       const fallbackQueries = [
  //         `${sub} ${mainTopic}`,
  //         sub,
  //         `${mainTopic} concept`,
  //         'education',
  //         'learning',
  //         'study'
  //       ];
        
  //       // Try each query until one works
  //       for (const query of fallbackQueries) {
  //         const testUrl = `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(query)}`;
          
  //         // Test if image loads (simple check)
  //         const img = new Image();
  //         await new Promise((resolve, reject) => {
  //           img.onload = resolve;
  //           img.onerror = reject;
  //           img.src = testUrl;
            
  //           // Timeout after 2 seconds
  //           setTimeout(reject, 2000);
  //         }).catch(() => {
  //           // Continue to next query
  //           return;
  //         });
          
  //         fallbackUrl = testUrl;
  //         break;
  //       }
  //     } catch (fallbackError) {
  //       console.error("All fallbacks failed:", fallbackError);
  //     }
      
  //     // Ultimate fallback - use a reliable placeholder service
  //     if (!fallbackUrl) {
  //       fallbackUrl = `https://picsum.photos/800/600?random=${encodeURIComponent(sub)}`;
  //     }
      
  //     setMedia(fallbackUrl);
      
  //     // Update the cache with fallback
  //     const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
  //     if (topicsList) {
  //       const mTopic = topicsList.find((t: any) => t.title === topics);
  //       const mSubTopic = mTopic?.subtopics.find((s: any) => s.title === sub);
        
  //       if (mSubTopic) {
  //         mSubTopic.image = fallbackUrl;
  //         mSubTopic.done = true;
  //         sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
  //       }
  //     }
      
  //     setImageLoading(prev => {
  //       const newMap = new Map(prev);
  //       newMap.delete(sub);
  //       return newMap;
  //     });
      
  //     setIsLoading(false);
  //   }
  // }


  async function sendImageForBatch(promptImage: string, topics: string, sub: string, theory: string) {
  try {
    setShowLoadingPopup(true);
    setLoadingSubtopic(sub);
    setLoadingProgress(0);
    simulateProgress('image');

    // Show theory immediately
    setSelectedTopicTitle(topics || currentTopicTitle || '');
    setSelected(sub);
    setTheory(theory);
    
    setImageLoading(prev => new Map(prev).set(sub, true));
    
    // Create a descriptive prompt using topic and subtopic for the /api/image endpoint
    const topicContext = topics || mainTopic;
    const imageSearchPrompt = `${sub} in ${topicContext}`;
    
    let imageUrl = '';
    
    try {
      // Call the backend /api/image endpoint (uses Unsplash API + GIS fallback)
      const postURL = serverURL + '/api/image';
      const res = await axios.post(postURL, { 
        prompt: imageSearchPrompt 
      }, {
        timeout: 10000
      }).catch(error => {
        console.error("Image API error:", error);
        return { data: { url: null } };
      });
      
      imageUrl = res.data?.url || '';
    } catch (apiError) {
      console.error("Image generation failed:", apiError);
      imageUrl = '';
    }
    
    // If /api/image failed, use a working placeholder
    if (!imageUrl) {
      console.log("Using placeholder fallback for:", sub);
      imageUrl = getFallbackImage(topicContext, sub);
    }
    
    // Update image in cache immediately
    if (imageUrl) {
      preloadImageWithCache(imageUrl, sub, topicContext);
      setMedia(imageUrl);
    }
    
    // Find the subtopic and update its image
    const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
    if (topicsList) {
      const mTopic = topicsList.find((t: any) => t.title === topics);
      const mSubTopic = mTopic?.subtopics.find((s: any) => s.title === sub);
      
      if (mSubTopic) {
        mSubTopic.image = imageUrl;
        mSubTopic.done = true;
        
        // Save to sessionStorage and update course
        sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
        updateCourse();
      }
    }
    
    setImageLoading(prev => {
      const newMap = new Map(prev);
      newMap.delete(sub);
      return newMap;
    });

    simulateProgress('complete');
    setLoadingProgress(100);
    setTimeout(() => {
      setShowLoadingPopup(false);
      if (window.progressInterval) {
        clearInterval(window.progressInterval);
      }
    }, 1500);
    
    setIsLoading(false);
    
  } catch (error) {
    console.error("Image generation error:", error);
    
    // Ultimate fallback with topic and subtopic context
    const topicContext = topics || mainTopic;
    const fallbackUrl = getFallbackImage(topicContext, sub);
    
    setMedia(fallbackUrl);
    
    // Update the cache with fallback
    const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
    if (topicsList) {
      const mTopic = topicsList.find((t: any) => t.title === topics);
      const mSubTopic = mTopic?.subtopics.find((s: any) => s.title === sub);
      
      if (mSubTopic) {
        mSubTopic.image = fallbackUrl;
        mSubTopic.done = true;
        sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
      }
    }
    
    setImageLoading(prev => {
      const newMap = new Map(prev);
      newMap.delete(sub);
      return newMap;
    });

    setShowLoadingPopup(false);
    if (window.progressInterval) {
      clearInterval(window.progressInterval);
    }
    
    setIsLoading(false);
  }
}
  const selectSubtopic = useCallback((topicTitle, subtopicTitle) => {
    if (!jsonData) return;

    const topicsList = jsonData['course_topics'] || jsonData[mainTopic.toLowerCase()];
    const mTopic = topicsList.find(topic => topic.title === topicTitle);
    const mSubTopic = mTopic?.subtopics.find(subtopic => subtopic.title === subtopicTitle);

    if (!mSubTopic) return;

    // Clear any existing intervals
    if (window.progressInterval) {
      clearInterval(window.progressInterval);
    }

    // INSTANT: Change the title
    setSelectedTopicTitle(topicTitle);
    setSelected(subtopicTitle);

    if (isSubtopicReadyForDisplay(mSubTopic)) {
      // CACHE HIT: Show immediately
      setTheory(mSubTopic.theory);
      setMedia(type === 'video & text course' ? mSubTopic.youtube : mSubTopic.image);
    } else {
      startSubtopicPreparation(topicTitle, subtopicTitle, mSubTopic);
    }
  }, [jsonData, mainTopic, type]);

  const handleSelect = useCallback((topicTitle, subtopicTitle) => {
    if (!isSubtopicUnlocked(topicTitle, subtopicTitle)) {
      toast({ title: "Lesson Locked", description: "Complete previous lessons to unlock this one." });
      return;
    }

    selectSubtopic(topicTitle, subtopicTitle);
  }, [isSubtopicUnlocked, selectSubtopic]);

  async function sendPrompt(prompt, promptImage, topics, sub) {
    const dataToSend = {
      prompt: prompt,
    };
    try {
      const postURL = serverURL + '/api/generate';
      const res = await axios.post(postURL, dataToSend);
      const generatedText = res.data.generatedText;
      const htmlContent = generatedText;
      try {
        const parsedJson = htmlContent;
        sendImage(parsedJson, promptImage, topics, sub);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
        setIsLoading(false);
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function sendImage(parsedJson, promptImage, topics, sub) {
    const dataToSend = {
      prompt: promptImage,
    };
    try {
      const postURL = serverURL + '/api/image';
      const res = await axios.post(postURL, dataToSend);
      try {
        const generatedText = res.data.url;
        sendData(generatedText, parsedJson, topics, sub);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
        setIsLoading(false);
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function sendData(image, theory, topics, sub) {
    const topicsList =
      jsonData?.course_topics ||
      jsonData?.[mainTopic?.toLowerCase()];

    if (!topicsList) {
      console.error('Topics list not found', jsonData);
      setIsLoading(false);
      return;
    }

    const mTopic = topicsList.find(topic => topic.title === topics);

    if (!mTopic) {
      console.error('Main topic not found:', topics);
      setIsLoading(false);
      return;
    }

    const mSubTopic = mTopic.subtopics?.find(
      subtopic => subtopic.title === sub
    );

    if (!mSubTopic) {
      console.error('Subtopic not found:', sub);
      setIsLoading(false);
      return;
    }

    // ✅ SAFE TO MUTATE NOW
    // mSubTopic.theory = theory;
    // mSubTopic.image = image;
    const cleanedTheory = cleanGeneratedHtml(theory);
mSubTopic.theory = cleanedTheory;
mSubTopic.image = image;
    mSubTopic.done = true;

    // Batch update all states at once
    setSelectedTopicTitle(topics);
    setSelected(mSubTopic.title);
    setTheory(theory);
    setMedia(image); // Always set media here

    setIsLoading(false);
    
    // Save to sessionStorage and update course
    sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
    updateCourse();
  }

  async function sendDataVideo(image, theory, topics, sub) {
    const topicsList =
      jsonData?.course_topics ||
      jsonData?.[mainTopic?.toLowerCase()];

    if (!topicsList) {
      setIsLoading(false);
      return;
    }

    const mTopic = topicsList.find(topic => topic.title === topics);
    if (!mTopic) {
      setIsLoading(false);
      return;
    }

    const mSubTopic = mTopic.subtopics?.find(
      subtopic => subtopic.title === sub
    );

    if (!mSubTopic) {
      setIsLoading(false);
      return;
    }

    mSubTopic.theory = theory;
    mSubTopic.youtube = image;
    mSubTopic.done = true;

    setSelectedTopicTitle(topics);
    setSelected(mSubTopic.title);
    setTheory(theory);
    setMedia(image);

    setIsLoading(false);
    updateCourse();
  }

  async function updateCourse() {
    CountDoneTopics();
    sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
    try {
      const viewerRole = sessionStorage.getItem('role') || '';
      const isOrgEditor = viewerRole === 'org_admin' || viewerRole === 'dept_admin';
      const isOrgManagedCourse = Boolean(jsonData?.course_meta?.organizationManaged);

      if (isOrgManagedCourse) {
        if (!isOrgEditor) {
          return;
        }

        const orgTopics = (Array.isArray(jsonData?.course_topics) ? jsonData.course_topics : []).map((topic: any, topicIndex: number) => ({
          title: topic?.title || `Module ${topicIndex + 1}`,
          order: topicIndex + 1,
          subtopics: (Array.isArray(topic?.subtopics) ? topic.subtopics : []).map((subtopic: any, subtopicIndex: number) => ({
            title: subtopic?.title || `Lesson ${subtopicIndex + 1}`,
            content: subtopic?.theory || subtopic?.content || '',
            videoUrl: subtopic?.youtube || subtopic?.videoUrl || '',
            diagram: subtopic?.image || subtopic?.diagram || '',
            order: subtopicIndex + 1
          }))
        }));

        await axios.put(`${serverURL}/api/org/course/${courseId}`, {
          title: jsonData?.course_title || mainTopic || '',
          description: jsonData?.course_details || '',
          type,
          topics: orgTopics,
          quizzes: Array.isArray(jsonData?.quizzes) ? jsonData.quizzes : [],
          quizSettings: jsonData?.quizSettings || {},
          courseMeta: jsonData?.course_meta || {},
          updatedBy: sessionStorage.getItem('uid')
        });
        return;
      }

      await axios.post(serverURL + '/api/update', {
        content: JSON.stringify(jsonData),
        courseId: courseId
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function sendVideo(query, mTopic, mSubTopic, subtop) {
    const dataToSend = {
      prompt: query,
    };
  const stopSim = simulateProgress('video');
  try {
    const postURL = serverURL + '/api/yt';
    const res = await axios.post(postURL, dataToSend);

    try {
      const generatedText = res.data.url;
      stopSim();
      sendTranscript(generatedText, mTopic, mSubTopic, subtop);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
        setIsLoading(false);
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function sendTranscript(url, mTopic, mSubTopic, subtop) {
    const dataToSend = {
      prompt: url,
    };
  const stopSim = simulateProgress('transcript');
  try {
    const postURL = serverURL + '/api/transcript';
    const res = await axios.post(postURL, dataToSend);

    try {
      const generatedText = res.data.transcript;
      const allText = generatedText.map(item => item.text);
      const concatenatedText = allText.join(' ');
      const prompt = buildStyledTheoryPrompt(subtop, concatenatedText);
      stopSim();
      sendSummery(prompt, url, mTopic, mSubTopic);
    } catch (error) {
      console.error(error)
      const prompt = buildStyledTheoryPrompt(subtop);
      stopSim();
      sendSummery(prompt, url, mTopic, mSubTopic);
    }

  } catch (error) {
    console.error(error)
    const prompt = buildStyledTheoryPrompt(subtop);
    stopSim();
    sendSummery(prompt, url, mTopic, mSubTopic);
  }
  }

  async function sendSummery(prompt, url, mTopic, mSubTopic) {
    const dataToSend = {
      prompt: prompt,
    };
  const stopSim = simulateProgress('theory');
  try {
    const postURL = serverURL + '/api/generate';
    const res = await axios.post(postURL, dataToSend);
    const generatedText = res.data.generatedText;
    const htmlContent = generatedText;
    try {
      const parsedJson = htmlContent;
      stopSim();
      simulateProgress('complete');
      setLoadingProgress(100);
      setTimeout(() => setShowLoadingPopup(false), 1500);
     const cleanedTheory = cleanGeneratedHtml(parsedJson);
sendDataVideo(url, cleanedTheory, mTopic, mSubTopic);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
        setIsLoading(false);
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function htmlDownload() {
    try {
      setExporting(true);

      const topics =
        jsonData?.course_topics ||
        jsonData?.[mainTopic?.toLowerCase()];

      if (!topics || !Array.isArray(topics)) {
        toast({
          title: "Export Failed",
          description: "Course topics not found",
        });
        setExporting(false);
        return;
      }

      const combinedHtml = await getCombinedHtml(mainTopic, topics);

      const tempDiv = document.createElement("div");
      tempDiv.style.width = "100%";
      tempDiv.innerHTML = combinedHtml;
      document.body.appendChild(tempDiv);

      const options = {
        filename: `${mainTopic}.pdf`,
        image: { type: "jpeg", quality: 1 },
        margin: [15, 15, 15, 15],
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      };

      await html2pdf().from(tempDiv).set(options).save();

      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast({
        title: "Export Failed",
        description: "Something went wrong while exporting PDF.",
      });
    } finally {
      setExporting(false);
    }
  }

  async function getCombinedHtml(mainTopic, topics) {

    // ✅ ADD THIS BLOCK HERE
    if (!topics || !Array.isArray(topics)) {
      console.error("Invalid topics passed to getCombinedHtml:", topics);
      return "<p>No topics available</p>";
    }
    async function toDataUrl(url) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.onload = function () {
          const reader = new FileReader();
          reader.onloadend = function () {
            resolve(reader.result);
          };
          reader.readAsDataURL(xhr.response);
        };

        xhr.onerror = function () {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
          });
        };

        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.send();
      }).catch(error => {
        console.error(`Failed to fetch image at ${url}:`, error);
        return ''; // Fallback or placeholder
      });
    }

    const topicsHtml = topics.map(topic => `
        <h3 style="font-size: 18pt; font-weight: bold; margin: 0; margin-top: 15px;">${topic.title}</h3>
        ${topic.subtopics.map(subtopic => `
            <p style="font-size: 16pt; margin-top: 10px;">${subtopic.title}</p>
        `).join('')}
    `).join('');

    const theoryPromises = topics.map(async topic => {
      const subtopicPromises = topic.subtopics.map(async (subtopic, index, array) => {
        const imageUrl = type === 'text & image course' ? await toDataUrl(subtopic.image) : ``;
        return `
            <div>
                <p style="font-size: 16pt; margin-top: 20px; font-weight: bold;">
                    ${subtopic.title}
                </p>
                <div style="font-size: 12pt; margin-top: 15px;">
                    ${subtopic.done
            ? `
                            ${type === 'text & image course'
              ? (imageUrl ? `<img style="margin-top: 10px;" src="${imageUrl}" alt="${subtopic.title} image">` : `<a style="color: #0000FF;" href="${subtopic.image}" target="_blank">View example image</a>`)
              : `<a style="color: #0000FF;" href="https://www.youtube.com/watch?v=${subtopic.youtube}" target="_blank" rel="noopener noreferrer">Watch the YouTube video on ${subtopic.title}</a>`
            }
                            <div style="margin-top: 10px;">${subtopic.theory}</div>
                        `
            : `<div style="margin-top: 10px;">Please visit ${subtopic.title} topic to export as PDF. Only topics that are completed will be added to the PDF.</div>`
          }
                </div>
            </div>
        `;
      });
      const subtopicHtml = await Promise.all(subtopicPromises);
      return `
            <div style="margin-top: 30px;">
                <h3 style="font-size: 18pt; text-align: center; font-weight: bold; margin: 0;">
                    ${topic.title}
                </h3>
                ${subtopicHtml.join('')}
            </div>
        `;
    });
    const theoryHtml = await Promise.all(theoryPromises);

    return `
    <div class="html2pdf__page-break" 
         style="display: flex; align-items: center; justify-content: center; text-align: center; margin: 0 auto; max-width: 100%; height: 11in;">
        <h1 style="font-size: 30pt; font-weight: bold; margin: 0;">
            ${mainTopic}
        </h1>
    </div>
    <div class="html2pdf__page-break" style="text-align: start; margin-top: 30px; margin-right: 16px; margin-left: 16px;">
        <h2 style="font-size: 24pt; font-weight: bold; margin: 0;">Index</h2>
        <br>
        <hr>
        ${topicsHtml}
    </div>
    <div style="text-align: start; margin-right: 16px; margin-left: 16px;">
        ${theoryHtml.join('')}
    </div>
    `;
  }

  const normalize = (s: string) =>
    s.toLowerCase().replace(/\s+/g, ' ').trim();

  async function redirectExam() {
    if (isQuizLoading) return;

    // Check if all subtopics are completed
    if (!isOrgAdmin && jsonData) {
      const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
      if (topicsList) {
        let allDone = true;
        topicsList.forEach(t => {
          t.subtopics.forEach(s => {
            if (!completedSubtopics.some(cs => cs.topicTitle === t.title && cs.subtopicTitle === s.title)) {
              allDone = false;
            }
          });
        });

        if (!allDone) {
          toast({
            title: "Quiz Locked",
            description: "Please complete all lessons before taking the quiz.",
          });
          return;
        }
      }
    }

    // Check for manual quizzes first
    if (jsonData?.quizzes && Array.isArray(jsonData.quizzes) && jsonData.quizzes.length > 0) {
      const cooldownActive =
        !!quizAttemptSummary?.nextAttemptAvailableAt &&
        new Date(quizAttemptSummary.nextAttemptAvailableAt) > new Date();

      if (!isOrgAdmin) {
        if (isQuizPassed) {
          toast({
            title: "Quiz locked",
            description: "You have already passed this quiz.",
          });
          return;
        }
        if (quizAttemptSummary?.maxAttemptsReached) {
          toast({
            title: "Quiz locked",
            description: "Maximum attempts reached for this quiz.",
          });
          return;
        }
        if (cooldownActive) {
          toast({
            title: "Quiz locked",
            description: `Next attempt is available after ${new Date(quizAttemptSummary.nextAttemptAvailableAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          });
          return;
        }
      }

      navigate(`/course/${courseId}/quiz`, {
        state: {
          topic: mainTopic,
          courseId,
          questions: jsonData.quizzes,
          manualQuizExam: true,
          quizSettings: jsonData.quizSettings || {},
        },
      });
      return;
    }

    if (!jsonData?.course_topics || !Array.isArray(jsonData.course_topics)) {
      console.error('Invalid course_topics:', jsonData);
      toast({
        title: "Error",
        description: "Course data not loaded",
      });
      return;
    }

    if (!mainTopic) {
      console.error('mainTopic missing');
      toast({
        title: "Error",
        description: "Main topic not selected",
      });
      return;
    }

    // ✅ Collect ALL subtopics from ALL chapters
    const allSubtopics = jsonData.course_topics.flatMap((topic: any) =>
      Array.isArray(topic.subtopics) ? topic.subtopics : []
    );

    if (!allSubtopics.length) {
      console.error('No subtopics found:', jsonData.course_topics);
      toast({
        title: "Error",
        description: "No subtopics available for exam",
      });
      return;
    }

    // ✅ Build subtopics string
    const subtopicsString = allSubtopics
      .map((sub: any) => sub.title)
      .join(', ');

    setIsQuizLoading(true);

    try {
      const response = await axios.post(
        `${serverURL}/api/aiexam`,
        {
          courseId,
          mainTopic,          // "REACT"
          subtopicsString,    // all React subtopics
          lang,
        }
      );

      if (!response.data?.success) {
        throw new Error('API failed');
      }

      const questions = JSON.parse(response.data.message);

      navigate(`/course/${courseId}/quiz`, {
        state: {
          topic: mainTopic,
          courseId,
          questions,
        },
      });
    } catch (error) {
      console.error('redirectExam error:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to generate exam",
      });
    } finally {
      setIsQuizLoading(false);
    }
  }

  const renderTopicsList = (topics) => {
    if (!topics || !Array.isArray(topics)) return null;
    return (
      <Accordion
        type="single"
        collapsible
        className="w-full space-y-3"
        defaultValue={topics.find((topic) => topic.subtopics?.some((subtopic) => subtopic.title === selected))?.title || topics[0]?.title}
      >
        {topics.map((topic, topicIndex) => {
          const topicSubtopics = Array.isArray(topic.subtopics) ? topic.subtopics : [];
          const topicCompletedCount = topicSubtopics.filter((subtopic) =>
            completedSubtopics.some(
              (entry) => entry.topicTitle === topic.title && entry.subtopicTitle === subtopic.title
            )
          ).length;
          const topicProgress = topicSubtopics.length
            ? Math.round((topicCompletedCount / topicSubtopics.length) * 100)
            : 0;
          const isTopicActive = topicSubtopics.some((subtopic) => subtopic.title === selected);

          return (
            <AccordionItem
              key={topic.title}
              value={topic.title}
              className={cn(
                "overflow-hidden rounded-2xl border bg-background/90 shadow-sm transition-colors",
                isTopicActive ? "border-primary/35 shadow-primary/10" : "border-border/60"
              )}
            >
              <AccordionTrigger
                className={cn(
                  "px-4 py-4 text-left hover:no-underline",
                  isTopicActive ? "bg-primary/[0.07]" : "hover:bg-muted/60"
                )}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold",
                      isTopicActive
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-muted text-foreground"
                    )}
                  >
                    {topicIndex + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Chapter {topicIndex + 1}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {topicCompletedCount}/{topicSubtopics.length} done
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-foreground">
                      {topic.title}
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border/70">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${topicProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 pt-1">
                <div className="space-y-2">
                  {topicSubtopics.map((subtopic, subtopicIndex) => {
                    const isUnlocked = isSubtopicUnlocked(topic.title, subtopic.title);
                    const isActive = selected === subtopic.title;
                    const isCompleted = completedSubtopics.some(
                      (entry) => entry.topicTitle === topic.title && entry.subtopicTitle === subtopic.title
                    );

                    return (
                      <button
                        type="button"
                        onClick={() => {
                          if (isUnlocked) {
                            handleSelect(topic.title, subtopic.title);
                          } else {
                            toast({ title: "Locked", description: "Complete previous lessons to unlock this one." });
                          }
                        }}
                        key={subtopic.title}
                        className={cn(
                          "group flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all",
                          isUnlocked
                            ? "cursor-pointer hover:border-primary/30 hover:bg-primary/[0.05]"
                            : "cursor-not-allowed opacity-60",
                          isActive
                            ? "border-primary/35 bg-primary/[0.08] shadow-sm"
                            : "border-transparent bg-muted/50"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                            isCompleted
                              ? "bg-emerald-500 text-white"
                              : isActive
                                ? "bg-primary text-primary-foreground"
                                : isUnlocked
                                  ? "border border-border bg-background text-muted-foreground"
                                  : "bg-muted-foreground/15 text-muted-foreground"
                          )}
                        >
                          {isCompleted ? "✓" : subtopicIndex + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium leading-5 text-foreground">
                            {subtopic.title}
                          </span>
                          <span className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            <span>
                              {isCompleted ? "Completed" : isActive ? "Current lesson" : isUnlocked ? "Open lesson" : "Locked"}
                            </span>
                            {!isCompleted && !isUnlocked && <Lock className="h-3 w-3" />}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  }

  function certificateCheck() {
    if (isComplete) {
      finish();
    } else {
      toast({
        title: "Completion Certificate",
        description: "Complete course to get certificate",
      });
    }
  }

  async function finish() {
    if (sessionStorage.getItem('first') === 'true') {
      if (!end) {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-GB');
        navigate('/course/' + courseId + '/certificate', { state: { courseTitle: mainTopic, end: formattedDate } });
      } else {
        navigate('/course/' + courseId + '/certificate', { state: { courseTitle: mainTopic, end: end } });
      }

    } else {
      const dataToSend = {
        courseId: courseId
      };
      try {
        const postURL = serverURL + '/api/finish';
        const response = await axios.post(postURL, dataToSend);
        if (response.data.success) {
          const today = new Date();
          const formattedDate = today.toLocaleDateString('en-GB');
          sessionStorage.setItem('first', 'true');
          sendEmail(formattedDate);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function sendEmail(formattedDate) {
    const userName = sessionStorage.getItem('mName');
    const email = sessionStorage.getItem('email');
    const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
                <html lang="en">
                
                  <head></head>
                 <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">Certificate<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
                 </div>
                
                  <body style="padding:20px; margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:#f6f9fc;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;">
                    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" height="80%" width="100%" style="max-width:37.5em;max-height:80%; margin-left:auto;margin-right:auto;margin-top:80px;margin-bottom:80px;width:465px;border-radius:0.25rem;border-width:1px;background-color:#fff;padding:20px">
                      <tr style="width:100%">
                        <td>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px">
                            <tbody>
                              <tr>
                                <td><img alt="Vercel" src="${appLogo}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px" /></td>
                              </tr>
                            </tbody>
                          </table>
                          <h1 style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-size:24px;font-weight:400;color:rgb(0,0,0)">Completion Certificate </h1>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Hello <strong>${userName}</strong>,</p>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">We are pleased to inform you that you have successfully completed the ${mainTopic} and are now eligible for your course completion certificate. Congratulations on your hard work and dedication throughout the course!</p>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-bottom:32px;margin-top:32px;text-align:center">
                            <tbody>
                              <tr>
                                <td><a href="${websiteURL}" target="_blank" style="p-x:20px;p-y:12px;line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color: #007BFF;text-align:center;font-size:12px;font-weight:600;color:rgb(255,255,255);text-decoration-line:none"><span></span><span style="p-x:20px;p-y:12px;max-width:100%;display:inline-block;line-height:120%;text-decoration:none;text-transform:none;mso-padding-alt:0px;mso-text-raise:9px"><span>Get Certificate</span></a></td>
                              </tr>
                            </tbody>
                          </table>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Best,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">The <strong>${companyName}</strong> Team</p></p>
                          </td>
                      </tr>
                    </table>
                  </body>
                
                </html>`;

    try {
      const postURL = serverURL + '/api/sendcertificate';
      await axios.post(postURL, { html, email }).then(res => {
        navigate('/course/' + courseId + '/certificate', { state: { courseTitle: mainTopic, end: formattedDate } });
      }).catch(error => {
        console.error(error);
        navigate('/course/' + courseId + '/certificate', { state: { courseTitle: mainTopic, end: formattedDate } });
      });

    } catch (error) {
      console.error(error);
      navigate('/course/' + courseId + '/certificate', { state: { courseTitle: mainTopic, end: formattedDate } });
    }
  }

  // Scroll to top when selected subtopic changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [selected]);

  // In the useEffect that sets initial subtopic
  useEffect(() => {
    // Only run if we have data
    if (!courseData || !jsonData) return;

    const updateQuizStatus = async () => {
      try {
        const response = await axios.post(serverURL + '/api/getmyresult', { courseId, userId });
        if (response.data.success) {
          setIsQuizPassed(response.data.message || (courseData?.pass === true));
          setQuizAttemptSummary({
            attemptCount: response.data.attemptCount,
            attemptLimit: response.data.attemptLimit,
            remainingAttempts: response.data.remainingAttempts,
            nextAttemptAvailableAt: response.data.nextAttemptAvailableAt,
            latestAttempt: response.data.latestAttempt,
            maxAttemptsReached: response.data.maxAttemptsReached,
          });
        }
      } catch (error) {
        console.error('Error fetching quiz status:', error);
      }
    };

    updateQuizStatus();
    loadMessages();
    getNotes();

    if (!mainTopic) {
      if (!isLoading && !courseData) {
        navigate("/create");
      }
    } else {
      const topicsList = jsonData['course_topics'] || jsonData[mainTopic.toLowerCase()];
      if (topicsList && topicsList.length > 0) {
        const mainTopicData = topicsList[0];
        const firstSubtopic = mainTopicData.subtopics[0];

        // If nothing selected yet, select first
        if (!selected) {
          setSelectedTopicTitle(mainTopicData.title);
          setSelected(firstSubtopic.title);
          
          // Check if content exists
          if (isSubtopicReadyForDisplay(firstSubtopic)) {
            setTheory(firstSubtopic.theory);
            setMedia(type === 'video & text course' ? firstSubtopic.youtube : firstSubtopic.image);
          } else {
            setTimeout(() => {
              startSubtopicPreparation(mainTopicData.title, firstSubtopic.title, firstSubtopic);
            }, 100);
          }
        }
      }
    }

    setIsLoading(false);
    sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
    CountDoneTopics(isQuizPassed);
  }, [courseData, jsonData, completedSubtopics, isOrgAdmin, isQuizPassed, preloadImageWithCache, simulateProgress]);

  const rawCourseTopics = jsonData?.course_topics || (mainTopic ? jsonData?.[mainTopic.toLowerCase()] : []);
  const courseTopics = Array.isArray(rawCourseTopics) ? rawCourseTopics : [];
  const orderedLessons = courseTopics.flatMap((topic, topicIndex) =>
    (Array.isArray(topic.subtopics) ? topic.subtopics : []).map((subtopic, subtopicIndex) => ({
      topicTitle: topic.title,
      subtopicTitle: subtopic.title,
      topicIndex,
      subtopicIndex,
    }))
  );
  const completedLessonCount = orderedLessons.filter((lesson) =>
    completedSubtopics.some(
      (entry) => entry.topicTitle === lesson.topicTitle && entry.subtopicTitle === lesson.subtopicTitle
    )
  ).length;
  const exactCurrentLessonIndex = orderedLessons.findIndex(
    (lesson) => lesson.subtopicTitle === selected && (!selectedTopicTitle || lesson.topicTitle === selectedTopicTitle)
  );
  const currentLessonIndex = exactCurrentLessonIndex >= 0
    ? exactCurrentLessonIndex
    : orderedLessons.findIndex((lesson) => lesson.subtopicTitle === selected);
  const currentLesson = currentLessonIndex >= 0 ? orderedLessons[currentLessonIndex] : orderedLessons[0];
  const currentTopicTitle = selectedTopicTitle || currentLesson?.topicTitle || courseTopics[0]?.title || '';
  const currentTopic = courseTopics.find((topic) => topic.title === currentTopicTitle);
  const currentTopicCompletedCount = (Array.isArray(currentTopic?.subtopics) ? currentTopic.subtopics : []).filter((subtopic) =>
    completedSubtopics.some(
      (entry) => entry.topicTitle === currentTopicTitle && entry.subtopicTitle === subtopic.title
    )
  ).length;
  const previousLesson = currentLessonIndex > 0 ? orderedLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 ? orderedLessons[currentLessonIndex + 1] : orderedLessons[1];
  const currentLessonCompleted = !!currentLesson && completedSubtopics.some(
    (entry) => entry.topicTitle === currentLesson.topicTitle && entry.subtopicTitle === currentLesson.subtopicTitle
  );
  const allLessonsCompleted = orderedLessons.length > 0 && completedLessonCount >= orderedLessons.length;
  const quizLockedByCourseProgress = !isOrgAdmin && !allLessonsCompleted;
  const hasManualQuiz = Array.isArray(jsonData?.quizzes) && jsonData.quizzes.length > 0;
  const manualQuizSettings = {
    examMode: true,
    attemptLimit: 2,
    cooldownMinutes: 60,
    passPercentage: 50,
    questionCount: jsonData?.quizzes?.length || 10,
    difficultyMode: 'mixed',
    shuffleQuestions: true,
    shuffleOptions: true,
    ...(jsonData?.quizSettings || {}),
    proctoring: {
      requireCamera: true,
      requireMicrophone: true,
      detectFullscreenExit: true,
      detectTabSwitch: true,
      detectCopyPaste: true,
      detectContextMenu: true,
      detectNoise: true,
      ...(jsonData?.quizSettings?.proctoring || {})
    }
  };
  const lessonAlertMessage = nextLesson
    ? `Complete this lesson, then continue with ${nextLesson.subtopicTitle}.`
    : `You are on the final lesson. Complete it to unlock the ${mainTopic} quiz.`;
  const handlePreviousLesson = () => {
    if (!previousLesson) return;
    selectSubtopic(previousLesson.topicTitle, previousLesson.subtopicTitle);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  };
  const handleNextLesson = () => {
    if (nextLesson) {
      if (!isOrgAdmin && !currentLessonCompleted) {
        toast({
          title: "Complete this lesson first",
          description: "Mark the current lesson as complete to unlock the next lesson.",
        });
        return;
      }
      selectSubtopic(nextLesson.topicTitle, nextLesson.subtopicTitle);
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 0;
      }
      return;
    }

    if (quizLockedByCourseProgress) {
      toast({
        title: "Quiz locked",
        description: "Complete every lesson in the course before starting the quiz.",
      });
      return;
    }

    redirectExam();
  };
  const examRulesSection = hasManualQuiz ? (
    <section className="mb-6 rounded-[28px] border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-background to-background p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/75">
            Exam Rules
          </p>
          <h2 className="mt-2 text-xl font-semibold md:text-2xl">{mainTopic} Assessment</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Final quiz unlocks after every lesson is completed. Attempt rules and basic proctoring are controlled by the organization.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm shadow-sm">
          <div className="font-semibold text-foreground">
            {quizLockedByCourseProgress ? 'Locked until course completion' : 'Ready when you are'}
          </div>
          <div className="mt-1 text-muted-foreground">
            {completedLessonCount}/{orderedLessons.length} lessons completed
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-background p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Attempts</div>
          <div className="mt-1 text-sm font-semibold">{manualQuizSettings.attemptLimit} total attempts</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {quizAttemptSummary?.attemptCount || 0} used, {quizAttemptSummary?.remainingAttempts ?? manualQuizSettings.attemptLimit} left
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Passing</div>
          <div className="mt-1 text-sm font-semibold">{manualQuizSettings.passPercentage}% required</div>
          <div className="mt-1 text-xs text-muted-foreground">{manualQuizSettings.questionCount} questions per attempt</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Cooldown</div>
          <div className="mt-1 text-sm font-semibold">{manualQuizSettings.cooldownMinutes} minutes after a failed attempt</div>
          <div className="mt-1 text-xs text-muted-foreground">Difficulty mode: {manualQuizSettings.difficultyMode}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Monitoring</div>
          <div className="mt-1 text-sm font-semibold">
            {[
              manualQuizSettings.proctoring.detectTabSwitch && 'tab switch',
              manualQuizSettings.proctoring.detectFullscreenExit && 'fullscreen',
              manualQuizSettings.proctoring.detectCopyPaste && 'clipboard',
              manualQuizSettings.proctoring.detectNoise && 'noise'
            ].filter(Boolean).join(', ') || 'standard'}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {manualQuizSettings.proctoring.requireCamera || manualQuizSettings.proctoring.requireMicrophone ? 'Camera/mic permissions may be requested' : 'No device access required'}
          </div>
        </div>
      </div>
    </section>
  ) : null;
  const roadmapSection = courseTopics.length > 0 ? (
    <section className="mb-6 rounded-[28px] border border-border/60 bg-gradient-to-br from-background via-background to-muted/50 p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Course Roadmap
          </p>
          <h2 className="mt-2 text-xl font-semibold md:text-2xl">All chapters and lesson flow</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Review the full structure here and jump into any unlocked lesson without relying only on the sidebar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            {courseTopics.length} chapters
          </span>
          <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            {orderedLessons.length} lessons
          </span>
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {completedLessonCount} completed
          </span>
        </div>
      </div>
      <Accordion
        type="single"
        collapsible
        className="mt-5 space-y-3"
        defaultValue={currentTopicTitle || courseTopics[0]?.title}
      >
        {courseTopics.map((topic, topicIndex) => {
          const topicSubtopics = Array.isArray(topic.subtopics) ? topic.subtopics : [];
          const topicCompletedCount = topicSubtopics.filter((subtopic) =>
            completedSubtopics.some(
              (entry) => entry.topicTitle === topic.title && entry.subtopicTitle === subtopic.title
            )
          ).length;
          const isTopicActive = topic.title === currentTopicTitle;

          return (
            <AccordionItem
              key={topic.title}
              value={topic.title}
              className={cn(
                "overflow-hidden rounded-3xl border transition-colors",
                isTopicActive
                  ? "border-primary/30 bg-primary/[0.05]"
                  : "border-border/60 bg-background/90"
              )}
            >
              <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
                <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Chapter {topicIndex + 1}
                    </span>
                    <h3 className="mt-3 text-base font-semibold leading-6 md:text-lg">{topic.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click to view lessons in this chapter
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted px-3 py-2 text-right">
                    <div className="text-base font-semibold">{topicCompletedCount}/{topicSubtopics.length}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      done
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0">
                <div className="grid gap-2 md:grid-cols-2">
                  {topicSubtopics.map((subtopic, subtopicIndex) => {
                    const isUnlocked = isSubtopicUnlocked(topic.title, subtopic.title);
                    const isActive = selected === subtopic.title;
                    const isCompleted = completedSubtopics.some(
                      (entry) => entry.topicTitle === topic.title && entry.subtopicTitle === subtopic.title
                    );

                    return (
                      <button
                        type="button"
                        key={subtopic.title}
                        onClick={() => {
                          if (isUnlocked) {
                            handleSelect(topic.title, subtopic.title);
                          } else {
                            toast({ title: "Locked", description: "Complete previous lessons to unlock this one." });
                          }
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all",
                          isUnlocked
                            ? "hover:border-primary/30 hover:bg-primary/[0.04]"
                            : "cursor-not-allowed opacity-60",
                          isActive
                            ? "border-primary/35 bg-primary/[0.08]"
                            : "border-border/50 bg-background"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                            isCompleted
                              ? "bg-emerald-500 text-white"
                              : isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isCompleted ? "✓" : subtopicIndex + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {subtopic.title}
                          </span>
                          <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            {isCompleted ? "Completed" : isActive ? "Current lesson" : isUnlocked ? "Available now" : "Locked"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  ) : null;

 return (
    <div className="flex min-h-[100dvh] flex-col bg-background overflow-x-hidden md:h-screen md:overflow-hidden">
      {/* Loading Popup */}
      <LoadingPopup 
        isOpen={showLoadingPopup}
        stage={loadingStage}
        subtopic={loadingSubtopic}
        progress={loadingProgress}
      />
      <QuizLoadingPopup
        isOpen={isQuizLoading}
        topic={mainTopic}
      />

      {/* ── HEADER ── */}
      <header className="border-b border-border/40 py-2 px-3 md:px-4 flex justify-between items-center sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 md:gap-4 shrink min-w-0">

          {/* Mobile drawer trigger */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden flex-shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh]">
              <div className="p-4">
                <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/60 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                        Course Navigation
                      </p>
                      <h2 className="mt-2 text-lg font-semibold">Course Content</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {completedLessonCount}/{orderedLessons.length} lessons completed
                      </p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 px-3 py-2 text-right text-primary flex-shrink-0">
                      <div className="text-lg font-semibold leading-none">{percentage}%</div>
                      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/70">
                        Progress
                      </div>
                    </div>
                  </div>
                </div>
                <ScrollArea className="h-[60vh]">
                  <div className="pr-2 pt-4">
                    {courseTopics.length > 0 && renderTopicsList(courseTopics)}
                    <button
                      type="button"
                      onClick={redirectExam}
                      disabled={quizLockedByCourseProgress || isQuizLoading}
                      className={cn(
                        "mt-4 flex w-full items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 text-left transition-colors",
                        quizLockedByCourseProgress || isQuizLoading
                          ? "cursor-not-allowed opacity-60"
                          : "hover:bg-muted/60"
                      )}
                    >
                      <span>
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                          Final Assessment
                        </span>
                        <span className="mt-1 block text-sm font-semibold text-foreground">
                          {mainTopic} Quiz
                        </span>
                        {quizLockedByCourseProgress && (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            Complete every lesson to unlock the quiz
                          </span>
                        )}
                      </span>
                      {isQuizLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                      ) : quizLockedByCourseProgress ? (
                        <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      ) : isQuizPassed === true ? (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                  </div>
                </ScrollArea>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Title + progress ring */}
          <div className="flex items-center gap-2 min-w-0">
            {!isOrgAdmin && (
              <div className="relative w-8 h-8 flex-shrink-0">
                <svg className="w-8 h-8" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted-foreground/20" strokeWidth="2" />
                  <circle
                    cx="18" cy="18" r="16" fill="none"
                    className="stroke-primary"
                    strokeWidth="2"
                    strokeDasharray="100"
                    strokeDashoffset={100 - percentage}
                    transform="rotate(-90 18 18)"
                  />
                  <text
                    x="18" y="18"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    className="fill-foreground text-[10px] font-medium"
                  >
                    {percentage}%
                  </text>
                </svg>
              </div>
            )}
            <h1 className="text-base sm:text-lg md:text-xl font-bold truncate max-w-[130px] xs:max-w-[160px] sm:max-w-[220px] md:max-w-none">
              {mainTopic}
            </h1>
          </div>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hidden md:flex"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop action buttons */}
          <div className="hidden sm:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <Home className="h-4 w-4 mr-1" /> Home
              </Link>
            </Button>
            {(plan !== "free" || isOrgAdmin || userRole === "student") && isQuizPassed && (
              <Button
                onClick={certificateCheck}
                variant="default"
                size="sm"
                className={cn(
                  "shadow-none",
                  userRole === "student" || !!sessionStorage.getItem("orgId")
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white border-none"
                    : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                )}
              >
                <Award className="h-4 w-4 mr-1" />
                <span className="hidden lg:inline">Download Certificate</span>
                <span className="lg:hidden">Certificate</span>
              </Button>
            )}
            {/* <Button onClick={htmlDownload} disabled={exporting} variant="ghost" size="sm" asChild>
              <span className="cursor-pointer">
                <Download className="h-4 w-4 mr-1" />
                <span className="hidden lg:inline">{exporting ? "Exporting..." : "Export"}</span>
              </span>
            </Button> */}
            <ShareOnSocial
              textToShare={sessionStorage.getItem("mName") + " shared you course on " + mainTopic}
              link={websiteURL + "/shareable?id=" + courseId}
              linkTitle={sessionStorage.getItem("mName") + " shared you course on " + mainTopic}
              linkMetaDesc={sessionStorage.getItem("mName") + " shared you course on " + mainTopic}
              linkFavicon={appLogo}
              noReferer
            >
              <Button variant="ghost" size="sm" asChild>
                <span className="cursor-pointer">
                  <Share className="h-4 w-4 mr-1" />
                  <span className="hidden lg:inline">Share</span>
                </span>
              </Button>
            </ShareOnSocial>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-visible md:overflow-hidden">

        {/* Desktop sidebar */}
        <div
          className={cn(
            "hidden overflow-hidden border-r border-border/40 bg-gradient-to-b from-slate-50 via-background to-background transition-all duration-300 dark:from-slate-950/30 md:block",
            isMenuOpen ? "w-72 lg:w-[22rem]" : "w-0"
          )}
        >
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/60 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      Course Navigation
                    </p>
                    <h2 className="mt-2 text-lg font-semibold">Course Content</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {completedLessonCount}/{orderedLessons.length} lessons completed
                    </p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 px-3 py-2 text-right text-primary flex-shrink-0">
                    <div className="text-lg font-semibold leading-none">{percentage}%</div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/70">
                      Progress
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                {courseTopics.length > 0 && renderTopicsList(courseTopics)}
              </div>
              <button
                type="button"
                onClick={redirectExam}
                disabled={quizLockedByCourseProgress || isQuizLoading}
                className={cn(
                  "mt-4 flex w-full items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 text-left transition-colors",
                  quizLockedByCourseProgress || isQuizLoading
                    ? "cursor-not-allowed opacity-60"
                    : "hover:bg-muted/60"
                )}
              >
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Final Assessment
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-foreground">
                    {mainTopic} Quiz
                  </span>
                  {quizLockedByCourseProgress && (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Complete every lesson to unlock the quiz
                    </span>
                  )}
                </span>
                {isQuizLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                ) : quizLockedByCourseProgress ? (
                  <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : isQuizPassed === true ? (
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                ) : (
                  <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
            </div>
          </ScrollArea>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="min-h-0 flex-1 overflow-visible md:overflow-hidden">
          <ScrollArea className="h-auto md:h-full" viewportRef={mainContentRef}>
            <main className="mx-auto max-w-6xl p-3 pb-36 sm:p-4 sm:pb-36 md:p-6 md:pb-10">
              {isLoading ? (
                <CourseContentSkeleton />
              ) : (
                <>
                  {/* Hero banner */}
                  <div className="mb-4 md:mb-6 overflow-hidden rounded-[20px] md:rounded-[30px] border border-slate-800/10 bg-gradient-to-br from-slate-950 via-slate-900 to-primary/80 p-3 sm:p-4 md:p-6 text-white shadow-xl">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                      <div className="max-w-3xl">
                        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/80 backdrop-blur">
                          {currentLesson ? `Chapter ${currentLesson.topicIndex + 1}` : "Lesson overview"}
                        </span>
                        <h1 className="mt-3 break-words text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight">
                          {selected}
                        </h1>
                        <p className="mt-2 md:mt-3 text-xs sm:text-sm leading-6 text-white/75">
                          {currentTopicTitle && `Inside ${currentTopicTitle}. `}
                          {currentLesson ? `Lesson ${currentLessonIndex + 1} of ${orderedLessons.length}. ` : ""}
                          Continue through the roadmap below or jump directly from the side menu.
                        </p>
                      </div>

                      {/* Info cards — stacked on mobile, side-by-side on sm+ */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-2 xl:w-auto xl:min-w-[320px]">
                        <div className="rounded-xl border border-white/12 bg-white/10 px-3 py-2 md:px-4 md:py-3 backdrop-blur">
                          <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
                            Current Chapter
                          </div>
                          <div className="mt-1.5 text-sm sm:text-base md:text-lg font-semibold leading-tight">
                            {currentTopic
                              ? `${currentLesson?.topicIndex + 1}. ${currentTopic.title}`
                              : "Course lesson"}
                          </div>
                          <div className="mt-1 text-[10px] sm:text-xs text-white/65">
                            {currentTopicCompletedCount}/{currentTopic?.subtopics?.length || 0} lessons done
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/12 bg-white/10 px-3 py-2 md:px-4 md:py-3 backdrop-blur">
                          <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
                            Up Next
                          </div>
                          <div className="mt-1.5 text-xs sm:text-sm font-semibold leading-5">
                            {nextLesson ? nextLesson.subtopicTitle : "Final quiz after completion"}
                          </div>
                          <div className="mt-1 text-[10px] sm:text-xs text-white/65">
                            {nextLesson ? nextLesson.topicTitle : `${mainTopic} quiz`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content profile badge bar */}
                  <div className={`mb-4 md:mb-6 rounded-2xl border p-3 sm:p-4 ${contentProfileMeta.surfaceClass}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${contentProfileMeta.badgeClass}`}>
                            <ContentProfileIcon className="mr-1.5 h-3.5 w-3.5" />
                            {contentProfileMeta.label}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                            {type === "video & text course" ? "Video + Text" : "Text + Images"}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                            {lang}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{contentProfileMeta.summary}</p>
                      </div>
                    </div>
                  </div>

                  {/* Exam rules + roadmap — desktop above content, mobile below */}
                  {!isMobile && examRulesSection}
                  {!isMobile && roadmapSection}

                  <div className="space-y-4">
                    {/* Video or Image */}
                    {/* {type === "video & text course" ? (
                      media ? (
                        <div className="overflow-hidden rounded-[20px] sm:rounded-[28px] border border-border/60 bg-background p-2 sm:p-3 shadow-sm">
                          <div className="aspect-video w-full overflow-hidden rounded-xl sm:rounded-2xl">
                            <YouTube
                              key={media}
                              className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full"
                              videoId={media}
                              opts={isMobile ? optsMobile : opts}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-48 sm:h-72 md:h-96 items-center justify-center rounded-[20px] sm:rounded-[28px] border border-border/60 bg-muted">
                          <p className="text-muted-foreground text-sm">Loading video...</p>
                        </div>
                      )
                    ) : (
                      <div className="relative h-48 sm:h-72 md:h-96 w-full overflow-hidden rounded-[20px] sm:rounded-[28px] border border-border/60 bg-muted shadow-sm">
                        {media ? (
                          <img
                            key={media}
                            src={media}
                            fetchpriority="high"
                            className={cn(
                              "w-full h-full object-cover transition-opacity duration-500",
                              imageLoading.has(selected) ? "opacity-0" : "opacity-100"
                            )}
                            alt={selected}
                            onLoad={() => {
                              setImageLoading((prev) => {
                                const newMap = new Map(prev);
                                newMap.delete(selected);
                                return newMap;
                              });
                            }}
                            onError={async (e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              try {
                                const imagePrompt = `${selected} in ${mainTopic || ""}`;
                                const res = await axios.post(
                                  serverURL + "/api/image",
                                  { prompt: imagePrompt },
                                  { timeout: 8000 }
                                );
                                if (res.data?.url) {
                                  target.src = res.data.url;
                                  return;
                                }
                              } catch (apiErr) {
                                console.error("Image API fallback failed:", apiErr);
                              }
                              const parent = target.parentElement;
                              if (parent) {
                                target.style.display = "none";
                                const gradientDiv = document.createElement("div");
                                gradientDiv.className =
                                  "flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20";
                                gradientDiv.innerHTML = `
                                  <div class="text-center p-4">
                                    <p class="text-lg font-semibold text-primary">${selected}</p>
                                    <p class="text-sm text-muted-foreground">${mainTopic || "Course"} visualization</p>
                                  </div>
                                `;
                                parent.appendChild(gradientDiv);
                              }
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                            <Skeleton className="w-full h-full absolute inset-0" />
                            <div className="z-10 flex flex-col items-center">
                              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs font-medium mt-2">Fetching Visuals...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )} */}

                    {/* Theory text */}
                    {theory && (
                      <div className="rounded-[20px] md:rounded-[28px] border border-border/60 bg-background p-3 sm:p-5 md:p-7 shadow-sm">
                        <StyledText text={theory} />
                      </div>
                    )}

                    {/* Learning note */}
                    <div className="rounded-[20px] border border-primary/20 bg-primary/5 p-3 sm:p-4 text-primary shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80">
                        Learning Note
                      </p>
                      <p className="mt-2 text-sm leading-6">{lessonAlertMessage}</p>
                    </div>

                    {/* Mobile-only: exam rules + roadmap below content */}
                    {isMobile && examRulesSection}
                    {isMobile && roadmapSection}

                    {/* Lesson actions */}
                    {!isOrgAdmin && (
                      <div className="mt-6 md:mt-8 rounded-[20px] md:rounded-[24px] border border-border/60 bg-background p-3 sm:p-4 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                              Lesson Actions
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {currentLessonCompleted
                                ? nextLesson
                                  ? "This lesson is complete. You can move to the next lesson now."
                                  : "All lessons are complete. The final quiz is now available."
                                : "Mark this lesson as complete to unlock the next part of the course."}
                            </p>
                          </div>
                          {/* Action buttons — full-width on mobile, auto on desktop */}
                          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-row sm:gap-2 sm:flex-shrink-0">
                            <Button
                              variant="outline"
                              onClick={handlePreviousLesson}
                              disabled={!previousLesson}
                              className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3"
                            >
                              <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                              <span>Prev</span>
                            </Button>
                            <Button
                              variant={currentLessonCompleted ? "secondary" : "default"}
                              onClick={handleMarkAsComplete}
                              disabled={currentLessonCompleted}
                              className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3"
                            >
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                              <span className="hidden xs:inline">
                                {currentLessonCompleted ? "Completed" : "Complete"}
                              </span>
                              <span className="xs:hidden">
                                {currentLessonCompleted ? "✓" : "Done"}
                              </span>
                            </Button>
                            <Button
                              onClick={handleNextLesson}
                              disabled={(!!nextLesson && !currentLessonCompleted) || isQuizLoading}
                              className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3"
                            >
                              {isQuizLoading
                                ? "Loading..."
                                : nextLesson
                                ? "Next"
                                : "Quiz"}
                              {isQuizLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                              ) : (
                                <ArrowRight className="h-4 w-4 flex-shrink-0" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                       {isOrgAdmin && (
                      <div className="mt-8 rounded-[24px] border border-border/60 bg-background p-4 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                              Review Actions
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {nextLesson 
                                ? "You are reviewing this course. Continue to the next lesson to complete the review."
                                : "You have reached the end of the lessons. Complete the final quiz to send this course for approval."}
                            </p>
                          </div>
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                              variant="outline"
                              onClick={handlePreviousLesson}
                              disabled={!previousLesson}
                              className="gap-2"
                            >
                              <ArrowLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            <Button
                              onClick={handleNextLesson}
                              disabled={isQuizLoading}
                              className="gap-2"
                            >
                              {isQuizLoading ? 'Preparing Quiz...' : nextLesson ? 'Continue Review' : 'Take Review Quiz'}
                              {isQuizLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </main>
          </ScrollArea>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-2 flex justify-around items-center z-40 safe-area-pb">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <Home className="h-5 w-5" />
          </Link>
        </Button>
        {(plan !== "free" || isOrgAdmin || userRole === "student") && isQuizPassed && (
          <Button
            onClick={certificateCheck}
            variant="ghost"
            size="sm"
            className={cn(
              "font-bold",
              userRole === "student" || !!sessionStorage.getItem("orgId")
                ? "text-yellow-600"
                : "text-primary"
            )}
          >
            <Award className="h-5 w-5" />
          </Button>
        )}
        <Button onClick={htmlDownload} disabled={exporting} variant="ghost" size="sm">
          <Download className="h-5 w-5" />
        </Button>
        <ShareOnSocial
          textToShare={sessionStorage.getItem("mName") + " shared you course on " + mainTopic}
          link={websiteURL + "/shareable?id=" + courseId}
          linkTitle={sessionStorage.getItem("mName") + " shared you course on " + mainTopic}
          linkMetaDesc={sessionStorage.getItem("mName") + " shared you course on " + mainTopic}
          linkFavicon={appLogo}
          noReferer
        >
          <Button variant="ghost" size="sm">
            <Share className="h-5 w-5" />
          </Button>
        </ShareOnSocial>
      </div>

      {/* ── FLOATING ACTION BUTTONS ── */}
      <div className="fixed bottom-20 right-3 z-40 flex flex-col gap-2 md:bottom-6 md:right-6">
        <Button
          size="icon"
          className="rounded-full bg-primary shadow-lg hover:shadow-xl h-10 w-10 md:h-11 md:w-11"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
        <Button
          size="icon"
          className="rounded-full bg-primary shadow-lg hover:shadow-xl h-10 w-10 md:h-11 md:w-11"
          onClick={() => setIsNotesOpen(true)}
        >
          <ClipboardCheck className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>

      {/* ── CHAT SHEET / DIALOG ── */}
      {isMobile ? (
        <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
          <SheetContent side="bottom" className="h-[90dvh] max-w-full p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-base font-semibold">Course Assistant</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsChatOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 pb-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex flex-col gap-2 rounded-2xl px-3 py-2 text-sm break-words",
                        message.sender === "user"
                          ? "ml-auto bg-primary text-primary-foreground max-w-[85%]"
                          : "bg-muted max-w-[85%]"
                      )}
                    >
                      <StyledText text={message.text} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center gap-2 p-4 border-t border-border">
                <Input
                  placeholder={isChatLoading ? "Assistant is thinking..." : "Type your message..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isChatLoading}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  className="flex-1 text-sm"
                />
                <Button onClick={sendMessage} disabled={isChatLoading} size="sm">
                  {isChatLoading ? "..." : "Send"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-h-[80vh]">
            <DialogTitle>Course Assistant</DialogTitle>
            <div className="flex flex-col h-[50vh] sm:h-[60vh]">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pt-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex flex-col gap-2 rounded-lg px-3 py-2 text-sm break-words",
                        message.sender === "user"
                          ? "ml-auto bg-primary text-primary-foreground max-w-[80%]"
                          : "bg-muted max-w-[80%]"
                      )}
                    >
                      <StyledText text={message.text} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={isChatLoading ? "Assistant is thinking..." : "Type your message..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isChatLoading}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={isChatLoading}>
                  {isChatLoading ? "..." : "Send"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── NOTES SHEET / DIALOG ── */}
      {isMobile ? (
        <Sheet open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <SheetContent side="bottom" className="h-[90dvh] sm:max-w-full p-0">
            <div className="flex flex-col h-full">
              <div className="py-3 px-4 border-b border-border">
                <h2 className="text-base font-semibold">Course Notes</h2>
              </div>
              <ScrollArea className="flex-1 px-4">
                <div className="pt-3 pb-2">
                  <MinimalTiptapEditor
                    value={value}
                    onChange={setValue}
                    className="w-full"
                    editorContentClassName="p-4"
                    output="html"
                    placeholder="No notes yet. Start taking notes for this course."
                    autofocus={true}
                    editable={true}
                    editorClassName="focus:outline-none min-h-[200px]"
                  />
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-border">
                <div className="flex justify-end">
                  <Button disabled={saving} onClick={handleSaveNote} size="sm">
                    {saving ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)]">
            <DialogTitle>Course Notes</DialogTitle>
            <div className="flex flex-col h-[60vh]">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pt-2">
                  <MinimalTiptapEditor
                    value={value}
                    onChange={setValue}
                    className="w-full"
                    editorContentClassName="p-5"
                    output="html"
                    placeholder="No notes yet. Start taking notes for this course."
                    autofocus={true}
                    editable={true}
                    editorClassName="focus:outline-none"
                  />
                </div>
              </ScrollArea>
              <div className="flex justify-end">
                <Button disabled={saving} onClick={handleSaveNote}>
                  {saving ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CoursePage;
