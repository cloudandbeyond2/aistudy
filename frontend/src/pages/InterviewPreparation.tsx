import React, { useState, useEffect } from 'react';
import { serverURL } from '@/constants';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Newspaper, Target, Network, Lock, Sparkles, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import SEO from '@/components/SEO';
import { useNavigate } from 'react-router-dom';

const InterviewPreparation = () => {
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  // States for features
  const [currentAffairs, setCurrentAffairs] = useState([]);
  const [dailyAptitudes, setDailyAptitudes] = useState([]);
  const [aiQuizData, setAiQuizData] = useState([]);
  const [aiCategory, setAiCategory] = useState('');
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  
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
            {currentAffairs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card/50 rounded-2xl border border-dashed">
                <Newspaper className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
                <p>No current affairs available yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {currentAffairs.map((item: any) => (
                  <Card key={item._id} className="hover:shadow-md transition-all h-full flex flex-col group border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full">
                          {item.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Daily Aptitude Content */}
          <TabsContent value="aptitude" className="space-y-4 outline-none">
            {dailyAptitudes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card/50 rounded-2xl border border-dashed">
                <Target className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
                <p>No daily aptitude tests available today.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {dailyAptitudes.map((test: any) => (
                  <Card key={test._id} className="hover:shadow-md transition-all border-border/50">
                    <CardHeader>
                      <CardTitle className="text-xl text-primary">{test.title}</CardTitle>
                      <CardDescription>{new Date(test.date).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{test.description}</p>
                      <ul className="space-y-3">
                        {test.questions.map((q: any, i: number) => (
                          <li key={i} className="bg-muted/30 p-4 rounded-xl border border-border/40">
                            <p className="font-medium text-sm mb-3"><span className="text-primary mr-1">Q{i+1}.</span> {q.question}</p>
                            <div className="pl-5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              {q.options.map((opt: string, j: number) => (
                                <div key={j} className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pl-5">
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">Ans: {q.answer}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
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
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold flex items-center">
                  <Network className="mr-2 h-5 w-5 text-primary" /> Generated Quiz on "<span className="capitalize">{aiCategory}</span>"
                </h3>
                <div className="grid gap-6">
                  {aiQuizData.map((q: any, idx: number) => (
                    <Card key={idx} className="border-l-4 border-l-primary/60 hover:shadow-md transition-shadow">
                      <CardHeader className="py-4">
                        <CardTitle className="text-lg leading-snug">
                          <span className="text-muted-foreground mr-2 font-mono">{idx + 1}.</span> 
                          {q.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="grid sm:grid-cols-2 gap-3 mb-4">
                          {q.options.map((opt: string, oi: number) => (
                            <div key={oi} className="p-3 rounded-lg bg-muted/40 border border-border/40 text-sm">
                              {opt}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center text-sm font-medium">
                          <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-md flex items-center">
                            <Target className="w-4 h-4 mr-1.5" /> Correct Answer: {q.answer}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default InterviewPreparation;
