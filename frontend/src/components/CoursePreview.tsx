
// // // import React, { useState } from 'react';
// // // import { Card, CardContent } from '@/components/ui/card';
// // // import { ScrollArea } from '@/components/ui/scroll-area';
// // // import { Skeleton } from '@/components/ui/skeleton';
// // // import { Button } from '@/components/ui/button';
// // // import { CheckCircle, Loader } from 'lucide-react';
// // // import { useNavigate } from 'react-router-dom';
// // // import { serverURL } from '@/constants';
// // // import axios from 'axios';
// // // import { useToast } from '@/hooks/use-toast';


// // // interface CoursePreviewProps {
// // //     isLoading: boolean;
// // //     courseName: string;
// // //     topics: unknown,
// // //     type: string,
// // //     lang: string,
// // //     onClose?: () => void;
// // // }

// // // const CoursePreview: React.FC<CoursePreviewProps> = ({
// // //     isLoading,
// // //     courseName,
// // //     topics,
// // //     type,
// // //     lang,
// // //     onClose,
// // // }) => {
// // //     const navigate = useNavigate();
// // //     const [isLoadingCourse, setIsLoadingCourse] = useState(false);
// // //     const { toast } = useToast();

// // //     function handleCreateCourse() {
// // //         const topicsData = topics['course_topics'] || topics[courseName.toLowerCase()];

// // //         if (!topicsData || !topicsData[0]) {
// // //             toast({
// // //                 title: "Error",
// // //                 description: "Course data is not available. Please try generating again.",
// // //             });
// // //             return;
// // //         }

// // //         const mainTopicData = topicsData[0];

// // //         if (!mainTopicData.subtopics || mainTopicData.subtopics.length === 0) {
// // //             toast({
// // //                 title: "Error",
// // //                 description: "No subtopics found. Please try generating again.",
// // //             });
// // //             return;
// // //         }

// // //         const firstSubtopic = mainTopicData.subtopics[0];

// // //         if (type === 'Video & Text Course') {

// // //             const query = `${firstSubtopic.title} ${courseName} in english`;
// // //             sendVideo(query, firstSubtopic.title);
// // //             setIsLoadingCourse(true);

// // //         } else {

// // //             const prompt = `Strictly in ${lang}, Explain me about this subtopic of ${courseName} with examples :- ${firstSubtopic.title}. Please Strictly Don't Give Additional Resources And Images.`;
// // //             const promptImage = `Example of ${firstSubtopic.title} in ${courseName}`;
// // //             setIsLoadingCourse(true);
// // //             sendPrompt(prompt, promptImage);

// // //         }

// // //     }

// // //     async function sendPrompt(prompt, promptImage) {
// // //         const dataToSend = {
// // //             prompt: prompt,
// // //         };
// // //         try {
// // //             const postURL = serverURL + '/api/generate';
// // //             const res = await axios.post(postURL, dataToSend);
// // //             const generatedText = res.data.text;
// // //             const htmlContent = generatedText;

// // //             try {
// // //                 const parsedJson = htmlContent;
// // //                 sendImage(parsedJson, promptImage);
// // //             } catch (error) {
// // //                 setIsLoadingCourse(false);
// // //                 console.error(error);
// // //                 toast({
// // //                     title: "Error",
// // //                     description: error.response?.data?.message || error.message || "Internal Server Error",
// // //                 });
// // //             }

// // //         } catch (error) {
// // //             setIsLoadingCourse(false);
// // //             console.error(error);
// // //             toast({
// // //                 title: "Error",
// // //                 description: error.response?.data?.message || error.message || "Internal Server Error",
// // //             });
// // //         }
// // //     }

// // //     async function sendImage(parsedJson, promptImage) {
// // //         const dataToSend = {
// // //             prompt: promptImage,
// // //         };
// // //         try {
// // //             const postURL = serverURL + '/api/image';
// // //             const res = await axios.post(postURL, dataToSend);
// // //             try {
// // //                 const generatedText = res.data.url;
// // //                 sendData(generatedText, parsedJson);
// // //                 setIsLoadingCourse(false);
// // //             } catch (error) {
// // //                 setIsLoadingCourse(false);
// // //                 console.error(error);
// // //                 toast({
// // //                     title: "Error",
// // //                     description: error.response?.data?.message || error.message || "Internal Server Error",
// // //                 });
// // //             }

// // //         } catch (error) {
// // //             setIsLoadingCourse(false);
// // //             console.error(error);
// // //             toast({
// // //                 title: "Error",
// // //                 description: error.response?.data?.message || error.message || "Internal Server Error",
// // //             });
// // //         }
// // //     }

// // //     async function sendData(image, theory) {
// // //         if (topics['course_topics']) {
// // //             topics['course_topics'][0].subtopics[0].theory = theory;
// // //             topics['course_topics'][0].subtopics[0].image = image;
// // //         } else {
// // //             topics[courseName.toLowerCase()][0].subtopics[0].theory = theory;
// // //             topics[courseName.toLowerCase()][0].subtopics[0].image = image;
// // //         }

// // //         const user = sessionStorage.getItem('uid');
// // //         const content = JSON.stringify(topics);
// // //         const postURL = serverURL + '/api/course';
// // //         const response = await axios.post(postURL, { user, content, type, mainTopic: courseName, lang });

