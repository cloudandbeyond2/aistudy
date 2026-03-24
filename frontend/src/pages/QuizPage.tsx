import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Medal, Clock, Trophy, Shield, Camera, Mic, FileCheck2, Sparkles, CircleAlert, LockKeyhole } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import { serverURL, appLogo, websiteURL, appName } from '@/constants';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';


enum QuizState {
    NotStarted,
    InProgress,
    Completed
}

const defaultManualQuizSettings = {
    examMode: true,
    quizMode: 'secure',
    attemptLimit: 2,
    cooldownMinutes: 60,
    passPercentage: 50,
    questionCount: 10,
    difficultyMode: 'mixed',
    shuffleQuestions: true,
    shuffleOptions: true,
    reviewMode: 'after_submit_with_answers',
    positiveMarkPerCorrect: 1,
    negativeMarkingEnabled: false,
    negativeMarkPerWrong: 0.25,
    sectionPatternEnabled: false,
    sections: {
        easy: 0,
        medium: 0,
        difficult: 0
    },
    proctoring: {
        requireCamera: true,
        requireMicrophone: true,
        detectFullscreenExit: true,
        detectTabSwitch: true,
        detectCopyPaste: true,
        detectContextMenu: true,
        detectNoise: true
    }
};

const initialSecuritySummary = {
    tabWarnings: 0,
    fullscreenWarnings: 0,
    noiseWarnings: 0,
    clipboardWarnings: 0
};

const defaultLegacyQuizStatus = {
    passed: false,
    certificateIssued: false,
    certificateId: '',
    certificateThreshold: 70,
    attemptCount: 0,
    latestAttempt: null,
    retakeRequest: null,
    canStart: true,
    canRequestRetake: false,
    retakeApproved: false,
    needsAdminApproval: false
};

const normalizeQuizQuestions = (inputQuestions: any[] = []) =>
    (Array.isArray(inputQuestions) ? inputQuestions : [])
        .map((item: any, index: number) => {
            if (!item) return null;

            const questionText =
                typeof item.question === 'string'
                    ? item.question
                    : item.question?.text || item.question?.question || 'Question text missing';

            const sanitizedOptions = Array.isArray(item.options)
                ? item.options.map((option: any, optionIndex: number) => ({
                    id: option?.id || String.fromCharCode(97 + optionIndex),
                    text:
                        typeof option === 'string'
                            ? option
                            : option?.text || option?.value || String(option || 'Option')
                }))
                : [];

            const rawAnswer = String(item.correctAnswer || item.answer || '').trim().toLowerCase();
            const matchedById = sanitizedOptions.find((opt: any) => String(opt.id).toLowerCase() === rawAnswer);
            const matchedByText = sanitizedOptions.find((opt: any) => opt.text.toLowerCase().trim() === rawAnswer);
            const correctAnswer = matchedById?.id || matchedByText?.id || rawAnswer || sanitizedOptions[0]?.id || 'a';

            return {
                id: item.id || `q${index + 1}`,
                question: questionText,
                options: sanitizedOptions,
                correctAnswer,
                difficulty: item.difficulty || 'medium'
            };
        })
        .filter(Boolean);

