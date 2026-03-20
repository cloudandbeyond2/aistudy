
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
import { ChevronDown, Home, Share, Download, MessageCircle, ClipboardCheck, Menu, Award, Lock, CheckCircle2, Loader2, Sparkles, BookOpen, Image as ImageIcon, Brain, Video, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { ThemeToggle } from '@/components/ThemeToggle';
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

  const [selected, setSelected] = useState('');
  const [theory, setTheory] = useState('');
  const [media, setMedia] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [isComplete, setIsCompleted] = useState(false);
  const [isQuizPassed, setIsQuizPassed] = useState(pass);
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
  const isOrgAdmin = userRole === 'org_admin' || sessionStorage.getItem('isOrganization') === 'true';

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
              userId
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
  }, [jsonData, selected, mainTopic, lang, userId, preloadImageWithCache]);

  // Cached API call
  const cachedApiCall = async (url, data, cacheKey) => {
    if (apiCache.current.has(cacheKey)) {
      return apiCache.current.get(cacheKey);
    }
    
    const response = await axios.post(url, data);
    apiCache.current.set(cacheKey, response);
    return response;
  };

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
        setIsLoading(true);
        try {
          const response = await axios.get(`${serverURL}/api/shareable?id=${activeCourseId}`);
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


// Add this function to validate if content is complete
const isContentComplete = (content: string, subtopic: string): boolean => {
  if (!content) return false;
  
  // Check if content has proper structure
  const hasProperClosing = content.includes('</div>') || content.includes('</html>');
  
  // Check if content ends with proper punctuation
  const lastChar = content.trim().slice(-1);
  const endsProperly = ['.', '!', '?', '"', "'", ')', '}', '>'].includes(lastChar);
  
  // Check minimum length (at least 500 chars for meaningful content)
  const hasMinimumLength = content.length > 500;
  
  // Check if content contains all key sections
  const hasIntroduction = content.includes('Introduction') || content.includes('<h3>');
  const hasConclusion = content.includes('Conclusion') || content.includes('Summary');
  const hasKeyConcepts = content.includes('Key Concept') || content.includes('Key Points');
  
  // For video courses, also check if content is complete
  const isComplete = hasProperClosing && endsProperly && hasMinimumLength && 
                     (hasIntroduction || hasConclusion || hasKeyConcepts);
  
  return isComplete;
};

// Retry mechanism with exponential backoff
const generateWithRetry = async (apiCall: () => Promise<any>, maxRetries: number = 3): Promise<any> => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};


  const handleSaveNote = async () => {
    setSaving(true);
    const postURL = serverURL + '/api/savenotes';
    const response = await axios.post(postURL, { course: courseId, notes: value });
    if (response.data.success) {
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully.",
      });
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

// ==================== FIXED CONTENT GENERATION FUNCTIONS ====================

/**
 * FIXED: Complete content generation for text & image courses
 * This function now properly handles all stages and ensures content is saved without truncation
 */