// // //         if (response.data.success) {
// // //             sessionStorage.setItem('courseId', response.data.courseId);
// // //             sessionStorage.setItem('first', response.data.completed);
// // //             sessionStorage.setItem('jsonData', JSON.stringify(topics));
// // //             navigate('/course/' + response.data.courseId, {
// // //                 state: {
// // //                     jsonData: topics,
// // //                     mainTopic: courseName.toUpperCase(),
// // //                     type: type.toLowerCase(),
// // //                     courseId: response.data.courseId,
// // //                     end: '',
// // //                     pass: false,
// // //                     lang: lang
// // //                 }
// // //             });
// // //         } else {
// // //             setIsLoadingCourse(false);
// // //             toast({
// // //                 title: "Error",
// // //                 description: response.data.message || "Internal Server Error",
// // //             });
// // //         }

// // //     }

// // //     async function sendDataVideo(image, theory) {
// // //         if (topics['course_topics']) {
// // //             topics['course_topics'][0].subtopics[0].theory = theory;
// // //             topics['course_topics'][0].subtopics[0].youtube = image;
// // //         } else {
// // //             topics[courseName.toLowerCase()][0].subtopics[0].theory = theory;
// // //             topics[courseName.toLowerCase()][0].subtopics[0].youtube = image;
// // //         }

// // //         const user = sessionStorage.getItem('uid');
// // //         const content = JSON.stringify(topics);
// // //         const postURL = serverURL + '/api/course';
// // //         const response = await axios.post(postURL, { user, content, type, mainTopic: courseName, lang });

// // //         if (response.data.success) {
// // //             sessionStorage.setItem('courseId', response.data.courseId);
// // //             sessionStorage.setItem('first', response.data.completed);
// // //             sessionStorage.setItem('jsonData', JSON.stringify(topics));
// // //             navigate('/course/' + response.data.courseId, {
// // //                 state: {
// // //                     jsonData: topics,
// // //                     mainTopic: courseName.toUpperCase(),
// // //                     type: type.toLowerCase(),
// // //                     courseId: response.data.courseId,
// // //                     end: '',
// // //                     pass: false,
// // //                     lang: lang
// // //                 }
// // //             });
// // //         } else {
// // //             setIsLoadingCourse(false);
// // //             toast({
// // //                 title: "Error",
// // //                 description: response.data.message || "Internal Server Error",
// // //             });
// // //         }

// // //     }

// // //     async function sendVideo(query, subtopic) {
// // //         const dataToSend = {
// // //             prompt: query,
// // //         };
// // //         try {
// // //             const postURL = serverURL + '/api/yt';
// // //             const res = await axios.post(postURL, dataToSend);
// // //             try {
// // //                 const generatedText = res.data.url;
// // //                 sendTranscript(generatedText, subtopic);
// // //             } catch (error) {
// // //                 setIsLoadingCourse(false);
// // //                 console.error(error);
// // //                 toast({
// // //                     title: "Error",
// // //                     description: error.response?.data?.message || error.message || "Internal Server Error",
// // //                 });
// // //             }

// // //         } catch (error) {
// // //             setIsLoadingCourse(false);
// // //             console.error(error);
// // //             toast({
// // //                 title: "Error",
// // //                 description: error.response?.data?.message || error.message || "Internal Server Error",
// // //             });
// // //         }
// // //     }

// // //     async function sendTranscript(url, subtopic) {
// // //         const dataToSend = {
// // //             prompt: url,
// // //         };
// // //         try {
// // //             const postURL = serverURL + '/api/transcript';
// // //             const res = await axios.post(postURL, dataToSend);

// // //             try {
// // //                 const generatedText = res.data.url;
// // //                 const allText = generatedText.map(item => item.text);
// // //                 const concatenatedText = allText.join(' ');
// // //                 const prompt = `Strictly in ${lang}, Summarize this theory in a teaching way and :- ${concatenatedText}.`;
// // //                 sendSummery(prompt, url);
// // //             } catch (error) {
// // //                 const prompt = `Strictly in ${lang}, Explain me about this subtopic of ${courseName} with examples :- ${subtopic}. Please Strictly Don't Give Additional Resources And Images.`;
// // //                 sendSummery(prompt, url);
// // //             }

// // //         } catch (error) {
// // //             const prompt = `Strictly in ${lang}, Explain me about this subtopic of ${courseName} with examples :- ${subtopic}. Please Strictly Don't Give Additional Resources And Images.`;
// // //             sendSummery(prompt, url);
// // //         }
// // //     }

// // //     async function sendSummery(prompt, url) {
// // //         const dataToSend = {
// // //             prompt: prompt,
// // //         };
// // //         try {
// // //             const postURL = serverURL + '/api/generate';
// // //             const res = await axios.post(postURL, dataToSend);
// // //             const generatedText = res.data.text;
// // //             const htmlContent = generatedText;

// // //             try {
// // //                 const parsedJson = htmlContent;
// // //                 setIsLoadingCourse(false);
// // //                 sendDataVideo(url, parsedJson);
// // //             } catch (error) {
// // //                 setIsLoadingCourse(false);
// // //                 console.error(error);
// // //                 toast({
// // //                     title: "Error",
// // //                     description: error.response?.data?.message || error.message || "Internal Server Error",
// // //                 });
// // //             }

// // //         } catch (error) {
// // //             setIsLoadingCourse(false);
// // //             console.error(error);
// // //             toast({
// // //                 title: "Error",
// // //                 description: error.response?.data?.message || error.message || "Internal Server Error",
// // //             });
// // //         }
// // //     }