const QuizPage = () => {
    const { state } = useLocation();
    // Safely extract topic - handle if it's an object or undefined
    const rawTopic = state?.topic;
    const topic = typeof rawTopic === 'object' && rawTopic !== null
        ? (rawTopic.name || rawTopic.title || rawTopic.topic || JSON.stringify(rawTopic))
        : String(rawTopic || 'Course');

    const courseId = state?.courseId || '';
    const questions = state?.questions || [];
    const certificateIdState = state?.certificateId || '';
    const manualQuizExam = !!state?.manualQuizExam;

    const [quizState, setQuizState] = useState<QuizState>(QuizState.NotStarted);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const { toast } = useToast();
    const [certificateSettings, setCertificateSettings] = useState({
        ceoName: 'Sumit Saha',
        ceoSignature: '',
        vpName: 'Dr. Shruti Awasthi',
        vpSignature: '',
        logo: '',
        qrCodeUrl: 'https://vlearny.com/check-certificate-authenticity'
    });
    const [quizQuestions, setExamJSON] = useState<any[]>([]);
    const [passedQuiz, setPassed] = useState(false);
    const [certificateId, setCertificateId] = useState(certificateIdState);
    const [attemptId, setAttemptId] = useState('');
    const [attemptSummary, setAttemptSummary] = useState<any>(null);
    const [quizSettings, setQuizSettings] = useState<any>({ ...defaultManualQuizSettings });
    const [submittedResult, setSubmittedResult] = useState<any>(null);
    const [permissionState, setPermissionState] = useState<any>({ camera: 'pending', microphone: 'pending' });
    const [securitySummary, setSecuritySummary] = useState<any>({ ...initialSecuritySummary });
    const [legacyQuizStatus, setLegacyQuizStatus] = useState<any>({ ...defaultLegacyQuizStatus });
    const [retakeRequestSubmitting, setRetakeRequestSubmitting] = useState(false);
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [startChecklist, setStartChecklist] = useState({
        rulesAccepted: false,
        monitoringAccepted: false,
        honestyAccepted: false
    });
    const [retakeReason, setRetakeReason] = useState('');
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const mediaStreamRef = useRef<any>(null);
    const audioContextRef = useRef<any>(null);
    const analyserRef = useRef<any>(null);
    const noiseIntervalRef = useRef<any>(null);
    const securityThrottleRef = useRef<Record<string, number>>({});
    const submissionLockRef = useRef(false);
    const abandonmentSentRef = useRef(false);

    const fetchCertificateSettings = async () => {
        try {
            const response = await axios.get(`${serverURL}/api/certificate-settings`);
            if (response.data) {
                // Sanitize inbound certificate settings
                const safeSettings = {
                    ceoName: String(response.data.ceoName || 'Sumit Saha'),
                    ceoSignature: String(response.data.ceoSignature || ''),
                    vpName: String(response.data.vpName || 'Dr. Shruti Awasthi'),
                    vpSignature: String(response.data.vpSignature || ''),
                    logo: String(response.data.logo || ''),
                    qrCodeUrl: String(response.data.qrCodeUrl || 'https://vlearny.com/check-certificate-authenticity')
                };
                setCertificateSettings(safeSettings);
            }
        } catch (error) {
            console.error('Error fetching certificate settings:', error);
        }
    };

    useEffect(() => {
        fetchCertificateSettings();
        if (manualQuizExam) {
            loadManualQuizStatus();
        } else if (questions) {
            init();
            loadLegacyQuizStatus();
        }
    }, [questions, manualQuizExam]);

    useEffect(() => {
        return () => {
            stopMonitoringDevices();
        };
    }, []);

    const resetSecurityState = () => {
        setSecuritySummary({ ...initialSecuritySummary });
        setPermissionState({ camera: 'pending', microphone: 'pending' });
        securityThrottleRef.current = {};
    };

    const resetStartChecklist = () => {
        setStartChecklist({
            rulesAccepted: false,
            monitoringAccepted: false,
            honestyAccepted: false
        });
    };

    const requestSecureFullscreen = async () => {
        const rootElement: any = document.documentElement;
        if (document.fullscreenElement) return true;

        try {
            if (rootElement.requestFullscreen) {
                await rootElement.requestFullscreen();
                return true;
            }
            if (rootElement.webkitRequestFullscreen) {
                rootElement.webkitRequestFullscreen();
                return true;
            }
            if (rootElement.msRequestFullscreen) {
                rootElement.msRequestFullscreen();
                return true;
            }
        } catch (error) {
            console.error('Fullscreen request failed', error);
        }

        return false;
    };

    const getEffectiveProctoring = (settings: any) => {
        if ((settings?.quizMode || 'secure') === 'practice') {
            return {
                requireCamera: false,
                requireMicrophone: false,
                detectFullscreenExit: false,
                detectTabSwitch: false,
                detectCopyPaste: false,
                detectContextMenu: false,
                detectNoise: false
            };
        }

        return {
            ...defaultManualQuizSettings.proctoring,
            ...(settings?.proctoring || {})
        };
    };

    function init() {
        try {
            console.log('Quiz Init - Raw questions:', questions);

            let parsedQuestions: any[] = [];
            if (Array.isArray(questions)) {
                parsedQuestions = questions;
            } else if (typeof questions === 'object' && questions !== null) {
                const topLevelKeys = Object.keys(questions);
                if (topLevelKeys.length > 0) {
                    const temp = questions[topLevelKeys[0]];
                    if (Array.isArray(temp)) {
                        parsedQuestions = temp;
                    }
                }
            }

            if (!Array.isArray(parsedQuestions)) {
                console.error('Quiz Init - parsedQuestions is not an array:', parsedQuestions);
                setExamJSON([]);
                return;
            }

            const formattedQuestions = normalizeQuizQuestions(parsedQuestions);

            console.log('Quiz Init - Formatted questions:', formattedQuestions);
            setExamJSON(formattedQuestions);
        } catch (error) {
            console.error('Quiz Init Error:', error);
            toast({
                title: "Error loading quiz",
                description: "There was a problem preparing the quiz questions.",
                variant: "destructive"
            });
            setExamJSON([]);
        }
    }

    const stopMonitoringDevices = () => {
        if (noiseIntervalRef.current) {
            clearInterval(noiseIntervalRef.current);
            noiseIntervalRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close?.();
            audioContextRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track: any) => track.stop());
            mediaStreamRef.current = null;
        }
    };

    const hasSevereMalpractice = (summary: any) =>
        (summary?.tabWarnings || 0) >= 3 ||
        (summary?.fullscreenWarnings || 0) >= 2 ||
        (summary?.clipboardWarnings || 0) >= 2 ||
        (summary?.noiseWarnings || 0) >= 5;

    const sendAbandonAttempt = useCallback((reason = 'page_exit') => {
        if (!manualQuizExam || !attemptId || submissionLockRef.current || abandonmentSentRef.current || quizState !== QuizState.InProgress) {
            return;
        }

        abandonmentSentRef.current = true;
        const payload = JSON.stringify({
            attemptId,
            userId: sessionStorage.getItem('uid'),
            reason
        });

        fetch(`${serverURL}/api/org-quiz/abandon`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
        }).catch(() => undefined);
    }, [attemptId, manualQuizExam, quizState]);

    const loadManualQuizStatus = async () => {
        if (!courseId) return;
        setIsLoading(true);
        try {
            const fallbackQuestions = normalizeQuizQuestions(questions);
            const userId = sessionStorage.getItem('uid');
            const response = await axios.post(`${serverURL}/api/org-quiz/status`, { courseId, userId });
            if (response.data?.success) {
                setExamJSON(fallbackQuestions);
                setAttemptSummary({
                    attemptCount: response.data.attemptCount,
                    attemptLimit: response.data.attemptLimit,
                    remainingAttempts: response.data.remainingAttempts,
                    nextAttemptAvailableAt: response.data.nextAttemptAvailableAt,
                    latestAttempt: response.data.latestAttempt,
                    maxAttemptsReached: response.data.maxAttemptsReached,
                    passed: response.data.passed
                });
                setQuizSettings({
                    ...defaultManualQuizSettings,
                    ...(response.data.quizSettings || {}),
                    sections: {
                        ...defaultManualQuizSettings.sections,
                        ...(response.data.quizSettings?.sections || {})
                    },
                    proctoring: {
                        ...defaultManualQuizSettings.proctoring,
                        ...(response.data.quizSettings?.proctoring || {})
                    }
                });
                setPassed(!!response.data.passed);
            }
        } catch (error) {
            console.error('Failed to load manual quiz status', error);
            toast({
                title: 'Quiz unavailable',
                description: 'Failed to load quiz status.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadLegacyQuizStatus = async () => {
        if (!courseId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const userId = sessionStorage.getItem('uid');
            const response = await axios.post(`${serverURL}/api/quiz-retake/status`, { courseId, userId });
            if (response.data?.success) {
                const nextStatus = {
                    ...defaultLegacyQuizStatus,
                    ...(response.data || {})
                };
                setLegacyQuizStatus(nextStatus);
                setPassed(!!response.data.passed);
                if (response.data.certificateId) {
                    setCertificateId(response.data.certificateId);
                }
            }
        } catch (error) {
            console.error('Failed to load legacy quiz status', error);
            toast({
                title: 'Quiz unavailable',
                description: 'Failed to load quiz status.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const logSecurityEvent = async (eventType: string, severity = 'low', details = '', explicitAttemptId?: string) => {
        const activeAttemptId = explicitAttemptId || attemptId;
        if (!manualQuizExam || !activeAttemptId) return;

        const now = Date.now();
        const lastLoggedAt = securityThrottleRef.current[eventType] || 0;
        if (now - lastLoggedAt < 5000) return;
        securityThrottleRef.current[eventType] = now;

        try {
            await axios.post(`${serverURL}/api/org-quiz/security-event`, {
                attemptId: activeAttemptId,
                userId: sessionStorage.getItem('uid'),
                eventType,
                severity,
                details
            });
        } catch (error) {
            console.error('Failed to log security event', error);
        }
    };

    const requestDevices = async (activeAttemptId?: string, settingsOverride?: any) => {
        const mergedSettings = settingsOverride
            ? {
                ...defaultManualQuizSettings,
                ...settingsOverride,
                sections: {
                    ...defaultManualQuizSettings.sections,
                    ...(settingsOverride?.sections || {})
                },
                proctoring: getEffectiveProctoring(settingsOverride)
            }
            : quizSettings;
        const proctoring = getEffectiveProctoring(mergedSettings);
        stopMonitoringDevices();

        try {
            if (proctoring.requireCamera || proctoring.requireMicrophone || proctoring.detectNoise) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: !!proctoring.requireCamera,
                    audio: !!(proctoring.requireMicrophone || proctoring.detectNoise)
                });

                mediaStreamRef.current = stream;

                if (videoRef.current && proctoring.requireCamera) {
                    videoRef.current.srcObject = stream;
                }

                setPermissionState({
                    camera: proctoring.requireCamera ? 'granted' : 'optional',
                    microphone: (proctoring.requireMicrophone || proctoring.detectNoise) ? 'granted' : 'optional'
                });

                if (proctoring.detectNoise) {
                    const AudioContextRef: any = window.AudioContext || (window as any).webkitAudioContext;
                    if (AudioContextRef) {
                        const audioContext = new AudioContextRef();
                        const analyser = audioContext.createAnalyser();
                        const source = audioContext.createMediaStreamSource(stream);
                        source.connect(analyser);
                        analyser.fftSize = 256;
                        audioContextRef.current = audioContext;
                        analyserRef.current = analyser;
                        const dataArray = new Uint8Array(analyser.frequencyBinCount);

                        noiseIntervalRef.current = setInterval(() => {
                            analyser.getByteFrequencyData(dataArray);
                            const avg = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
                            if (avg > 65) {
                                setSecuritySummary((prev: any) => ({ ...prev, noiseWarnings: prev.noiseWarnings + 1 }));
                                logSecurityEvent('noise_spike', 'medium', `Average noise level detected: ${Math.round(avg)}`);
                            }
                        }, 4000);
                    }
                }

                return true;
            }

            setPermissionState({ camera: 'optional', microphone: 'optional' });
            return true;
        } catch (error) {
            console.error('Device access failed', error);
            const cameraDenied = proctoring.requireCamera;
            const micDenied = proctoring.requireMicrophone || proctoring.detectNoise;
            setPermissionState({
                camera: cameraDenied ? 'denied' : 'optional',
                microphone: micDenied ? 'denied' : 'optional'
            });
            if (cameraDenied) {
                await logSecurityEvent('camera_denied', 'high', 'Camera access denied before exam start', activeAttemptId);
            }
            if (micDenied) {
                await logSecurityEvent('microphone_denied', 'high', 'Microphone access denied before exam start', activeAttemptId);
            }
            toast({
                title: 'Permission required',
                description: 'Camera or microphone permission was denied for this secure exam.',
                variant: 'destructive'
            });
            return !cameraDenied && !micDenied;
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (timerActive && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setTimerActive(false);
                        setQuizState(QuizState.Completed);
                        void finalizeQuizAttempt();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [timerActive, timeRemaining]);

    useEffect(() => {
        if (quizState !== QuizState.InProgress) return;

        const proctoring = getEffectiveProctoring(quizSettings);
        const onVisibilityChange = () => {
            if (document.hidden && proctoring.detectTabSwitch) {
                setSecuritySummary((prev: any) => ({ ...prev, tabWarnings: prev.tabWarnings + 1 }));
                void logSecurityEvent('tab_switch', 'high', 'Student moved away from the quiz tab');
            }
        };
        const onFullScreenChange = () => {
            if (proctoring.detectFullscreenExit && !document.fullscreenElement) {
                setSecuritySummary((prev: any) => ({ ...prev, fullscreenWarnings: prev.fullscreenWarnings + 1 }));
                void logSecurityEvent('fullscreen_exit', 'medium', 'Fullscreen mode exited during quiz');
            }
        };
        const onClipboard = (event: ClipboardEvent) => {
            if (!proctoring.detectCopyPaste) return;
            event.preventDefault();
            setSecuritySummary((prev: any) => ({ ...prev, clipboardWarnings: prev.clipboardWarnings + 1 }));
            void logSecurityEvent('clipboard_attempt', 'medium', 'Copy or paste attempted during quiz');
        };
        const onContextMenu = (event: MouseEvent) => {
            if (!proctoring.detectContextMenu) return;
            event.preventDefault();
            void logSecurityEvent('context_menu', 'medium', 'Context menu attempted during quiz');
        };

        document.addEventListener('visibilitychange', onVisibilityChange);
        document.addEventListener('fullscreenchange', onFullScreenChange);
        document.addEventListener('copy', onClipboard);
        document.addEventListener('cut', onClipboard);
        document.addEventListener('paste', onClipboard);
        document.addEventListener('contextmenu', onContextMenu);

        const onPageHide = () => {
            sendAbandonAttempt('pagehide');
        };
        const onBeforeUnload = () => {
            sendAbandonAttempt('beforeunload');
        };
        window.addEventListener('pagehide', onPageHide);
        window.addEventListener('beforeunload', onBeforeUnload);

        if (proctoring.detectFullscreenExit && !document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => undefined);
        }

        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            document.removeEventListener('fullscreenchange', onFullScreenChange);
            document.removeEventListener('copy', onClipboard);
            document.removeEventListener('cut', onClipboard);
            document.removeEventListener('paste', onClipboard);
            document.removeEventListener('contextmenu', onContextMenu);
            window.removeEventListener('pagehide', onPageHide);
            window.removeEventListener('beforeunload', onBeforeUnload);
        };
    }, [quizState, quizSettings, sendAbandonAttempt]);

    const beginQuizAttempt = async () => {
        submissionLockRef.current = false;
        abandonmentSentRef.current = false;
        resetSecurityState();
        if (manualQuizExam) {
            setIsLoading(true);
            try {
                const userId = sessionStorage.getItem('uid');
                const response = await axios.post(`${serverURL}/api/org-quiz/start`, { courseId, userId });
                if (!response.data?.success) {
                    throw new Error(response.data?.message || 'Failed to start quiz');
                }

                const nextAttemptId = response.data.attemptId;
                const nextQuizSettings = {
                    ...defaultManualQuizSettings,
                    ...(response.data.quizSettings || {}),
                    sections: {
                        ...defaultManualQuizSettings.sections,
                        ...(response.data.quizSettings?.sections || {})
                    },
                    proctoring: {
                        ...defaultManualQuizSettings.proctoring,
                        ...(response.data.quizSettings?.proctoring || {})
                    }
                };
                setAttemptId(nextAttemptId);
                const permissionsOkay = await requestDevices(nextAttemptId, nextQuizSettings);
                if (!permissionsOkay) {
                    setIsLoading(false);
                    return;
                }

                setAttemptSummary(response.data.summary);
                setQuizSettings(nextQuizSettings);
                setExamJSON(normalizeQuizQuestions(response.data.questions || []));
                setAnswers({});
                setSubmittedResult(null);
                setCurrentQuestionIndex(0);
                setQuizState(QuizState.InProgress);
                setTimerActive(true);
                setTimeRemaining(60 * (response.data.questions?.length || 0));
                toast({
                    title: 'Quiz started',
                    description: `Attempt ${response.data.attemptNumber} started with secure monitoring enabled.`
                });
            } catch (error: any) {
                console.error('Failed to start org quiz', error);
                const message = error?.response?.data?.message || error.message || 'Failed to start quiz';
                toast({
                    title: 'Quiz locked',
                    description: message,
                    variant: 'destructive'
                });
                await loadManualQuizStatus();
            } finally {
                setIsLoading(false);
            }
            return;
        }

        if (!legacyQuizStatus.canStart) {
            const requestStatus = legacyQuizStatus?.retakeRequest?.status;
            const message =
                requestStatus === 'pending'
                    ? 'Your retake request is pending admin approval.'
                    : 'Request a retake approval from admin before attempting the quiz again.';
            toast({
                title: 'Retake approval required',
                description: message,
                variant: 'destructive'
            });
            return;
        }

        setIsLoading(true);
        try {
            const userId = sessionStorage.getItem('uid');
            const response = await axios.post(`${serverURL}/api/quiz-retake/start`, { courseId, userId });
            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Failed to prepare quiz');
            }

            const nextQuestions = normalizeQuizQuestions(response.data.questions || questions);
            const permissionsOkay = await requestDevices(undefined, quizSettings);
            if (!permissionsOkay) {
                setIsLoading(false);
                return;
            }

            setExamJSON(nextQuestions);
            setAnswers({});
            setSubmittedResult(null);
            setCurrentQuestionIndex(0);
            setQuizState(QuizState.InProgress);
            setTimerActive(true);
            setTimeRemaining(60 * nextQuestions.length);
            setLegacyQuizStatus({
                ...defaultLegacyQuizStatus,
                ...(response.data.quizStatus || legacyQuizStatus),
                canStart: true
            });

            toast({
                title: response.data.regenerated ? 'Fresh retake quiz ready' : 'Quiz started',
                description: response.data.regenerated
                    ? 'A new quiz set was generated for this approved retake attempt.'
                    : `Good luck! You have ${nextQuestions.length} minutes to complete the quiz.`,
            });
        } catch (error: any) {
            console.error('Failed to start legacy quiz', error);
            const isMissingRetakeRoute =
                error?.response?.status === 404 &&
                String(error?.config?.url || '').includes('/api/quiz-retake/start');
            const message = isMissingRetakeRoute
                ? 'The backend needs a restart to load the new retake quiz route.'
                : error?.response?.data?.message || error?.message || 'Failed to prepare quiz';
            toast({
                title: 'Quiz unavailable',
                description: message,
                variant: 'destructive'
            });
            await loadLegacyQuizStatus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartQuiz = async () => {
        resetStartChecklist();
        setStartDialogOpen(true);
    };

    const handleConfirmStartQuiz = async () => {
        const fullscreenEnabled = await requestSecureFullscreen();
        setStartDialogOpen(false);
        if (!fullscreenEnabled && getEffectiveProctoring(quizSettings).detectFullscreenExit) {
            toast({
                title: 'Fullscreen required',
                description: 'Allow fullscreen mode to start this secure quiz.',
                variant: 'destructive'
            });
            return;
        }
        await beginQuizAttempt();
    };

    const handleSelectAnswer = (questionId: number, optionId: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setQuizState(QuizState.Completed);
            setTimerActive(false);
            toast({
                title: "Quiz completed",
                description: "Your answers have been submitted. Check your results below.",
            });
            void finalizeQuizAttempt();
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const getScore = () => {
        if (submittedResult?.score !== undefined) return submittedResult.score;
        let correctCount = 0;
        quizQuestions.forEach(question => {
            if (String(answers[question.id]) === String(question.correctAnswer)) {
                correctCount++;
            }
        });
        return correctCount;
    };

    const setQuizResult = () => {
        const scor = getScore();
        const percentage = Math.round((scor / (quizQuestions.length || 1)) * 100);
        setPassed(percentage >= legacyQuizStatus.certificateThreshold);
        void updateResult(scor);
    };

    const finalizeQuizAttempt = async () => {
        if (submissionLockRef.current) return;
        submissionLockRef.current = true;
        abandonmentSentRef.current = true;
        if (manualQuizExam) {
            try {
                const response = await axios.post(`${serverURL}/api/org-quiz/submit`, {
                    attemptId,
                    userId: sessionStorage.getItem('uid'),
                    answers,
                    clientSummary: securitySummary
                });
                if (response.data?.success) {
                    setSubmittedResult(response.data.result);
                    setAttemptSummary(response.data.summary);
                    setPassed(!!response.data.result?.passed);
                }
            } catch (error) {
                console.error('Failed to submit org quiz', error);
                toast({
                    title: 'Submit failed',
                    description: 'Failed to submit your quiz attempt.',
                    variant: 'destructive'
                });
            } finally {
                stopMonitoringDevices();
            }
            return;
        }

        stopMonitoringDevices();
        setQuizResult();
    };

    useEffect(() => {
        if (quizState !== QuizState.InProgress) return;
        if (!hasSevereMalpractice(securitySummary)) return;
        if (submissionLockRef.current) return;

        setTimerActive(false);
        setQuizState(QuizState.Completed);
        void logSecurityEvent('auto_submit_threshold', 'high', 'Exam auto-submitted after repeated malpractice indicators');
        toast({
            title: 'Quiz auto-submitted',
            description: 'Repeated malpractice indicators were detected during the exam.',
            variant: 'destructive'
        });
        void finalizeQuizAttempt();
    }, [quizState, securitySummary, toast]);

    async function updateResult(correct: number) {
        const marks = correct * 10;
        const marksString = "" + marks;
        const userId = sessionStorage.getItem('uid');
        try {
            const totalQuestions = quizQuestions.length;
            const percentage = Math.round((correct / (totalQuestions || 1)) * 100);
            const response = await axios.post(serverURL + '/api/updateresult', {
                courseId,
                marksString,
                userId,
                score: correct,
                totalQuestions,
                percentage,
                questions: quizQuestions,
                answers
            });
            if (response.data.success) {
                setPassed(!!response.data.passed);
                setLegacyQuizStatus({
                    ...defaultLegacyQuizStatus,
                    ...(response.data.quizStatus || {})
                });
                if (response.data.certificateId) {
                    setCertificateId(response.data.certificateId);
                }
                toast({
                    title: response.data.passed ? 'Certificate unlocked' : 'Retake approval required',
                    description: response.data.passed
                        ? `You crossed ${response.data.certificateThreshold || 70}% and your certificate is now available.`
                        : 'Request a retake from admin to attempt this quiz again.',
                    variant: response.data.passed ? 'default' : 'destructive'
                });
            }
        } catch (error) {
            console.error('Error updating result:', error);
        }
    }

    const handleRetakeRequest = async () => {
        if (retakeRequestSubmitting) return;
        setRetakeRequestSubmitting(true);
        try {
            const userId = sessionStorage.getItem('uid');
            const response = await axios.post(`${serverURL}/api/quiz-retake/request`, {
                courseId,
                userId,
                requestReason: retakeReason.trim()
            });
            if (response.data?.success) {
                setLegacyQuizStatus((prev: any) => ({
                    ...prev,
                    canStart: false,
                    canRequestRetake: false,
                    retakeApproved: false,
                    needsAdminApproval: true,
                    retakeRequest: response.data.retakeRequest || prev.retakeRequest
                }));
                toast({
                    title: 'Request submitted',
                    description: 'Your retake request has been sent to admin for approval.'
                });
                setRetakeReason('');
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Failed to submit retake request.';
            toast({
                title: 'Request failed',
                description: message,
                variant: 'destructive'
            });
        } finally {
            setRetakeRequestSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Calculate quiz progress
    const progress = quizState === QuizState.InProgress
        ? ((currentQuestionIndex + 1) / quizQuestions.length) * 100
        : 0;
    const effectiveAttemptSummary = attemptSummary || {};
    const cooldownActive = !!effectiveAttemptSummary?.nextAttemptAvailableAt && new Date(effectiveAttemptSummary.nextAttemptAvailableAt) > new Date();
    const canRetakeManualQuiz = manualQuizExam && !passedQuiz && !cooldownActive && !effectiveAttemptSummary?.maxAttemptsReached;
    const manualPercentage = submittedResult?.percentage ?? Math.round((getScore() / (quizQuestions.length || 1)) * 100);
    const legacyCertificateThreshold = legacyQuizStatus?.certificateThreshold || 70;
    const showLegacyRetakeButton = !manualQuizExam && !passedQuiz && legacyQuizStatus.canStart && legacyQuizStatus.attemptCount > 0;
    const showDetailedManualReview = manualQuizExam && submittedResult?.reviewMode === 'after_submit_with_answers';
    const showSummaryOnlyManualReview = manualQuizExam && submittedResult?.reviewMode === 'score_only';
    const showLegacyRetakeRequestButton =
        !manualQuizExam &&
        !passedQuiz &&
        legacyQuizStatus.attemptCount > 0 &&
        !legacyQuizStatus.canStart;
    const canSubmitRetakeRequest =
        retakeReason.trim().length >= 12 &&
        !retakeRequestSubmitting &&
        legacyQuizStatus?.retakeRequest?.status !== 'pending';
    const canConfirmStart = Object.values(startChecklist).every(Boolean);
    const effectiveQuizMode = manualQuizExam ? (quizSettings?.quizMode || 'secure') : 'secure';
    const effectiveProctoring = getEffectiveProctoring(quizSettings);
    const quizModeDescription =
        effectiveQuizMode === 'practice'
            ? 'Practice quiz mode with reduced restrictions and guided learning.'
            : effectiveQuizMode === 'assessment'
                ? 'Assessment mode with timed attempts, controlled review, and structured scoring.'
                : 'Secure quiz mode with camera, microphone, and malpractice checks.';

    const renderLegacyRetakeRequestComposer = () => (
        <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-background via-primary/5 to-indigo-500/5 p-5 text-left shadow-sm">
            <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                    <FileCheck2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold">Send Retake Request</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Explain why you need another attempt. Admin will review your request and unlock the next quiz attempt after approval.
                    </p>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                <Textarea
                    value={retakeReason}
                    onChange={(e) => setRetakeReason(e.target.value)}
                    placeholder="Example: I completed the course again, reviewed the weak topics, and I want one more attempt to improve my score above the certificate threshold."
                    className="min-h-[120px] resize-none rounded-2xl border-primary/15 bg-background/90"
                    disabled={legacyQuizStatus?.retakeRequest?.status === 'pending'}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                        Minimum 12 characters. Include the reason and how you prepared for the retake.
                    </p>
                    <Button
                        onClick={handleRetakeRequest}
                        disabled={!canSubmitRetakeRequest}
                        className="rounded-xl"
                    >
                        {legacyQuizStatus?.retakeRequest?.status === 'pending' ? 'Approval Pending' : 'Send Request'}
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderCameraPreviewBubble = (sizeClass = 'h-24 w-24') => {
        const showLiveVideo = permissionState.camera === 'granted';

        return (
            <div className="flex items-center gap-3">
                <div className={cn(
                    "relative overflow-hidden rounded-full border-4 border-primary/15 bg-slate-950 shadow-lg ring-4 ring-background/80",
                    sizeClass
                )}>
                    {showLiveVideo ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="h-full w-full object-cover scale-x-[-1]"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-primary">
                            <Camera className="h-7 w-7" />
                        </div>
                    )}
                    <div className="absolute bottom-2 right-2 h-3 w-3 rounded-full border border-white/70 bg-emerald-500 shadow-sm" />
                </div>
                <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Live Camera</p>
                    <p className="text-xs text-muted-foreground">
                        {showLiveVideo ? 'Monitoring active' : 'Camera preview ready'}
                    </p>
                </div>
            </div>
        );
    };

    const downloadCertificate = async () => {
        const node = document.getElementById('certificate-node');
        if (node) {
            try {
                // Add a small delay to ensure rendering
                await new Promise(resolve => setTimeout(resolve, 500));

                const dataUrl = await toPng(node, {
                    useCORS: true,
                    cacheBust: true,
                    skipAutoScale: true,
                    pixelRatio: 2,
                    backgroundColor: '#ffffff',
                    width: 800, // Force width
                    height: 600, // Force height
                    style: {
                        // Reset positioning for the capture
                        position: 'static',
                        left: 'auto',
                        top: 'auto',
                        visibility: 'visible',
                        transform: 'none'
                    },
                    filter: (node) => {
                        return (node.tagName !== 'LINK' && node.tagName !== 'STYLE' && node.tagName !== 'SCRIPT');
                    },
                    fontEmbedCSS: ''
                } as any);

                saveAs(dataUrl, `${topic}-certificate.png`);
                toast({
                    title: "Certificate Downloaded",
                    description: "Your certificate has been saved successfully.",
                });
            } catch (error) {
                console.error('Certificate Generation Error:', error);

                // Detailed error extraction
                let errorMessage = "Failed to generate certificate.";
                if (error instanceof Error) {
                    errorMessage += " " + error.message;
                } else if (typeof error === 'object' && error !== null) {
                    // Check for DOM Exception or Event object
                    if ('type' in error && error.type === 'error') {
                        errorMessage += " Network error loading images (CORS issue).";
                    } else {
                        errorMessage += " " + String(error);
                    }
                } else {
                    errorMessage += " " + String(error);
                }

                toast({
                    title: "Download Failed",
                    description: errorMessage,
                    variant: "destructive"
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border/40 py-4 px-6 bg-background/95 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button onClick={() => window.history.back()} variant="ghost" size="sm" asChild>
                            <span>
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                Back to Course
                            </span>
                        </Button>
                    </div>

                    {quizState === QuizState.InProgress && (
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatTime(timeRemaining)}</span>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    {isLoading ? (
                        <div className="space-y-6 animate-pulse">
                            <Skeleton className="h-8 w-3/4 mb-8 mx-auto" />
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-7 w-full mb-2" />
                                    <Skeleton className="h-5 w-3/4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
                                                <Skeleton className="h-6 w-full" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Skeleton className="h-10 w-full" />
                                </CardFooter>
                            </Card>
                        </div>
                    ) : (
                        <>
                            {quizState === QuizState.NotStarted && (
                                <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-background via-background to-primary/5 text-center shadow-xl">
                                    <CardHeader className="relative pb-4">
                                        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary/10 via-indigo-500/10 to-sky-500/10" />
                                        <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/15 bg-background/80 shadow-sm backdrop-blur">
                                            <Shield className="h-8 w-8 text-primary" />
                                        </div>
                                        <CardTitle className="relative text-2xl capitalize">{topic} Quiz</CardTitle>
                                        <CardDescription>
                                            {manualQuizExam
                                                ? quizModeDescription
                                                : `Secure quiz mode for ${topic} with camera, microphone, and malpractice checks.`}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="grid gap-3 text-left sm:grid-cols-2">
                                            <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Sparkles className="h-4 w-4 text-primary" />
                                                    Quiz Snapshot
                                                </div>
                                                <div className="mt-3 space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Medal className="h-5 w-5 text-muted-foreground" />
                                                <span>{quizQuestions.length || quizSettings.questionCount} questions to test your understanding</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-5 w-5 text-muted-foreground" />
                                                <span>{quizQuestions.length || quizSettings.questionCount} minutes to complete the quiz</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Trophy className="h-5 w-5 text-muted-foreground" />
                                                <span>Instant feedback on your answers</span>
                                            </div>
                                            {manualQuizExam && (
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                                    <span>Attempts: {effectiveAttemptSummary.attemptCount || 0}/{effectiveAttemptSummary.attemptLimit || quizSettings.attemptLimit}</span>
                                                </div>
                                            )}
                                                </div>
                                            </div>
                                            <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <LockKeyhole className="h-4 w-4 text-primary" />
                                                    Monitoring Status
                                                </div>
                                                <div className="mt-3 space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Camera className="h-5 w-5 text-muted-foreground" />
                                                <span>Camera: {effectiveProctoring.requireCamera ? permissionState.camera : 'not required'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mic className="h-5 w-5 text-muted-foreground" />
                                                <span>Microphone: {effectiveProctoring.requireMicrophone || effectiveProctoring.detectNoise ? permissionState.microphone : 'not required'}</span>
                                            </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left">
                                            <p className="text-sm font-semibold text-amber-700">
                                                {effectiveQuizMode === 'practice' ? 'Practice mode policy' : effectiveQuizMode === 'assessment' ? 'Assessment mode policy' : 'Secure exam policy'}
                                            </p>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {effectiveQuizMode === 'practice'
                                                    ? 'This mode is designed for learning. Secure monitoring is reduced, but timing and quiz structure still apply.'
                                                    : `Camera ${effectiveProctoring.requireCamera ? 'required' : 'optional'}, microphone ${effectiveProctoring.requireMicrophone || effectiveProctoring.detectNoise ? 'required' : 'optional'}, tab switching ${effectiveProctoring.detectTabSwitch ? 'tracked' : 'not tracked'}, fullscreen ${effectiveProctoring.detectFullscreenExit ? 'required' : 'optional'}, clipboard ${effectiveProctoring.detectCopyPaste ? 'blocked' : 'allowed'}, and context-menu ${effectiveProctoring.detectContextMenu ? 'blocked' : 'allowed'} during the quiz.`}
                                            </p>
                                            {manualQuizExam ? (
                                                <>
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        Mode {quizSettings.quizMode}, pass mark {quizSettings.passPercentage}%, max {quizSettings.attemptLimit} attempts, cooldown {quizSettings.cooldownMinutes} minutes after a failed attempt.
                                                    </p>
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        Review mode: {String(quizSettings.reviewMode || '').replace(/_/g, ' ')}.
                                                        {quizSettings.negativeMarkingEnabled
                                                            ? ` Negative marking: -${quizSettings.negativeMarkPerWrong} per wrong answer.`
                                                            : ' Negative marking is off.'}
                                                    </p>
                                                    {quizSettings.sectionPatternEnabled && (
                                                        <p className="mt-2 text-sm text-muted-foreground">
                                                            Section pattern: Easy {quizSettings.sections.easy}, Medium {quizSettings.sections.medium}, Difficult {quizSettings.sections.difficult}.
                                                        </p>
                                                    )}
                                                    {cooldownActive && (
                                                        <p className="mt-2 text-sm text-destructive">
                                                            Next attempt available at {new Date(effectiveAttemptSummary.nextAttemptAvailableAt).toLocaleString()}.
                                                        </p>
                                                    )}
                                                    {effectiveAttemptSummary.maxAttemptsReached && (
                                                        <p className="mt-2 text-sm text-destructive">
                                                            Maximum attempts reached for this quiz.
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    Certificate is issued only when you score {legacyCertificateThreshold}% or above. Any retake after a failed attempt needs admin approval.
                                                </p>
                                            )}
                                            <div className="mt-4 rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                                                {renderCameraPreviewBubble('h-28 w-28')}
                                            </div>
                                        </div>
                                        {!manualQuizExam && showLegacyRetakeRequestButton && renderLegacyRetakeRequestComposer()}
                                    </CardContent>
                                    <CardFooter className="flex justify-center gap-3 flex-wrap">
                                        <Button
                                            size="lg"
                                            onClick={handleStartQuiz}
                                            disabled={
                                                manualQuizExam
                                                    ? cooldownActive || effectiveAttemptSummary.maxAttemptsReached || passedQuiz
                                                    : passedQuiz || !legacyQuizStatus.canStart
                                            }
                                        >
                                            {manualQuizExam
                                                ? 'Start Quiz'
                                                : legacyQuizStatus.attemptCount > 0
                                                    ? 'Retake Quiz'
                                                    : 'Start Quiz'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}

                            {quizState === QuizState.InProgress && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm text-muted-foreground sm:min-w-[280px]">
                                                    <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                                                    <span>{formatTime(timeRemaining)} remaining</span>
                                                </div>
                                                <Progress value={progress} className="h-2" />
                                            </div>
                                            <div className="self-start rounded-2xl border border-primary/10 bg-background/80 px-3 py-2 shadow-sm">
                                                {renderCameraPreviewBubble('h-20 w-20')}
                                            </div>
                                        </div>
                                    </div>

                                    <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-background to-primary/5 shadow-xl">
                                        <CardHeader className="border-b border-border/50 bg-background/80 backdrop-blur">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                                                    Question {currentQuestionIndex + 1}
                                                </div>
                                                <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                                                    {manualPercentage}% target view
                                                </div>
                                            </div>
                                            <CardTitle className="pt-3 text-xl leading-8">{quizQuestions[currentQuestionIndex].question}</CardTitle>
                                            <CardDescription>
                                                Difficulty: {quizQuestions[currentQuestionIndex]?.difficulty || quizSettings.difficultyMode}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="font-medium">Security events:</span>
                                                    <span>Tab {securitySummary.tabWarnings}</span>
                                                    <span>Fullscreen {securitySummary.fullscreenWarnings}</span>
                                                    <span>Noise {securitySummary.noiseWarnings}</span>
                                                    <span>Clipboard {securitySummary.clipboardWarnings}</span>
                                                </div>
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Repeated violations can auto-submit the exam.
                                                </p>
                                            </div>
                                            <RadioGroup
                                                value={answers[quizQuestions[currentQuestionIndex].id] || ""}
                                                onValueChange={(value) => handleSelectAnswer(quizQuestions[currentQuestionIndex].id, value)}
                                                className="space-y-3"
                                            >
                                                {quizQuestions[currentQuestionIndex].options.map((option) => (
                                                    <div
                                                        key={option.id}
                                                        className={cn(
                                                            "rounded-2xl border p-4 transition-all",
                                                            answers[quizQuestions[currentQuestionIndex].id] === option.id
                                                                ? "border-primary bg-primary/5 shadow-sm"
                                                                : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
                                                        )}
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                        <RadioGroupItem value={option.id} id={`option-${option.id}`} className="mt-1" />
                                                        <Label
                                                            htmlFor={`option-${option.id}`}
                                                            className="cursor-pointer font-normal leading-6"
                                                        >
                                                            {option.text}
                                                        </Label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </CardContent>
                                        <CardFooter className="flex justify-between">
                                            <Button
                                                variant="outline"
                                                onClick={handlePrevQuestion}
                                                disabled={currentQuestionIndex === 0}
                                            >
                                                <ChevronLeft className="mr-1 h-4 w-4" />
                                                Previous
                                            </Button>
                                            <Button
                                                onClick={handleNextQuestion}
                                                disabled={!answers[quizQuestions[currentQuestionIndex].id]}
                                            >
                                                {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish' : 'Next'}
                                                {currentQuestionIndex < quizQuestions.length - 1 && (
                                                    <ChevronRight className="ml-1 h-4 w-4" />
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>
                            )}

                            {quizState === QuizState.Completed && (
                                <div className="space-y-6">
                                    <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-background via-background to-primary/5 text-center shadow-xl">
                                        <CardHeader className="pb-4">
                                            <div className={cn(
                                                "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border shadow-sm",
                                                passedQuiz
                                                    ? "border-green-500/20 bg-green-500/10 text-green-600"
                                                    : "border-destructive/20 bg-destructive/10 text-destructive"
                                            )}>
                                                {passedQuiz ? <Trophy className="h-8 w-8" /> : <CircleAlert className="h-8 w-8" />}
                                            </div>
                                            <CardTitle className="text-2xl">Quiz {passedQuiz ? "Passed" : "Failed"}</CardTitle>
                                            <CardDescription>
                                                {manualQuizExam && submittedResult
                                                    ? `Net score ${submittedResult.score} from ${submittedResult.correctCount || 0} correct answers out of ${quizQuestions.length}`
                                                    : `You scored ${getScore()} out of ${quizQuestions.length}`}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-center mb-6">
                                                <div className="relative w-32 h-32">
                                                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                                                        <circle
                                                            cx="50" cy="50" r="45"
                                                            fill="none"
                                                            className="stroke-muted-foreground/20"
                                                            strokeWidth="10"
                                                        />
                                                        <circle
                                                            cx="50" cy="50" r="45"
                                                            fill="none"
                                                            className={cn(
                                                                "stroke-primary transition-all duration-1000 ease-in-out",
                                                                getScore() / quizQuestions.length < 0.5 && "stroke-destructive",
                                                                getScore() / quizQuestions.length >= 0.8 && "stroke-green-500"
                                                            )}
                                                            strokeWidth="10"
                                                            strokeDasharray="282.7"
                                                            strokeDashoffset={282.7 - (282.7 * getScore() / quizQuestions.length)}
                                                            transform="rotate(-90 50 50)"
                                                        />
                                                        <text
                                                            x="50" y="50"
                                                            dominantBaseline="middle"
                                                            textAnchor="middle"
                                                            className="fill-foreground text-xl font-bold"
                                                        >
                                                            {manualPercentage}%
                                                        </text>
                                                    </svg>
                                                </div>
                                            </div>

                                            {manualQuizExam && (
                                                <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left">
                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                        <p className="text-sm"><span className="font-semibold">Attempt:</span> {submittedResult?.attemptNumber || effectiveAttemptSummary?.latestAttempt?.attemptNumber || 1}</p>
                                                        <p className="text-sm"><span className="font-semibold">Pass mark:</span> {quizSettings.passPercentage}%</p>
                                                        <p className="text-sm"><span className="font-semibold">Malpractice flag:</span> {submittedResult?.malpracticeFlag ? 'Yes' : 'No'}</p>
                                                        <p className="text-sm"><span className="font-semibold">Remaining attempts:</span> {effectiveAttemptSummary?.remainingAttempts ?? 0}</p>
                                                        <p className="text-sm"><span className="font-semibold">Correct:</span> {submittedResult?.correctCount ?? 0}</p>
                                                        <p className="text-sm"><span className="font-semibold">Wrong:</span> {submittedResult?.wrongCount ?? 0}</p>
                                                        <p className="text-sm"><span className="font-semibold">Unanswered:</span> {submittedResult?.unansweredCount ?? 0}</p>
                                                        <p className="text-sm"><span className="font-semibold">Review mode:</span> {String(submittedResult?.reviewMode || quizSettings.reviewMode || '').replace(/_/g, ' ')}</p>
                                                        <p className="text-sm"><span className="font-semibold">Positive marks:</span> {submittedResult?.positiveMarks ?? 0}</p>
                                                        <p className="text-sm"><span className="font-semibold">Negative marks:</span> {submittedResult?.negativeMarks ?? 0}</p>
                                                    </div>
                                                    {submittedResult?.sectionStats && (
                                                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                                            {Object.entries(submittedResult.sectionStats).map(([sectionName, stats]: any) => (
                                                                <div key={sectionName} className="rounded-lg border border-border/60 bg-background p-3 text-sm">
                                                                    <p className="font-semibold capitalize">{sectionName}</p>
                                                                    <p className="text-muted-foreground">Total {stats.total}</p>
                                                                    <p className="text-green-700">Correct {stats.correct}</p>
                                                                    <p className="text-destructive">Wrong {stats.wrong}</p>
                                                                    <p className="text-muted-foreground">Unanswered {stats.unanswered}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {cooldownActive && (
                                                        <p className="mt-2 text-sm text-destructive">
                                                            Retry available at {new Date(effectiveAttemptSummary.nextAttemptAvailableAt).toLocaleString()}.
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {!manualQuizExam && (
                                                <div className="mb-6 rounded-xl border border-primary/15 bg-primary/5 p-4 text-left">
                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                        <p className="text-sm"><span className="font-semibold">Attempts:</span> {legacyQuizStatus.attemptCount || 0}</p>
                                                        <p className="text-sm"><span className="font-semibold">Certificate mark:</span> {legacyCertificateThreshold}%</p>
                                                        <p className="text-sm"><span className="font-semibold">Latest request:</span> {legacyQuizStatus?.retakeRequest?.status || 'none'}</p>
                                                        <p className="text-sm"><span className="font-semibold">Certificate issued:</span> {certificateId ? 'Yes' : 'No'}</p>
                                                    </div>
                                                    {!passedQuiz && legacyQuizStatus?.retakeRequest?.status === 'pending' && (
                                                        <p className="mt-2 text-sm text-amber-700">
                                                            Your retake request is pending admin approval.
                                                        </p>
                                                    )}
                                                    {!passedQuiz && legacyQuizStatus?.retakeRequest?.status === 'rejected' && (
                                                        <p className="mt-2 text-sm text-destructive">
                                                            Retake request rejected. {legacyQuizStatus?.retakeRequest?.adminComment || 'Contact admin for the next request.'}
                                                        </p>
                                                    )}
                                                    {passedQuiz && (
                                                        <p className="mt-2 text-sm text-green-700">
                                                            You crossed the certificate threshold. Your certificate is now available.
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {!manualQuizExam && showLegacyRetakeRequestButton && renderLegacyRetakeRequestComposer()}

                                            {!showSummaryOnlyManualReview && (
                                                <ScrollArea className="h-[300px] pr-4">
                                                    <div className="space-y-6">
                                                        {quizQuestions.map((question, idx) => (
                                                            <div key={question.id} className="border border-border rounded-lg p-4">
                                                                <p className="font-medium mb-3">{idx + 1}. {question.question}</p>
                                                                <div className="space-y-2">
                                                                    {question.options.map((option) => (
                                                                        (() => {
                                                                            const reviewedAnswer = submittedResult?.answers?.find((item: any) => item.questionId === question.id);
                                                                            const correctOptionId = reviewedAnswer?.correctOptionId || question.correctAnswer;
                                                                            const selectedOptionId = reviewedAnswer?.selectedOptionId || answers[question.id];
                                                                            const showCorrectAnswer = !manualQuizExam || showDetailedManualReview;
                                                                            return (
                                                                                <div
                                                                                    key={option.id}
                                                                                    className={cn(
                                                                                        "p-2 rounded-md text-sm flex items-center",
                                                                                        showCorrectAnswer && option.id === correctOptionId && "bg-green-500/10 border border-green-500/30",
                                                                                        selectedOptionId === option.id && (!showCorrectAnswer || option.id !== correctOptionId) && "bg-primary/10 border border-primary/30"
                                                                                    )}
                                                                                >
                                                                                    <div className="mr-2">
                                                                                        {showCorrectAnswer && option.id === correctOptionId ? (
                                                                                            <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                                                                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                                                                </svg>
                                                                                            </div>
                                                                                        ) : selectedOptionId === option.id ? (
                                                                                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                                                                                                <span className="text-[10px] font-bold text-primary">You</span>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="h-5 w-5 rounded-full border border-muted-foreground/30"></div>
                                                                                        )}
                                                                                    </div>
                                                                                    <span>{option.text}</span>
                                                                                </div>
                                                                            );
                                                                        })()
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            )}
                                        </CardContent>
                                        <CardFooter className="flex justify-center gap-4 flex-wrap">
                                            <Button onClick={() => window.history.back()} variant="outline">
                                                Return to Course
                                            </Button>
                                            {manualQuizExam && (
                                                <Button onClick={handleStartQuiz} disabled={!canRetakeManualQuiz}>
                                                    Retake Quiz
                                                </Button>
                                            )}
                                            {showLegacyRetakeButton && (
                                                <Button onClick={handleStartQuiz}>
                                                    Retake Quiz
                                                </Button>
                                            )}
                                            {passedQuiz && certificateId && (
                                                <Button onClick={downloadCertificate} className="gap-2">
                                                    <Download className="h-4 w-4" />
                                                    Download Certificate
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>

                                    {/* Updated Certificate Design */}
                                    <div className="absolute left-[-9999px] top-[-9999px]">
                                        <div id="certificate-node" className="w-[800px] h-[600px] bg-white relative overflow-hidden flex flex-col items-center text-center font-serif text-black p-0 border border-gray-200">

                                            {/* Design Elements - Black Corners */}
                                            <div className="absolute top-0 left-0 w-0 h-0 border-t-[120px] border-r-[120px] border-t-black border-r-transparent"></div>
                                            <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[120px] border-l-[120px] border-b-black border-l-transparent"></div>

                                            {/* Top Logo Badge */}
                                            <div className="mt-10 mb-4 rounded-full border border-yellow-500 p-2 w-16 h-16 flex items-center justify-center">
                                                <span className="text-3xl text-red-600 font-bold">U</span>
                                            </div>

                                            <div className="z-10 w-full px-12 flex flex-col items-center">
                                                <p className="text-sm tracking-[0.2em] font-sans text-gray-500 mb-1 uppercase">Course Completion</p>
                                                <h1 className="text-5xl font-bold mb-4 tracking-wider uppercase" style={{ fontFamily: 'serif' }}>Certificate</h1>

                                                <p className="text-xs tracking-[0.1em] font-sans text-gray-500 mb-6 uppercase">This certificate is proudly presented to</p>


                                                <h2 className="text-5xl italic font-serif text-black mb-4 relative inline-block px-8 py-2">
                                                    {sessionStorage.getItem('mName') || 'Student Name'}
                                                </h2>

                                                <p className="text-xs text-gray-500 mb-4 max-w-lg mx-auto leading-relaxed">
                                                    for successful completion of all the required evaluation process for the course
                                                </p>

                                                <h3 className="text-2xl font-bold text-black mb-8 uppercase tracking-wide">{topic}</h3>

                                                {/* Middle Section: Instructor */}
                                                <div className="mb-6 flex flex-col items-center">
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Course Instructor</p>
                                                    <p className="font-bold text-lg">{certificateSettings.vpName}</p>
                                                </div>

                                                <div className="w-full flex justify-between items-end mt-4 px-4">
                                                    {/* CEO Signature */}
                                                    <div className="text-center w-1/3">
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Chief Executive Officer</p>
                                                        <div className="h-10 flex items-center justify-center mb-1">
                                                            {certificateSettings.ceoSignature ? (
                                                                <img src={certificateSettings.ceoSignature} alt="CEO Sig" className="h-full object-contain" />
                                                            ) : (
                                                                <span className="font-script text-xl text-gray-400">Signature</span>
                                                            )}
                                                        </div>
                                                        <div className="border-t border-gray-300 w-full mx-auto"></div>
                                                        <p className="font-bold text-sm mt-1">{certificateSettings.ceoName}</p>
                                                    </div>

                                                    {/* Date & ID */}
                                                    <div className="text-center w-1/3 flex flex-col items-center">
                                                        <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest mb-1">Certification Date</p>
                                                        <p className="font-bold text-md mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                                                        {/* Branding Logo */}
                                                        <div className="flex items-center justify-center gap-2 mb-1">
                                                            <img src={appLogo} alt="Logo" className="h-6" />
                                                            <span className="font-bold text-sm text-[#2c3e50]">{appName}</span>
                                                        </div>
                                                        <p className="text-[8px] text-gray-400 mt-1">Verify at: {websiteURL}/verify-certificate</p>
                                                        <p className="text-[9px] font-mono text-gray-600 mt-0">ID: {certificateId || 'PENDING'}</p>
                                                    </div>

                                                    {/* VP Signature */}
                                                    <div className="text-center w-1/3">
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Vice President</p>
                                                        <div className="h-10 flex items-center justify-center mb-1">
                                                            {certificateSettings.vpSignature ? (
                                                                <img src={certificateSettings.vpSignature} alt="VP Sig" className="h-full object-contain" />
                                                            ) : (
                                                                <span className="font-script text-xl text-gray-400">Signature</span>
                                                            )}
                                                        </div>
                                                        <div className="border-t border-gray-300 w-full mx-auto"></div>
                                                        <p className="font-bold text-sm mt-1">{certificateSettings.vpName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
                <DialogContent className="max-w-2xl rounded-3xl border-primary/15 p-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/10 via-indigo-500/10 to-sky-500/10 px-6 py-5">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-2xl">
                                <Shield className="h-6 w-6 text-primary" />
                                Quiz Instructions
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                Review the conditions carefully and approve them before starting the quiz.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="space-y-6 px-6 py-6">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-primary/10 bg-background p-4">
                                <p className="text-sm font-semibold">Attempt format</p>
                                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                    <li>{quizQuestions.length || quizSettings.questionCount} questions in one continuous attempt</li>
                                    <li>Each question must be answered before moving forward</li>
                                    <li>Certificate is issued only above the required threshold</li>
                                </ul>
                            </div>
                            <div className="rounded-2xl border border-primary/10 bg-background p-4">
                                <p className="text-sm font-semibold">Monitoring rules</p>
                                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                    <li>Camera and microphone permissions are required for secure mode</li>
                                    <li>Tab switch, fullscreen exit, copy/paste, and context menu are tracked</li>
                                    <li>Repeated violations can auto-submit the quiz</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="rulesAccepted"
                                    checked={startChecklist.rulesAccepted}
                                    onCheckedChange={(checked) => setStartChecklist((prev) => ({ ...prev, rulesAccepted: !!checked }))}
                                />
                                <Label htmlFor="rulesAccepted" className="cursor-pointer leading-6">
                                    I have read the quiz instructions and understand the attempt, scoring, and certificate rules.
                                </Label>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="monitoringAccepted"
                                    checked={startChecklist.monitoringAccepted}
                                    onCheckedChange={(checked) => setStartChecklist((prev) => ({ ...prev, monitoringAccepted: !!checked }))}
                                />
                                <Label htmlFor="monitoringAccepted" className="cursor-pointer leading-6">
                                    I approve secure monitoring, including camera, microphone, fullscreen, and malpractice checks during the quiz.
                                </Label>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="honestyAccepted"
                                    checked={startChecklist.honestyAccepted}
                                    onCheckedChange={(checked) => setStartChecklist((prev) => ({ ...prev, honestyAccepted: !!checked }))}
                                />
                                <Label htmlFor="honestyAccepted" className="cursor-pointer leading-6">
                                    I confirm this attempt will be taken honestly without external help, copying, or switching away from the quiz.
                                </Label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-border/50 bg-background px-6 py-4">
                        <Button variant="outline" onClick={() => setStartDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmStartQuiz} disabled={!canConfirmStart}>
                            Approve And Start Quiz
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default QuizPage;