async function sendBulkCourseContent(clickedTopic, clickedSub) {
  setShowLoadingPopup(true);
  setLoadingSubtopic(clickedSub);
  
  const clearTheoryProgress = simulateProgress('theory');
  
  // 1. Instant UI Feedback
  setSelected(clickedSub);
  setTheory(`<div class="prose dark:prose-invert max-w-none">
    <h2>${clickedSub}</h2>
    <p>AI is crafting personalized content for you...</p>
    <div class="flex items-center justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  </div>`);
  
  const placeholderUrl = getFallbackImage(mainTopic, clickedSub);
  setMedia(placeholderUrl);
  
  try {
    // 2. Generate theory content with retry mechanism
    const theoryPayload = {
      mainTopic,
      topicsList: [{ topicTitle: clickedTopic, subtopics: [clickedSub] }],
      lang,
      userId
    };
    
    let generatedTheory = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries && !generatedTheory) {
      try {
        const theoryRes = await axios.post(serverURL + '/api/generate-batch', theoryPayload, {
          timeout: 60000 // 60 second timeout
        });
        
        if (theoryRes.data && theoryRes.data.success && theoryRes.data.topics && theoryRes.data.topics[0]) {
          generatedTheory = theoryRes.data.topics[0].subtopics[0].theory;
          
          // Validate content completeness
          if (!isContentComplete(generatedTheory, clickedSub)) {
            console.warn(`Content incomplete for ${clickedSub}, retry ${retryCount + 1}`);
            generatedTheory = null;
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            break;
          }
        } else {
          retryCount++;
        }
      } catch (error) {
        console.error(`Generation attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // Switch to image loading stage
    clearTheoryProgress();
    simulateProgress('image');
    
    // Ensure we have complete content
    let finalTheory = generatedTheory;
    if (!finalTheory || !isContentComplete(finalTheory, clickedSub)) {
      finalTheory = generateCompleteContent(clickedSub, mainTopic);
      console.log(`Using fallback complete content for ${clickedSub}`);
    } else {
      // Format and enhance the content
      finalTheory = formatCompleteContent(finalTheory, clickedSub, mainTopic);
    }
    
    // Update theory in state and cache
    setTheory(finalTheory);
    updateLocalCache(clickedTopic, clickedSub, { theory: finalTheory });
    
    // 3. Generate image with retry
    let imageUrl = placeholderUrl;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const imagePrompt = `${clickedSub} in ${mainTopic}`;
        const imageRes = await axios.post(serverURL + '/api/image', { prompt: imagePrompt }, { timeout: 15000 });
        
        if (imageRes.data?.url) {
          imageUrl = imageRes.data.url;
          break;
        }
      } catch (imageErr) {
        console.error(`Image fetch attempt ${attempt + 1} failed:`, imageErr);
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    setMedia(imageUrl);
    updateLocalCache(clickedTopic, clickedSub, { 
      image: imageUrl,
      done: true 
    });
    
    // 4. Update course in backend
    await updateCourse();
    
    // Switch to complete stage
    simulateProgress('complete');
    setLoadingProgress(100);
    
    setTimeout(() => {
      setShowLoadingPopup(false);
      if (window.progressInterval) {
        clearInterval(window.progressInterval);
      }
    }, 1500);
    
  } catch (error) {
    console.error("Content generation failed:", error);
    const fallbackContent = generateCompleteContent(clickedSub, mainTopic);
    setTheory(fallbackContent);
    setMedia(placeholderUrl);
    updateLocalCache(clickedTopic, clickedSub, { 
      theory: fallbackContent, 
      image: placeholderUrl,
      done: true 
    });
    await updateCourse();
    
    setShowLoadingPopup(false);
    if (window.progressInterval) {
      clearInterval(window.progressInterval);
    }
  }
}

/**
 * Formats content to ensure it's complete and well-structured
 */
function formatCompleteContent(content, subtopic, topic) {
  if (!content || content.trim() === '') {
    return generateCompleteContent(subtopic, topic);
  }
  
  // Check if content has proper HTML structure
  let formattedContent = content;
  
  // Ensure content starts with proper container
  if (!formattedContent.includes('<div class="prose') && !formattedContent.includes('<div')) {
    formattedContent = `<div class="prose dark:prose-invert max-w-none">
      ${formattedContent}
    </div>`;
  }
  
  // Ensure content has proper closing tags
  if (!formattedContent.includes('</div>')) {
    formattedContent = formattedContent + '</div>';
  }
  
  // Check if content is complete (has conclusion/summary)
  const hasConclusion = formattedContent.toLowerCase().includes('conclusion') || 
                        formattedContent.toLowerCase().includes('summary') ||
                        formattedContent.toLowerCase().includes('key takeaway');
  
  if (!hasConclusion) {
    formattedContent = formattedContent.replace('</div>', `
      <h3>Summary</h3>
      <p>In conclusion, ${subtopic} is a fundamental concept in ${topic}. Understanding this topic is essential for mastering ${topic} and applying it effectively in real-world scenarios.</p>
      </div>
    `);
  }
  
  // Ensure content has proper section structure
  if (!formattedContent.includes('<h2>') && !formattedContent.includes('<h1>')) {
    formattedContent = formattedContent.replace('<div', `<div>\n<h2>${subtopic}</h2>`);
  }
  
  return formattedContent;
}

/**
 * Generates COMPLETE educational content for any subtopic
 */
function generateCompleteContent(subtopic, topic) {
  return `<div class="prose dark:prose-invert max-w-none">
    <h2>${subtopic}</h2>
    
    <h3>📚 Introduction to ${subtopic}</h3>
    <p><strong>${subtopic}</strong> is a crucial concept in the field of <strong>${topic}</strong>. This topic forms the foundation for understanding more advanced concepts and practical applications in real-world scenarios.</p>
    
    <h3>🎯 Learning Objectives</h3>
    <ul>
      <li>Understand the core principles of ${subtopic}</li>
      <li>Learn practical applications and use cases</li>
      <li>Master key techniques and best practices</li>
      <li>Develop problem-solving skills in ${topic}</li>
    </ul>
    
    <h3>🔑 Key Concepts and Definitions</h3>
    <ul>
      <li><strong>Definition:</strong> ${subtopic} refers to the systematic approach of analyzing, processing, and deriving insights from data in ${topic}.</li>
      <li><strong>Core Principles:</strong> The fundamental principles include accuracy, consistency, validity, and completeness of information.</li>
      <li><strong>Importance:</strong> Understanding ${subtopic} is essential because it enables professionals to make data-driven decisions and solve complex problems efficiently.</li>
    </ul>
    
    <h3>💡 Practical Applications</h3>
    <p><strong>${subtopic}</strong> finds applications across various domains:</p>
    <ul>
      <li><strong>Business Intelligence:</strong> Companies use these concepts to analyze customer behavior and optimize operations.</li>
      <li><strong>Scientific Research:</strong> Researchers apply these techniques to validate hypotheses and discover patterns.</li>
      <li><strong>Machine Learning:</strong> ${subtopic} is fundamental to building accurate predictive models and understanding model performance.</li>
    </ul>
    
    <h3>🔧 Step-by-Step Implementation</h3>
    <p>Let's explore a practical example to understand ${subtopic} better:</p>
    <pre><code>
# Example: Understanding ${subtopic.toLowerCase()} in practice
import pandas as pd
import numpy as np

# Sample data for analysis
data = {
    'feature1': [1, 2, 3, 4, 5],
    'feature2': [10, 20, 30, 40, 50],
    'target': [100, 200, 300, 400, 500]
}

df = pd.DataFrame(data)

# Apply ${subtopic.toLowerCase()} concepts
print("Data shape:", df.shape)
print("Data types:", df.dtypes)
print("Summary statistics:", df.describe())
    </code></pre>
    
    <h3>⚠️ Common Challenges and Solutions</h3>
    <p>When working with ${subtopic}, practitioners often face several challenges:</p>
    <ul>
      <li><strong>Data Quality Issues:</strong> Missing values, outliers, and inconsistencies can affect results. Solutions include data cleaning, imputation, and validation techniques.</li>
      <li><strong>Scalability Problems:</strong> As data volume grows, performance can degrade. Using efficient algorithms and distributed computing helps address this.</li>
      <li><strong>Interpretability:</strong> Complex models can be hard to explain. Visualization and feature importance analysis improve understanding.</li>
    </ul>
    
    <h3>✅ Best Practices</h3>
    <p>To excel in ${subtopic}, follow these best practices:</p>
    <ul>
      <li>Always start with exploratory analysis to understand your data</li>
      <li>Document your methodology and assumptions clearly</li>
      <li>Validate results using multiple approaches when possible</li>
      <li>Stay updated with the latest tools and techniques in ${topic}</li>
      <li>Collaborate with domain experts to ensure practical relevance</li>
    </ul>
    
    <h3>🛠️ Tools and Resources</h3>
    <p>Popular tools for working with ${subtopic} include:</p>
    <ul>
      <li><strong>Python Libraries:</strong> Pandas, NumPy, Scikit-learn, Matplotlib, Seaborn</li>
      <li><strong>R Packages:</strong> dplyr, ggplot2, tidyr, caret</li>
      <li><strong>Visualization Tools:</strong> Tableau, Power BI, D3.js</li>
      <li><strong>Big Data Platforms:</strong> Apache Spark, Dask, Hadoop</li>
    </ul>
    
    <h3>📝 Practice Exercises</h3>
    <p>Test your understanding of ${subtopic} with these exercises:</p>
    <ol>
      <li>Create a simple implementation of ${subtopic} with sample data</li>
      <li>Identify three real-world scenarios where ${subtopic} would be applicable</li>
      <li>Compare different approaches to solving problems using ${subtopic}</li>
      <li>Document the key steps in your ${subtopic} workflow</li>
    </ol>
    
    <h3>📖 Conclusion and Next Steps</h3>
    <p><strong>${subtopic}</strong> is a vast and fascinating area of ${topic} that continues to evolve. Mastering these concepts requires consistent practice and application to real-world problems. As you progress, you'll discover deeper nuances and advanced techniques that build upon this foundation.</p>
    
    <h4>Key Takeaways:</h4>
    <ul>
      <li>✅ ${subtopic} is fundamental to data analysis and decision-making in ${topic}</li>
      <li>✅ Understanding both theoretical concepts and practical applications is crucial</li>
      <li>✅ Regular practice with real datasets helps reinforce learning</li>
      <li>✅ Stay curious and explore advanced topics as you build confidence</li>
    </ul>
    
    <p><em>🎓 Remember: The journey of mastering ${subtopic} is ongoing. Each concept you learn opens doors to new possibilities in your ${topic} journey. Keep practicing, stay curious, and don't hesitate to explore additional resources!</em></p>
  </div>`;
}

/**
 * FIXED: Complete video course content generation with no truncation
 */
async function sendVideo(query, mTopic, mSubTopic, subtop) {
  const dataToSend = { prompt: query };
  const stopSim = simulateProgress('video');
  
  try {
    const res = await axios.post(serverURL + '/api/yt', dataToSend);
    const videoUrl = res.data.url;
    
    stopSim();
    
    if (videoUrl) {
      updateLocalCache(mTopic, mSubTopic, { youtube: videoUrl });
      await sendTranscript(videoUrl, mTopic, mSubTopic, subtop);
    } else {
      throw new Error("No video URL received");
    }
    
  } catch (error) {
    console.error("Video search failed:", error);
    const prompt = `Strictly in ${lang}, provide a COMPLETE and DETAILED explanation of this subtopic "${subtop}" in ${mainTopic}. Include introduction, key concepts, examples, best practices, and a conclusion. Format with proper HTML structure.`;
    stopSim();
    await sendSummery(prompt, '', mTopic, mSubTopic);
  }
}

async function sendTranscript(url, mTopic, mSubTopic, subtop) {
  const dataToSend = { prompt: url };
  const stopSim = simulateProgress('transcript');
  
  try {
    const res = await axios.post(serverURL + '/api/transcript', dataToSend);
    const generatedText = res.data.transcript;
    
    if (generatedText && Array.isArray(generatedText)) {
      const allText = generatedText.map(item => item.text);
      const concatenatedText = allText.join(' ');
      
      const prompt = `Strictly in ${lang}, you are an educational instructor creating a COMPLETE course on "${mainTopic}". Provide a thorough, detailed explanation of the subtopic "${subtop}" with:
1. A comprehensive introduction
2. Key concepts and definitions
3. Practical examples with code if applicable
4. Best practices and common pitfalls
5. A proper conclusion summarizing key takeaways

Use the following video transcript as reference:
${concatenatedText}

Format with proper HTML tags for better readability. Ensure the content is COMPLETE and not truncated.`;
      
      stopSim();
      await sendSummery(prompt, url, mTopic, mSubTopic);
    } else {
      throw new Error("Invalid transcript format");
    }
    
  } catch (error) {
    console.error("Transcript fetch failed:", error);
    const prompt = `Strictly in ${lang}, provide a COMPLETE and DETAILED educational lesson on "${subtop}" in ${mainTopic}. Include:
- Introduction
- Core concepts with explanations
- Real-world examples
- Step-by-step implementation guide
- Best practices
- Common mistakes to avoid
- Summary and key takeaways

Format with proper HTML. Make sure the content is comprehensive and not truncated.`;
    stopSim();
    await sendSummery(prompt, url, mTopic, mSubTopic);
  }
}

async function sendSummery(prompt, url, mTopic, mSubTopic) {
  const dataToSend = { prompt: prompt };
  const stopSim = simulateProgress('theory');
  
  try {
    let generatedText = '';
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries && (!generatedText || !isContentComplete(generatedText, mSubTopic))) {
      try {
        const res = await axios.post(serverURL + '/api/generate', dataToSend, {
          timeout: 60000 // 60 second timeout
        });
        
        generatedText = res.data.generatedText;
        
        if (!generatedText || !isContentComplete(generatedText, mSubTopic)) {
          console.warn(`Content incomplete for ${mSubTopic}, retry ${retryCount + 1}`);
          generatedText = '';
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          break;
        }
      } catch (error) {
        console.error(`Summary generation attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // Ensure content is complete and properly formatted
    let finalText = generatedText;
    if (!finalText || !isContentComplete(finalText, mSubTopic)) {
      finalText = generateCompleteContent(mSubTopic, mainTopic);
      console.log(`Using fallback complete content for ${mSubTopic}`);
    } else {
      finalText = formatCompleteContent(finalText, mSubTopic, mainTopic);
    }
    
    stopSim();
    simulateProgress('complete');
    setLoadingProgress(100);
    
    setSelected(mSubTopic);
    setTheory(finalText);
    
    if (url) {
      setMedia(url);
      updateLocalCache(mTopic, mSubTopic, { 
        theory: finalText, 
        youtube: url,
        done: true 
      });
    } else {
      const placeholderUrl = getFallbackImage(mainTopic, mSubTopic);
      setMedia(placeholderUrl);
      updateLocalCache(mTopic, mSubTopic, { 
        theory: finalText, 
        image: placeholderUrl,
        done: true 
      });
    }
    
    await updateCourse();
    
    setTimeout(() => {
      setShowLoadingPopup(false);
      if (window.progressInterval) {
        clearInterval(window.progressInterval);
      }
    }, 1500);
    
  } catch (error) {
    console.error("Summary generation failed:", error);
    const fallbackContent = generateCompleteContent(mSubTopic, mainTopic);
    
    setTheory(fallbackContent);
    const placeholderUrl = getFallbackImage(mainTopic, mSubTopic);
    setMedia(placeholderUrl);
    
    updateLocalCache(mTopic, mSubTopic, { 
      theory: fallbackContent, 
      image: placeholderUrl,
      done: true 
    });
    
    await updateCourse();
    
    setShowLoadingPopup(false);
    if (window.progressInterval) {
      clearInterval(window.progressInterval);
    }
  }
}

const handleSelect = useCallback((topicTitle, subtopicTitle) => {
  if (!jsonData) return;

  const topicsList = jsonData['course_topics'] || jsonData[mainTopic.toLowerCase()];
  const mTopic = topicsList.find(topic => topic.title === topicTitle);
  const mSubTopic = mTopic?.subtopics.find(subtopic => subtopic.title === subtopicTitle);

  if (!mSubTopic) return;

  if (!isSubtopicUnlocked(topicTitle, subtopicTitle)) {
    toast({ title: "Lesson Locked", description: "Complete previous lessons to unlock this one." });
    return;
  }

  if (window.progressInterval) {
    clearInterval(window.progressInterval);
  }

  setSelected(subtopicTitle);

  if (mSubTopic.theory && mSubTopic.done) {
    // Validate content completeness before displaying
    let contentToShow = mSubTopic.theory;
    if (!isContentComplete(contentToShow, subtopicTitle)) {
      console.warn(`Incomplete content detected for ${subtopicTitle}, regenerating...`);
      // Content is incomplete, regenerate it
      setShowLoadingPopup(true);
      setLoadingSubtopic(subtopicTitle);
      setLoadingProgress(0);
      
      if (type === 'video & text course') {
        const query = `${subtopicTitle} ${mainTopic} in english`;
        sendVideo(query, topicTitle, subtopicTitle, subtopicTitle);
      } else {
        sendBulkCourseContent(topicTitle, subtopicTitle);
      }
      return;
    }
    
    // Ensure content is properly formatted
    contentToShow = formatCompleteContent(contentToShow, subtopicTitle, mainTopic);
    setTheory(contentToShow);
    
    if (type === 'video & text course') {
      setMedia(mSubTopic.youtube);
    } else {
      setMedia(mSubTopic.image || getFallbackImage(mainTopic, subtopicTitle));
    }
  } else {
    setShowLoadingPopup(true);
    setLoadingSubtopic(subtopicTitle);
    setLoadingProgress(0);
    
    if (type === 'video & text course') {
      const query = `${subtopicTitle} ${mainTopic} in english`;
      sendVideo(query, topicTitle, subtopicTitle, subtopicTitle);
    } else {
      sendBulkCourseContent(topicTitle, subtopicTitle);
    }
  }
}, [jsonData, mainTopic, isSubtopicUnlocked, type]);

const handleMarkAsComplete = async () => {
  if (!userId || !courseId || !selected) return;

  const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
  let currentTopicTitle = '';
  if (Array.isArray(topicsList)) {
    topicsList.forEach(t => {
      if (Array.isArray(t.subtopics) && t.subtopics.some(s => s.title === selected)) {
        currentTopicTitle = t.title;
      }
    });
  }

  let total = 0;
  topicsList.forEach(t => total += t.subtopics.length);

  try {
    const res = await axios.post(`${serverURL}/api/progress/update`, {
      userId,
      courseId,
      topicTitle: currentTopicTitle,
      subtopicTitle: selected,
      totalSubtopics: total
    });

    if (res.data.success) {
      setCompletedSubtopics(res.data.progress.completedSubtopics);
      setPercentage(res.data.progress.percentage);

      const allSubtopics = [];
      topicsList.forEach(t => {
        t.subtopics.forEach(s => {
          allSubtopics.push({ topicTitle: t.title, subtopicTitle: s.title });
        });
      });

      const currentIndex = allSubtopics.findIndex(s => s.subtopicTitle === selected);
      
      if (currentIndex < allSubtopics.length - 1) {
        const next = allSubtopics[currentIndex + 1];
        handleSelect(next.topicTitle, next.subtopicTitle);
        
        if (mainContentRef.current) {
          mainContentRef.current.scrollTop = 0;
        }
      } else {
        setIsCompleted(true);
        setPercentage(100);
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




/**
 * Complete fallback content generator
 */
function getCompleteFallbackContent(subtopic, topic) {
  return `<div class="prose dark:prose-invert max-w-none">
    <h2>${subtopic}</h2>
    
    <h3>Introduction</h3>
    <p>${subtopic} is a fundamental concept in ${topic}. Understanding this topic is essential for building a strong foundation in ${topic}.</p>
    
    <h3>Key Concepts</h3>
    <ul>
      <li><strong>Definition:</strong> ${subtopic} refers to the process of making decisions based on conditions in programming.</li>
      <li><strong>Importance:</strong> It allows programs to execute different code paths based on different conditions.</li>
      <li><strong>Common Use Cases:</strong> Input validation, user authentication, data processing, and business logic implementation.</li>
    </ul>
    
    <h3>Examples</h3>
    <pre><code>
# Example of ${subtopic.toLowerCase()} in Python
condition = True

if condition:
    print("Condition is true")
else:
    print("Condition is false")
    </code></pre>
    
    <h3>Best Practices</h3>
    <ul>
      <li>Keep conditions simple and readable</li>
      <li>Avoid deep nesting of conditional statements</li>
      <li>Use meaningful variable names in conditions</li>
      <li>Consider edge cases and handle them appropriately</li>
    </ul>
    
    <h3>Conclusion</h3>
    <p>Mastering ${subtopic} is crucial for writing effective and efficient ${topic} code. Practice with different scenarios to become proficient in using conditional statements.</p>
  </div>`;
}


/**
 * Helper function to ensure content is complete
 */
function ensureCompleteContent(content, subtopic, topic) {
  // Check if content seems truncated (ends mid-sentence)
  if (!content) {
    return getCompleteFallbackContent(subtopic, topic);
  }
  
  // Check if content ends with incomplete sentence
  const lastChar = content.trim().slice(-1);
  const words = content.split(' ');
  const lastWord = words[words.length - 1];
  
  // If content doesn't end with proper punctuation and seems cut off
  if (!['.', '!', '?', '"', "'", ')', '}'].includes(lastChar) && 
      lastWord.length > 3 && 
      !lastWord.includes('</') && 
      !lastWord.includes('/>')) {
    
    // Append a proper conclusion
    return content + ' This concept is fundamental to understanding ' + topic + '.';
  }
  
  return content;
}


  async function sendImageForBatch(promptImage: string, topics: string, sub: string, theory: string) {
  try {
    // Show theory immediately
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
    
    setIsLoading(false);
  }
}



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
    mSubTopic.theory = theory;
    mSubTopic.image = image;
    mSubTopic.done = true;

    // Batch update all states at once
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

    setSelected(mSubTopic.title);
    setTheory(theory);
    setMedia(image);

    setIsLoading(false);
    updateCourse();
  }

  async function updateCourse() {
    CountDoneTopics();
    sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
    const dataToSend = {
      content: JSON.stringify(jsonData),
      courseId: courseId
    };
    try {
      const postURL = serverURL + '/api/update';
      await axios.post(postURL, dataToSend);
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
    if (isLoading) return;

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
      const manualQuizzes = jsonData.quizzes.map((q, index) => ({
        id: index + 1,
        question: q.question,
        options: q.options.map((opt, i) => ({
          id: String.fromCharCode(97 + i), // 'a', 'b', 'c', ...
          text: opt
        })),
        correctAnswer: q.answer, // Assuming 'answer' stores the correct option text or ID. QuizPage logic handles both.
        answer: q.answer // Pass original answer for QuizPage flexible matching
      }));

      navigate(`/course/${courseId}/quiz`, {
        state: {
          topic: mainTopic,
          courseId,
          questions: manualQuizzes,
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

    setIsLoading(true);

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
        description: "Failed to generate exam",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const renderTopicsList = (topics) => {
    if (!topics || !Array.isArray(topics)) return null;
    return (
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={topics[0]?.title}
      >
        {topics.map((topic) => (
          <AccordionItem key={topic.title} value={topic.title} className="border-none">
            <AccordionTrigger className="py-2 text-left px-3 hover:bg-accent/50 rounded-md w-full">
              {topic.title}
            </AccordionTrigger>
            <AccordionContent className="pl-2">
              {topic.subtopics.map((subtopic) => (
                <div
                  onClick={() => {
                    if (isSubtopicUnlocked(topic.title, subtopic.title)) {
                      handleSelect(topic.title, subtopic.title);
                    } else {
                      toast({ title: "Locked", description: "Complete previous lessons to unlock this one." });
                    }
                  }}
                  key={subtopic.title}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md transition-colors",
                    isSubtopicUnlocked(topic.title, subtopic.title) ? "cursor-pointer hover:bg-accent/50" : "opacity-50 cursor-not-allowed",
                    selected === subtopic.title && "bg-accent/50 font-medium text-primary"
                  )}
                >
                  {completedSubtopics.some(s => s.topicTitle === topic.title && s.subtopicTitle === subtopic.title) ? (
                    <span className="mr-2 text-primary">✓</span>
                  ) : !isSubtopicUnlocked(topic.title, subtopic.title) && (
                    <Lock className="w-3 h-3 mr-2 opacity-50" />
                  )}
                  <span className="text-sm">{subtopic.title}</span>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
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
          setSelected(firstSubtopic.title);
          
          // Check if content exists
          if (firstSubtopic.theory) {
            setTheory(firstSubtopic.theory);
          } else {
            // Show loading message and trigger generation
            setTheory(`<div class="prose dark:prose-invert max-w-none">
              <h2>${firstSubtopic.title}</h2>
              <p>AI is crafting personalized content for you...</p>
              <div class="flex items-center justify-center p-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </div>`);
            
            // Show loading popup
            setShowLoadingPopup(true);
            setLoadingSubtopic(firstSubtopic.title);
            setLoadingProgress(0);
            simulateProgress('theory');
            
            // Trigger content generation
            setTimeout(() => {
              if (type === 'video & text course') {
                const query = `${firstSubtopic.title} ${mainTopic} in english`;
                sendVideo(query, mainTopicData.title, firstSubtopic.title, firstSubtopic.title);
              } else {
                sendBulkCourseContent(mainTopicData.title, firstSubtopic.title);
              }
            }, 100);
          }
          
          // Handle image
          if (type === 'video & text course') {
            if (firstSubtopic.youtube) {
              setMedia(firstSubtopic.youtube);
            }
          } else {
            if (firstSubtopic.image) {
              setMedia(firstSubtopic.image);
              preloadImageWithCache(firstSubtopic.image, firstSubtopic.title);
            } else {
              // Generate image in background
              setTimeout(() => {
                const promptImage = `Example of ${firstSubtopic.title} in ${mainTopic}`;
                sendImageForBatch(promptImage, mainTopicData.title, firstSubtopic.title, firstSubtopic.theory || '');
              }, 200);
            }
          }
        }
      }
    }

    setIsLoading(false);
    sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
    CountDoneTopics(isQuizPassed);
  }, [courseData, jsonData, completedSubtopics, isOrgAdmin, isQuizPassed, preloadImageWithCache, simulateProgress]);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Loading Popup */}
      <LoadingPopup 
        isOpen={showLoadingPopup}
        stage={loadingStage}
        subtopic={loadingSubtopic}
        progress={loadingProgress}
      />

      <header className="border-b border-border/40 py-2 px-4 flex justify-between items-center sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Course Content</h2>
                <ScrollArea className="h-[60vh]">
                  <div className="pr-4">
                    {jsonData && renderTopicsList(jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()])}
                    <p onClick={redirectExam} className='py-2 text-left px-3 hover:bg-accent/50 rounded-md cursor-pointer'>{pass === true ? <span className="mr-2 text-primary">✓</span> : <></>}{mainTopic} Quiz</p>
                  </div>
                </ScrollArea>
              </div>
            </DrawerContent>
          </Drawer>

          <div className="flex items-center gap-2">
            {!isOrgAdmin && (
              <div className="relative w-8 h-8">
                <svg className="w-8 h-8" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted-foreground/20" strokeWidth="2" />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-primary"
                    strokeWidth="2"
                    strokeDasharray="100"
                    strokeDashoffset={100 - percentage}
                    transform="rotate(-90 18 18)"
                  />
                  <text
                    x="18"
                    y="18"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    className="fill-foreground text-[10px] font-medium"
                  >
                    {percentage}%
                  </text>
                </svg>
              </div>
            )}
            <h1 className="text-xl font-bold">{mainTopic}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hidden md:flex"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <ToggleGroup type="single" className="hidden sm:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link to='/dashboard'>
                <Home className="h-4 w-4 mr-1" /> Home
              </Link>
            </Button>
            {(plan !== "free" || isOrgAdmin || userRole === 'student') && isQuizPassed && (
              <Button
                onClick={certificateCheck}
                variant="default"
                size="sm"
                className={cn(
                  "shadow-none",
                  (userRole === 'student' || !!sessionStorage.getItem('orgId'))
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white border-none"
                    : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                )}
              >
                <Award className="h-4 w-4 mr-1" /> Download Certificate
              </Button>
            )}

            <Button onClick={htmlDownload} disabled={exporting} variant="ghost" size="sm" asChild>
              <span className='cursor-pointer'><Download className="h-4 w-4 mr-1" />{exporting ? 'Exporting...' : 'Export'}</span>
            </Button>
            <ShareOnSocial
              textToShare={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
              link={websiteURL + '/shareable?id=' + courseId}
              linkTitle={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
              linkMetaDesc={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
              linkFavicon={appLogo}
              noReferer
            >
              <Button variant="ghost" size="sm" asChild>
                <span className='cursor-pointer'><Share className="h-4 w-4 mr-1" /> Share</span>
              </Button>
            </ShareOnSocial>
          </ToggleGroup>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className={cn(
          "bg-sidebar border-r border-border/40 transition-all duration-300 overflow-hidden hidden md:block",
          isMenuOpen ? "w-64" : "w-0"
        )}>
          <ScrollArea className="h-full">
            <div className="p-4">
              {jsonData && renderTopicsList(jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()])}
              <p onClick={redirectExam} className='py-2 text-left px-3 hover:bg-accent/50 rounded-md cursor-pointer'>{pass === true ? <span className="mr-2 text-primary">✓</span> : <></>}{mainTopic} Quiz</p>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" viewportRef={mainContentRef}>
            <main className="p-6 max-w-5xl mx-auto">
              {isLoading ? (
                <CourseContentSkeleton />
              ) : (
                <>
                  <h1 className="text-3xl font-bold mb-6">{selected}</h1>
                  <div className="space-y-4">
                    {type === 'video & text course' ? (
                      media ? (
                        <div>
                          <YouTube key={media} className='mb-5' videoId={media} opts={opts} />
                        </div>
                      ) : (
                        <div className="h-96 bg-muted flex items-center justify-center rounded-lg">
                          <p className="text-muted-foreground">Loading video...</p>
                        </div>
                      )
                    ) : (
                      <div className="relative w-full h-96 max-md:h-64 overflow-hidden rounded-lg bg-muted">
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
                              setImageLoading(prev => {
                                const newMap = new Map(prev);
                                newMap.delete(selected);
                                return newMap;
                              });
                            }}
                            onError={async (e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null; // Prevent infinite loop
                              
                              // Try to fetch a new image from the backend API
                              try {
                                const imagePrompt = `${selected} in ${mainTopic || ''}`;
                                const res = await axios.post(serverURL + '/api/image', { prompt: imagePrompt }, { timeout: 8000 });
                                if (res.data?.url) {
                                  target.src = res.data.url;
                                  return;
                                }
                              } catch (apiErr) {
                                console.error('Image API fallback failed:', apiErr);
                              }
                              
                              // Ultimate fallback - show a gradient with text
                              const parent = target.parentElement;
                              if (parent) {
                                target.style.display = 'none';
                                const gradientDiv = document.createElement('div');
                                gradientDiv.className = 'flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20';
                                gradientDiv.innerHTML = `
                                  <div class="text-center p-4">
                                    <p class="text-lg font-semibold text-primary">${selected}</p>
                                    <p class="text-sm text-muted-foreground">${mainTopic || 'Course'} visualization</p>
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
                              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-xs font-medium mt-2">Fetching Visuals...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {theory && <StyledText text={theory} />}

                    {!isOrgAdmin && (
                      <div className="pt-8 border-t border-border mt-8 flex justify-center">
                        <Button
                          onClick={handleMarkAsComplete}
                          className="px-8 py-6 text-lg gap-2"
                        >
                          {completedSubtopics.some(s => s.subtopicTitle === selected) ? (
                            <>Next Lesson <CheckCircle2 className="w-5 h-5" /></>
                          ) : (
                            <>Mark as Complete & Next <CheckCircle2 className="w-5 h-5" /></>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </main>
          </ScrollArea>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 flex justify-around items-center">
        <Button variant="ghost" size="sm">
          <Link to='/dashboard'>
            <Home className="h-5 w-5" />
          </Link>
        </Button>
        {(plan !== "free" || isOrgAdmin || userRole === 'student') && isQuizPassed && (
          <Button
            onClick={certificateCheck}
            variant="ghost"
            size="sm"
            className={cn(
              "font-bold",
              (userRole === 'student' || !!sessionStorage.getItem('orgId')) ? "text-yellow-600" : "text-primary"
            )}
          >
            <Award className="h-5 w-5" />
          </Button>
        )}
        <Button onClick={htmlDownload} disabled={exporting} variant="ghost" size="sm">
          <Download className="h-5 w-5" />
        </Button>
        <ShareOnSocial
          textToShare={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
          link={websiteURL + '/shareable?id=' + courseId}
          linkTitle={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
          linkMetaDesc={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
          linkFavicon={appLogo}
          noReferer
        >
          <Button variant="ghost" size="sm">
            <Share className="h-5 w-5" />
          </Button>
        </ShareOnSocial>
      </div>

      <div className="fixed bottom-16 right-6 flex flex-col gap-3 md:bottom-6">
        <Button
          size="icon"
          className="rounded-full bg-primary shadow-lg hover:shadow-xl"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          className="rounded-full bg-primary shadow-lg hover:shadow-xl"
          onClick={() => setIsNotesOpen(true)}
        >
          <ClipboardCheck className="h-5 w-5" />
        </Button>
      </div>

      {isMobile ? (
        <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
          <SheetContent side="bottom" className="h-[90vh] sm:max-w-full p-0">
            <div className="flex flex-col h-full p-4">
              <div className="py-2 px-4 border-b border-border mb-2">
                <h2 className="text-lg font-semibold">Course Assistant</h2>
              </div>
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pt-2 px-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        message.sender === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted"
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={isChatLoading}>
                  {isChatLoading ? "..." : "Send"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Course Assistant</DialogTitle>
            <div className="flex flex-col h-[60vh]">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pt-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-2/4 max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        message.sender === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted"
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
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

      {isMobile ? (
        <Sheet open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <SheetContent side="bottom" className="h-[90vh] sm:max-w-full p-0">
            <div className="flex flex-col h-full p-4">
              <div className="py-2 px-4 border-b border-border mb-2">
                <h2 className="text-lg font-semibold">Course Notes</h2>
              </div>
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pt-2 px-4">
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

              <div className="p-4 border-t border-border">
                <div className="flex justify-end">
                  <Button disabled={saving} onClick={handleSaveNote}>{saving ? 'Saving...' : 'Save Note'}</Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <DialogContent className="sm:max-w-lg">
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

              <div>
                <div className="flex justify-end">
                  <Button disabled={saving} onClick={handleSaveNote}>{saving ? 'Saving...' : 'Save Note'}</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CoursePage;