// // //     if (isLoading) {
// // //         return (
// // //             <div className="space-y-6 py-8 animate-fade-in">
// // //                 <div className="text-center mb-8">
// // //                     <h1 className="text-3xl font-bold tracking-tight mb-4">
// // //                         <Skeleton className="h-10 w-3/4 mx-auto" />
// // //                     </h1>
// // //                     <div className="text-muted-foreground max-w-lg mx-auto">
// // //                         <Skeleton className="h-4 w-full mx-auto" />
// // //                     </div>
// // //                 </div>

// // //                 <div className="space-y-6 max-w-3xl mx-auto">
// // //                     {[1, 2, 3, 4].map((section) => (
// // //                         <div key={section} className="space-y-2">
// // //                             <Skeleton className="h-10 w-full bg-muted-foreground/10" />
// // //                             {[1, 2, 3].map((item) => (
// // //                                 <Skeleton key={item} className="h-12 w-full" />
// // //                             ))}
// // //                         </div>
// // //                     ))}
// // //                 </div>

// // //                 <div className="flex justify-center mt-8">
// // //                     <div className="flex items-center space-x-2">
// // //                         <Loader className="animate-spin h-5 w-5 text-primary" />
// // //                         <span>Generating your course structure...</span>
// // //                     </div>
// // //                 </div>
// // //             </div>
// // //         );
// // //     }

// // //     const renderTopicsAndSubtopics = (topicss) => {
// // //         if (!topicss || !Array.isArray(topicss)) {
// // //             return null;
// // //         }
// // //         return (
// // //             <>
// // //                 {topicss.map((topic, index) => (
// // //                     <div key={index} className="space-y-2">
// // //                         <Card className="bg-black text-white">
// // //                             <CardContent className="p-4 font-bold">
// // //                                 {topic.title}
// // //                             </CardContent>
// // //                         </Card>
// // //                         {topic.subtopics && topic.subtopics.map((subtopic, idx) => (
// // //                             <Card key={idx} className="border">
// // //                                 <CardContent className="p-4">
// // //                                     {subtopic.title}
// // //                                 </CardContent>
// // //                             </Card>
// // //                         ))}
// // //                     </div>
// // //                 ))}
// // //             </>
// // //         );
// // //     };
// // // // bala

// // //     return (
// // //         <div className="space-y-6 py-8 animate-fade-in">
// // //             <div className="text-center mb-8">
// // //                 <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-indigo-500 mb-4">
// // //                     {courseName.toUpperCase()}
// // //                 </h1>
// // //                 <p className="text-muted-foreground max-w-lg mx-auto">
// // //                     List of topics and subtopics course will cover
// // //                 </p>
// // //             </div>

// // //             <ScrollArea className="px-4">
// // //                 <div className="space-y-6 max-w-3xl mx-auto pb-6">
// // //                     {topics && (topics['course_topics'] || topics[courseName.toLowerCase()]) && renderTopicsAndSubtopics(topics['course_topics'] || topics[courseName.toLowerCase()])}
// // //                 </div>
// // //             </ScrollArea>

// // //             <div className="flex justify-center gap-4 mt-8">
// // //                 <Button
// // //                     disabled={isLoadingCourse}
// // //                     variant="outline"
// // //                     onClick={onClose}
// // //                     className="w-40"
// // //                 >
// // //                     Cancel
// // //                 </Button>
// // //                 <Button
// // //                     disabled={isLoadingCourse}
// // //                     onClick={handleCreateCourse}
// // //                     className="w-40 bg-black text-white hover:bg-gray-800"
// // //                 >
// // //                     {isLoadingCourse ?
// // //                         <Loader className="animate-spin mr-2 h-4 w-4" />
// // //                         :
// // //                         <CheckCircle className="mr-2 h-4 w-4" />
// // //                     }
// // //                     {isLoadingCourse ? 'Generating...' : 'Generate Course'}
// // //                 </Button>
// // //             </div>
// // //         </div>
// // //     );
// // // };

// // // export default CoursePreview;

// // import React, { useState } from 'react';
// // import { Card, CardContent } from '@/components/ui/card';
// // import { ScrollArea } from '@/components/ui/scroll-area';
// // import { Skeleton } from '@/components/ui/skeleton';
// // import { Button } from '@/components/ui/button';
// // import { CheckCircle, Loader } from 'lucide-react';
// // import { useNavigate } from 'react-router-dom';
// // import { serverURL } from '@/constants';
// // import axios from 'axios';
// // import { useToast } from '@/hooks/use-toast';

// // interface CoursePreviewProps {
// //     isLoading: boolean;
// //     courseName: string;
// //     topics: any;
// //     type: string;
// //     lang: string;
// //     onClose?: () => void;
// // }

// // const CoursePreview: React.FC<CoursePreviewProps> = ({
// //     isLoading,
// //     courseName,
// //     topics,
// //     type,
// //     lang,
// //     onClose,
// // }) => {
// //     const navigate = useNavigate();
// //     const [isLoadingCourse, setIsLoadingCourse] = useState(false);
// //     const { toast } = useToast();

// //     /** -------------------- HELPERS -------------------- */

// //     const getCourseTopics = () =>
// //         topics['course_topics'] || topics[courseName.toLowerCase()];

// //     const normalizeFirstSubtopic = () => {
// //         const courseTopics = getCourseTopics();
// //         if (!courseTopics?.[0]?.subtopics?.[0]) return null;

// //         let subtopic = courseTopics[0].subtopics[0];

