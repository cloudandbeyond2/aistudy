import React, { useState, useEffect } from 'react';
import { serverURL } from '@/constants';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Newspaper, Target, Network, Lock, Sparkles, Brain, CheckCircle2, XCircle, ChevronLeft, ChevronRight, RefreshCw, Trophy, BookOpenCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import SEO from '@/components/SEO';
import { useNavigate } from 'react-router-dom';

const getScoreAppearance = (score: number) => {
  if (score >= 80) {
    return {
      accent: 'text-emerald-600 dark:text-emerald-400',
      soft: 'border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/20',
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
      progress: '[&>div]:bg-emerald-500',
      label: 'Excellent work'
    };
  }

  if (score >= 60) {
    return {
      accent: 'text-blue-600 dark:text-blue-400',
      soft: 'border-blue-200/80 bg-blue-50/80 dark:border-blue-900/50 dark:bg-blue-950/20',
      badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300',
      progress: '[&>div]:bg-blue-500',
      label: 'Good progress'
    };
  }

  if (score >= 40) {
    return {
      accent: 'text-amber-600 dark:text-amber-400',
      soft: 'border-amber-200/80 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/20',
      badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
      progress: '[&>div]:bg-amber-500',
      label: 'Keep practicing'
    };
  }

  return {
    accent: 'text-rose-600 dark:text-rose-400',
    soft: 'border-rose-200/80 bg-rose-50/80 dark:border-rose-900/50 dark:bg-rose-950/20',
    badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300',
    progress: '[&>div]:bg-rose-500',
    label: 'Warm up more'
  };
};

