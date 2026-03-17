import React, { useState, useEffect } from 'react';
import { serverURL } from '@/constants';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Newspaper, Target, Network, Lock, Sparkles, Brain, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import SEO from '@/components/SEO';
import { useNavigate } from 'react-router-dom';

const AptitudeTestViewer = ({ test }: { test: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const questions = test.questions?.slice(0, 15) || [];

  if (questions.length === 0) return null;

  const q = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" /> {test.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 bg-primary/10 text-primary rounded-full shrink-0">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <Card className="border-l-4 border-l-primary/50 hover:shadow-md transition-shadow">
        <CardHeader className="py-4">
          <CardTitle className="text-lg leading-snug">
            <span className="text-muted-foreground mr-2 font-mono">Q{currentIndex + 1}.</span>
            {q.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {q.options.map((opt: string, j: number) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = q.answer === opt;

              let optionStyle = "bg-muted/40 border-border/40 text-foreground";
              let indicator = <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}></div>;

              if (showAnswer) {
                if (isCorrect) {
                  optionStyle = "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-800 dark:text-emerald-400 font-medium";
                  indicator = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
                } else if (isSelected && !isCorrect) {
                  optionStyle = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-400 font-medium";
                  indicator = <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />;
                } else {
                  optionStyle = "bg-muted/20 border-border/20 text-muted-foreground opacity-60";
                }
              } else if (isSelected) {
                optionStyle = "bg-primary/10 border-primary text-primary font-medium";
              }

              return (
                <div
                  key={j}
                  onClick={() => !showAnswer && setSelectedAnswer(opt)}
                  className={`p-3 rounded-lg border transition-all text-sm flex items-center gap-3 ${!showAnswer ? 'cursor-pointer hover:border-primary/50 hover:bg-muted/60' : ''} ${optionStyle}`}
                >
                  {indicator}
                  {opt}
                </div>
              );
            })}
          </div>

          <div className="space-y-6">
            <div className="min-h-[40px] flex items-center">
              {showAnswer ? (
                <div className="animate-in fade-in slide-in-from-left-2">
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-md inline-flex items-center">
                    <Target className="w-4 h-4 mr-2" /> Correct Answer: {q.answer}
                  </span>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowAnswer(true)}>
                  Show Answer
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
              >
                {currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
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
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  if (questions.length === 0) return null;

  const q = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center">
          <Network className="mr-2 h-5 w-5 text-primary" /> Generated Quiz on "<span className="capitalize">{category}</span>"
        </h3>
        <span className="text-xs font-semibold px-3 py-1.5 bg-primary/10 text-primary rounded-full shrink-0">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <Card className="border-l-4 border-l-primary/60 hover:shadow-md transition-shadow">
        <CardHeader className="py-4">
          <CardTitle className="text-lg leading-snug">
            <span className="text-muted-foreground mr-2 font-mono">Q{currentIndex + 1}.</span>
            {q.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {q.options.map((opt: string, oi: number) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = q.answer === opt;

              let optionStyle = "bg-muted/40 border-border/40 text-foreground";
              let indicator = <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}></div>;

              if (showAnswer) {
                if (isCorrect) {
                  optionStyle = "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-800 dark:text-emerald-400 font-medium";
                  indicator = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
                } else if (isSelected && !isCorrect) {
                  optionStyle = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-400 font-medium";
                  indicator = <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />;
                } else {
                  optionStyle = "bg-muted/20 border-border/20 text-muted-foreground opacity-60";
                }
              } else if (isSelected) {
                optionStyle = "bg-primary/10 border-primary text-primary font-medium";
              }

              return (
                <div
                  key={oi}
                  onClick={() => !showAnswer && setSelectedAnswer(opt)}
                  className={`p-3 rounded-lg border transition-all text-sm flex items-center gap-3 ${!showAnswer ? 'cursor-pointer hover:border-primary/50 hover:bg-muted/60' : ''} ${optionStyle}`}
                >
                  {indicator}
                  {opt}
                </div>
              );
            })}
          </div>

          <div className="space-y-6">
            <div className="min-h-[40px] flex items-center">
              {showAnswer ? (
                <div className="animate-in fade-in slide-in-from-left-2">
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-md inline-flex items-center">
                    <Target className="w-4 h-4 mr-2" /> Correct Answer: {q.answer}
                  </span>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowAnswer(true)}>
                  Show Answer
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
              >
                {currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const InterviewPreparation = () => {
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // States for features
  const [currentAffairs, setCurrentAffairs] = useState([]);
  const [dailyAptitudes, setDailyAptitudes] = useState([]);
  const [loadingAptitude, setLoadingAptitude] = useState(false);
  const [aiQuizData, setAiQuizData] = useState([]);
  const [aiCategory, setAiCategory] = useState('');
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [selectedNewsItem, setSelectedNewsItem] = useState<any | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
    const uid = sessionStorage.getItem('uid');
    if (!uid) return navigate('/login');

    try {
      const response = await axios.get(`${serverURL}/api/user/${uid}`);
      const user = response.data.user;
      if (user) {
        const type = user.type;
        const orgId = user.organizationId;
        const isOrg = user.isOrganization;
        const paidTypes = ['monthly', 'yearly', 'forever'];

        if (paidTypes.includes(type) || orgId || isOrg) {
          setIsPaidUser(true);
          fetchCurrentAffairs(uid);
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

  const fetchCurrentAffairs = async (uid: string) => {
    try {
      console.log("Fetching current affairs for:", uid);
      const resp = await axios.get(`${serverURL}/api/interview-prep/current-affairs`, {
        headers: { 'user-id': uid }
      });
      console.log("Current affairs response:", resp.data);
      if (resp.data.success) {
        setCurrentAffairs(resp.data.data);
      }
    } catch (e) {
      console.error("Fetch current affairs error:", e);
    }
  };

  const fetchDailyAptitude = async (uid: string) => {
    setLoadingAptitude(true);
    try {
      console.log("Fetching daily aptitude for:", uid);
      const resp = await axios.get(`${serverURL}/api/interview-prep/daily-aptitude`, {
        headers: { 'user-id': uid }
      });
      console.log("Daily aptitude response:", resp.data);
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

    setGeneratingQuiz(true);
    setAiQuizData([]);
    try {
      const uid = sessionStorage.getItem('uid');
      console.log("Generating quiz for:", uid, "category:", aiCategory);

      const resp = await axios.post(`${serverURL}/api/interview-prep/generate-category-quiz`,
        { userId: uid, category: aiCategory },
        { headers: { 'user-id': uid } }
      );

      console.log("Generate quiz response:", resp.data);
      if (resp.data.success) {
        setAiQuizData(resp.data.data);
        toast({ title: "Success", description: "Quiz generated successfully!" });
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center px-4">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <Lock className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent mb-4">
            Unlock Advanced Interview Prep
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Access daily current affairs, aptitude tests, and AI-powered custom quizzes tailored to your dream career. Upgrade to a premium plan to gain an edge in your interviews.
          </p>
          <Button size="lg" onClick={() => navigate('/dashboard/pricing')} className="px-8 shadow-lg">
            <Sparkles className="h-4 w-4 mr-2" /> Upgrade Now
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Interview Preparation" description="Master your interviews with daily tests and AI quizzes" />
      <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-10">

        {/* Banner Section */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-primary/5 to-transparent border border-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] -z-10" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Interview Preparation Hub</h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Stay ahead with curated current affairs, sharpen your logic with daily aptitude tests, and generate infinite quizzes on any category with AI.
            </p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-muted/50 rounded-xl p-1">
            <TabsTrigger value="news" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"><Newspaper className="h-4 w-4 mr-2" /> Current Affairs & News</TabsTrigger>
            <TabsTrigger value="aptitude" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"><Target className="h-4 w-4 mr-2" /> Daily Aptitude Test</TabsTrigger>
            <TabsTrigger value="quiz" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"><Network className="h-4 w-4 mr-2" /> Categorized AI Quiz</TabsTrigger>
          </TabsList>

          {/* Current Affairs Content */}
          <TabsContent value="news" className="space-y-4 outline-none">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" /> Today's News
              </h2>
              <span className="text-sm text-muted-foreground font-medium">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            {currentAffairs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card/50 rounded-2xl border border-dashed">
                <Newspaper className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
                <p>No news available for today. Check back later!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentAffairs.map((item: any) => (
                  <Card
                    key={item._id}
                    className="cursor-pointer hover:shadow-md transition-all h-full flex flex-col group border-border/50"
                    onClick={() => setSelectedNewsItem(item)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pt-0">
                      <div className="text-muted-foreground text-sm leading-relaxed line-clamp-3 prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: item.content }} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Dialog open={!!selectedNewsItem} onOpenChange={(open) => !open && setSelectedNewsItem(null)}>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl leading-relaxed">{selectedNewsItem?.title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 pb-4 border-b">
                    <Newspaper className="h-4 w-4" />
                    {selectedNewsItem?.createdAt && <span>{new Date(selectedNewsItem.createdAt).toLocaleDateString()}</span>}
                  </div>
                  <div
                    className="text-base text-foreground/90 leading-relaxed prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedNewsItem?.content || '' }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Daily Aptitude Content */}
          <TabsContent value="aptitude" className="space-y-4 outline-none">
            {loadingAptitude ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-sm">Generating today's aptitude questions...</p>
              </div>
            ) : dailyAptitudes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card/50 rounded-2xl border border-dashed">
                <Target className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
                <p>No daily aptitude tests available today.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {dailyAptitudes.map((test: any) => (
                  <AptitudeTestViewer key={test._id} test={test} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Categorized Quiz Builder */}
          <TabsContent value="quiz" className="outline-none">
            <Card className="border-border/50 shadow-sm overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 border-b border-border/40">
                <div className="max-w-2xl mx-auto text-center space-y-4">
                  <Brain className="h-12 w-12 mx-auto text-primary" />
                  <h2 className="text-2xl font-bold">AI Quiz Generator</h2>
                  <p className="text-muted-foreground text-sm">Create tailored interview questions by entering any specific topic or industry below. Let the AI build a custom test for you instantly.</p>

                  <div className="flex w-full items-center space-x-2 mt-6">
                    <Input
                      type="text"
                      placeholder="e.g. History, ReactJS, Machine Learning, Geography..."
                      value={aiCategory}
                      onChange={(e) => setAiCategory(e.target.value)}
                      className="bg-background shadow-sm h-12"
                      onKeyDown={(e) => e.key === 'Enter' && generateQuiz()}
                    />
                    <Button
                      type="submit"
                      onClick={generateQuiz}
                      disabled={generatingQuiz}
                      className="h-12 px-6 shadow-sm"
                    >
                      {generatingQuiz ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
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
      </div>
    </>
  );
};

export default InterviewPreparation;