// //         if (typeof subtopic === 'string') {
// //             subtopic = {
// //                 title: subtopic,
// //                 theory: '',
// //             };
// //             courseTopics[0].subtopics[0] = subtopic;
// //         }

// //         return subtopic;
// //     };

// //     /** -------------------- CREATE COURSE -------------------- */

// //     function handleCreateCourse() {
// //         const courseTopics = getCourseTopics();

// //         if (!courseTopics?.length) {
// //             toast({
// //                 title: 'Error',
// //                 description: 'Course data is not available.',
// //             });
// //             return;
// //         }

// //         const firstSubtopic = normalizeFirstSubtopic();

// //         if (!firstSubtopic) {
// //             toast({
// //                 title: 'Error',
// //                 description: 'No subtopics found.',
// //             });
// //             return;
// //         }

// //         setIsLoadingCourse(true);

// //         if (type === 'Video & Text Course') {
// //             const query = `${firstSubtopic.title} ${courseName} in english`;
// //             sendVideo(query, firstSubtopic.title);
// //         } else {
// //             const prompt = `Strictly in ${lang}, Explain me about this subtopic of ${courseName} with examples :- ${firstSubtopic.title}. Please Strictly Don't Give Additional Resources And Images.`;
// //             const promptImage = `Example of ${firstSubtopic.title} in ${courseName}`;
// //             sendPrompt(prompt, promptImage);
// //         }
// //     }

// //     /** -------------------- TEXT COURSE FLOW -------------------- */

// //     async function sendPrompt(prompt: string, promptImage: string) {
// //         try {
// //             const res = await axios.post(serverURL + '/api/generate', { prompt });
// //             await sendImage(res.data.text, promptImage);
// //         } catch (error: any) {
// //             handleError(error);
// //         }
// //     }

// //     async function sendImage(theory: string, promptImage: string) {
// //         try {
// //             const res = await axios.post(serverURL + '/api/image', {
// //                 prompt: promptImage,
// //             });

// //             await sendData(res.data.url, theory);
// //         } catch (error: any) {
// //             handleError(error);
// //         }
// //     }

// //     async function sendData(image: string, theory: string) {
// //         const subtopic = normalizeFirstSubtopic();
// //         if (!subtopic) return;

// //         subtopic.theory = theory;
// //         subtopic.image = image;

// //         await saveCourse();
// //     }

// //     /** -------------------- VIDEO COURSE FLOW -------------------- */

// //     async function sendVideo(query: string, subtopicTitle: string) {
// //         try {
// //             const res = await axios.post(serverURL + '/api/yt', { prompt: query });
// //             sendTranscript(res.data.url, subtopicTitle);
// //         } catch (error: any) {
// //             handleError(error);
// //         }
// //     }

// //     async function sendTranscript(url: string, subtopic: string) {
// //         try {
// //             const res = await axios.post(serverURL + '/api/transcript', {
// //                 prompt: url,
// //             });

// //             const allText = res.data.url.map((i: any) => i.text).join(' ');
// //             const prompt = `Strictly in ${lang}, Summarize this theory in a teaching way :- ${allText}`;
// //             sendSummary(prompt, url);
// //         } catch {
// //             const prompt = `Strictly in ${lang}, Explain me about this subtopic of ${courseName} with examples :- ${subtopic}. Please Strictly Don't Give Additional Resources And Images.`;
// //             sendSummary(prompt, url);
// //         }
// //     }

// //     async function sendSummary(prompt: string, url: string) {
// //         try {
// //             const res = await axios.post(serverURL + '/api/generate', { prompt });
// //             await sendDataVideo(url, res.data.text);
// //         } catch (error: any) {
// //             handleError(error);
// //         }
// //     }

// //     async function sendDataVideo(youtube: string, theory: string) {
// //         const subtopic = normalizeFirstSubtopic();
// //         if (!subtopic) return;

// //         subtopic.theory = theory;
// //         subtopic.youtube = youtube;

// //         await saveCourse();
// //     }

// //     /** -------------------- SAVE COURSE -------------------- */

// //     async function saveCourse() {
// //         try {
// //             const response = await axios.post(serverURL + '/api/course', {
// //                 user: sessionStorage.getItem('uid'),
// //                 content: JSON.stringify(topics),
// //                 type,
// //                 mainTopic: courseName,
// //                 lang,
// //             });

// //             if (!response.data.success) throw new Error(response.data.message);

// //             sessionStorage.setItem('courseId', response.data.courseId);
// //             sessionStorage.setItem('jsonData', JSON.stringify(topics));

// //             navigate('/course/' + response.data.courseId, {
// //                 state: {
// //                     jsonData: topics,
// //                     mainTopic: courseName.toUpperCase(),
// //                     type: type.toLowerCase(),
// //                     courseId: response.data.courseId,
// //                     lang,
// //                 },
// //             });
// //         } catch (error: any) {
// //             handleError(error);
// //         } finally {
// //             setIsLoadingCourse(false);
// //         }
// //     }

// //     /** -------------------- ERROR HANDLER -------------------- */

// //     function handleError(error: any) {
// //         console.error(error);
// //         setIsLoadingCourse(false);
// //         toast({
// //             title: 'Error',
// //             description:
// //                 error?.response?.data?.message ||
// //                 error?.message ||
// //                 'Internal Server Error',
// //         });
// //     }

// //     /** -------------------- UI -------------------- */