const ScoreSummaryCard = ({
  title,
  subtitle,
  score,
  correctCount,
  wrongCount,
  unansweredCount,
  totalQuestions,
  onRetake,
  onReview
}: {
  title: string;
  subtitle: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalQuestions: number;
  onRetake: () => void;
  onReview: () => void;
}) => {
  const appearance = getScoreAppearance(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card className="overflow-hidden rounded-[28px] border border-border/60 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
      <CardHeader className="border-b border-border/40 bg-muted/20 pb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Session Complete</p>
            <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
            <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Badge variant="outline" className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${appearance.badge}`}>
            <Trophy className="mr-1.5 h-3.5 w-3.5" />
            {appearance.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 md:p-7">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className={`rounded-[24px] border p-5 ${appearance.soft}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Final Score</p>
                <p className={`mt-2 text-4xl font-black ${appearance.accent}`}>{score}%</p>
              </div>
              <div className="relative h-24 w-24">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="10" fill="none" className="text-muted/30" />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={appearance.accent}
                    style={{ transition: 'stroke-dashoffset 0.9s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-lg font-bold ${appearance.accent}`}>{score}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Accuracy</span>
                <span>{correctCount}/{totalQuestions} correct</span>
              </div>
              <Progress value={score} className={`h-2 bg-muted/60 ${appearance.progress}`} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-4 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700/80 dark:text-emerald-300/80">Correct</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{correctCount}</p>
              </div>
              <div className="rounded-2xl border border-rose-200/70 bg-rose-50/70 p-4 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/20">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-700/80 dark:text-rose-300/80">Wrong</p>
                <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{wrongCount}</p>
              </div>
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700/80 dark:text-amber-300/80">Unanswered</p>
                <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{unansweredCount}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Questions</p>
                <p className="mt-2 text-2xl font-bold">{totalQuestions}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={onRetake} className="gap-2 rounded-full sm:flex-1">
                <RefreshCw className="h-4 w-4" />
                Retake Test
              </Button>
              <Button variant="outline" onClick={onReview} className="gap-2 rounded-full sm:flex-1">
                <BookOpenCheck className="h-4 w-4" />
                Review Questions
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AptitudeTestViewer = ({ test }: { test: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const questions = test.questions?.slice(0, 15) || [];

  if (questions.length === 0) return null;

  const q = questions[currentIndex];
  const selectedAnswer = answers[currentIndex] ?? null;
  const correctCount = questions.filter((question: any, index: number) => answers[index] === question.answer).length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = Math.max(questions.length - answeredCount, 0);
  const wrongCount = Math.max(answeredCount - correctCount, 0);
  const score = Math.round((correctCount / questions.length) * 100);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      return;
    }

    setShowResults(true);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setAnswers({});
    setShowResults(false);
  };

  const handleReview = () => {
    setCurrentIndex(0);
    setShowAnswer(true);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="mb-6 md:mb-8">
        <ScoreSummaryCard
          title={test.title}
          subtitle="You completed the daily aptitude round. Review your performance and jump back in for another attempt anytime."
          score={score}
          correctCount={correctCount}
          wrongCount={wrongCount}
          unansweredCount={unansweredCount}
          totalQuestions={questions.length}
          onRetake={handleRetake}
          onReview={handleReview}
        />
      </div>
    );
  }

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 flex-wrap">
            <Brain className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" /> 
            <span className="break-words">{test.title}</span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{test.description}</p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 md:px-3 md:py-1.5 bg-primary/10 text-primary rounded-full shrink-0 self-start sm:self-auto">
          Q{currentIndex + 1}/{questions.length}
        </span>
      </div>

      <Card className="border-l-2 md:border-l-4 border-l-primary/50 hover:shadow-md transition-shadow">
        <CardHeader className="py-3 md:py-4 px-4 md:px-6">
          <CardTitle className="text-base md:text-lg leading-relaxed md:leading-snug">
            <span className="text-muted-foreground mr-2 font-mono text-sm md:text-base">Q{currentIndex + 1}.</span>
            <span className="break-words">{q.question}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4 px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
            {q.options.map((opt: string, j: number) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = q.answer === opt;

              let optionStyle = "bg-muted/40 border-border/40 text-foreground";
              let indicator = <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}></div>;

              if (showAnswer) {
                if (isCorrect) {
                  optionStyle = "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-800 dark:text-emerald-400 font-medium";
                  indicator = <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
                } else if (isSelected && !isCorrect) {
                  optionStyle = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-400 font-medium";
                  indicator = <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400 shrink-0" />;
                } else {
                  optionStyle = "bg-muted/20 border-border/20 text-muted-foreground opacity-60";
                }
              } else if (isSelected) {
                optionStyle = "bg-primary/10 border-primary text-primary font-medium";
              }

              return (
                <div
                  key={j}
                  onClick={() => !showAnswer && setAnswers((prev) => ({ ...prev, [currentIndex]: opt }))}
                  className={`p-2 md:p-3 rounded-lg border transition-all text-xs md:text-sm flex items-center gap-2 md:gap-3 ${!showAnswer ? 'cursor-pointer hover:border-primary/50 hover:bg-muted/60' : ''} ${optionStyle}`}
                >
                  {indicator}
                  <span className="break-words flex-1">{opt}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="min-h-[36px] md:min-h-[40px] flex items-center">
              {showAnswer ? (
                <div className="animate-in fade-in slide-in-from-left-2">
                  <span className="text-xs md:text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 md:px-3 md:py-1.5 rounded-md inline-flex items-center gap-1 md:gap-2">
                    <Target className="w-3 h-3 md:w-4 md:h-4" /> 
                    <span>Correct Answer: {q.answer}</span>
                  </span>
                </div>
              ) : (
                <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => setShowAnswer(true)}>
                  Show Answer
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 md:pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button
                size={isMobile ? "sm" : "default"}
                onClick={handleNext}
                className="gap-1"
              >
                <span className="hidden sm:inline">{currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}</span>
                <span className="sm:hidden">{currentIndex === questions.length - 1 ? 'Finish' : 'Next'}</span>
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AiQuizViewer = ({ questions, category }: { questions: any[], category: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (questions.length === 0) return null;

  const q = questions[currentIndex];
  const selectedAnswer = answers[currentIndex] ?? null;
  const correctCount = questions.filter((question: any, index: number) => answers[index] === question.answer).length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = Math.max(questions.length - answeredCount, 0);
  const wrongCount = Math.max(answeredCount - correctCount, 0);
  const score = Math.round((correctCount / questions.length) * 100);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      return;
    }

    setShowResults(true);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setAnswers({});
    setShowResults(false);
  };

  const handleReview = () => {
    setCurrentIndex(0);
    setShowAnswer(true);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <ScoreSummaryCard
        title={`AI Quiz: ${category}`}
        subtitle="Your custom interview quiz is complete. Check your score, review mistakes, and generate another round whenever you're ready."
        score={score}
        correctCount={correctCount}
        wrongCount={wrongCount}
        unansweredCount={unansweredCount}
        totalQuestions={questions.length}
        onRetake={handleRetake}
        onReview={handleReview}
      />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-4">
        <h3 className="text-lg md:text-xl font-bold flex items-center flex-wrap">
          <Network className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" /> 
          <span className="break-words">Generated Quiz on "<span className="capitalize">{category}</span>"</span>
        </h3>
        <span className="text-xs font-semibold px-2 py-1 md:px-3 md:py-1.5 bg-primary/10 text-primary rounded-full shrink-0 self-start sm:self-auto">
          Q{currentIndex + 1}/{questions.length}
        </span>
      </div>

      <Card className="border-l-2 md:border-l-4 border-l-primary/60 hover:shadow-md transition-shadow">
        <CardHeader className="py-3 md:py-4 px-4 md:px-6">
          <CardTitle className="text-base md:text-lg leading-relaxed md:leading-snug">
            <span className="text-muted-foreground mr-2 font-mono text-sm md:text-base">Q{currentIndex + 1}.</span>
            <span className="break-words">{q.question}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4 px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
            {q.options.map((opt: string, oi: number) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = q.answer === opt;

              let optionStyle = "bg-muted/40 border-border/40 text-foreground";
              let indicator = <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}></div>;

              if (showAnswer) {
                if (isCorrect) {
                  optionStyle = "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-800 dark:text-emerald-400 font-medium";
                  indicator = <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
                } else if (isSelected && !isCorrect) {
                  optionStyle = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-400 font-medium";
                  indicator = <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400 shrink-0" />;
                } else {
                  optionStyle = "bg-muted/20 border-border/20 text-muted-foreground opacity-60";
                }
              } else if (isSelected) {
                optionStyle = "bg-primary/10 border-primary text-primary font-medium";
              }

              return (
                <div
                  key={oi}
                  onClick={() => !showAnswer && setAnswers((prev) => ({ ...prev, [currentIndex]: opt }))}
                  className={`p-2 md:p-3 rounded-lg border transition-all text-xs md:text-sm flex items-center gap-2 md:gap-3 ${!showAnswer ? 'cursor-pointer hover:border-primary/50 hover:bg-muted/60' : ''} ${optionStyle}`}
                >
                  {indicator}
                  <span className="break-words flex-1">{opt}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="min-h-[36px] md:min-h-[40px] flex items-center">
              {showAnswer ? (
                <div className="animate-in fade-in slide-in-from-left-2">
                  <span className="text-xs md:text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 md:px-3 md:py-1.5 rounded-md inline-flex items-center gap-1 md:gap-2">
                    <Target className="w-3 h-3 md:w-4 md:h-4" /> 
                    <span>Correct Answer: {q.answer}</span>
                  </span>
                </div>
              ) : (
                <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => setShowAnswer(true)}>
                  Show Answer
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 md:pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button
                size={isMobile ? "sm" : "default"}
                onClick={handleNext}
                className="gap-1"
              >
                <span className="hidden sm:inline">{currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}</span>
                <span className="sm:hidden">{currentIndex === questions.length - 1 ? 'Finish' : 'Next'}</span>
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const InterviewPreparation = () => {

  const userPlan = sessionStorage.getItem('type') || 'free';
const isYearlyOnly = userPlan !== 'yearly';
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // States for features
  const [topHeadlines, setTopHeadlines] = useState([]);
  const [dailyAptitudes, setDailyAptitudes] = useState([]);
  const [loadingAptitude, setLoadingAptitude] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [aiQuizData, setAiQuizData] = useState([]);
  const [aiCategory, setAiCategory] = useState('');
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [selectedNewsItem, setSelectedNewsItem] = useState<any | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    checkUserAccess();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-refresh news every 2 hours
  useEffect(() => {
    if (!isPaidUser) return;

    const interval = setInterval(() => {
      const uid = sessionStorage.getItem('uid');
      if (uid) {
        fetchTopHeadlines(uid);
      }
    }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds

    return () => clearInterval(interval);
  }, [isPaidUser]);

  const checkUserAccess = async () => {
    const uid = sessionStorage.getItem('uid');
    if (!uid) return navigate('/login');

    try {
      const response = await axios.get(`${serverURL}/api/user/${uid}`);
      const user = response.data.user;
      if (user) {
        const type = user.type;
        const orgId = user.organizationId;
        const organization = user.organization;
        const isOrg = user.isOrganization;
        const role = user.role;
        const paidTypes = ['monthly', 'yearly', 'forever'];

        if (paidTypes.includes(type) || orgId || organization || isOrg || role === 'student') {
          setIsPaidUser(true);
          fetchTopHeadlines(uid);
          fetchDailyAptitude(uid);
        } else {
          setIsPaidUser(false);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const fetchTopHeadlines = async (uid: string, showLoading = false) => {
    if (showLoading) setLoadingNews(true);
    try {
      // console.log("Fetching today's current affairs for:", uid);
      const resp = await axios.get(`${serverURL}/api/interview-prep/current-affairs`, {
        headers: { 'user-id': uid }
      });
      // console.log("Current affairs response:", resp.data);
      const newsData = Array.isArray(resp.data)
        ? resp.data
        : Array.isArray(resp.data?.news)
          ? resp.data.news
          : Array.isArray(resp.data?.data)
            ? resp.data.data
            : [];

      const sortedNews = [...newsData].sort((a: any, b: any) =>
        new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime()
      );

      setTopHeadlines(sortedNews);
    } catch (e) {
      console.error("Fetch current affairs error:", e);
    } finally {
      if (showLoading) setLoadingNews(false);
    }
  };

  const fetchDailyAptitude = async (uid: string) => {
    setLoadingAptitude(true);
    try {
      // console.log("Fetching daily aptitude for:", uid);
      const resp = await axios.get(`${serverURL}/api/interview-prep/daily-aptitude`, {
        headers: { 'user-id': uid }
      });
      // console.log("Daily aptitude response:", resp.data);
      if (resp.data.success) {
        setDailyAptitudes(resp.data.data);
      }
    } catch (e) {
      console.error("Fetch daily aptitude error:", e);
    } finally {
      setLoadingAptitude(false);
    }
  };

  const generateQuiz = async () => {
    if (!aiCategory.trim()) {
      toast({ title: "Error", description: "Please enter a category", variant: "destructive" });
      return;
    }

    const uid = sessionStorage.getItem('uid');
    
    // Check for daily limit (24-hour cooldown)
    const lastGenKey = `last_ai_quiz_gen_${uid}`;
    const lastGen = localStorage.getItem(lastGenKey);
    const now = Date.now();
    const cooldownMs = 24 * 60 * 60 * 1000;

    if (lastGen) {
      const timeSinceLast = now - parseInt(lastGen);
      if (timeSinceLast < cooldownMs) {
        const hoursRemaining = Math.ceil((cooldownMs - timeSinceLast) / (1000 * 60 * 60));
        toast({ 
          title: "Daily Limit Reached", 
          description: `You can generate your next AI quiz in ${hoursRemaining} hours. Focus on mastering today's practice for now!`, 
          variant: "destructive" 
        });
        return;
      }
    }

    setGeneratingQuiz(true);
    setAiQuizData([]);
    try {
      // console.log("Generating quiz for:", uid, "category:", aiCategory);

      const resp = await axios.post(`${serverURL}/api/interview-prep/generate-category-quiz`,
        { userId: uid, category: aiCategory },
        { headers: { 'user-id': uid } }
      );

      // console.log("Generate quiz response:", resp.data);
      if (resp.data.success) {
        localStorage.setItem(lastGenKey, now.toString());
        setAiQuizData(resp.data.data);
        toast({ title: "Success", description: "Your daily AI quiz has been generated!" });
      } else {
        throw new Error(resp.data.message || "Failed to generate");
      }
    } catch (e: any) {
      console.error("Generate quiz error:", e);
      toast({
        title: "Error Generating Quiz",
        description: e.response?.data?.message || e.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setGeneratingQuiz(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isPaidUser) {
    return (
      <>
        <SEO title="Interview Preparation" description="Premium interview preparation tools" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center px-4 py-8 ">
          <div className="bg-primary/10 p-4 md:p-6 rounded-full mb-4 md:mb-6">
            <Lock className="h-12 w-12 md:h-16 md:w-16 text-primary" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent mb-3 md:mb-4">
            Unlock Advanced Interview Prep
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground mb-6 md:mb-8 px-2">
            Access daily current affairs, aptitude tests, and AI-powered custom quizzes tailored to your dream career. Upgrade to a premium plan to gain an edge in your interviews.
          </p>
          <Button size={isMobile ? "default" : "lg"} onClick={() => navigate('/dashboard/pricing')} className="px-6 md:px-8 shadow-lg">
            <Sparkles className="h-4 w-4 mr-2" /> Upgrade Now
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Interview Preparation" description="Master your interviews with daily tests and AI quizzes" />
      <div className="space-y-6 md:space-y-8 animate-fade-in max-w-6xl mx-auto pb-6 md:pb-10 px-4 md:px-6 lg:px-8 pt-0 lg:pt-[60px]">

        {/* Interview Success Blueprint Introduction */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-primary via-indigo-600 to-teal-500 bg-clip-text text-transparent mb-2">
                Interview Preparation Hub
              </h1>
              <p className="text-sm md:text-base text-muted-foreground font-medium max-w-2xl">
                Master the art of the interview with our 3-pillar daily blueprint. Awareness of the world, logic of the mind, and technical precision.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm flex flex-col gap-3 group hover:border-primary/50 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                <Newspaper className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Awareness</h3>
                <p className="text-xs text-muted-foreground mt-1">Stay updated with global headlines to handle current affairs and behavioral questions with ease.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm flex flex-col gap-3 group hover:border-primary/50 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Logic</h3>
                <p className="text-xs text-muted-foreground mt-1">Sharpen your analytical thinking with daily aptitude challenges designed to keep your mind quick.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm flex flex-col gap-3 group hover:border-primary/50 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Precision</h3>
                <p className="text-xs text-muted-foreground mt-1">Use AI to generate focused practice quizzes for your specific industry or technology stack.</p>
              </div>
            </div>
          </div>

          <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="h-20 w-20 text-primary" />
            </div>
            <CardContent className="p-4 md:p-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="bg-primary text-white text-[10px] uppercase tracking-wider">Pro-Tip of the Day</Badge>
                </div>
                <p className="text-sm md:text-base font-semibold italic text-slate-800 dark:text-slate-200">
                  "Use the STAR method (Situation, Task, Action, Result) to structure your answers for behavioral questions. It ensures you provide context while highlighting your specific impact."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 md:mb-8 h-auto bg-muted/50 rounded-xl p-1 gap-1">
            <TabsTrigger value="news" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-xs md:text-sm py-2 md:py-3">
              <Newspaper className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> 
              <span className="hidden xs:inline">Worldwide Headlines</span>
              <span className="xs:hidden">News</span>
            </TabsTrigger>
            <TabsTrigger value="aptitude" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-xs md:text-sm py-2 md:py-3">
              <Target className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> 
              <span className="hidden xs:inline">Daily Aptitude Test</span>
              <span className="xs:hidden">Aptitude</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-xs md:text-sm py-2 md:py-3">
              <Network className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> 
              <span className="hidden xs:inline">Categorized AI Quiz</span>
              <span className="xs:hidden">AI Quiz</span>
            </TabsTrigger>
          </TabsList>

          {/* Worldwide Headlines Content */}
          <TabsContent value="news" className="space-y-4 outline-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <Newspaper className="h-4 w-4 md:h-5 md:w-5 text-primary" /> Today's Top Headlines
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const uid = sessionStorage.getItem('uid');
                    if (uid) fetchTopHeadlines(uid, true);
                  }}
                  disabled={loadingNews}
                  className="h-8 px-3"
                >
                  {loadingNews ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  <span className="ml-1 hidden sm:inline">Refresh</span>
                </Button>
                <span className="text-xs md:text-sm text-muted-foreground font-medium">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
            {topHeadlines.length === 0 ? (
              <div className="text-center py-8 md:py-12 text-muted-foreground bg-card/50 rounded-xl md:rounded-2xl border border-dashed">
                <Newspaper className="h-8 w-8 md:h-10 md:w-10 mx-auto text-muted-foreground/50 mb-3 md:mb-4" />
                <p className="text-sm md:text-base">No headlines available right now. Check back later!</p>
              </div>
            ) : (
              <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {topHeadlines.map((item: any) => (
                  <Card
                    key={item._id}
                    className="cursor-pointer hover:shadow-md transition-all h-full flex flex-col group border-border/50"
                    onClick={() => setSelectedNewsItem(item)}
                  >
                    <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
                      <CardTitle className="text-sm md:text-base lg:text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2 break-words">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pt-0 px-3 md:px-6 pb-3 md:pb-6">
                      <div className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-3">
                        {item.content}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Dialog open={!!selectedNewsItem} onOpenChange={(open) => !open && setSelectedNewsItem(null)}>
              <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[85vh] overflow-y-auto p-4 md:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl lg:text-2xl leading-relaxed break-words">
                    {selectedNewsItem?.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-3 md:mt-4">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                    <Newspaper className="h-3 w-3 md:h-4 md:w-4" />
                    {(selectedNewsItem?.date || selectedNewsItem?.createdAt) && (
                      <span>{new Date(selectedNewsItem.date || selectedNewsItem.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div
                    className="text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap"
                  >
                    {selectedNewsItem?.content || ''}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Daily Aptitude Content */}
          <TabsContent value="aptitude" className="space-y-4 outline-none">
            {loadingAptitude ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-primary mb-3 md:mb-4" />
                <p className="text-xs md:text-sm">Generating today's aptitude questions...</p>
              </div>
            ) : dailyAptitudes.length === 0 ? (
              <div className="text-center py-8 md:py-12 text-muted-foreground bg-card/50 rounded-xl md:rounded-2xl border border-dashed">
                <Target className="h-8 w-8 md:h-10 md:w-10 mx-auto text-muted-foreground/50 mb-3 md:mb-4" />
                <p className="text-sm md:text-base">No daily aptitude tests available today.</p>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {dailyAptitudes.map((test: any) => (
                  <AptitudeTestViewer key={test._id} test={test} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Categorized Quiz Builder */}
          <TabsContent value="quiz" className="outline-none">
            <Card className="border-border/50 shadow-sm overflow-hidden mb-6 md:mb-8">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 md:p-6 lg:p-8 border-b border-border/40">
                <div className="max-w-2xl mx-auto text-center space-y-3 md:space-y-4">
                  <Brain className="h-8 w-8 md:h-10 md:w-12 mx-auto text-primary" />
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold">AI Quiz Generator</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Create tailored interview questions by entering any specific topic or industry below. Let the AI build a custom test for you instantly.
                  </p>

                  <div className="flex w-full flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4 md:mt-6">
                    <Input
                      type="text"
                      placeholder="e.g. History, ReactJS, Machine Learning..."
                      value={aiCategory}
                      onChange={(e) => setAiCategory(e.target.value)}
                      className="bg-background shadow-sm h-10 md:h-12 w-full"
                      onKeyDown={(e) => e.key === 'Enter' && generateQuiz()}
                    />
                    <Button
                      type="submit"
                      onClick={generateQuiz}
                      disabled={generatingQuiz}
                      className="h-10 md:h-12 px-4 md:px-6 shadow-sm w-full sm:w-auto"
                    >
                      {generatingQuiz ? <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" /> : <Sparkles className="mr-2 h-3 w-3 md:h-4 md:w-4" />}
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Generated Quiz Display */}
            {aiQuizData.length > 0 && (
              <AiQuizViewer questions={aiQuizData} category={aiCategory} />
            )}
          </TabsContent>
        </Tabs>

        {/* Master Class: Interview Essentials Section */}
        <div className="pt-10 md:pt-16 border-t border-border/40">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8 md:mb-12">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 flex items-center gap-3">
                <BookOpenCheck className="h-7 w-7 text-indigo-600" />
                Interview Essentials
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Beyond tests and news, successful candidates master these foundational strategies. Review these essentials before every major interview.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-center">
                <p className="text-lg font-bold text-primary">85%</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Prep Impact</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-center">
                <p className="text-lg font-bold text-primary">24h</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Mindset Focus</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Strategy Card 1 */}
            <Card className="border-none bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 shadow-sm transition-transform hover:-translate-y-1">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg">Behavioral Mastery</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Companies hire for culture as much as skill. Practice telling stories that emphasize empathy, problem-solving, and leadership using our STAR modules.
                </p>
                <ul className="space-y-2">
                  <li className="text-xs flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Emphasize collaborative success</li>
                  <li className="text-xs flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Own your failures with a lesson</li>
                </ul>
              </CardContent>
            </Card>

            {/* Strategy Card 2 */}
            <Card className="border-none bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/10 dark:to-slate-950 shadow-sm transition-transform hover:-translate-y-1">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg">Technical Clarity</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  In technical rounds, the process is often more important than the final result. Communicate your thought process clearly and ask clarifying questions.
                </p>
                <ul className="space-y-2">
                  <li className="text-xs flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Explain complexity trade-offs</li>
                  <li className="text-xs flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Sketch or write logic before code</li>
                </ul>
              </CardContent>
            </Card>

            {/* Strategy Card 3: Checklist */}
            <Card className="border-none bg-slate-900 text-white shadow-xl lg:col-span-1">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg text-teal-400">Pre-Interview Checklist</h3>
                <div className="space-y-3">
                  {[
                    "Research the company's recent news",
                    "Review the job description's keywords",
                    "Prepare 3 questions for the interviewer",
                    "Check your lighting and audio setup",
                    "Have a glass of water nearby"
                  ].map((item, id) => (
                    <div key={id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors">
                      <div className="h-4 w-4 rounded-md border border-white/20 flex items-center justify-center bg-teal-500/10">
                        <CheckCircle2 className="h-3 w-3 text-teal-400" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewPreparation;
