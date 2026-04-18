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
import { ChevronDown, Home, Share, Download, MessageCircle, ClipboardCheck, Menu, Award, Lock, CheckCircle2, Loader2, Sparkles, BookOpen, Image as ImageIcon, Brain, Video, FileText, ArrowLeft, ArrowRight, X, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCoursePresentationMeta } from '@/lib/coursePresentation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

// Fallback image utility
const getFallbackImage = (topic: string, subtopic: string) => {
  return `https://placehold.co/800x600/4f46e5/ffffff?text=${encodeURIComponent(subtopic.substring(0, 40))}`;
};

// Loading Popup Component - Responsive
const LoadingPopup = ({ 
  isOpen, 
  stage, 
  subtopic, 
  progress = 0, 
  onContinue,
  showContinueButton,
  remainingSeconds
}) => {
  const getAdjustedProgress = () => {
    if (stage === 'theory' || stage === 'video' || stage === 'transcript') {
      return Math.min(progress * 0.5, 50);
    } else if (stage === 'image') {
      return 50 + (progress * 0.5);
    } else if (stage === 'complete') {
      return 100;
    }
    return Math.min(progress, 100);
  };

  const adjustedProgress = getAdjustedProgress();
  const isComplete = adjustedProgress === 100;
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getStageContent = () => {
    switch(stage) {
      case 'video':
        return { icon: <Video className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 animate-pulse" />, title: 'Searching Video', message: `Finding the best tutorial for "${subtopic}"`, color: 'red' };
      case 'transcript':
        return { icon: <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 animate-bounce" />, title: 'Extracting Knowledge', message: `Processing video transcript for "${subtopic}"`, color: 'orange' };
      case 'theory':
        return { icon: <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 animate-pulse" />, title: 'Generating Content', message: `AI is creating learning material for "${subtopic}"`, color: 'blue' };
      case 'image':
        return { icon: <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 animate-bounce" />, title: 'Fetching Visuals', message: `Finding the perfect image for "${subtopic}"`, color: 'green' };
      case 'complete':
        return { icon: <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 animate-spin" />, title: 'Finalizing', message: 'Polishing the content for best experience', color: 'yellow' };
      default:
        return { icon: <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 animate-pulse" />, title: 'AI is Thinking', message: `Preparing your subtopic "${subtopic}"`, color: 'purple' };
    }
  };

  const content = getStageContent();
  if (!isOpen) return null;
  const isContentPhase = stage === 'theory' || stage === 'video' || stage === 'transcript' || (!stage && adjustedProgress <= 50);
  const phaseProgress = isContentPhase ? adjustedProgress : adjustedProgress - 50;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-[95vw] sm:w-full rounded-2xl sm:rounded-lg" aria-describedby={undefined}>
        <DialogTitle className="sr-only">{content.title}</DialogTitle>
        <div className="flex flex-col items-center py-6 sm:py-8 px-3 sm:px-4">
          <div className={`relative mb-4 sm:mb-6`}>
            <div className={`absolute inset-0 rounded-full bg-${content.color}-500/20 animate-ping`}></div>
            <div className={`relative z-10 p-3 sm:p-4 rounded-full bg-${content.color}-500/10`}>{content.icon}</div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {isComplete ? 'Ready to Continue!' : (isContentPhase ? 'Generating Content' : 'Fetching Visuals')}
          </h2>
          <p className="text-xs sm:text-sm text-center text-muted-foreground mb-1">
            {isComplete ? 'All content has been prepared for you' : `${content.title} • ${content.message}`}
          </p>
          <div className="w-full mt-4 mb-2">
            <div className="w-full h-2 sm:h-3 bg-muted rounded-full overflow-hidden flex">
              <div className="h-full bg-blue-500 transition-all duration-300 rounded-l-full" style={{ width: `${Math.min(adjustedProgress, 50)}%` }} />
              <div className="h-full bg-blue-500 transition-all duration-300 rounded-r-full" style={{ width: `${Math.max(0, adjustedProgress - 50)}%` }} />
            </div>
          </div>
          <p className="text-base sm:text-lg font-bold text-primary mt-1">{Math.round(adjustedProgress)}% Complete</p>
          <div className="w-full space-y-3 mt-4">
            {isComplete ? (
              <>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">✓ Content generation complete!</span>
                </div>
                <div className="mt-4 p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <p className="text-xs sm:text-sm font-medium text-yellow-600 dark:text-yellow-400">Please wait 20 sec before continuing</p>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">This pause helps with knowledge retention. Take a short break!</p>
                </div>
                <Button onClick={onContinue} disabled={!showContinueButton} className="w-full mt-4 gap-2 bg-green-600 hover:bg-green-700 text-sm sm:text-base">
                  {!showContinueButton ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Please wait {formatTime(remainingSeconds)}...</>
                  ) : (
                    <><ArrowRight className="w-4 h-4" />Continue Review</>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm">
                    {isContentPhase
                      ? `Creating learning material... (${Math.round(phaseProgress)}% of content phase)`
                      : `Finding and optimizing visuals... (${Math.round(phaseProgress)}% of visuals phase)`}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Skeleton className="h-10 sm:h-12 rounded-lg" />
                  <Skeleton className="h-10 sm:h-12 rounded-lg" />
                  <Skeleton className="h-10 sm:h-12 rounded-lg" />
                  <Skeleton className="h-10 sm:h-12 rounded-lg" />
                </div>
                <p className="text-xs text-muted-foreground/60 mt-6 italic">
                  ✨ {isContentPhase ? 'AI is crafting personalized content just for you...' : 'Finding the perfect visuals to enhance your learning...'}
                </p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const QuizLoadingPopup = ({ isOpen, topic }) => {
  if (!isOpen) return null;
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-[95vw] sm:w-full rounded-2xl sm:rounded-lg" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Preparing Quiz</DialogTitle>
        <div className="flex flex-col items-center py-6 sm:py-8 px-3 sm:px-4">
          <div className="mb-6 rounded-full bg-primary/10 p-3 sm:p-4">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">Preparing Quiz</h2>
          <p className="text-center text-muted-foreground mb-4 text-sm sm:text-base">Generating the assessment for {topic || 'this course'}.</p>
          <div className="w-full rounded-2xl border border-primary/15 bg-primary/5 p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground">
            Please wait while we collect course topics, build questions, and open the quiz page.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Regenerate Chapter Popup - Responsive
const RegenerateChapterPopup = ({ isOpen, chapterTitle, progress }) => {
  if (!isOpen) return null;
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-[95vw] sm:w-full rounded-2xl sm:rounded-lg" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Regenerating Chapter</DialogTitle>
        <div className="flex flex-col items-center py-6 sm:py-8 px-3 sm:px-4">
          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping"></div>
            <div className="relative z-10 p-3 sm:p-4 rounded-full bg-violet-500/10">
              <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-violet-500 animate-spin" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 bg-gradient-to-r from-violet-600 to-primary/60 bg-clip-text text-transparent">
            Regenerating Chapter
          </h2>
          <p className="text-xs sm:text-sm text-center text-muted-foreground mb-1 px-4">
            Refreshing all lessons in <span className="font-semibold text-foreground">"{chapterTitle}"</span>
          </p>
          <div className="w-full mt-5 mb-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{progress.done} of {progress.total} lessons done</span>
              <span className="font-semibold text-primary">{pct}%</span>
            </div>
            <div className="w-full h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-primary transition-all duration-500 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <div className="w-full space-y-3 mt-5">
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground">
                {progress.done < progress.total
                  ? `Generating theory and visuals for lesson ${progress.done + 1}…`
                  : 'Finalising and saving…'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Skeleton className="h-8 sm:h-10 rounded-lg" />
              <Skeleton className="h-8 sm:h-10 rounded-lg" />
              <Skeleton className="h-8 sm:h-10 rounded-lg" />
              <Skeleton className="h-8 sm:h-10 rounded-lg" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-6 italic">
            ✨ AI is crafting fresh content for each lesson…
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CoursePage = () => {
  const { state } = useLocation();
  const { courseId: paramCourseId } = useParams();
  const activeCourseId = state?.courseId || paramCourseId;
  const plan = sessionStorage.getItem('type');
  const [courseData, setCourseData] = useState(state || null);
  const [jsonData, setJsonData] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('jsonData')); } catch (e) { return null; }
  });

  // Loading Popup States
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [loadingStage, setLoadingStage] = useState('theory');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingSubtopic, setLoadingSubtopic] = useState('');
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  // Regenerate Chapter States
  const [regeneratingChapter, setRegeneratingChapter] = useState<string | null>(null);
  const [regenerateProgress, setRegenerateProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });

  // Image cache
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
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isLessonFlowOpen, setIsLessonFlowOpen] = useState(false);
  const [lessonFlowChapter, setLessonFlowChapter] = useState('');
  const [lessonFlowSearch, setLessonFlowSearch] = useState('');
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

  const [preloadedNextContent, setPreloadedNextContent] = useState(null);
  const apiCache = useRef(new Map());

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [isMenuOpenMobile, setIsMenuOpenMobile] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextLessonWithDelay = () => {
    if (isButtonDisabled) return;
    setIsButtonDisabled(true);
    setRemainingSeconds(80);
    setShowContinueButton(false);
    handleNextLesson();
    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) { clearInterval(interval); setIsButtonDisabled(false); setShowContinueButton(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  };


  const testImageUrl = useCallback((url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      setTimeout(() => resolve(false), 3000);
    });
  }, []);

// Add this new function to regenerate only the current lesson
const handleRegenerateCurrentLesson = async () => {
  if (!jsonData || !mainTopic || !userId || !currentLesson) {
    toast({ title: "Error", description: "Cannot regenerate lesson at this time." });
    return;
  }

  const { topicTitle, subtopicTitle } = currentLesson;
  
  const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
  const targetTopic = topicsList?.find(t => t.title === topicTitle);
  const targetSub = targetTopic?.subtopics?.find(s => s.title === subtopicTitle);
  
  if (!targetSub) {
    toast({ title: "Error", description: "Lesson not found." });
    return;
  }

  // Show loading state for this specific lesson
  setShowLoadingPopup(true);
  setLoadingSubtopic(subtopicTitle);
  setLoadingStage('theory');
  setLoadingProgress(0);

  // Clear any existing interval
  if (window.progressInterval) clearInterval(window.progressInterval);

  // Progress simulation variables
  let currentProgress = 0;
  const isVideoCourse = type === 'video & text course';
  const totalPhases = isVideoCourse ? 3 : 3; // theory + (video or image) + finalize
  let currentPhase = 1; // 1=theory, 2=media, 3=finalize

  // Progress simulation interval
  window.progressInterval = setInterval(() => {
    if (currentPhase === 1) {
      // Theory phase: 0-33%
      if (currentProgress < 33) {
        currentProgress += Math.random() * 3;
        setLoadingProgress(Math.min(currentProgress, 33));
      }
    } else if (currentPhase === 2) {
      // Media phase: 33-66%
      if (currentProgress < 66) {
        currentProgress += Math.random() * 2.5;
        setLoadingProgress(Math.min(currentProgress, 66));
      }
    } else if (currentPhase === 3) {
      // Finalize phase: 66-100%
      if (currentProgress < 99) {
        currentProgress += Math.random() * 2;
        setLoadingProgress(Math.min(currentProgress, 99));
      }
    }
  }, 200);

  try {
    // PHASE 1: Regenerate theory (0-33%)
    setLoadingStage('theory');
    setLoadingProgress(10);
    currentProgress = 10;
    
    const theoryRes = await axios.post(serverURL + '/api/generate-batch', {
      mainTopic,
      topicsList: [{ topicTitle, subtopics: [subtopicTitle] }],
      lang,
      userId,
      contentProfile: contentProfileId,
    });

    if (theoryRes.data?.success && theoryRes.data.topics?.[0]) {
      const newTheory = theoryRes.data.topics[0].subtopics[0].theory;
      const cleanedTheory = cleanGeneratedHtml(newTheory);
      targetSub.theory = cleanedTheory;
      
      // Update UI if this is the currently selected lesson
      if (selected === subtopicTitle) {
        setTheory(cleanedTheory);
      }
    }
    
    // Phase 1 complete
    setLoadingProgress(50);
    currentProgress = 50;

    // PHASE 2: Regenerate media based on course type (50-75%)
    if (isVideoCourse) {
      setLoadingStage('video');
      setLoadingProgress(60);
      
      const query = `${subtopicTitle} ${mainTopic} in english`;
      const ytRes = await axios.post(serverURL + '/api/yt', { prompt: query });
      if (ytRes.data?.url) {
        targetSub.youtube = ytRes.data.url;
        if (selected === subtopicTitle) {
          setMedia(ytRes.data.url);
        }
      }
    } else {
      // Subtopic image generation removed per user request to save tokens
      setLoadingStage('complete');
      setLoadingProgress(75);
    }
    
    // Phase 2 complete
    setLoadingProgress(66);
    currentProgress = 66;

    // PHASE 3: Finalizing and cleanup (66-100%)
    setLoadingStage('complete');
    setLoadingProgress(75);
    
    // Small delay to show finalizing stage
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Keep done status as false so user can mark as complete again
    targetSub.done = false;
    
    // Update state and storage
    setJsonData({ ...jsonData });
    sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
    await updateCourse();

    // Complete!
    setLoadingProgress(100);
    currentProgress = 100;
    
    // Show completion briefly before closing
    await new Promise(resolve => setTimeout(resolve, 800));

    toast({
      title: "Lesson Regenerated ✓",
      description: `"${subtopicTitle}" has been refreshed with new content.`,
    });
    
    // Close popup after completion
    setShowLoadingPopup(false);
    
  } catch (err) {
    console.error("Lesson regeneration failed:", err);
    setShowLoadingPopup(false);
    toast({
      title: "Regeneration Failed",
      description: "Something went wrong. Please try again.",
    });
  } finally {
    if (window.progressInterval) {
      clearInterval(window.progressInterval);
      window.progressInterval = null;
    }
  }
};
  const simulateProgress = useCallback((stage) => {
    setLoadingStage(stage);
    setLoadingProgress(0);
    if (window.progressInterval) clearInterval(window.progressInterval);
    window.progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (stage === 'complete' && prev >= 90) return prev;
        if (prev < 90) return prev + 10;
        return prev;
      });
    }, 400);
    return () => { if (window.progressInterval) clearInterval(window.progressInterval); };
  }, []);

  const preloadImageWithCache = useCallback((url, subtopicTitle, topicTitle = '') => {
    if (!url || imageCache.current.has(url)) return;
    imageCache.current.add(url);
    setImageLoading(prev => new Map(prev).set(subtopicTitle, true));
    const img = new Image();
    img.onload = () => {
      setPreloadedImages(prev => new Map(prev).set(subtopicTitle, url));
      setImageLoading(prev => { const m = new Map(prev); m.delete(subtopicTitle); return m; });
    };
    img.onerror = () => {
      const fallbackUrl = getFallbackImage(topicTitle || '', subtopicTitle);
      setPreloadedImages(prev => new Map(prev).set(subtopicTitle, fallbackUrl));
      setImageLoading(prev => { const m = new Map(prev); m.delete(subtopicTitle); return m; });
    };
    img.src = url;
  }, []);

  const preloadAllImages = useCallback(() => {
    if (!jsonData || !mainTopic || !selected) return;
    const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
    if (!topicsList) return;
    const allSubtopics = [];
    topicsList.forEach(t => t.subtopics.forEach(s => allSubtopics.push({ topicTitle: t.title, subtopicTitle: s.title, image: s.image })));
    const currentIndex = allSubtopics.findIndex(s => s.subtopicTitle === selected);
    for (let i = 1; i <= 3; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < allSubtopics.length) {
        const next = allSubtopics[nextIndex];
        if (next.image && !imageCache.current.has(next.image)) preloadImageWithCache(next.image, next.subtopicTitle);
      }
    }
  }, [jsonData, mainTopic, selected, preloadImageWithCache]);

  const preloadNextSubtopic = useCallback(async () => {
    if (!jsonData || !selected || !mainTopic || !lang || !userId) return;
    const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
    if (!topicsList) return;
    const allSubtopics = [];
    topicsList.forEach(t => t.subtopics.forEach(s => allSubtopics.push({ topicTitle: t.title, subtopicTitle: s.title, subtopic: s })));
    const currentIndex = allSubtopics.findIndex(s => s.subtopicTitle === selected);
    if (currentIndex < allSubtopics.length - 1) {
      const next = allSubtopics[currentIndex + 1];
      if (!next.subtopic.theory) {
        if (type === 'video & text course') {
          if (!next.subtopic.youtube) {
            try {
              const query = `${next.subtopicTitle} ${mainTopic} in english`;
              axios.post(serverURL + '/api/yt', { prompt: query }).then(res => {
                if (res.data?.url) updateLocalCache(next.topicTitle, next.subtopicTitle, { youtube: res.data.url });
              });
            } catch (e) { console.error("Background video search failed:", e); }
          }
        } else {
          try {
            const res = await axios.post(serverURL + '/api/generate-batch', {
              mainTopic, topicsList: [{ topicTitle: next.topicTitle, subtopics: [next.subtopicTitle] }],
              lang, userId, contentProfile: contentProfileId
            });
            if (res.data.success && res.data.topics[0]) {
              setPreloadedNextContent({ topicTitle: next.topicTitle, subtopicTitle: next.subtopicTitle, theory: res.data.topics[0].subtopics[0].theory });
              if (res.data.topics[0].subtopics[0].image) preloadImageWithCache(res.data.topics[0].subtopics[0].image, next.subtopicTitle);
            }
          } catch (error) { console.error("Preload failed:", error); }
        }
      } else if (next.subtopic.image) {
        preloadImageWithCache(next.subtopic.image, next.subtopicTitle);
      }
    }
  }, [contentProfileId, jsonData, selected, mainTopic, lang, userId, preloadImageWithCache]);

  const buildStyledTheoryPrompt = useCallback((subtopicTitle, transcriptText = '') => {
    const transcriptSection = transcriptText
      ? `Use the following transcript as supporting context and ignore any intro, outro, like, subscribe, or sponsor filler:\n${transcriptText}\n` : '';
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

  useEffect(() => {
    if (selected && jsonData) { preloadNextSubtopic(); preloadAllImages(); }
  }, [selected, jsonData, preloadNextSubtopic, preloadAllImages]);

  useEffect(() => {
    if (media && !imageCache.current.has(media) && type !== 'video & text course') preloadImageWithCache(media, selected);
  }, [media, selected, preloadImageWithCache, type]);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseData && activeCourseId) {
        const requesterId = sessionStorage.getItem('uid') || '';
        if (!requesterId) { window.location.href = `${websiteURL}/login`; return; }
        setIsLoading(true);
        try {
          const requesterRole = sessionStorage.getItem('role') || '';
          const organizationId = sessionStorage.getItem('orgId') || '';
          const response = await axios.get(`${serverURL}/api/shareable`, { params: { id: activeCourseId, requesterId, requesterRole, organizationId } });
          if (response.data && response.data.length > 0) {
            const course = response.data[0];
            const content = JSON.parse(course.content);
            let mainTopicValue = course.mainTopic;
            if (!mainTopicValue) {
              if (content && content['course_topics'] && content['course_topics'].length > 0) {
                mainTopicValue = content['course_topics'][0].title;
              } else {
                for (const key in content) { if (Array.isArray(content[key]) && content[key].length > 0) { mainTopicValue = content[key][0].title; break; } }
              }
            }
            const newCourseData = { mainTopic: mainTopicValue, type: course.type, courseId: course._id, end: course.end, pass: course.completed, lang: 'English' };
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
                if (course.type === 'video & text course') { setMedia(firstSubtopic.youtube); }
                else { setMedia(firstSubtopic.image); if (firstSubtopic.image) preloadImageWithCache(firstSubtopic.image, firstSubtopic.title); }
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch course data:", error);
          if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status || 0)) { window.location.href = `${websiteURL}/login`; return; }
        } finally { setIsLoading(false); }
      } else if (courseData) { setIsLoading(false); }
    };
    fetchCourseData();
  }, [activeCourseId, courseData, preloadImageWithCache]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (courseId && userId) {
        try {
          const res = await axios.get(`${serverURL}/api/progress?userId=${userId}&courseId=${courseId}`);
          if (res.data.success) { setCompletedSubtopics(res.data.progress.completedSubtopics || []); setPercentage(res.data.progress.percentage || 0); }
        } catch (error) { console.error("Failed to fetch progress:", error); }
        finally { setProgressLoading(false); }
      } else { setProgressLoading(false); }
    };
    fetchProgress();
  }, [courseId, userId]);

  async function getNotes() {
    try {
      const postURL = serverURL + '/api/getnotes';
      const response = await axios.post(postURL, { course: courseId });
      if (response.data.success) setValue(response.data.message);
    } catch (error) { console.error(error); }
  }

  const handleSaveNote = async () => {
    setSaving(true);
    const postURL = serverURL + '/api/savenotes';
    const response = await axios.post(postURL, { course: courseId, notes: value });
    if (response.data.success) {
      toast({ title: "Note saved", description: "Your note has been saved successfully." });
      setIsNotesOpen(false);
    } else { toast({ title: "Error", description: "Internal Server Error" }); }
    setSaving(false);
  };

  const CourseContentSkeleton = () => (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      <Skeleton className="h-6 sm:h-8 w-3/4 mb-6 sm:mb-8" />
      <div className="space-y-4 sm:space-y-6">
        <div><Skeleton className="h-5 sm:h-7 w-1/2 mb-3 sm:mb-4" /><Skeleton className="h-4 sm:h-5 w-full mb-2" /><Skeleton className="h-4 sm:h-5 w-full mb-2" /><Skeleton className="h-4 sm:h-5 w-3/4" /></div>
        <div><Skeleton className="h-5 sm:h-7 w-1/3 mb-3 sm:mb-4" /><Skeleton className="h-4 sm:h-5 w-full mb-2" /><Skeleton className="h-4 sm:h-5 w-full mb-2" /><Skeleton className="h-4 sm:h-5 w-5/6" /></div>
        <div><Skeleton className="h-5 sm:h-7 w-2/5 mb-3 sm:mb-4" /><Skeleton className="h-4 sm:h-5 w-full mb-2" /><Skeleton className="h-4 sm:h-5 w-full mb-2" /><Skeleton className="h-28 sm:h-36 w-full rounded-md bg-muted/30" /></div>
      </div>
    </div>
  );

  const opts = { height: '390', width: '640' };
  const optsMobile = { height: '200px', width: '100%' };

  const isSubtopicUnlocked = (topicTitle, subtopicTitle) => {
    if (isOrgAdmin) return true;
    if (!jsonData) return false;
    const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
    if (!Array.isArray(topicsList)) return false;
    const allSubtopics = [];
    topicsList.forEach(t => { if (Array.isArray(t.subtopics)) t.subtopics.forEach(s => allSubtopics.push({ topicTitle: t.title, subtopicTitle: s.title })); });
    const currentIndex = allSubtopics.findIndex(s => s.topicTitle === topicTitle && s.subtopicTitle === subtopicTitle);
    if (currentIndex === 0) return true;
    const prevSubtopic = allSubtopics[currentIndex - 1];
    const isPrevCompleted = completedSubtopics.some(s => s.topicTitle === prevSubtopic.topicTitle && s.subtopicTitle === prevSubtopic.subtopicTitle);
    const isCurrentCompleted = completedSubtopics.some(s => s.topicTitle === topicTitle && s.subtopicTitle === subtopicTitle);
    return isPrevCompleted || isCurrentCompleted;
  };

  const handleMarkAsComplete = async () => {
    if (!userId || !courseId || !currentLesson) return;
    const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
    const activeTopicTitle = currentLesson.topicTitle;
    const activeSubtopicTitle = currentLesson.subtopicTitle;
    const alreadyCompleted = completedSubtopics.some(e => e.topicTitle === activeTopicTitle && e.subtopicTitle === activeSubtopicTitle);
    if (alreadyCompleted) { if (nextLesson) selectSubtopic(nextLesson.topicTitle, nextLesson.subtopicTitle); return; }
    let total = 0;
    topicsList.forEach(t => total += t.subtopics.length);
    try {
      const res = await axios.post(`${serverURL}/api/progress/update`, { userId, courseId, topicTitle: activeTopicTitle, subtopicTitle: activeSubtopicTitle, totalSubtopics: total });
      if (res.data.success) {
        setCompletedSubtopics(res.data.progress.completedSubtopics || []);
        setPercentage(res.data.progress.percentage);
        if (nextLesson) { selectSubtopic(nextLesson.topicTitle, nextLesson.subtopicTitle); if (mainContentRef.current) mainContentRef.current.scrollTop = 0; }
        else { toast({ title: "Course Completed!", description: "You've finished all lessons. You can now take the quiz." }); }
      }
    } catch (error) { console.error("Failed to update progress:", error); }
  };

  const loadMessages = async () => {
    try {
      const jsonValue = sessionStorage.getItem(mainTopic);
      if (jsonValue !== null) {
        const savedMessages = JSON.parse(jsonValue).map((msg, index) => ({ ...msg, id: msg.id || `msg-${Date.now()}-${index}` }));
        setMessages(savedMessages);
      } else {
        const initialMessages = [{ id: `msg-${Date.now()}`, text: defaultMessage, sender: 'bot' }];
        setMessages(initialMessages);
        await storeLocal(initialMessages);
      }
    } catch (error) { console.error(error); }
  };

  async function storeLocal(messages) {
    try { sessionStorage.setItem(mainTopic, JSON.stringify(messages)); } catch (error) { console.error(error); }
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
    try {
      const response = await axios.post(serverURL + '/api/chat', { prompt: mainPrompt });
      if (response.data.success === false) {
        toast({ title: "Assistant Error", description: response.data.message || "Failed to get a response." });
      } else {
        const botMessage = { id: `bot-${Date.now()}`, text: response.data.text, sender: 'bot' };
        const updatedMessagesWithBot = [...updatedMessages, botMessage];
        setMessages(updatedMessagesWithBot);
        await storeLocal(updatedMessagesWithBot);
      }
    } catch (error) { toast({ title: "Assistant Error", description: "Communication failure with AI assistant." }); console.error(error); }
    finally { setIsChatLoading(false); }
  };

  useEffect(() => { if (mainTopic) CountDoneTopics(); }, [isQuizPassed, completedSubtopics, jsonData, isOrgAdmin]);

  const CountDoneTopics = (passed = isQuizPassed) => {
    if (isOrgAdmin || passed) { setPercentage(100); setIsCompleted(true); return; }
    if (!jsonData) return;
    let doneCount = 0; let totalTopics = 0;
    const topicsData = jsonData['course_topics'] || (mainTopic ? jsonData[mainTopic.toLowerCase()] : []);
    if (!Array.isArray(topicsData)) return;
    topicsData.forEach(topic => {
      if (Array.isArray(topic.subtopics)) {
        topic.subtopics.forEach(subtopic => {
          if (completedSubtopics.some(s => s.topicTitle === topic.title && s.subtopicTitle === subtopic.title)) doneCount++;
          totalTopics++;
        });
      }
    });
    const completionPercentage = totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0;
    const finalPercentage = Math.min(completionPercentage, 99);
    setPercentage(finalPercentage);
    if (finalPercentage >= 100) setIsCompleted(true);
  };

  const updateLocalCache = (clickedTopic, clickedSub, updates) => {
    const updatedData = { ...jsonData };
    const topicsList = updatedData['course_topics'] || updatedData[mainTopic?.toLowerCase()];
    const targetTopic = topicsList?.find(t => t.title === clickedTopic);
    const targetSub = targetTopic?.subtopics.find(s => s.title === clickedSub);
    if (targetSub) {
      Object.assign(targetSub, updates);
      setJsonData(updatedData);
      sessionStorage.setItem('jsonData', JSON.stringify(updatedData));
      if (updates.theory && selected === clickedSub) setTheory(updates.theory);
    }
  };

  const cleanGeneratedHtml = (htmlContent) => {
    if (!htmlContent) return '';
    let cleaned = String(htmlContent);
    cleaned = cleaned.replace(/^\s*```html?\s*/i, '');
    cleaned = cleaned.replace(/^\s*```\s*/i, '');
    cleaned = cleaned.replace(/\s*```\s*$/i, '');
    cleaned = cleaned.replace(/^\s*html\s*(?:\r?\n|\s)+/i, '');
    cleaned = cleaned.replace(/<html[^>]*>[\s\S]*?<\/html>/gi, (match) => {
      const bodyMatch = match.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      return bodyMatch ? bodyMatch[1] : '';
    });
    cleaned = cleaned.replace(/<body[^>]*>|<\/body>/gi, '');
    cleaned = cleaned.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
    cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');
    cleaned = cleaned.replace(/<\?xml[^>]*\?>/gi, '');
    cleaned = cleaned.replace(/<meta[^>]*>/gi, '');
    cleaned = cleaned.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
    cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    cleaned = cleaned.replace(/<link[^>]*>/gi, '');
    cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '');
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');
    cleaned = cleaned.trim();
    if (!cleaned || cleaned.length < 50) {
      return `<div class="prose dark:prose-invert max-w-none"><h2 class="text-lg sm:text-xl">${htmlContent.substring(0, 100)}</h2><p class="text-sm">Content is being processed. Please refresh the page in a moment.</p></div>`;
    }
    return cleaned;
  };

  const isSubtopicReadyForDisplay = (subtopic) => {
    if (!subtopic?.theory) return false;
    const plainText = String(subtopic.theory || '').replace(/<pre[\s\S]*?<\/pre>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
    if (plainText.length < 1200) return false;
    if (wordCount < 220) return false;
    return type === 'video & text course' ? !!subtopic.youtube : !!subtopic.image;
  };

  const startSubtopicPreparation = (topicTitle, subtopicTitle, subtopicData) => {
    if (subtopicData?.theory && subtopicData.theory.length > 500) {
      setShowLoadingPopup(false);
      setSelectedTopicTitle(topicTitle);
      setSelected(subtopicTitle);
      setTheory(cleanGeneratedHtml(subtopicData.theory));
      setMedia(type === 'video & text course' ? subtopicData.youtube : subtopicData.image);
      return;
    }
    setShowLoadingPopup(true);
    setLoadingSubtopic(subtopicTitle);
    setLoadingProgress(0);
    setSelectedTopicTitle(topicTitle);
    setSelected(subtopicTitle);
    if (subtopicData?.theory) {
      setTheory(cleanGeneratedHtml(subtopicData.theory));
      setMedia(type === 'video & text course' ? subtopicData.youtube || '' : subtopicData.image || '');
    } else {
      setTheory(`<div class="prose dark:prose-invert max-w-none"><h2 class="text-xl sm:text-2xl">${subtopicTitle}</h2><p class="text-sm sm:text-base">AI is crafting personalized content for you...</p><div class="flex items-center justify-center p-6 sm:p-8"><div class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div></div></div>`);
      setMedia(null);
    }
    if (type === 'video & text course') sendVideo(`${subtopicTitle} ${mainTopic}`, topicTitle, subtopicTitle, subtopicTitle);
    else if (subtopicData?.theory) sendImageForBatch(`${subtopicTitle} in ${mainTopic}`, topicTitle, subtopicTitle, subtopicData.theory);
    else sendBulkCourseContent(topicTitle, subtopicTitle);
  };

  async function sendBulkCourseContent(clickedTopic, clickedSub) {
    setShowLoadingPopup(true);
    setLoadingSubtopic(clickedSub);
    const clearTheoryProgress = simulateProgress('theory');
    setSelectedTopicTitle(clickedTopic);
    setSelected(clickedSub);
    setTheory(`<div class="prose dark:prose-invert max-w-none"><h2 class="text-xl sm:text-2xl">${clickedSub}</h2><p class="text-sm sm:text-base">AI is crafting personalized content for you...</p><div class="flex items-center justify-center p-6 sm:p-8"><div class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div></div></div>`);
    setMedia(null);
    try {
      const theoryRes = await axios.post(serverURL + '/api/generate-batch', {
        mainTopic, topicsList: [{ topicTitle: clickedTopic, subtopics: [clickedSub] }], lang, userId, contentProfile: contentProfileId
      });
      if (theoryRes.data?.success && theoryRes.data.topics?.[0]) {
        const newTheory = theoryRes.data.topics[0].subtopics[0].theory;
        const cleanedTheory = cleanGeneratedHtml(newTheory);
        const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
        const targetTopic = topicsList?.find(t => t.title === clickedTopic);
        const targetSub = targetTopic?.subtopics.find(s => s.title === clickedSub);
        if (targetSub) { 
          targetSub.theory = cleanedTheory; 
          targetSub.done = true; // Mark as done after theory generation
          setJsonData({ ...jsonData }); 
          sessionStorage.setItem('jsonData', JSON.stringify(jsonData)); 
          setTheory(cleanedTheory); 
        }
      }
      if (clearTheoryProgress) clearTheoryProgress();
      
      // Image generation removed per user request to save tokens
      
      await updateCourse();
      simulateProgress('complete');
      setLoadingProgress(100);
      setTimeout(() => { setShowLoadingPopup(false); if (window.progressInterval) clearInterval(window.progressInterval); }, 1500);
    } catch (error) {
      console.error("Theory generation failed:", error);
      setTheory(`<div class="prose dark:prose-invert max-w-none"><h2 class="text-xl sm:text-2xl">${clickedSub}</h2><p class="text-sm sm:text-base">Sorry, we encountered an error loading the content. Please try again.</p><p class="text-xs sm:text-sm text-muted-foreground mt-2">Error: ${error.message}</p></div>`);
      setShowLoadingPopup(false);
      if (window.progressInterval) clearInterval(window.progressInterval);
    }
  }

  async function sendImageForBatch(promptImage: string, topics: string, sub: string, theory: string) {
    try {
      setShowLoadingPopup(true);
      setLoadingSubtopic(sub);
      setLoadingProgress(0);
      simulateProgress('image');
      setSelectedTopicTitle(topics || currentTopicTitle || '');
      setSelected(sub);
      setTheory(cleanGeneratedHtml(theory));
      setImageLoading(prev => new Map(prev).set(sub, true));
      const topicContext = topics || mainTopic;
      // Subtopic image generation removed per user request to save tokens
      // We will only use a fallback image directly if needed, or none at all.
      const imageUrl = getFallbackImage(topicContext, sub);
      if (imageUrl) { 
        preloadImageWithCache(imageUrl, sub, topicContext); 
        setMedia(imageUrl); 
      }
      const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
      if (topicsList) {
        const mTopic = topicsList.find((t: any) => t.title === topics);
        const mSubTopic = mTopic?.subtopics.find((s: any) => s.title === sub);
        if (mSubTopic) { mSubTopic.image = imageUrl; mSubTopic.done = true; sessionStorage.setItem('jsonData', JSON.stringify(jsonData)); updateCourse(); }
      }
      setImageLoading(prev => { const m = new Map(prev); m.delete(sub); return m; });
      simulateProgress('complete');
      setLoadingProgress(100);
      setTimeout(() => { setShowLoadingPopup(false); if (window.progressInterval) clearInterval(window.progressInterval); }, 1500);
      setIsLoading(false);
    } catch (error) {
      console.error("Image generation error:", error);
      const topicContext = topics || mainTopic;
      const fallbackUrl = getFallbackImage(topicContext, sub);
      setMedia(fallbackUrl);
      const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
      if (topicsList) {
        const mTopic = topicsList.find((t: any) => t.title === topics);
        const mSubTopic = mTopic?.subtopics.find((s: any) => s.title === sub);
        if (mSubTopic) { mSubTopic.image = fallbackUrl; mSubTopic.done = true; sessionStorage.setItem('jsonData', JSON.stringify(jsonData)); }
      }
      setImageLoading(prev => { const m = new Map(prev); m.delete(sub); return m; });
      setShowLoadingPopup(false);
      if (window.progressInterval) clearInterval(window.progressInterval);
      setIsLoading(false);
    }
  }

  const selectSubtopic = useCallback((topicTitle, subtopicTitle) => {
    if (!jsonData) return;
    const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
    const mTopic = topicsList?.find(topic => topic.title === topicTitle);
    const mSubTopic = mTopic?.subtopics?.find(subtopic => subtopic.title === subtopicTitle);
    if (!mSubTopic) return;
    if (window.progressInterval) clearInterval(window.progressInterval);
    setSelectedTopicTitle(topicTitle);
    setSelected(subtopicTitle);
    const hasValidTheory = mSubTopic.theory && mSubTopic.theory.length > 500 && !mSubTopic.theory.includes("AI is crafting personalized content");
    const hasValidMedia = type === 'video & text course' ? mSubTopic.youtube : mSubTopic.image;
    if (hasValidTheory && hasValidMedia) {
      setTheory(cleanGeneratedHtml(mSubTopic.theory));
      setMedia(type === 'video & text course' ? mSubTopic.youtube : mSubTopic.image);
    } else if (hasValidTheory) {
      setTheory(cleanGeneratedHtml(mSubTopic.theory));
      startSubtopicPreparation(topicTitle, subtopicTitle, mSubTopic);
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

  const handleRegenerateChapter = async (topicTitle: string) => {
    if (!jsonData || !mainTopic || !userId || regeneratingChapter) return;

    const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
    const targetTopic = topicsList?.find(t => t.title === topicTitle);
    if (!targetTopic) return;

    const subtopics = targetTopic.subtopics || [];
    if (subtopics.length === 0) return;

    setRegeneratingChapter(topicTitle);
    setRegenerateProgress({ done: 0, total: subtopics.length });

    try {
      for (let i = 0; i < subtopics.length; i++) {
        const sub = subtopics[i];

        try {
          const theoryRes = await axios.post(serverURL + '/api/generate-batch', {
            mainTopic,
            topicsList: [{ topicTitle, subtopics: [sub.title] }],
            lang,
            userId,
            contentProfile: contentProfileId,
          });

          if (theoryRes.data?.success && theoryRes.data.topics?.[0]) {
            const newTheory = theoryRes.data.topics[0].subtopics[0].theory;
            const cleanedTheory = cleanGeneratedHtml(newTheory);
            sub.theory = cleanedTheory;
            sub.done = true; // Mark as done after theory refreshed
            if (selected === sub.title) setTheory(cleanedTheory);
          }
        } catch (theoryErr) {
          console.error(`Theory generation failed for ${sub.title}:`, theoryErr);
        }

        setJsonData({ ...jsonData });
        sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
        setRegenerateProgress({ done: i + 1, total: subtopics.length });
      }

      await updateCourse();

      toast({
        title: "Chapter Regenerated ✓",
        description: `All ${subtopics.length} lessons in "${topicTitle}" have been refreshed with new content.`,
      });
    } catch (err) {
      console.error("Chapter regeneration failed:", err);
      toast({
        title: "Regeneration Failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setRegeneratingChapter(null);
      setRegenerateProgress({ done: 0, total: 0 });
    }
  };

  async function sendPrompt(prompt, promptImage, topics, sub) {
    try {
      const postURL = serverURL + '/api/generate';
      const res = await axios.post(postURL, { prompt });
      const generatedText = res.data.generatedText;
      try { 
        // Bypassing image generation to save tokens
        sendData('', generatedText, topics, sub); 
      }
      catch (error) { console.error(error); toast({ title: "Error", description: "Internal Server Error" }); setIsLoading(false); }
    } catch (error) { console.error(error); toast({ title: "Error", description: "Internal Server Error" }); setIsLoading(false); }
  }

  async function sendImage(parsedJson, promptImage, topics, sub) {
    // Disabled per user request to save tokens
    sendData('', parsedJson, topics, sub);
  }

  async function sendData(image, theory, topics, sub) {
    const topicsList = jsonData?.course_topics || jsonData?.[mainTopic?.toLowerCase()];
    if (!topicsList) { setIsLoading(false); return; }
    const mTopic = topicsList.find(topic => topic.title === topics);
    if (!mTopic) { setIsLoading(false); return; }
    const mSubTopic = mTopic.subtopics?.find(subtopic => subtopic.title === sub);
    if (!mSubTopic) { setIsLoading(false); return; }
    const cleanedTheory = cleanGeneratedHtml(theory);
    mSubTopic.theory = cleanedTheory;
    mSubTopic.image = image;
    mSubTopic.done = true;
    setSelectedTopicTitle(topics);
    setSelected(mSubTopic.title);
    setTheory(cleanedTheory);
    setMedia(image);
    setIsLoading(false);
    sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
    updateCourse();
  }

  async function sendDataVideo(image, theory, topics, sub) {
    const topicsList = jsonData?.course_topics || jsonData?.[mainTopic?.toLowerCase()];
    if (!topicsList) { setIsLoading(false); return; }
    const mTopic = topicsList.find(topic => topic.title === topics);
    if (!mTopic) { setIsLoading(false); return; }
    const mSubTopic = mTopic.subtopics?.find(subtopic => subtopic.title === sub);
    if (!mSubTopic) { setIsLoading(false); return; }
    const cleanedTheory = cleanGeneratedHtml(theory);
    mSubTopic.theory = cleanedTheory;
    mSubTopic.youtube = image;
    mSubTopic.done = true;
    setSelectedTopicTitle(topics);
    setSelected(mSubTopic.title);
    setTheory(cleanedTheory);
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
        if (!isOrgEditor) return;
        const orgTopics = (Array.isArray(jsonData?.course_topics) ? jsonData.course_topics : []).map((topic: any, topicIndex: number) => ({
          title: topic?.title || `Module ${topicIndex + 1}`, order: topicIndex + 1,
          subtopics: (Array.isArray(topic?.subtopics) ? topic.subtopics : []).map((subtopic: any, subtopicIndex: number) => ({
            title: subtopic?.title || `Lesson ${subtopicIndex + 1}`,
            content: subtopic?.theory || subtopic?.content || '',
            videoUrl: subtopic?.youtube || subtopic?.videoUrl || '',
            diagram: subtopic?.image || subtopic?.diagram || '',
            order: subtopicIndex + 1
          }))
        }));
        await axios.put(`${serverURL}/api/org/course/${courseId}`, {
          title: jsonData?.course_title || mainTopic || '', description: jsonData?.course_details || '', type,
          topics: orgTopics, quizzes: Array.isArray(jsonData?.quizzes) ? jsonData.quizzes : [],
          quizSettings: jsonData?.quizSettings || {}, courseMeta: jsonData?.course_meta || {},
          updatedBy: sessionStorage.getItem('uid')
        });
        return;
      }
      await axios.post(serverURL + '/api/update', { content: JSON.stringify(jsonData), courseId });
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error?.response?.data?.message || "Internal Server Error" });
      setIsLoading(false);
    }
  }

  async function sendVideo(query, mTopic, mSubTopic, subtop) {
    const stopSim = simulateProgress('video');
    try {
      const res = await axios.post(serverURL + '/api/yt', { prompt: query });
      try { stopSim(); sendTranscript(res.data.url, mTopic, mSubTopic, subtop); }
      catch (error) { console.error(error); toast({ title: "Error", description: "Internal Server Error" }); setIsLoading(false); }
    } catch (error) { console.error(error); toast({ title: "Error", description: "Internal Server Error" }); setIsLoading(false); }
  }

  async function sendTranscript(url, mTopic, mSubTopic, subtop) {
    const stopSim = simulateProgress('transcript');
    try {
      const res = await axios.post(serverURL + '/api/transcript', { prompt: url });
      try {
        const concatenatedText = res.data.transcript.map(item => item.text).join(' ');
        const prompt = buildStyledTheoryPrompt(subtop, concatenatedText);
        stopSim(); sendSummery(prompt, url, mTopic, mSubTopic);
      } catch (error) { const prompt = buildStyledTheoryPrompt(subtop); stopSim(); sendSummery(prompt, url, mTopic, mSubTopic); }
    } catch (error) { const prompt = buildStyledTheoryPrompt(subtop); stopSim(); sendSummery(prompt, url, mTopic, mSubTopic); }
  }

  async function sendSummery(prompt, url, mTopic, mSubTopic) {
    const stopSim = simulateProgress('theory');
    try {
      const res = await axios.post(serverURL + '/api/generate', { prompt });
      const generatedText = res.data.generatedText;
      try {
        stopSim(); simulateProgress('complete'); setLoadingProgress(100);
        setTimeout(() => setShowLoadingPopup(false), 1500);
        const cleanedTheory = cleanGeneratedHtml(generatedText);
        sendDataVideo(url, cleanedTheory, mTopic, mSubTopic);
      } catch (error) { console.error(error); toast({ title: "Error", description: "Internal Server Error" }); setIsLoading(false); }
    } catch (error) { console.error(error); toast({ title: "Error", description: "Internal Server Error" }); setIsLoading(false); }
  }

  async function htmlDownload() {
    try {
      setExporting(true);
      const topics = jsonData?.course_topics || jsonData?.[mainTopic?.toLowerCase()];
      if (!topics || !Array.isArray(topics)) { toast({ title: "Export Failed", description: "Course topics not found" }); setExporting(false); return; }
      const combinedHtml = await getCombinedHtml(mainTopic, topics);
      const tempDiv = document.createElement("div");
      tempDiv.style.width = "100%";
      tempDiv.innerHTML = combinedHtml;
      document.body.appendChild(tempDiv);
      const options = {
        filename: `${mainTopic}.pdf`, image: { type: "jpeg", quality: 1 }, margin: [15, 15, 15, 15],
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }, html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      };
      await html2pdf().from(tempDiv).set(options).save();
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast({ title: "Export Failed", description: "Something went wrong while exporting PDF." });
    } finally { setExporting(false); }
  }

  async function getCombinedHtml(mainTopic, topics) {
    if (!topics || !Array.isArray(topics)) { console.error("Invalid topics passed to getCombinedHtml:", topics); return "<p>No topics available</p>"; }
    async function toDataUrl(url) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () { const reader = new FileReader(); reader.onloadend = function () { resolve(reader.result); }; reader.readAsDataURL(xhr.response); };
        xhr.onerror = function () { reject({ status: xhr.status, statusText: xhr.statusText }); };
        xhr.open("GET", url); xhr.responseType = "blob"; xhr.send();
      }).catch(error => { console.error(`Failed to fetch image at ${url}:`, error); return ''; });
    }
    const topicsHtml = topics.map(topic => `<h3 style="font-size: 18pt; font-weight: bold; margin: 0; margin-top: 15px;">${topic.title}</h3>${topic.subtopics.map(subtopic => `<p style="font-size: 16pt; margin-top: 10px;">${subtopic.title}</p>`).join('')}`).join('');
    const theoryPromises = topics.map(async topic => {
      const subtopicPromises = topic.subtopics.map(async (subtopic) => {
        const imageUrl = type === 'text & image course' ? await toDataUrl(subtopic.image) : ``;
        return `<div><p style="font-size: 16pt; margin-top: 20px; font-weight: bold;">${subtopic.title}</p><div style="font-size: 12pt; margin-top: 15px;">${subtopic.done ? `${type === 'text & image course' ? (imageUrl ? `<img style="margin-top: 10px;" src="${imageUrl}" alt="${subtopic.title} image">` : `<a style="color: #0000FF;" href="${subtopic.image}" target="_blank">View example image</a>`) : `<a style="color: #0000FF;" href="https://www.youtube.com/watch?v=${subtopic.youtube}" target="_blank" rel="noopener noreferrer">Watch the YouTube video on ${subtopic.title}</a>`}<div style="margin-top: 10px;">${subtopic.theory}</div>` : `<div style="margin-top: 10px;">Please visit ${subtopic.title} topic to export as PDF.</div>`}</div></div>`;
      });
      const subtopicHtml = await Promise.all(subtopicPromises);
      return `<div style="margin-top: 30px;"><h3 style="font-size: 18pt; text-align: center; font-weight: bold; margin: 0;">${topic.title}</h3>${subtopicHtml.join('')}</div>`;
    });
    const theoryHtml = await Promise.all(theoryPromises);
    return `<div class="html2pdf__page-break" style="display: flex; align-items: center; justify-content: center; text-align: center; margin: 0 auto; max-width: 100%; height: 11in;"><h1 style="font-size: 30pt; font-weight: bold; margin: 0;">${mainTopic}</h1></div><div class="html2pdf__page-break" style="text-align: start; margin-top: 30px; margin-right: 16px; margin-left: 16px;"><h2 style="font-size: 24pt; font-weight: bold; margin: 0;">Index</h2><br><hr>${topicsHtml}</div><div style="text-align: start; margin-right: 16px; margin-left: 16px;">${theoryHtml.join('')}</div>`;
  }

  async function redirectExam() {
    if (isQuizLoading) return;
    if (!isOrgAdmin && jsonData) {
      const topicsList = jsonData['course_topics'] || jsonData[mainTopic?.toLowerCase()];
      if (topicsList) {
        let allDone = true;
        topicsList.forEach(t => { t.subtopics.forEach(s => { if (!completedSubtopics.some(cs => cs.topicTitle === t.title && cs.subtopicTitle === s.title)) allDone = false; }); });
        if (!allDone) { toast({ title: "Quiz Locked", description: "Please complete all lessons before taking the quiz." }); return; }
      }
    }
    if (jsonData?.quizzes && Array.isArray(jsonData.quizzes) && jsonData.quizzes.length > 0) {
      const cooldownActive = !!quizAttemptSummary?.nextAttemptAvailableAt && new Date(quizAttemptSummary.nextAttemptAvailableAt) > new Date();
      if (!isOrgAdmin) {
        if (isQuizPassed) { toast({ title: "Quiz locked", description: "You have already passed this quiz." }); return; }
        if (quizAttemptSummary?.maxAttemptsReached) { toast({ title: "Quiz locked", description: "Maximum attempts reached for this quiz." }); return; }
        if (cooldownActive) { toast({ title: "Quiz locked", description: `Next attempt is available after ${new Date(quizAttemptSummary.nextAttemptAvailableAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` }); return; }
      }
      navigate(`/course/${courseId}/quiz`, { state: { topic: mainTopic, courseId, questions: jsonData.quizzes, manualQuizExam: true, orgManagedQuiz: Boolean(jsonData?.course_meta?.organizationManaged), quizSettings: jsonData.quizSettings || {} } });
      return;
    }
    if (!jsonData?.course_topics || !Array.isArray(jsonData.course_topics)) { toast({ title: "Error", description: "Course data not loaded" }); return; }
    if (!mainTopic) { toast({ title: "Error", description: "Main topic not selected" }); return; }
    const allSubtopics = jsonData.course_topics.flatMap((topic: any) => Array.isArray(topic.subtopics) ? topic.subtopics : []);
    if (!allSubtopics.length) { toast({ title: "Error", description: "No subtopics available for exam" }); return; }
    const subtopicsString = allSubtopics.map((sub: any) => sub.title).join(', ');
    setIsQuizLoading(true);
    try {
      const response = await axios.post(`${serverURL}/api/aiexam`, { courseId, mainTopic, subtopicsString, lang });
      if (!response.data?.success) throw new Error('API failed');
      const questions = JSON.parse(response.data.message);
      navigate(`/course/${courseId}/quiz`, { state: { topic: mainTopic, courseId, questions, generatedQuizSession: true } });
    } catch (error) {
      console.error('redirectExam error:', error);
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to generate exam" });
    } finally { setIsQuizLoading(false); }
  }

  const renderTopicsList = (topics) => {
    if (!topics || !Array.isArray(topics)) return null;
    return (
      <Accordion
        type="single" collapsible className="w-full space-y-2 sm:space-y-3"
        defaultValue={topics.find((topic) => topic.subtopics?.some((subtopic) => subtopic.title === selected))?.title || topics[0]?.title}
      >
        {topics.map((topic, topicIndex) => {
          const topicSubtopics = Array.isArray(topic.subtopics) ? topic.subtopics : [];
          const topicCompletedCount = topicSubtopics.filter(subtopic => completedSubtopics.some(entry => entry.topicTitle === topic.title && entry.subtopicTitle === subtopic.title)).length;
          const topicProgress = topicSubtopics.length ? Math.round((topicCompletedCount / topicSubtopics.length) * 100) : 0;
          const isTopicActive = topicSubtopics.some(subtopic => subtopic.title === selected);
          const isThisChapterRegenerating = regeneratingChapter === topic.title;

          return (
            <AccordionItem
              key={topic.title} value={topic.title}
              className={cn("overflow-hidden rounded-xl sm:rounded-2xl border bg-background/90 shadow-sm transition-colors", isTopicActive ? "border-primary/35 shadow-primary/10" : "border-border/60")}
            >
              <AccordionTrigger className={cn("px-3 sm:px-4 py-3 sm:py-4 text-left hover:no-underline", isTopicActive ? "bg-primary/[0.07]" : "hover:bg-muted/60")}>
                <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3">
                  <div className={cn("flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold", isTopicActive ? "bg-primary text-primary-foreground" : "border border-border bg-muted text-foreground")}>
                    {topicIndex + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <span className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Chapter {topicIndex + 1}</span>
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-medium text-muted-foreground">{topicCompletedCount}/{topicSubtopics.length} done</span>
                      {isThisChapterRegenerating && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                          <Loader2 className="h-2 w-2 sm:h-2.5 sm:w-2.5 animate-spin" />
                          {regenerateProgress.done}/{regenerateProgress.total}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 sm:mt-2 line-clamp-2 text-xs sm:text-sm font-semibold leading-5 sm:leading-6 text-foreground">{topic.title}</p>
                    <div className="mt-2 sm:mt-3 h-1 sm:h-1.5 overflow-hidden rounded-full bg-border/70">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${topicProgress}%` }} />
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-2 sm:px-3 pb-2 sm:pb-3 pt-1">
                <div className="space-y-1.5 sm:space-y-2">

                  {/* Regenerate Chapter Button */}
                  {/* <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!regeneratingChapter) handleRegenerateChapter(topic.title);
                    }}
                    disabled={!!regeneratingChapter}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg sm:rounded-xl border px-2 sm:px-3 py-2 sm:py-2.5 text-left transition-all",
                      isThisChapterRegenerating
                        ? "border-violet-400/40 bg-violet-500/10 cursor-wait"
                        : regeneratingChapter
                        ? "border-border/30 bg-muted/20 cursor-not-allowed opacity-40"
                        : "border-dashed border-border/50 hover:border-violet-400/50 hover:bg-violet-500/5 cursor-pointer group"
                    )}
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      {isThisChapterRegenerating ? (
                        <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin text-violet-500 flex-shrink-0" />
                      ) : (
                        <RefreshCw className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 transition-colors", regeneratingChapter ? "text-muted-foreground/40" : "text-muted-foreground group-hover:text-violet-500")} />
                      )}
                      <span className={cn("text-[10px] sm:text-xs font-medium transition-colors", isThisChapterRegenerating ? "text-violet-600 dark:text-violet-400" : regeneratingChapter ? "text-muted-foreground/40" : "text-muted-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400")}>
                        {isThisChapterRegenerating
                          ? `Regenerating… ${regenerateProgress.done}/${regenerateProgress.total} lessons`
                          : "Regenerate chapter content"}
                      </span>
                    </span>
                    {isThisChapterRegenerating && regenerateProgress.total > 0 && (
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <div className="w-12 sm:w-16 h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.round((regenerateProgress.done / regenerateProgress.total) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[8px] sm:text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                          {Math.round((regenerateProgress.done / regenerateProgress.total) * 100)}%
                        </span>
                      </div>
                    )}
                  </button> */}

                  {/* Subtopics List */}
                  {topicSubtopics.map((subtopic, subtopicIndex) => {
                    const isUnlocked = isSubtopicUnlocked(topic.title, subtopic.title);
                    const isActive = selected === subtopic.title;
                    const isCompleted = completedSubtopics.some(entry => entry.topicTitle === topic.title && entry.subtopicTitle === subtopic.title);
                    
                    return (
                      <div key={subtopic.title} className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            if (isUnlocked) handleSelect(topic.title, subtopic.title);
                            else toast({ title: "Locked", description: "Complete previous lessons to unlock this one." });
                          }}
                          className={cn(
                            "group flex w-full items-start gap-2 sm:gap-3 rounded-lg sm:rounded-xl border px-2 sm:px-3 py-2 sm:py-3 text-left transition-all",
                            isUnlocked ? "cursor-pointer hover:border-primary/30 hover:bg-primary/[0.05]" : "cursor-not-allowed opacity-60",
                            isActive ? "border-primary/35 bg-primary/[0.08] shadow-sm" : "border-transparent bg-muted/50",
                            isActive ? "pr-8 sm:pr-10" : ""
                          )}
                        >
                          <span className={cn("mt-0.5 flex h-5 w-5 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full text-[9px] sm:text-[11px] font-semibold",
                            isCompleted ? "bg-emerald-500 text-white" : isActive ? "bg-primary text-primary-foreground" : isUnlocked ? "border border-border bg-background text-muted-foreground" : "bg-muted-foreground/15 text-muted-foreground"
                          )}>
                            {isCompleted ? "✓" : subtopicIndex + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs sm:text-sm font-medium leading-4 sm:leading-5 text-foreground">{subtopic.title}</span>
                            <span className="mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                              <span>{isCompleted ? "Completed" : isActive ? "Current lesson" : isUnlocked ? "Open lesson" : "Locked"}</span>
                              {!isCompleted && !isUnlocked && <Lock className="h-2 w-2 sm:h-3 sm:w-3" />}
                            </span>
                          </span>
                        </button>
                        
                        {/* Regenerate button for current lesson only */}
                        {isActive && !regeneratingChapter && (
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await handleRegenerateCurrentLesson();
                            }}
                            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-lg hover:bg-primary/10 transition-colors group/regenerate"
                            title="Regenerate this lesson only"
                          >
                            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground hover:text-primary transition-colors" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  };

  function certificateCheck() {
    if (isComplete) finish();
    else toast({ title: "Completion Certificate", description: "Complete course to get certificate" });
  }

  async function finish() {
    if (sessionStorage.getItem('first') === 'true') {
      if (!end) { const today = new Date(); const formattedDate = today.toLocaleDateString('en-GB'); navigate('/course/' + courseId + '/certificate', { state: { courseTitle: mainTopic, end: formattedDate } }); }
      else navigate('/course/' + courseId + '/certificate', { state: { courseTitle: mainTopic, end: end } });
    } else {
      try {
        const response = await axios.post(serverURL + '/api/finish', { courseId });
        if (response.data.success) { const today = new Date(); const formattedDate = today.toLocaleDateString('en-GB'); sessionStorage.setItem('first', 'true'); sendEmail(formattedDate); }
      } catch (error) { console.error(error); }
    }
  }

  async function sendEmail(formattedDate) {
    const userName = sessionStorage.getItem('mName');
    const email = sessionStorage.getItem('email');
    const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><meta http-equiv="Content-Type" content="text/html charset=UTF-8" /><html lang="en"><head></head><body style="padding:20px; margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:#f6f9fc;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;"><table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" height="80%" width="100%" style="max-width:37.5em;max-height:80%; margin-left:auto;margin-right:auto;margin-top:80px;margin-bottom:80px;width:465px;border-radius:0.25rem;border-width:1px;background-color:#fff;padding:20px"><tr style="width:100%"><td><table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px"><tbody><tr><td><img alt="Logo" src="${appLogo}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px" /></td></tr></tbody></table><h1 style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-size:24px;font-weight:400;color:rgb(0,0,0)">Completion Certificate </h1><p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Hello <strong>${userName}</strong>,</p><p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">We are pleased to inform you that you have successfully completed the ${mainTopic} and are now eligible for your course completion certificate.</p><table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-bottom:32px;margin-top:32px;text-align:center"><tbody><tr><td><a href="${websiteURL}" target="_blank" style="p-x:20px;p-y:12px;line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color: #007BFF;text-align:center;font-size:12px;font-weight:600;color:rgb(255,255,255)"><span>Get Certificate</span></a><tr></tr></tbody></table><p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Best,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">The <strong>${companyName}</strong> Team</p></p></td></tr></body></html>`;
    try {
      await axios.post(serverURL + '/api/sendcertificate', { html, email }).then(res => {
        navigate('/course/' + courseId + '/certificate', { state: { courseTitle: mainTopic, end: formattedDate } });
      }).catch(error => {
        console.error(error);
        navigate('/course/' + courseId + '/certificate', { state: { courseTitle: mainTopic, end: formattedDate } });
      });
    } catch (error) { console.error(error); navigate('/course/' + courseId + '/certificate', { state: { courseTitle: mainTopic, end: formattedDate } }); }
  }

  useEffect(() => { if (mainContentRef.current) mainContentRef.current.scrollTop = 0; window.scrollTo(0, 0); }, [selected]);

  useEffect(() => {
    if (!courseData || !jsonData) return;
    const updateQuizStatus = async () => {
      try {
        const response = await axios.post(serverURL + '/api/getmyresult', { courseId, userId });
        if (response.data.success) {
          setIsQuizPassed(response.data.message || (courseData?.pass === true));
          setQuizAttemptSummary({ attemptCount: response.data.attemptCount, attemptLimit: response.data.attemptLimit, remainingAttempts: response.data.remainingAttempts, nextAttemptAvailableAt: response.data.nextAttemptAvailableAt, latestAttempt: response.data.latestAttempt, maxAttemptsReached: response.data.maxAttemptsReached });
        }
      } catch (error) { console.error('Error fetching quiz status:', error); }
    };
    updateQuizStatus(); loadMessages(); getNotes();
    if (!mainTopic) { if (!isLoading && !courseData) navigate("/create"); }
    else {
      const topicsList = jsonData['course_topics'] || jsonData[mainTopic.toLowerCase()];
      if (topicsList && topicsList.length > 0) {
        const mainTopicData = topicsList[0];
        const firstSubtopic = mainTopicData.subtopics[0];
        if (!selected) {
          setSelectedTopicTitle(mainTopicData.title);
          setSelected(firstSubtopic.title);
          if (isSubtopicReadyForDisplay(firstSubtopic)) {
            setTheory(cleanGeneratedHtml(firstSubtopic.theory));
            setMedia(type === 'video & text course' ? firstSubtopic.youtube : firstSubtopic.image);
          } else {
            setTimeout(() => startSubtopicPreparation(mainTopicData.title, firstSubtopic.title, firstSubtopic), 100);
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
    (Array.isArray(topic.subtopics) ? topic.subtopics : []).map((subtopic, subtopicIndex) => ({ topicTitle: topic.title, subtopicTitle: subtopic.title, topicIndex, subtopicIndex }))
  );
  const completedLessonCount = orderedLessons.filter(lesson => completedSubtopics.some(entry => entry.topicTitle === lesson.topicTitle && entry.subtopicTitle === lesson.subtopicTitle)).length;
  const exactCurrentLessonIndex = orderedLessons.findIndex(lesson => lesson.subtopicTitle === selected && (!selectedTopicTitle || lesson.topicTitle === selectedTopicTitle));
  const currentLessonIndex = exactCurrentLessonIndex >= 0 ? exactCurrentLessonIndex : orderedLessons.findIndex(lesson => lesson.subtopicTitle === selected);
  const currentLesson = currentLessonIndex >= 0 ? orderedLessons[currentLessonIndex] : orderedLessons[0];
  const currentTopicTitle = selectedTopicTitle || currentLesson?.topicTitle || courseTopics[0]?.title || '';
  const currentTopic = courseTopics.find(topic => topic.title === currentTopicTitle);
  const currentTopicCompletedCount = (Array.isArray(currentTopic?.subtopics) ? currentTopic.subtopics : []).filter(subtopic => completedSubtopics.some(entry => entry.topicTitle === currentTopicTitle && entry.subtopicTitle === subtopic.title)).length;
  const previousLesson = currentLessonIndex > 0 ? orderedLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 ? orderedLessons[currentLessonIndex + 1] : orderedLessons[1];
  const currentLessonCompleted = !!currentLesson && completedSubtopics.some(entry => entry.topicTitle === currentLesson.topicTitle && entry.subtopicTitle === currentLesson.subtopicTitle);
  const allLessonsCompleted = orderedLessons.length > 0 && completedLessonCount >= orderedLessons.length;
  const quizLockedByCourseProgress = !isOrgAdmin && !allLessonsCompleted;
  const hasManualQuiz = Array.isArray(jsonData?.quizzes) && jsonData.quizzes.length > 0;
  const manualQuizSettings = {
    examMode: true, attemptLimit: 2, cooldownMinutes: 60, passPercentage: 50, questionCount: jsonData?.quizzes?.length || 10, difficultyMode: 'mixed', shuffleQuestions: true, shuffleOptions: true,
    ...(jsonData?.quizSettings || {}),
    proctoring: { requireCamera: false, requireMicrophone: false, detectFullscreenExit: true, detectTabSwitch: true, detectCopyPaste: true, detectContextMenu: true, detectNoise: false, ...(jsonData?.quizSettings?.proctoring || {}) }
  };
  const lessonAlertMessage = nextLesson ? `Complete this lesson, then continue with ${nextLesson.subtopicTitle}.` : `You are on the final lesson. Complete it to unlock the ${mainTopic} quiz.`;
  const handlePreviousLesson = () => {
    if (!previousLesson) return;
    selectSubtopic(previousLesson.topicTitle, previousLesson.subtopicTitle);
    if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
  };
  const handleNextLesson = () => {
    if (nextLesson) {
      if (!isOrgAdmin && !currentLessonCompleted) { toast({ title: "Complete this lesson first", description: "Mark the current lesson as complete to unlock the next lesson." }); return; }
      selectSubtopic(nextLesson.topicTitle, nextLesson.subtopicTitle);
      if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
      return;
    }
    if (quizLockedByCourseProgress) { toast({ title: "Quiz locked", description: "Complete every lesson in the course before starting the quiz." }); return; }
    redirectExam();
  };

  const examRulesSection = hasManualQuiz ? (
    <section className="mb-4 sm:mb-6 rounded-2xl sm:rounded-[28px] border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-background to-background p-3 sm:p-4 md:p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/75">Exam Rules</p>
          <h2 className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-semibold">{mainTopic} Assessment</h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">Final quiz unlocks after every lesson is completed. Attempt rules and basic proctoring are controlled by the organization.</p>
        </div>
        <div className="rounded-xl sm:rounded-2xl border border-primary/15 bg-background px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-sm">
          <div className="font-semibold text-foreground">{quizLockedByCourseProgress ? 'Locked until course completion' : 'Ready when you are'}</div>
          <div className="mt-1 text-muted-foreground">{completedLessonCount}/{orderedLessons.length} lessons completed</div>
        </div>
      </div>
      
      {/* Responsive Grid for Exam Rules */}
      <div className="mt-3 sm:mt-4 grid gap-2 sm:gap-3 
        grid-cols-1 
        xs:grid-cols-2 
        sm:grid-cols-2 
        xl:grid-cols-2">
        <div className="rounded-xl sm:rounded-2xl border border-border/60 bg-background p-2 sm:p-3">
          <div className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Attempts</div>
          <div className="mt-1 text-xs sm:text-sm font-semibold">{manualQuizSettings.attemptLimit} total attempts</div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">{quizAttemptSummary?.attemptCount || 0} used, {quizAttemptSummary?.remainingAttempts ?? manualQuizSettings.attemptLimit} left</div>
        </div>
        <div className="rounded-xl sm:rounded-2xl border border-border/60 bg-background p-2 sm:p-3">
          <div className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Passing</div>
          <div className="mt-1 text-xs sm:text-sm font-semibold">{manualQuizSettings.passPercentage}% required</div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">{manualQuizSettings.questionCount} questions per attempt</div>
        </div>
        <div className="rounded-xl sm:rounded-2xl border border-border/60 bg-background p-2 sm:p-3">
          <div className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Cooldown</div>
          <div className="mt-1 text-xs sm:text-sm font-semibold">{manualQuizSettings.cooldownMinutes} minutes after a failed attempt</div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">Difficulty mode: {manualQuizSettings.difficultyMode}</div>
        </div>
        <div className="rounded-xl sm:rounded-2xl border border-border/60 bg-background p-2 sm:p-3">
          <div className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Monitoring</div>
          <div className="mt-1 text-xs sm:text-sm font-semibold">{[manualQuizSettings.proctoring.detectTabSwitch && 'tab switch', manualQuizSettings.proctoring.detectFullscreenExit && 'fullscreen', manualQuizSettings.proctoring.detectCopyPaste && 'clipboard', manualQuizSettings.proctoring.detectNoise && 'noise'].filter(Boolean).join(', ') || 'standard'}</div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">{manualQuizSettings.proctoring.requireCamera || manualQuizSettings.proctoring.requireMicrophone ? 'Camera/mic permissions may be requested' : 'No device access required'}</div>
        </div>
      </div>
    </section>
  ) : null;

  const openLessonFlow = (chapterTitle?: string) => {
    const targetChapter = chapterTitle || currentTopicTitle || courseTopics[0]?.title || '';
    setLessonFlowChapter(targetChapter); setLessonFlowSearch(''); setIsLessonFlowOpen(true);
  };

  const roadmapSection = courseTopics.length > 0 ? (
    <section className="mb-4 sm:mb-6 rounded-2xl sm:rounded-[28px] border border-border/60 bg-gradient-to-br from-background via-background to-muted/50 p-3 sm:p-4 md:p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Course Roadmap</p>
          <h2 className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-semibold">All chapters and lesson flow</h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">Review the full structure here and jump into any unlocked lesson without relying only on the sidebar.</p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <span className="inline-flex items-center rounded-full border border-border bg-background px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-muted-foreground">{courseTopics.length} chapters</span>
          <span className="inline-flex items-center rounded-full border border-border bg-background px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-muted-foreground">{orderedLessons.length} lessons</span>
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-primary">{completedLessonCount} completed</span>
        </div>
      </div>
      
      <div className="mt-4 sm:mt-5 rounded-2xl sm:rounded-3xl border border-border/60 bg-background/80 p-3 sm:p-4 md:p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold">Lesson flow</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Hidden by default. Open the popup to browse all chapters and lessons.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => openLessonFlow()} className="rounded-xl sm:rounded-2xl text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"><BookOpen className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />Browse All</Button>
            {currentTopicTitle && (<Button variant="outline" onClick={() => openLessonFlow(currentTopicTitle)} className="rounded-xl sm:rounded-2xl text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">Current Title</Button>)}
          </div>
        </div>
        
        {/* Responsive Grid for Roadmap Chapters */}
        <div className="mt-4 sm:mt-5 grid gap-2 sm:gap-3 
          grid-cols-1 
          sm:grid-cols-1 
          xl:grid-cols-1">
          {courseTopics.slice(0, 4).map((topic, topicIndex) => {
            const topicSubtopics = Array.isArray(topic.subtopics) ? topic.subtopics : [];
            const topicCompletedCount = topicSubtopics.filter(subtopic => completedSubtopics.some(entry => entry.topicTitle === topic.title && entry.subtopicTitle === subtopic.title)).length;
            const isTopicActive = topic.title === currentTopicTitle;
            return (
              <button type="button" key={topic.title} onClick={() => openLessonFlow(topic.title)}
                className={cn("group flex w-full items-start justify-between gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl border px-3 sm:px-4 py-3 sm:py-4 text-left transition-all hover:border-primary/30 hover:bg-primary/[0.04]", isTopicActive ? "border-primary/30 bg-primary/[0.05]" : "border-border/60 bg-background")}
              >
                <div className="min-w-0">
                  <span className="inline-flex items-center rounded-full bg-muted px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Chapter {topicIndex + 1}</span>
                  <h3 className="mt-2 sm:mt-3 line-clamp-2 text-xs sm:text-sm font-semibold leading-5 sm:leading-6 md:text-base">{topic.title}</h3>
                  <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">Tap to open lessons</p>
                </div>
                <div className="rounded-xl sm:rounded-2xl bg-muted px-2 sm:px-3 py-1.5 sm:py-2 text-right"><div className="text-sm sm:text-base font-semibold">{topicCompletedCount}/{topicSubtopics.length}</div><div className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">done</div></div>
              </button>
            );
          })}
        </div>
        {courseTopics.length > 4 && (<div className="mt-3 sm:mt-4 flex justify-center"><Button variant="ghost" className="rounded-xl sm:rounded-2xl text-xs sm:text-sm" onClick={() => openLessonFlow()}>View all chapters</Button></div>)}
      </div>
      
      <Dialog open={isLessonFlowOpen} onOpenChange={setIsLessonFlowOpen}>
        <DialogContent className="w-[95vw] max-w-4xl overflow-hidden p-0 rounded-2xl sm:rounded-3xl">
          <DialogHeader className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-background to-indigo-500/10 p-4 sm:p-5 md:p-6">
            <DialogTitle className="text-lg sm:text-xl">Lesson flow</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Browse chapters and jump directly to any unlocked lesson.</DialogDescription>
            <div className="mt-3 sm:mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input value={lessonFlowSearch} onChange={(e) => setLessonFlowSearch(e.target.value)} placeholder="Search lesson…" className="h-9 sm:h-11 rounded-xl sm:rounded-2xl bg-background/80 text-sm" />
              <Button variant="outline" className="h-9 sm:h-11 rounded-xl sm:rounded-2xl text-xs sm:text-sm" onClick={() => { setLessonFlowSearch(''); setLessonFlowChapter(currentTopicTitle || courseTopics[0]?.title || ''); }}>Reset</Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] sm:max-h-[70vh]">
            <div className="p-3 sm:p-4 md:p-6">
              <Accordion type="single" collapsible className="space-y-2 sm:space-y-3" value={lessonFlowChapter} onValueChange={setLessonFlowChapter}>
                {courseTopics.map((topic, topicIndex) => {
                  const topicSubtopics = Array.isArray(topic.subtopics) ? topic.subtopics : [];
                  const query = lessonFlowSearch.trim().toLowerCase();
                  const filteredSubtopics = query ? topicSubtopics.filter((sub: any) => String(sub?.title || '').toLowerCase().includes(query)) : topicSubtopics;
                  if (query && filteredSubtopics.length === 0 && !String(topic?.title || '').toLowerCase().includes(query)) return null;
                  const topicCompletedCount = topicSubtopics.filter(subtopic => completedSubtopics.some(entry => entry.topicTitle === topic.title && entry.subtopicTitle === subtopic.title)).length;
                  const isTopicActive = topic.title === currentTopicTitle;
                  return (
                    <AccordionItem key={topic.title} value={topic.title} className={cn("overflow-hidden rounded-2xl sm:rounded-3xl border transition-colors", isTopicActive ? "border-primary/30 bg-primary/[0.05]" : "border-border/60 bg-background")}>
                      <AccordionTrigger className="px-3 sm:px-4 py-3 sm:py-4 text-left hover:no-underline">
                        <div className="flex min-w-0 flex-1 items-start justify-between gap-2 sm:gap-3">
                          <div className="min-w-0">
                            <span className="inline-flex items-center rounded-full bg-muted px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Chapter {topicIndex + 1}</span>
                            <h3 className="mt-2 sm:mt-3 text-sm sm:text-base font-semibold leading-5 sm:leading-6 md:text-lg">{topic.title}</h3>
                            <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">Click to view lessons in this chapter</p>
                          </div>
                          <div className="rounded-xl sm:rounded-2xl bg-muted px-2 sm:px-3 py-1.5 sm:py-2 text-right"><div className="text-sm sm:text-base font-semibold">{topicCompletedCount}/{topicSubtopics.length}</div><div className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">done</div></div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                        {filteredSubtopics.length === 0 ? (
                          <div className="rounded-xl sm:rounded-2xl border border-dashed bg-muted/20 p-4 sm:p-5 text-center text-xs sm:text-sm text-muted-foreground">No lessons match your search.</div>
                        ) : (
                          /* Responsive Grid for Lesson Flow Subtopics */
                          <div className="grid gap-1.5 sm:gap-2 
                            grid-cols-1 
                            sm:grid-cols-2 
                            lg:grid-cols-2">
                            {filteredSubtopics.map((subtopic: any, subtopicIndex: number) => {
                              const isUnlocked = isSubtopicUnlocked(topic.title, subtopic.title);
                              const isActive = selected === subtopic.title;
                              const isCompleted = completedSubtopics.some(entry => entry.topicTitle === topic.title && entry.subtopicTitle === subtopic.title);
                              return (
                                <button type="button" key={subtopic.title}
                                  onClick={() => { if (isUnlocked) { handleSelect(topic.title, subtopic.title); setIsLessonFlowOpen(false); } else toast({ title: "Locked", description: "Complete previous lessons to unlock this one." }); }}
                                  className={cn("flex w-full items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border px-2 sm:px-3 py-2 sm:py-3 text-left transition-all", isUnlocked ? "hover:border-primary/30 hover:bg-primary/[0.04]" : "cursor-not-allowed opacity-60", isActive ? "border-primary/35 bg-primary/[0.08]" : "border-border/50 bg-background")}
                                >
                                  <span className={cn("flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-semibold", isCompleted ? "bg-emerald-500 text-white" : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                                    {isCompleted ? "✓" : subtopicIndex + 1}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-xs sm:text-sm font-medium text-foreground">{subtopic.title}</span>
                                    <span className="mt-0.5 sm:mt-1 block text-[9px] sm:text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{isCompleted ? "Completed" : isActive ? "Current lesson" : isUnlocked ? "Available now" : "Locked"}</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </section>
  ) : null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background overflow-x-hidden md:h-screen md:overflow-hidden">

      {/* Regenerate Chapter Popup */}
      <RegenerateChapterPopup
        isOpen={!!regeneratingChapter}
        chapterTitle={regeneratingChapter || ''}
        progress={regenerateProgress}
      />

      <LoadingPopup
        isOpen={showLoadingPopup}
        stage={loadingStage}
        subtopic={loadingSubtopic}
        progress={loadingProgress}
        onContinue={() => { setShowContinueButton(false); setIsButtonDisabled(false); setShowLoadingPopup(false); }}
        showContinueButton={showContinueButton}
        remainingSeconds={remainingSeconds}
      />
      <QuizLoadingPopup isOpen={isQuizLoading} topic={mainTopic} />

      <header className="sticky top-0 z-50 flex h-14 sm:h-16 items-center justify-between border-b border-white/5 px-2 sm:px-4 md:px-6 bg-background/80 backdrop-blur-xl transition-all duration-300">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Drawer open={isMenuOpenMobile} onOpenChange={setIsMenuOpenMobile}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-full hover:bg-muted/80">
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[85vh] rounded-t-[32px] p-0 border-none bg-background/95 backdrop-blur-xl">
              <div className="mx-auto w-full max-w-lg flex flex-col h-full">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Course Navigation</h2>
                      <p className="text-xs text-muted-foreground">Chapters and Lessons</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpenMobile(false)} className="rounded-full"><X className="h-5 w-5" /></Button>
                </div>
                <ScrollArea className="flex-1 px-4 sm:px-6">
                  <div className="pr-1 sm:pr-2 pt-3 sm:pt-4">
                    {courseTopics.length > 0 && renderTopicsList(courseTopics)}
                    <button type="button" onClick={redirectExam} disabled={quizLockedByCourseProgress || isQuizLoading}
                      className={cn("mt-4 sm:mt-6 flex w-full items-center justify-between rounded-2xl border border-primary/10 bg-primary/[0.02] px-4 py-4 text-left transition-all hover:bg-primary/[0.04]", quizLockedByCourseProgress || isQuizLoading ? "cursor-not-allowed opacity-60" : "hover:scale-[0.98]")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-background border border-border shadow-sm">
                          {isQuizPassed === true ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <ClipboardCheck className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-primary/70">Final Assessment</span>
                          <span className="text-sm font-bold text-foreground">{mainTopic} Quiz</span>
                        </div>
                      </div>
                      {isQuizLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : quizLockedByCourseProgress && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </div>
                </ScrollArea>
              </div>
            </DrawerContent>
          </Drawer>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {!isOrgAdmin && (
              <div className="relative group cursor-help transition-transform hover:scale-110">
                <svg className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" className="stroke-muted/30" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15" fill="none" className="stroke-primary transition-all duration-1000" strokeWidth="2.5" strokeDasharray="94.2" strokeDashoffset={94.2 - (94.2 * percentage / 100)} transform="rotate(-90 18 18)" strokeLinecap="round" />
                  <text x="18" y="18" dominantBaseline="middle" textAnchor="middle" className="fill-foreground text-[8px] sm:text-[9px] font-bold">{percentage}%</text>
                </svg>
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 hidden sm:block">Learning Dashboard</span>
              <h1 className="text-sm sm:text-base md:text-lg font-bold truncate tracking-tight text-foreground transition-all">
                {mainTopic}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="hidden md:flex h-9 w-9 rounded-full hover:bg-muted/80 hover:scale-105 transition-all"><Menu className="h-5 w-5" /></Button>
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" size="sm" asChild className="rounded-full h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all hover:bg-muted/80">
              <Link to="/dashboard">
                <Home className="h-4 w-4 mr-2 text-muted-foreground" /> 
                <span className="hidden lg:inline text-foreground/80">Dashboard</span>
              </Link>
            </Button>

            {(plan !== "free" || isOrgAdmin || userRole === "student") && isQuizPassed && (
              <Button onClick={certificateCheck} variant="default" size="sm"
                className={cn("rounded-full h-8 sm:h-10 px-4 sm:px-6 shadow-lg transition-all hover:scale-105", userRole === "student" || !!sessionStorage.getItem("orgId") ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : "bg-primary shadow-primary/20")}
              >
                <Award className="h-4 w-4 mr-2" />
                <span className="text-xs sm:text-sm font-bold">Certificate</span>
              </Button>
            )}

            <ShareOnSocial textToShare={`${sessionStorage.getItem("mName")} shared you course on ${mainTopic}`} link={`${websiteURL}/shareable?id=${courseId}`} linkTitle={`${sessionStorage.getItem("mName")} shared you course on ${mainTopic}`} linkMetaDesc={`${sessionStorage.getItem("mName")} shared you course on ${mainTopic}`} linkFavicon={appLogo} noReferer>
              <Button variant="outline" size="sm" className="rounded-full h-8 sm:h-10 px-4 sm:px-6 border-border/60 hover:bg-muted/80 transition-all">
                <Share className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-bold text-foreground/80">Share</span>
              </Button>
            </ShareOnSocial>
          </div>
        </div>
      </header>

      {/* Body - Responsive */}
      <div className="flex flex-1 overflow-visible md:overflow-hidden">
        {/* Desktop sidebar */}
        <div className={cn("hidden overflow-hidden border-r border-border/40 bg-gradient-to-b from-slate-50 via-background to-background transition-all duration-300 dark:from-slate-950/30 md:block", isMenuOpen ? "w-72 lg:w-[22rem]" : "w-0")}>
          <ScrollArea className="h-full">
            <div className="p-3 sm:p-4">
              <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/60 p-3 sm:p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div>
                    <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Course Navigation</p>
                    <h2 className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold">Course Content</h2>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">{completedLessonCount}/{orderedLessons.length} lessons completed</p>
                  </div>
                  <div className="rounded-xl sm:rounded-2xl bg-primary/10 px-2 sm:px-3 py-1.5 sm:py-2 text-right text-primary flex-shrink-0">
                    <div className="text-base sm:text-lg font-semibold leading-none">{percentage}%</div>
                    <div className="mt-0.5 sm:mt-1 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/70">Progress</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 sm:mt-4">{courseTopics.length > 0 && renderTopicsList(courseTopics)}</div>
              <button type="button" onClick={redirectExam} disabled={quizLockedByCourseProgress || isQuizLoading}
                className={cn("mt-3 sm:mt-4 flex w-full items-center justify-between rounded-xl sm:rounded-2xl border border-border/60 bg-background px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-colors", quizLockedByCourseProgress || isQuizLoading ? "cursor-not-allowed opacity-60" : "hover:bg-muted/60")}
              >
                <span>
                  <span className="block text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Final Assessment</span>
                  <span className="mt-0.5 sm:mt-1 block text-xs sm:text-sm font-semibold text-foreground">{mainTopic} Quiz</span>
                  {quizLockedByCourseProgress && <span className="mt-0.5 sm:mt-1 block text-[10px] sm:text-xs text-muted-foreground">Complete every lesson to unlock the quiz</span>}
                </span>
                {isQuizLoading ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-primary flex-shrink-0" /> : quizLockedByCourseProgress ? <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" /> : isQuizPassed === true ? <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" /> : <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />}
              </button>
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="min-h-0 flex-1 overflow-visible md:overflow-hidden">
          <ScrollArea className="h-auto md:h-full" viewportRef={mainContentRef}>
            <main className="mx-auto max-w-6xl p-2 sm:p-3 md:p-4 lg:p-6 pb-24 sm:pb-32 md:pb-10">
              {isLoading ? <CourseContentSkeleton /> : (
                <>
                  <div className="mb-4 sm:mb-6 lg:mb-8 overflow-hidden rounded-3xl sm:rounded-[32px] md:rounded-[40px] border border-white/10 bg-[#0c111d] bg-gradient-to-br from-slate-950 via-[#0c111d] to-primary/30 p-4 sm:p-6 md:p-8 lg:p-10 text-white shadow-2xl relative">
                    {/* Decorative radial glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col gap-6 lg:gap-8">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-4xl space-y-3 sm:space-y-4">
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 sm:px-4 py-1 text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                            {currentLesson ? `Chapter ${currentLesson.topicIndex + 1}` : "Course Overview"}
                          </span>
                          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.15] tracking-tight">{selected}</h1>
                          <p className="text-xs sm:text-sm md:text-base leading-relaxed text-white/70 font-medium max-w-2xl">
                            {currentTopicTitle && <span className="text-white/90">Module: {currentTopicTitle}. </span>}
                            You're currently on lesson {currentLessonIndex + 1} of {orderedLessons.length}. Complete the course to earn your official certification.
                          </p>
                        </div>
                        
                        {/* Compact Stats Grid */}
                        <div className="flex flex-row sm:flex-row gap-3 sm:gap-4 lg:flex-col lg:w-72">
                          <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4 backdrop-blur-md transition-all hover:bg-white/[0.05]">
                            <div className="text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-white/50 mb-2">Module Progress</div>
                            <div className="flex items-end justify-between">
                              <div className="text-sm sm:text-lg font-bold">{currentTopicCompletedCount}/{currentTopic?.subtopics?.length || 0}</div>
                              <div className="text-[10px] text-white/40">Lessons Done</div>
                            </div>
                            <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${(currentTopicCompletedCount / (currentTopic?.subtopics?.length || 1)) * 100}%` }}></div>
                            </div>
                          </div>
                          <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4 backdrop-blur-md transition-all hover:bg-white/[0.05]">
                            <div className="text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-white/50 mb-2">Next Milestone</div>
                            <div className="text-[xs] sm:text-sm font-bold truncate mb-1">{nextLesson ? nextLesson.subtopicTitle : "Course Exam"}</div>
                            <div className="text-[9px] text-white/40 truncate">{nextLesson ? nextLesson.topicTitle : `Available after ${orderedLessons.length} lessons`}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 border-t border-white/5 pt-6 lg:pt-8">
                        <Button 
                          onClick={() => setIsGuideOpen(true)}
                          className="w-full sm:w-auto rounded-xl sm:rounded-2xl bg-white text-black hover:bg-white/90 transition-all font-bold px-6 h-11 sm:h-12 text-sm sm:text-base shadow-xl shadow-white/5 group"
                        >
                          <Brain className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                          <span>Roadmap & Exam Rules</span>
                        </Button>

                        <Button 
                          variant="ghost"
                          asChild
                          className="w-full sm:w-auto rounded-xl sm:rounded-2xl text-white/80 hover:bg-white/10 hover:text-white transition-all font-semibold px-6 h-11 sm:h-12 text-sm sm:text-base"
                        >
                          <Link to="/dashboard">
                            <Home className="h-4 w-4 mr-2" />
                            <span>My Courses</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Content profile badge - Responsive */}
                  <div className={`mb-3 sm:mb-4 md:mb-6 rounded-xl sm:rounded-2xl border p-2 sm:p-3 md:p-4 ${contentProfileMeta.surfaceClass}`}>
                    <div className="flex flex-col gap-2 sm:gap-3 
                      sm:flex-row sm:items-start sm:justify-between
                      lg:flex-row lg:items-center">
                      <div className="space-y-1.5 sm:space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className={`inline-flex items-center rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold ${contentProfileMeta.badgeClass}`}>
                            <ContentProfileIcon className="mr-1 h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />{contentProfileMeta.label}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-border bg-background px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-muted-foreground">{type === "video & text course" ? "Video + Text" : "Text + Images"}</span>
                          <span className="inline-flex items-center rounded-full border border-border bg-background px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-muted-foreground">{lang}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">{contentProfileMeta.summary}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section blocks removed from inline flow to declutter top portion */}

                  <div className="space-y-3 sm:space-y-4">
                    {/* Theory text */}
                    {theory && !theory.includes("AI is crafting personalized content") && theory.length > 50 ? (
                      <div className="rounded-2xl sm:rounded-[20px] md:rounded-[28px] border border-border/60 bg-background p-3 sm:p-4 md:p-5 lg:p-7 shadow-sm">
                        <StyledText text={theory} />
                      </div>
                    ) : theory && theory.includes("AI is crafting personalized content") ? (
                      <div className="rounded-2xl sm:rounded-[20px] md:rounded-[28px] border border-border/60 bg-background p-3 sm:p-4 md:p-5 lg:p-7 shadow-sm">
                        <StyledText text={theory} />
                      </div>
                    ) : (
                      <div className="rounded-2xl sm:rounded-[20px] md:rounded-[28px] border border-border/60 bg-background p-3 sm:p-4 md:p-6 lg:p-10 shadow-sm text-center">
                        <div className="max-w-md mx-auto space-y-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <h3 className="text-lg font-semibold">Content Not Available</h3>
                          <p className="text-sm text-muted-foreground">
                            We couldn't generate the content for "{selected}" yet or the generation failed. 
                            Would you like to try generating it now?
                          </p>
                          <Button 
                            onClick={() => handleRegenerateCurrentLesson()} 
                            className="w-full sm:w-auto"
                          >
                            Generate This Lesson
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Learning note - Responsive */}
                    <div className="rounded-xl sm:rounded-[20px] border border-primary/20 bg-primary/5 p-2.5 sm:p-3 md:p-4 text-primary shadow-sm">
                      <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80">Learning Note</p>
                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6">{lessonAlertMessage}</p>
                    </div>

                    {/* Mobile inline blocks removed to declutter */}

                    {/* Lesson actions - Responsive */}
                    {!isOrgAdmin && (
                      <div className="mt-4 sm:mt-6 md:mt-8 rounded-xl sm:rounded-[20px] md:rounded-[24px] border border-border/60 bg-background p-2.5 sm:p-3 md:p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Lesson Actions</p>
                            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                              {currentLessonCompleted ? nextLesson ? "This lesson is complete. You can move to the next lesson now." : "All lessons are complete. The final quiz is now available." : "Mark this lesson as complete to unlock the next part of the course."}
                            </p>
                          </div>
                          
                          {/* Responsive Grid for Lesson Action Buttons */}
                          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 
                            sm:flex sm:flex-row sm:gap-2 sm:flex-shrink-0">
                            <Button variant="outline" onClick={handlePreviousLesson} disabled={!previousLesson} className="gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /><span>Prev</span>
                            </Button>
                            <Button variant={currentLessonCompleted ? "secondary" : "default"} onClick={handleMarkAsComplete} disabled={currentLessonCompleted} className="gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="hidden xs:inline">{currentLessonCompleted ? "Completed" : "Complete"}</span>
                              <span className="xs:hidden">{currentLessonCompleted ? "✓" : "Done"}</span>
                            </Button>
                            <Button onClick={handleNextLesson} disabled={(!!nextLesson && !currentLessonCompleted) || isQuizLoading} className="gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                              {isQuizLoading ? "Loading..." : nextLesson ? "Next" : "Quiz"}
                              {isQuizLoading ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0" /> : <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lesson actions - org admin */}
                    {isOrgAdmin && (
                      <div className="mt-4 sm:mt-6 md:mt-8 rounded-xl sm:rounded-[20px] md:rounded-[24px] border border-border/60 bg-background p-2.5 sm:p-3 md:p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Review Actions</p>
                            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                              {nextLesson ? "You are reviewing this course. Continue to the next lesson to complete the review." : "You have reached the end of the lessons. Complete the final quiz to send this course for approval."}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button variant="outline" onClick={handlePreviousLesson} disabled={!previousLesson} className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />Previous
                            </Button>
                            <Button onClick={handleNextLessonWithDelay} disabled={isQuizLoading || isButtonDisabled} className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                              {isQuizLoading ? 'Preparing Quiz...' : isButtonDisabled ? `Wait ${formatTime(remainingSeconds)}` : nextLesson ? 'Continue Review' : 'Take Review Quiz'}
                              {isQuizLoading ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Course Explorer Side Panel (Sheet) */}
                  <Sheet open={isGuideOpen} onOpenChange={setIsGuideOpen}>
                    <SheetContent side="right" className="w-[90vw] sm:max-w-xl md:max-w-2xl p-0 overflow-hidden border-l border-primary/10 bg-background/95 backdrop-blur-xl transition-all duration-300">
                      <div className="flex flex-col h-full">
                        {/* Custom Header for Sheet */}
                        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-primary/10 bg-primary/[0.02]">
                          <div>
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">Course Explorer</h2>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Explore roadmap, rules, and assessment details.</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setIsGuideOpen(false)} className="rounded-full h-8 w-8 sm:h-9 sm:w-9">
                            <X className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </div>

                        <ScrollArea className="flex-1">
                          <div className="p-4 sm:p-6 md:p-8 space-y-8 pb-32">
                            {/* Roadmap and Exam Rules moved here */}
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                              {roadmapSection}
                            </div>
                            
                            <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                              {examRulesSection}
                            </div>

                            <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/[0.03] p-5 text-center">
                              <Sparkles className="h-5 w-5 text-primary/40 mx-auto mb-3" />
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Use the roadmap to track your progress and navigate through chapters effortlessly.
                              </p>
                            </div>
                          </div>
                        </ScrollArea>

                        {/* Bottom Action Area */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-background via-background/90 to-transparent border-t border-primary/5">
                          <Button 
                            onClick={() => setIsGuideOpen(false)} 
                            className="w-full rounded-xl sm:rounded-2xl shadow-lg shadow-primary/20 h-10 sm:h-12 text-sm sm:text-base font-semibold"
                          >
                            Return to Current Lesson
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </>
              )}
            </main>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-1.5 sm:p-2 flex justify-around items-center z-40 safe-area-pb">
        <Button variant="ghost" size="sm" asChild className="h-8 w-8 sm:h-9 sm:w-9 p-0"><Link to="/dashboard"><Home className="h-4 w-4 sm:h-5 sm:w-5" /></Link></Button>
        {(plan !== "free" || isOrgAdmin || userRole === "student") && isQuizPassed && (
          <Button onClick={certificateCheck} variant="ghost" size="sm" className={cn("h-8 w-8 sm:h-9 sm:w-9 p-0 font-bold", userRole === "student" || !!sessionStorage.getItem("orgId") ? "text-yellow-600" : "text-primary")}>
            <Award className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
        <Button onClick={htmlDownload} disabled={exporting} variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0"><Download className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
        <ShareOnSocial textToShare={sessionStorage.getItem("mName") + " shared you course on " + mainTopic} link={websiteURL + "/shareable?id=" + courseId} linkTitle={sessionStorage.getItem("mName") + " shared you course on " + mainTopic} linkMetaDesc={sessionStorage.getItem("mName") + " shared you course on " + mainTopic} linkFavicon={appLogo} noReferer>
          <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0"><Share className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
        </ShareOnSocial>
      </div>

      {/* Floating Action Buttons - Responsive */}
      <div className="fixed bottom-16 sm:bottom-20 right-2 sm:right-3 z-40 flex flex-col gap-2 md:bottom-6 md:right-6">
        <Button size="icon" className="rounded-full bg-primary shadow-lg hover:shadow-xl h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11" onClick={() => setIsChatOpen(true)}>
          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        </Button>
        <Button size="icon" className="rounded-full bg-primary shadow-lg hover:shadow-xl h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11" onClick={() => setIsNotesOpen(true)}>
          <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        </Button>
      </div>

      {/* Chat Dialog - Responsive */}
      {isMobile ? (
        <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
          <SheetContent side="bottom" className="h-[85dvh] sm:h-[90dvh] max-w-full p-0 rounded-t-2xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
                <h2 className="text-sm sm:text-base font-semibold">Course Assistant</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)} className="h-7 w-7 sm:h-8 sm:w-8"><X className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button>
              </div>
              <ScrollArea className="flex-1 p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4 pb-2">
                  {messages.map((message) => (
                    <div key={message.id} className={cn("flex flex-col gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm break-words", message.sender === "user" ? "ml-auto bg-primary text-primary-foreground max-w-[85%]" : "bg-muted max-w-[85%]")}>
                      <StyledText text={message.text} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center gap-2 p-3 sm:p-4 border-t border-border">
                <Input placeholder={isChatLoading ? "Assistant is thinking..." : "Type your message..."} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={isChatLoading} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} className="flex-1 text-xs sm:text-sm h-9 sm:h-10" />
                <Button onClick={sendMessage} disabled={isChatLoading} size="sm" className="h-9 sm:h-10 text-xs sm:text-sm">{isChatLoading ? "..." : "Send"}</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-h-[80vh] rounded-2xl">
            <DialogTitle className="text-base sm:text-lg">Course Assistant</DialogTitle>
            <div className="flex flex-col h-[50vh] sm:h-[60vh]">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-3 sm:space-y-4 pt-2">
                  {messages.map((message) => (
                    <div key={message.id} className={cn("flex flex-col gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm break-words", message.sender === "user" ? "ml-auto bg-primary text-primary-foreground max-w-[80%]" : "bg-muted max-w-[80%]")}>
                      <StyledText text={message.text} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center gap-2">
                <Input placeholder={isChatLoading ? "Assistant is thinking..." : "Type your message..."} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={isChatLoading} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} className="flex-1 text-sm" />
                <Button onClick={sendMessage} disabled={isChatLoading} size="sm">{isChatLoading ? "..." : "Send"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Notes Dialog - Responsive */}
      {isMobile ? (
        <Sheet open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <SheetContent side="bottom" className="h-[85dvh] sm:h-[90dvh] sm:max-w-full p-0 rounded-t-2xl">
            <div className="flex flex-col h-full">
              <div className="py-2.5 sm:py-3 px-3 sm:px-4 border-b border-border"><h2 className="text-sm sm:text-base font-semibold">Course Notes</h2></div>
              <ScrollArea className="flex-1 px-3 sm:px-4">
                <div className="pt-2 sm:pt-3 pb-2">
                  <MinimalTiptapEditor value={value} onChange={setValue} className="w-full" editorContentClassName="p-3 sm:p-4" output="html" placeholder="No notes yet. Start taking notes for this course." autofocus={true} editable={true} editorClassName="focus:outline-none min-h-[180px] sm:min-h-[200px] text-sm" />
                </div>
              </ScrollArea>
              <div className="p-2.5 sm:p-3 border-t border-border"><div className="flex justify-end"><Button disabled={saving} onClick={handleSaveNote} size="sm" className="text-xs sm:text-sm">{saving ? "Saving..." : "Save Note"}</Button></div></div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] rounded-2xl">
            <DialogTitle className="text-base sm:text-lg">Course Notes</DialogTitle>
            <div className="flex flex-col h-[55vh] sm:h-[60vh]">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pt-2">
                  <MinimalTiptapEditor value={value} onChange={setValue} className="w-full" editorContentClassName="p-4 sm:p-5" output="html" placeholder="No notes yet. Start taking notes for this course." autofocus={true} editable={true} editorClassName="focus:outline-none text-sm" />
                </div>
              </ScrollArea>
              <div className="flex justify-end"><Button disabled={saving} onClick={handleSaveNote} size="sm" className="text-xs sm:text-sm">{saving ? "Saving..." : "Save Note"}</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CoursePage;