// //     const renderTopicsAndSubtopics = (topicss: any[]) =>
// //         topicss.map((topic, index) => (
// //             <div key={index} className="space-y-2">
// //                 <Card className="bg-black text-white">
// //                     <CardContent className="p-4 font-bold">
// //                         {topic.title}
// //                     </CardContent>
// //                 </Card>
// //                 {topic.subtopics?.map((sub: any, i: number) => (
// //                     <Card key={i}>
// //                         <CardContent className="p-4">
// //                             {typeof sub === 'string' ? sub : sub.title}
// //                         </CardContent>
// //                     </Card>
// //                 ))}
// //             </div>
// //         ));

// //     if (isLoading) {
// //         return <Skeleton className="h-64 w-full" />;
// //     }

// //     return (
// //         <div className="space-y-6 py-8">
// //             <h1 className="text-3xl font-bold text-center">
// //                 {courseName.toUpperCase()}
// //             </h1>

// //             <ScrollArea>
// //                 <div className="max-w-3xl mx-auto space-y-6">
// //                     {renderTopicsAndSubtopics(getCourseTopics())}
// //                 </div>
// //             </ScrollArea>

// //             <div className="flex justify-center gap-4">
// //                 <Button variant="outline" onClick={onClose}>
// //                     Cancel
// //                 </Button>
// //                 <Button onClick={handleCreateCourse} disabled={isLoadingCourse}>
// //                     {isLoadingCourse ? (
// //                         <Loader className="animate-spin mr-2 h-4 w-4" />
// //                     ) : (
// //                         <CheckCircle className="mr-2 h-4 w-4" />
// //                     )}
// //                     Generate Course
// //                 </Button>
// //             </div>
// //         </div>
// //     );
// // };

// // export default CoursePreview;

// import React, { useState } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Button } from '@/components/ui/button';
// import { CheckCircle, Loader } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { serverURL } from '@/constants';
// import axios from 'axios';
// import { useToast } from '@/hooks/use-toast';

// interface CoursePreviewProps {
//     isLoading: boolean;
//     courseName: string;
//     topics: any;
//     type: string;
//     lang: string;
//     onClose?: () => void;
// }

// const CoursePreview: React.FC<CoursePreviewProps> = ({
//     isLoading,
//     courseName,
//     topics,
//     type,
//     lang,
//     onClose,
// }) => {
//     const navigate = useNavigate();
//     const [isLoadingCourse, setIsLoadingCourse] = useState(false);
//     const { toast } = useToast();

//     /* -------------------- HELPERS -------------------- */

//     const getCourseTopics = () =>
//         topics['course_topics'] || topics[courseName.toLowerCase()];

//     /**
//      * ✅ IMPORTANT FIX
//      * Normalize ALL subtopics so sidebar + course page works
//      */
//     const normalizeAllSubtopics = () => {
//         const courseTopics = getCourseTopics();
//         if (!Array.isArray(courseTopics)) return null;

//         courseTopics.forEach((topic: any) => {
//             if (!Array.isArray(topic.subtopics)) return;

//             topic.subtopics = topic.subtopics.map((sub: any) => {
//                 if (typeof sub === 'string') {
//                     return {
//                         title: sub,
//                         theory: '',
//                         image: '',
//                         youtube: '',
//                     };
//                 }
//                 return sub;
//             });
//         });

//         return courseTopics;
//     };

//     /* -------------------- CREATE COURSE -------------------- */

//     function handleCreateCourse() {
//         const courseTopics = normalizeAllSubtopics();

//         if (!courseTopics?.length) {
//             toast({
//                 title: 'Error',
//                 description: 'Course data is not available.',
//             });
//             return;
//         }

//         const firstSubtopic = courseTopics[0]?.subtopics?.[0];

//         if (!firstSubtopic) {
//             toast({
//                 title: 'Error',
//                 description: 'No subtopics found.',
//             });
//             return;
//         }

//         setIsLoadingCourse(true);

//         if (type === 'Video & Text Course') {
//             const query = `${firstSubtopic.title} ${courseName} in english`;
//             sendVideo(query, firstSubtopic.title);
//         } else {
//             const prompt = `Strictly in ${lang}, Explain me about this subtopic of ${courseName} with examples :- ${firstSubtopic.title}. Please Strictly Don't Give Additional Resources And Images.`;
//             const promptImage = `Example of ${firstSubtopic.title} in ${courseName}`;
//             sendPrompt(prompt, promptImage);
//         }
//     }

//     /* -------------------- TEXT COURSE FLOW -------------------- */

//     async function sendPrompt(prompt: string, promptImage: string) {
//         try {
//             const res = await axios.post(serverURL + '/api/generate', { prompt });
//             await sendImage(res.data.text, promptImage);
//         } catch (error: any) {
//             handleError(error);
//         }
//     }

//     async function sendImage(theory: string, promptImage: string) {
//         try {
//             const res = await axios.post(serverURL + '/api/image', {
//                 prompt: promptImage,
//             });

//             await sendData(res.data.url, theory);
//         } catch (error: any) {
//             handleError(error);
//         }
//     }

//     async function sendData(image: string, theory: string) {
//         normalizeAllSubtopics();

//         const courseTopics = getCourseTopics();
//         const subtopic = courseTopics[0].subtopics[0];

//         subtopic.theory = theory;
//         subtopic.image = image;

//         await saveCourse();
//     }

//     /* -------------------- VIDEO COURSE FLOW -------------------- */

