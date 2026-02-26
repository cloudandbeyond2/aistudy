import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Sparkles, Plus, Lock, AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CoursePreview from '@/components/CoursePreview';
import SEO from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ─── Plan limits (mirrors server/config/planLimits.js) ─────────────────────
const PLAN_LIMITS: Record<string, { maxCourses: number; maxSubtopics: number; allowVideo: boolean; allowMultiLang: boolean }> = {
  free: { maxCourses: 1, maxSubtopics: 5, allowVideo: false, allowMultiLang: false },
  monthly: { maxCourses: 20, maxSubtopics: 10, allowVideo: true, allowMultiLang: false },
  yearly: { maxCourses: Infinity, maxSubtopics: 10, allowVideo: true, allowMultiLang: true },
  forever: { maxCourses: Infinity, maxSubtopics: 10, allowVideo: true, allowMultiLang: true },
};

const courseFormSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters" }),
  subtopics: z.array(z.string()),
  topicsLimit: z.enum(["1", "4", "8"]),
  courseType: z.enum(["image & text course", "video & text course"]),
  language: z.string().min(1, { message: "Please select a language" })
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

const GenerateCourse = () => {
  const [subtopicInput, setSubtopicInput] = useState('');
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState({});
  const [selectedValue, setSelectedValue] = useState('4');
  const [selectedType, setSelectedType] = useState('image & text course');
  const [lang, setLang] = useState('English');
  const { toast } = useToast();
  const navigate = useNavigate();

  // ─── Derived plan state ───────────────────────────────────────────────────
  const userType = (sessionStorage.getItem('type') || 'free') as string;
  const subscriptionEndStr = sessionStorage.getItem('subscriptionEnd') || '';
  const planLimits = PLAN_LIMITS[userType] || PLAN_LIMITS.free;

  const isPlanExpired = (() => {
    if (userType === 'forever') return false;
    if (!subscriptionEndStr) return true; // No date set = treat as expired
    return new Date(subscriptionEndStr) < new Date();
  })();

  const canUseVideo = planLimits.allowVideo;
  const canUseMultiLang = planLimits.allowMultiLang;
  const maxSubtopics = planLimits.maxSubtopics;

  const languages = [
    { "code": "en", "name": "English" },
    { "code": "ar", "name": "Arabic" },
    { "code": "bn", "name": "Bengali" },
    { "code": "bg", "name": "Bulgarian" },
    { "code": "zh", "name": "Chinese" },
    { "code": "hr", "name": "Croatian" },
    { "code": "cs", "name": "Czech" },
    { "code": "da", "name": "Danish" },
    { "code": "nl", "name": "Dutch" },
    { "code": "et", "name": "Estonian" },
    { "code": "fi", "name": "Finnish" },
    { "code": "fr", "name": "French" },
    { "code": "de", "name": "German" },
    { "code": "el", "name": "Greek" },
    { "code": "he", "name": "Hebrew" },
    { "code": "hi", "name": "Hindi" },
    { "code": "hu", "name": "Hungarian" },
    { "code": "id", "name": "Indonesian" },
    { "code": "it", "name": "Italian" },
    { "code": "ja", "name": "Japanese" },
    { "code": "ko", "name": "Korean" },
    { "code": "lv", "name": "Latvian" },
    { "code": "lt", "name": "Lithuanian" },
    { "code": "no", "name": "Norwegian" },
    { "code": "pl", "name": "Polish" },
    { "code": "pt", "name": "Portuguese" },
    { "code": "ro", "name": "Romanian" },
    { "code": "ru", "name": "Russian" },
    { "code": "sr", "name": "Serbian" },
    { "code": "sk", "name": "Slovak" },
    { "code": "sl", "name": "Slovenian" },
    { "code": "es", "name": "Spanish" },
    { "code": "sw", "name": "Swahili" },
    { "code": "sv", "name": "Swedish" },
    { "code": "ta", "name": "Tamil" },
    { "code": "th", "name": "Thai" },
    { "code": "tr", "name": "Turkish" },
    { "code": "uk", "name": "Ukrainian" },
    { "code": "vi", "name": "Vietnamese" }
  ];

  useEffect(() => {
    if (sessionStorage.getItem('role') === 'student') {
      window.location.href = '/dashboard/student';
      return;
    }
  }, []);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      topic: '',
      subtopics: [],
      topicsLimit: "1",
      courseType: "image & text course",
      language: "English"
    }
  });

  /** Show an upgrade/plan toast when a restricted feature is clicked */
  const showUpgradeToast = (feature: string) => {
    toast({
      title: "Upgrade Required",
      description: `${feature} is not available on your ${userType} plan. Please upgrade to access this feature.`,
      variant: "destructive"
    });
  };

  /** Show expiry toast and redirect to pricing */
  const showExpiryToast = () => {
    toast({
      title: "Plan Expired",
      description: "Your subscription has expired. Please renew your plan to continue generating courses.",
      variant: "destructive"
    });
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  const addSubtopic = () => {
    if (isPlanExpired) {
      showExpiryToast();
      return;
    }
    if (subtopics.length >= maxSubtopics) {
      toast({
        title: "Subtopic Limit Reached",
        description: `Your ${userType} plan allows a maximum of ${maxSubtopics} subtopics. ${userType === 'free' ? 'Upgrade to get up to 10.' : ''}`,
        variant: "destructive"
      });
      return;
    }
    if (subtopicInput.trim() === '') return;
    const updated = [...subtopics, subtopicInput.trim()];
    setSubtopics(updated);
    setSubtopicInput('');
    form.setValue('subtopics', updated);
  };

  const onSubmit = async (data: CourseFormValues) => {
    // Plan expiry gate
    if (isPlanExpired) {
      showExpiryToast();
      return;
    }

    setIsLoading(true);
    setIsSubmitted(true);

    const subtopicsList: string[] = [];
    data.subtopics.forEach(s => subtopicsList.push(s));

    const mainTopic = data.topic;
    const language = data.language;
    const number = data.topicsLimit;

    // Check if course already exists
    try {
      const userId = sessionStorage.getItem('uid');
      const checkURL = serverURL + `/api/check-existence?userId=${userId}&mainTopic=${encodeURIComponent(mainTopic)}`;
      const checkRes = await axios.get(checkURL);

      if (checkRes.data.exists) {
        setIsLoading(false);
        setIsSubmitted(false);
        toast({
          title: "Course Already Exists",
          description: "You have already generated a course with this title. Please try a different topic.",
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      console.error('Error checking course existence:', error);
    }

    const prompt = `Strictly in ${language}, Generate a list of EXACTLY ${number} topics (chapters) for the course "${mainTopic}". 
    For each topic, include relevant subtopics.
    The output must take the form of a JSON object with a "course_topics" array containing EXACTLY ${number} items.
    
    Structure:
    {
      "course_topics": [
        {
          "title": "Topic 1",
          "subtopics": [ ... ]
        }
      ]
    }

    Strictly include these requested subtopics if provided: ${subtopicsList.join(', ')}.
    Keep "theory", "youtube", "image" fields empty.
    "done" should be false.
    `;

    sendPrompt(prompt);
  };

  async function sendPrompt(prompt: string) {
    const dataToSend = { prompt };
    try {
      const postURL = serverURL + '/api/prompt';
      const res = await axios.post(postURL, dataToSend);
      const generatedText = res.data.generatedText;

      if (!generatedText) {
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Course data is not available. Please try generating again.",
        });
        return;
      }

      const cleanedJsonString = generatedText.replace(/```json/g, '').replace(/```/g, '');
      try {
        const parsedJson = JSON.parse(cleanedJsonString);
        setGeneratedTopics(parsedJson);
        setIsLoading(false);
      } catch (error: any) {
        console.error(error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: error.response?.data?.message || error.message || "Internal Server Error",
        });
      }
    } catch (error: any) {
      setIsLoading(false);

      // Handle backend plan errors gracefully
      const errData = error.response?.data;
      if (errData?.planExpired) {
        showExpiryToast();
        setIsSubmitted(false);
        return;
      }
      if (errData?.courseLimitReached) {
        setIsSubmitted(false);
        toast({
          title: "Course Limit Reached",
          description: errData.message,
          variant: "destructive"
        });
        return;
      }

      console.error(error);
      toast({
        title: "Error",
        description: errData?.message || error.message || "Internal Server Error",
      });
    }
  }

  const handleEditTopics = () => {
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <>
        <SEO
          title="Generate Course - Preview"
          description="Preview your AI-generated course before creation"
          keywords="course generation, preview, AI learning"
        />
        <CoursePreview
          isLoading={isLoading}
          courseName={form.getValues('topic').toLowerCase()}
          topics={generatedTopics}
          type={selectedType}
          lang={lang.toLowerCase()}
          onClose={handleEditTopics}
        />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Generate Course"
        description="Create a customized AI-generated course"
        keywords="course generation, AI learning, custom education"
      />
      <div className="space-y-8 animate-fade-in max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-indigo-500 mb-4">Generate Course</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Type the topic on which you want to Generate course.
            Also, you can enter a list of subtopics, which are the
            specifics you want to learn.
          </p>
        </div>

        {/* Plan Expiry Banner */}
        {isPlanExpired && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Your subscription has expired</p>
              <p className="text-xs mt-0.5">Please <a href="/dashboard" className="underline font-medium">renew your plan</a> to continue generating courses.</p>
            </div>
          </div>
        )}

        {/* Plan Info Badge */}
        {!isPlanExpired && (
          <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>
              <strong className="capitalize">{userType} Plan</strong> — up to{' '}
              <strong>{planLimits.maxCourses === Infinity ? 'unlimited' : planLimits.maxCourses}</strong> course{planLimits.maxCourses === 1 ? '' : 's'},{' '}
              <strong>{maxSubtopics}</strong> subtopics per course
              {subscriptionEndStr && userType !== 'forever' && (
                <> · Expires <strong>{new Date(subscriptionEndStr).toLocaleDateString()}</strong></>
              )}
            </span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter main topic" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Sub Topic (Optional) <span className="text-muted-foreground font-normal">— max {maxSubtopics}</span></FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter subtopic"
                        value={subtopicInput}
                        onChange={(e) => setSubtopicInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSubtopic();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addSubtopic}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Sub-Topic
                      </Button>
                    </div>

                    {subtopics.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {subtopics.map((topic, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <span className="text-sm">{topic}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="ml-auto h-7 w-7 p-0"
                              onClick={() => {
                                const newSubtopics = subtopics.filter((_, i) => i !== index);
                                setSubtopics(newSubtopics);
                                form.setValue('subtopics', newSubtopics);
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Number of Sub-Topics */}
                  <div>
                    <FormLabel>Select Number Of Sub Topic</FormLabel>
                    <FormField
                      control={form.control}
                      name="topicsLimit"
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <FormControl>
                            <RadioGroup
                              value={selectedValue}
                              onValueChange={(val) => {
                                setSelectedValue(val);
                                field.onChange(val);
                              }}
                              className="space-y-2"
                            >
                              {/* Option: 5 — always available */}
                              <div className="flex items-center space-x-2 border p-3 rounded-md">
                                <RadioGroupItem defaultChecked value="4" id="r1" />
                                <FormLabel htmlFor="r1" className="mb-0">5</FormLabel>
                              </div>

                              {/* Option: 10 — monthly/yearly/forever only */}
                              <div
                                onClick={() => { if (maxSubtopics < 10) showUpgradeToast('10 subtopics per topic'); }}
                                className={`flex items-center space-x-2 border p-3 rounded-md ${maxSubtopics < 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <RadioGroupItem disabled={maxSubtopics < 10} value="8" id="r2" />
                                <FormLabel htmlFor="r2" className="mb-0 flex items-center gap-2">
                                  10
                                  {maxSubtopics < 10 && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                                </FormLabel>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Course Type */}
                  <div>
                    <FormLabel>Select Course Type</FormLabel>
                    <FormField
                      control={form.control}
                      name="courseType"
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <FormControl>
                            <RadioGroup
                              value={selectedType}
                              onValueChange={(val) => {
                                setSelectedType(val);
                                field.onChange(val);
                              }}
                              className="space-y-2"
                            >
                              {/* Theory & Image — always available */}
                              <div className="flex items-center space-x-2 border p-3 rounded-md">
                                <RadioGroupItem defaultChecked value="image & text course" id="ct1" />
                                <FormLabel htmlFor="ct1" className="mb-0">Theory &amp; Image Course</FormLabel>
                              </div>

                              {/* Video & Theory — monthly/yearly/forever only */}
                              <div
                                onClick={() => { if (!canUseVideo) showUpgradeToast('Video & Theory courses'); }}
                                className={`flex items-center space-x-2 border p-3 rounded-md ${!canUseVideo ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <RadioGroupItem disabled={!canUseVideo} value="video & text course" id="ct2" />
                                <FormLabel htmlFor="ct2" className="mb-0 flex items-center gap-2">
                                  Video &amp; Theory Course
                                  {!canUseVideo && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                                </FormLabel>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Language */}
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Course Language
                          {!canUseMultiLang && <span className="text-xs text-muted-foreground font-normal">(Yearly plan for 23+ languages)</span>}
                        </FormLabel>
                        <Select
                          onValueChange={(val) => {
                            if (!canUseMultiLang && val !== 'English') {
                              showUpgradeToast('Multi-language support (23+ languages)');
                              return;
                            }
                            setLang(val);
                            field.onChange(val);
                          }}
                          value={lang}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((country) => (
                              <SelectItem
                                key={country.code}
                                value={country.name}
                                disabled={!canUseMultiLang && country.name !== 'English'}
                              >
                                {country.name}
                                {!canUseMultiLang && country.name !== 'English' && ' 🔒'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isPlanExpired}
                    className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isPlanExpired ? 'Plan Expired — Renew to Generate' : 'Submit'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </>
  );
};

export default GenerateCourse;