//     async function sendVideo(query: string, subtopicTitle: string) {
//         try {
//             const res = await axios.post(serverURL + '/api/yt', { prompt: query });
//             sendTranscript(res.data.url, subtopicTitle);
//         } catch (error: any) {
//             handleError(error);
//         }
//     }

//     async function sendTranscript(url: string, subtopic: string) {
//         try {
//             const res = await axios.post(serverURL + '/api/transcript', {
//                 prompt: url,
//             });

//             const allText = res.data.url.map((i: any) => i.text).join(' ');
//             const prompt = `Strictly in ${lang}, Summarize this theory in a teaching way :- ${allText}`;
//             sendSummary(prompt, url);
//         } catch {
//             const prompt = `Strictly in ${lang}, Explain me about this subtopic of ${courseName} with examples :- ${subtopic}. Please Strictly Don't Give Additional Resources And Images.`;
//             sendSummary(prompt, url);
//         }
//     }

//     async function sendSummary(prompt: string, url: string) {
//         try {
//             const res = await axios.post(serverURL + '/api/generate', { prompt });
//             await sendDataVideo(url, res.data.text);
//         } catch (error: any) {
//             handleError(error);
//         }
//     }

//     async function sendDataVideo(youtube: string, theory: string) {
//         normalizeAllSubtopics();

//         const courseTopics = getCourseTopics();
//         const subtopic = courseTopics[0].subtopics[0];

//         subtopic.theory = theory;
//         subtopic.youtube = youtube;

//         await saveCourse();
//     }

//     /* -------------------- SAVE COURSE -------------------- */

//     async function saveCourse() {
//         try {
//             const response = await axios.post(serverURL + '/api/course', {
//                 user: sessionStorage.getItem('uid'),
//                 content: JSON.stringify(topics),
//                 type,
//                 mainTopic: courseName,
//                 lang,
//             });

//             if (!response.data.success) {
//                 throw new Error(response.data.message);
//             }

//             sessionStorage.setItem('courseId', response.data.courseId);
//             sessionStorage.setItem('jsonData', JSON.stringify(topics));

//             navigate('/course/' + response.data.courseId, {
//                 state: {
//                     jsonData: topics,
//                     mainTopic: courseName.toUpperCase(),
//                     type: type.toLowerCase(),
//                     courseId: response.data.courseId,
//                     lang,
//                 },
//             });
//         } catch (error: any) {
//             handleError(error);
//         } finally {
//             setIsLoadingCourse(false);
//         }
//     }

//     /* -------------------- ERROR HANDLER -------------------- */

//     function handleError(error: any) {
//         console.error(error);
//         setIsLoadingCourse(false);
//         toast({
//             title: 'Error',
//             description:
//                 error?.response?.data?.message ||
//                 error?.message ||
//                 'Internal Server Error',
//         });
//     }

//     /* -------------------- UI -------------------- */

//     const renderTopicsAndSubtopics = (topicss: any[]) =>
//         topicss.map((topic, index) => (
//             <div key={index} className="space-y-2">
//                 <Card className="bg-black text-white">
//                     <CardContent className="p-4 font-bold">
//                         {topic.title}
//                     </CardContent>
//                 </Card>
//                 {topic.subtopics?.map((sub: any, i: number) => (
//                     <Card key={i}>
//                         <CardContent className="p-4">
//                             {sub.title}
//                         </CardContent>
//                     </Card>
//                 ))}
//             </div>
//         ));

//     if (isLoading) {
//         return <Skeleton className="h-64 w-full" />;
//     }

//     return (
//         <div className="space-y-6 py-8">
//             <h1 className="text-3xl font-bold text-center">
//                 {courseName.toUpperCase()}
//             </h1>

//             <ScrollArea>
//                 <div className="max-w-3xl mx-auto space-y-6">
//                     {renderTopicsAndSubtopics(getCourseTopics())}
//                 </div>
//             </ScrollArea>

//             <div className="flex justify-center gap-4">
//                 <Button variant="outline" onClick={onClose}>
//                     Cancel
//                 </Button>
//                 <Button onClick={handleCreateCourse} disabled={isLoadingCourse}>
//                     {isLoadingCourse ? (
//                         <Loader className="animate-spin mr-2 h-4 w-4" />
//                     ) : (
//                         <CheckCircle className="mr-2 h-4 w-4" />
//                     )}
//                     Generate Course
//                 </Button>
//             </div>
//         </div>
//     );
// };

// export default CoursePreview;


// import React, { useState } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Button } from '@/components/ui/button';
// import { CheckCircle, Loader } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { serverURL } from '@/constants';
// import axios from 'axios';
// import { useToast } from '@/hooks/use-toast';

// interface CoursePreviewProps {
//   isLoading: boolean;
//   courseName: string;
//   topics: any;
//   type: string;
//   lang: string;
//   onClose?: () => void;
// }

// const CoursePreview: React.FC<CoursePreviewProps> = ({
//   isLoading,
//   courseName,
//   topics,
//   type,
//   lang,
//   onClose
// }) => {
//   const navigate = useNavigate();
//   const [isLoadingCourse, setIsLoadingCourse] = useState(false);
//   const { toast } = useToast();

//   const getCourseTopics = () =>
//     topics['course_topics'] || topics[courseName.toLowerCase()];

//   const normalizeAllSubtopics = () => {
//     const courseTopics = getCourseTopics();
//     if (!Array.isArray(courseTopics)) return null;

//     courseTopics.forEach((topic: any) => {
//       if (!Array.isArray(topic.subtopics)) return;
//       topic.subtopics = topic.subtopics.map((sub: any) =>
//         typeof sub === 'string'
//           ? { title: sub, theory: '', image: '', youtube: '' }
//           : sub
//       );
//     });

//     return courseTopics;
//   };

//   async function handleCreateCourse() {
//     if (isLoadingCourse) return;

//     const courseTopics = normalizeAllSubtopics();
//     const firstSubtopic = courseTopics?.[0]?.subtopics?.[0];

//     if (!firstSubtopic) {
//       toast({ title: 'Error', description: 'No subtopics found.' });
//       return;
//     }

//     setIsLoadingCourse(true);

//     try {
//       if (type === 'Video & Text Course') {
//         const query = `${firstSubtopic.title} ${courseName} in english`;
//         await sendVideo(query);
//       } else {
//         const prompt = `Strictly in ${lang}, Explain ${firstSubtopic.title} of ${courseName} with examples. Do not include images or extra resources.`;
//         const imagePrompt = `Example of ${firstSubtopic.title} in ${courseName}`;
//         await sendPrompt(prompt, imagePrompt);
//       }
//     } catch {
//       setIsLoadingCourse(false);
//     }
//   }

//   /* ---------------- TEXT COURSE ---------------- */

//   async function sendPrompt(prompt: string, imagePrompt: string) {
//     const res = await axios.post(serverURL + '/api/generate', { prompt });
//     await sendImage(res.data.generatedText, imagePrompt);
//   }

//   async function sendImage(theory: string, imagePrompt: string) {
//     const res = await axios.post(serverURL + '/api/image', {
//       prompt: imagePrompt
//     });
//     await saveSubtopic({ theory, image: res.data.url });
//   }

//   /* ---------------- VIDEO COURSE ---------------- */

//   async function sendVideo(query: string) {
//     const yt = await axios.post(serverURL + '/api/yt', { prompt: query });
//     await sendTranscript(yt.data.url);
//   }

//   async function sendTranscript(videoId: string) {
//     try {
//       const res = await axios.post(serverURL + '/api/transcript', {
//         prompt: videoId
//       });

//       const allText = res.data.transcript
//         .map((i: any) => i.text)
//         .join(' ');

//       const prompt = `Strictly in ${lang}, Summarize this content clearly for learning: ${allText}`;
//       const summary = await axios.post(serverURL + '/api/generate', { prompt });

//       await saveSubtopic({
//         theory: summary.data.generatedText,
//         youtube: videoId
//       });
//     } catch {
//       throw new Error('Transcript failed');
//     }
//   }

//   /* ---------------- SAVE ---------------- */

//   async function saveSubtopic(data: any) {
//     normalizeAllSubtopics();
//     const courseTopics = getCourseTopics();
//     Object.assign(courseTopics[0].subtopics[0], data);
//     await saveCourse();
//   }

//   async function saveCourse() {
//     try {
//       const res = await axios.post(serverURL + '/api/course', {
//         user: sessionStorage.getItem('uid'),
//         content: JSON.stringify(topics),
//         type,
//         mainTopic: courseName,
//         lang
//       });

//       sessionStorage.setItem('courseId', res.data.courseId);
//       sessionStorage.setItem('jsonData', JSON.stringify(topics));

//       navigate('/course/' + res.data.courseId, {
//         state: {
//           jsonData: topics,
//           mainTopic: courseName.toUpperCase(),
//           type: type.toLowerCase(),
//           courseId: res.data.courseId,
//           lang
//         }
//       });
//     } catch (error: any) {
//       if (error?.response?.status === 429) {
//         toast({
//           title: 'Rate limit exceeded',
//           description: 'Please wait and try again.'
//         });
//       } else {
//         toast({
//           title: 'Error',
//           description: error.message || 'Internal server error'
//         });
//       }
//     } finally {
//       setIsLoadingCourse(false);
//     }
//   }

//   if (isLoading) return <Skeleton className="h-64 w-full" />;

//   return (
//     <div className="space-y-6 py-8">
//       <h1 className="text-3xl font-bold text-center">
//         {courseName.toUpperCase()}
//       </h1>

//       <ScrollArea>
//         <div className="max-w-3xl mx-auto space-y-6">
//           {getCourseTopics()?.map((topic: any, i: number) => (
//             <div key={i} className="space-y-2">
//               <Card className="bg-black text-white">
//                 <CardContent className="p-4 font-bold">
//                   {topic.title}
//                 </CardContent>
//               </Card>
//               {topic.subtopics?.map((s: any, j: number) => (
//                 <Card key={j}>
//                   <CardContent className="p-4">{s.title}</CardContent>
//                 </Card>
//               ))}
//             </div>
//           ))}
//         </div>
//       </ScrollArea>

//       <div className="flex justify-center gap-4">
//         <Button variant="outline" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button onClick={handleCreateCourse} disabled={isLoadingCourse}>
//           {isLoadingCourse ? (
//             <Loader className="animate-spin mr-2 h-4 w-4" />
//           ) : (
//             <CheckCircle className="mr-2 h-4 w-4" />
//           )}
//           Generate Course
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default CoursePreview;


import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface CoursePreviewProps {
  isLoading: boolean;
  courseName: string;
  topics: any;
  type: string;
  lang: string;
  onClose?: () => void;
}

const CoursePreview: React.FC<CoursePreviewProps> = ({
  isLoading,
  courseName,
  topics,
  type,
  lang,
  onClose
}) => {
  const navigate = useNavigate();
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const { toast } = useToast();

  /* ---------------- HELPERS ---------------- */

  const getCourseTopics = () =>
    topics?.course_topics || topics?.[courseName.toLowerCase()];

  /** ✅ GUARANTEES subtopic titles exist */
  const normalizeAllSubtopics = () => {
    const courseTopics = getCourseTopics();
    if (!Array.isArray(courseTopics)) return null;

    courseTopics.forEach((topic: any) => {
      if (!Array.isArray(topic.subtopics)) return;

      topic.subtopics = topic.subtopics.map(
        (sub: any, index: number) => {
          if (typeof sub === 'string') {
            return {
              title: sub,
              theory: '',
              image: '',
              youtube: ''
            };
          }

          return {
            title: sub.title?.trim() || `Subtopic ${index + 1}`,
            theory: sub.theory || '',
            image: sub.image || '',
            youtube: sub.youtube || ''
          };
        }
      );
    });

    return courseTopics;
  };

  /* ---------------- CREATE COURSE ---------------- */

  async function handleCreateCourse() {
    if (isLoadingCourse) return;

    const courseTopics = normalizeAllSubtopics();
    const firstSubtopic = courseTopics?.[0]?.subtopics?.[0];

    if (!firstSubtopic) {
      toast({ title: 'Error', description: 'No subtopics found.' });
      return;
    }

    setIsLoadingCourse(true);

    try {
      if (type === 'Video & Text Course') {
        const query = `${firstSubtopic.title} ${courseName} in english`;
        await sendVideo(query);
      } else {
        const prompt = `Strictly in ${lang}, Explain ${firstSubtopic.title} of ${courseName} with examples. Do not include images or extra resources.`;
        const imagePrompt = `Example of ${firstSubtopic.title} in ${courseName}`;
        await sendPrompt(prompt, imagePrompt);
      }
    } catch {
      setIsLoadingCourse(false);
    }
  }

  /* ---------------- TEXT COURSE ---------------- */

  async function sendPrompt(prompt: string, imagePrompt: string) {
    const res = await axios.post(serverURL + '/api/generate', { prompt });
    await sendImage(res.data.generatedText, imagePrompt);
  }

  async function sendImage(theory: string, imagePrompt: string) {
    const res = await axios.post(serverURL + '/api/image', {
      prompt: imagePrompt
    });
    await saveSubtopic({ theory, image: res.data.url });
  }

  /* ---------------- VIDEO COURSE ---------------- */

  async function sendVideo(query: string) {
    const yt = await axios.post(serverURL + '/api/yt', { prompt: query });
    await sendTranscript(yt.data.url);
  }

  async function sendTranscript(videoId: string) {
    const res = await axios.post(serverURL + '/api/transcript', {
      prompt: videoId
    });

    const allText = res.data.transcript
      .map((i: any) => i.text)
      .join(' ');

    const prompt = `Strictly in ${lang}, Summarize this content clearly for learning: ${allText}`;
    const summary = await axios.post(serverURL + '/api/generate', { prompt });

    await saveSubtopic({
      theory: summary.data.generatedText,
      youtube: videoId
    });
  }

  /* ---------------- SAVE ---------------- */

  async function saveSubtopic(data: any) {
    normalizeAllSubtopics();
    const courseTopics = getCourseTopics();
    Object.assign(courseTopics[0].subtopics[0], data);
    await saveCourse();
  }

  async function saveCourse() {
    try {
      const res = await axios.post(serverURL + '/api/course', {
        user: sessionStorage.getItem('uid'),
        content: JSON.stringify(topics),
        type,
        mainTopic: courseName,
        lang
      });

      sessionStorage.setItem('courseId', res.data.courseId);
      sessionStorage.setItem('jsonData', JSON.stringify(topics));

      navigate('/course/' + res.data.courseId, {
        state: {
          jsonData: topics,
          mainTopic: courseName.toUpperCase(),
          type: type.toLowerCase(),
          courseId: res.data.courseId,
          lang
        }
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.status === 429
            ? 'Rate limit exceeded. Please wait.'
            : error.message || 'Internal server error'
      });
    } finally {
      setIsLoadingCourse(false);
    }
  }

  /* ---------------- RENDER ---------------- */

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  normalizeAllSubtopics(); // ✅ ensure data is fixed before render

  return (
    <div className="space-y-6 py-8">
      <h1 className="text-3xl font-bold text-center">
        {courseName.toUpperCase()}
      </h1>

   <ScrollArea className="h-[70vh]">
  <div className="max-w-3xl mx-auto space-y-8 px-2">
    {getCourseTopics()?.map((topic: any, i: number) => (
      <div key={i} className="space-y-4">
        {/* TOPIC */}
        <Card className="bg-black text-white rounded-md">
          <CardContent className="px-6 py-3 text-base font-semibold">
            {topic.title}
          </CardContent>
        </Card>

        {/* SUBTOPICS */}
        <div className="ml-6 space-y-2">
          {topic.subtopics?.map((s: any, j: number) => (
            <div
              key={j}
              className="
                flex items-center
                px-4 py-2
                border border-gray-300
                rounded-md
                text-sm text-gray-700
                bg-white
              "
            >
              {s.title}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
</ScrollArea>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleCreateCourse} disabled={isLoadingCourse}>
          {isLoadingCourse ? (
            <Loader className="animate-spin mr-2 h-4 w-4" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Generate Course
        </Button>
      </div>
    </div>
  );
};

export default CoursePreview;
