
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


import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Loader, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { getCoursePresentationMeta } from '@/lib/coursePresentation';

const defaultQuizSettings = {
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
    requireCamera: false,
    requireMicrophone: false,
    detectFullscreenExit: true,
    detectTabSwitch: true,
    detectCopyPaste: true,
    detectContextMenu: true,
    detectNoise: false
  }
};

interface DepartmentOption {
  _id: string;
  name: string;
}

interface CoursePreviewProps {
  isLoading: boolean;
  courseName: string;
  topics: any;
  type: string;
  lang: string;
  contentProfile?: string;
  onClose?: () => void;
}

const CoursePreview: React.FC<CoursePreviewProps> = ({
  isLoading,
  courseName,
  topics,
  type,
  lang,
  contentProfile,
  onClose
}) => {
  const navigate = useNavigate();
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Preparing your course...');
  const [orgDepartments, setOrgDepartments] = useState<DepartmentOption[]>([]);
  const [isOrgSettingsDialogOpen, setIsOrgSettingsDialogOpen] = useState(false);
  const { toast } = useToast();
  const presentationMeta = getCoursePresentationMeta(
    contentProfile || topics?.course_meta?.contentProfile
  );
  const PresentationIcon = presentationMeta.icon;
  const role = sessionStorage.getItem('role') || '';
  const orgId = sessionStorage.getItem('orgId') || '';
  const deptId = sessionStorage.getItem('deptId') || '';
  const deptName = sessionStorage.getItem('deptName') || '';
  const isOrgStaff = Boolean(orgId) && (role === 'org_admin' || role === 'dept_admin');
  const [orgSaveConfig, setOrgSaveConfig] = useState(() => ({
    department: role === 'dept_admin' ? (deptId || deptName || '') : 'all',
    quizSettings: {
      ...defaultQuizSettings,
      proctoring: { ...defaultQuizSettings.proctoring },
      sections: { ...defaultQuizSettings.sections }
    }
  }));

  useEffect(() => {
    if (!isOrgStaff || !orgId) return;

    let ignore = false;
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${serverURL}/api/org/departments?organizationId=${orgId}`);
        if (ignore) return;
        const departments = Array.isArray(res.data?.departments) ? res.data.departments : [];
        setOrgDepartments(departments);
      } catch (error) {
        console.error('Failed to fetch org departments for AI course save:', error);
      }
    };

    void fetchDepartments();
    return () => {
      ignore = true;
    };
  }, [isOrgStaff, orgId]);

  useEffect(() => {
    if (role !== 'dept_admin') return;
    setOrgSaveConfig((prev) => ({
      ...prev,
      department: deptId || deptName || prev.department
    }));
  }, [role, deptId, deptName]);

  /* ---------------- HELPERS ---------------- */

  const getCourseTopics = () =>
    topics?.course_topics || topics?.[courseName.toLowerCase()];

  const updateOrgQuizSetting = (field: string, value: any) => {
    setOrgSaveConfig((prev) => ({
      ...prev,
      quizSettings: {
        ...prev.quizSettings,
        [field]: value
      }
    }));
  };

  const disableAllProctoring = () => ({
    requireCamera: false,
    requireMicrophone: false,
    detectFullscreenExit: false,
    detectTabSwitch: false,
    detectCopyPaste: false,
    detectContextMenu: false,
    detectNoise: false
  });

  const updateOrgProctoringSetting = (field: string, value: boolean) => {
    setOrgSaveConfig((prev) => ({
      ...prev,
      quizSettings: {
        ...prev.quizSettings,
        proctoring: (() => {
          const nextProctoring = {
            ...prev.quizSettings.proctoring,
            [field]: value
          };

          // Noise detection depends on microphone input.
          if (field === 'requireMicrophone' && !value) {
            nextProctoring.detectNoise = false;
          }

          if (field === 'detectNoise' && value) {
            nextProctoring.requireMicrophone = true;
          }

          return nextProctoring;
        })()
      }
    }));
  };

  const resolveOrgDepartmentValue = () => {
    if (role === 'dept_admin') return deptId || deptName || orgSaveConfig.department || '';
    return orgSaveConfig.department || 'all';
  };

  const extractOrgTopics = () =>
    (getCourseTopics() || []).map((topic: any, topicIndex: number) => ({
      title: topic?.title || `Module ${topicIndex + 1}`,
      order: topicIndex + 1,
      subtopics: (Array.isArray(topic?.subtopics) ? topic.subtopics : []).map((sub: any, subIndex: number) => ({
        title: sub?.title || `Lesson ${subIndex + 1}`,
        content: sub?.theory || sub?.content || '',
        videoUrl: sub?.youtube || sub?.videoUrl || '',
        diagram: sub?.image || sub?.diagram || '',
        order: subIndex + 1
      }))
    }));

  const extractCourseQuizzes = () => {
    if (Array.isArray(topics?.quizzes)) return topics.quizzes;
    if (Array.isArray(topics?.course_quizzes)) return topics.course_quizzes;
    return [];
  };

  const buildPreviewJsonData = (quizSettings = defaultQuizSettings) => ({
    ...topics,
    course_meta: {
      ...(topics.course_meta || {}),
      contentProfile: presentationMeta.id,
      contentProfileLabel: presentationMeta.label,
      language: lang,
      courseType: type,
      organizationManaged: isOrgStaff
    },
    quizzes: extractCourseQuizzes(),
    quizSettings
  });

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

    if (isOrgStaff && extractCourseQuizzes().length === 0) {
      toast({
        title: 'Quiz not generated yet',
        description: 'Generate quiz questions first, then request approval.',
        variant: 'destructive'
      });
      return;
    }

    if (role === 'dept_admin') {
      const courseLimit = parseInt(sessionStorage.getItem('courseLimit') || '0', 10) || 0;
      const coursesCreatedCount = parseInt(sessionStorage.getItem('coursesCreatedCount') || '0', 10) || 0;

      if (coursesCreatedCount >= courseLimit) {
        toast({
          title: 'Course Limit Reached',
          description: `Your course creation limit (${courseLimit}) has been reached. Please ask your organization admin to request an increase.`,
          variant: 'destructive'
        });
        return;
      }
    }

    normalizeAllSubtopics();
    const courseTopics = getCourseTopics();

    if (!courseTopics?.length) {
      toast({ title: 'Error', description: 'Course data is not available.' });
      return;
    }

    if (isOrgStaff) {
      if (role === 'org_admin' && !resolveOrgDepartmentValue()) {
        setOrgSaveConfig((prev) => ({ ...prev, department: 'all' }));
      }
      setIsOrgSettingsDialogOpen(true);
      return;
    }

    setIsLoadingCourse(true);
    setLoadingMessage('Saving course structure...');
    await saveCourse();
  }

  /* ---------------- SAVE ---------------- */

  async function saveCourse(customQuizSettings?: typeof defaultQuizSettings) {
    try {
      const effectiveQuizSettings = customQuizSettings || orgSaveConfig.quizSettings;
      const previewJsonData = buildPreviewJsonData(effectiveQuizSettings);
      topics.course_meta = previewJsonData.course_meta;
      topics.quizzes = previewJsonData.quizzes;
      topics.quizSettings = previewJsonData.quizSettings;

      let savedCourseId = '';

      if (isOrgStaff) {
        const department = resolveOrgDepartmentValue();
        setLoadingMessage('Saving organization course and publish controls...');

        const res = await axios.post(`${serverURL}/api/org/course/create`, {
          organizationId: orgId,
          createdBy: sessionStorage.getItem('uid'),
          title: courseName,
          description: previewJsonData.course_meta?.contentProfileLabel
            ? `${previewJsonData.course_meta.contentProfileLabel} AI-generated course`
            : 'AI-generated course',
          type,
          department,
          topics: extractOrgTopics(),
          quizzes: previewJsonData.quizzes,
          quizSettings: effectiveQuizSettings,
          courseMeta: previewJsonData.course_meta,
          isAiGenerated: true
        });

        if (!res.data?.success) {
          throw new Error(res.data?.message || 'Failed to create organization course');
        }

        savedCourseId = res.data?.course?._id || '';

        // Course is saved as draft - approval request is handled separately via quiz attendance
      } else {
        setLoadingMessage('Saving course structure...');
        const res = await axios.post(serverURL + '/api/course', {
          user: sessionStorage.getItem('uid'),
          content: JSON.stringify(previewJsonData),
          type,
          mainTopic: courseName,
          lang
        });
        savedCourseId = res.data?.courseId || '';
      }

      if (!savedCourseId) {
        throw new Error('Course id was not returned after save');
      }

      sessionStorage.setItem('courseId', savedCourseId);
      sessionStorage.setItem('jsonData', JSON.stringify(previewJsonData));

      if (role === 'dept_admin') {
        const prev = parseInt(sessionStorage.getItem('coursesCreatedCount') || '0', 10) || 0;
        sessionStorage.setItem('coursesCreatedCount', String(prev + 1));
      }

      navigate('/course/' + savedCourseId, {
        state: {
          jsonData: previewJsonData,
          mainTopic: courseName.toUpperCase(),
          type: type.toLowerCase(),
          courseId: savedCourseId,
          lang
        }
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error?.response?.status === 429 ? 'Rate limit exceeded. Please wait.' : '') ||
        error?.message ||
        'Internal server error';

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsLoadingCourse(false);
    }
  }

  const handleSaveOrgCourseWithSettings = async () => {
    setIsOrgSettingsDialogOpen(false);
    setIsLoadingCourse(true);
    await saveCourse(orgSaveConfig.quizSettings);
  };

  /* ---------------- RENDER ---------------- */

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  normalizeAllSubtopics(); // ✅ ensure data is fixed before render

  const viewerRole = sessionStorage.getItem('role') || '';
  const viewerCourseLimit = parseInt(sessionStorage.getItem('courseLimit') || '0', 10) || 0;
  const viewerCoursesCreated = parseInt(sessionStorage.getItem('coursesCreatedCount') || '0', 10) || 0;
  const isDeptAdminLimitReached = viewerRole === 'dept_admin' && viewerCoursesCreated >= viewerCourseLimit;
  const courseTopics = Array.isArray(getCourseTopics()) ? getCourseTopics() : [];
  const hasGeneratedQuizzes = extractCourseQuizzes().length > 0;

  return (
    <div className="space-y-6 py-8">
      {isLoadingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-md space-y-4 rounded-2xl border bg-card p-6 shadow-2xl">
            <div className="text-center space-y-2">
              <Loader className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="text-lg font-semibold">Saving course…</p>
              <p className="text-sm text-muted-foreground">{loadingMessage}</p>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-5xl space-y-4 px-2">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-indigo-500/10 p-6 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${presentationMeta.badgeClass}`}>
                  <PresentationIcon className="mr-1.5 h-3.5 w-3.5" />
                  {presentationMeta.label}
                </span>
                <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  {type === 'video & text course' ? 'Video + Text' : 'Text + Images'}
                </span>
                <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  {lang}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{courseName.toUpperCase()}</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Preview the generated structure before saving. The selected presentation style will shape how each lesson reads inside the course page.
                </p>
              </div>
            </div>
            <div className={`max-w-sm rounded-2xl border p-4 ${presentationMeta.surfaceClass}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${presentationMeta.badgeClass}`}>
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Selected writing pattern</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {presentationMeta.summary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[70vh] rounded-3xl border bg-card/60 p-4 shadow-sm">
          <div className="mx-auto max-w-4xl pb-2">
            <Accordion
              type="single"
              collapsible
              className="space-y-3"
              defaultValue={courseTopics.length ? 'module-0' : undefined}
            >
              {courseTopics.map((topic: any, i: number) => (
                <AccordionItem
                  key={`${i}-${topic?.title || 'module'}`}
                  value={`module-${i}`}
                  className="overflow-hidden rounded-3xl border border-border/70 bg-background/70 shadow-sm"
                >
                  <AccordionTrigger className="px-5 py-4 text-left hover:no-underline">
                    <div className="flex w-full items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${presentationMeta.badgeClass}`}>
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Module {i + 1}
                          </p>
                          <h2 className="mt-1 truncate text-lg font-semibold">{topic?.title || `Module ${i + 1}`}</h2>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {Array.isArray(topic?.subtopics) ? `${topic.subtopics.length} lessons` : 'Lessons'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4 pt-0">
                    <div className="space-y-3">
                      {(Array.isArray(topic?.subtopics) ? topic.subtopics : []).map((subtopic: any, j: number) => (
                        <div
                          key={`${i}-${j}-${subtopic?.title || 'lesson'}`}
                          className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3"
                        >
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {j + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">{subtopic?.title || `Lesson ${j + 1}`}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              This lesson will follow the {presentationMeta.shortLabel.toLowerCase()} pattern after generation.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollArea>
      </div>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        {sessionStorage.getItem('role') !== 'student' && (
          <Button
            onClick={handleCreateCourse}
            disabled={isLoadingCourse || isDeptAdminLimitReached || (isOrgStaff && !hasGeneratedQuizzes)}
          >
            {isLoadingCourse ? (
              <Loader className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {isOrgStaff && role === 'dept_admin'
              ? 'Save & Request Approval'
              : isOrgStaff
                ? 'Save Course Draft'
                : 'Generate Course'}
          </Button>
        )}
      </div>

      {isDeptAdminLimitReached && (
        <p className="text-center text-sm text-destructive">
          Your staff course limit is reached. Ask your organization admin to request a higher limit.
        </p>
      )}

      {isLoadingCourse && (
        <p className="text-center text-sm text-muted-foreground">
          {loadingMessage}
        </p>
      )}

      {isOrgStaff && !hasGeneratedQuizzes && (
        <p className="text-center text-sm text-amber-700 dark:text-amber-300">
          Quiz questions are missing. Generate quizzes before requesting approval.
        </p>
      )}

      <Dialog open={isOrgSettingsDialogOpen} onOpenChange={setIsOrgSettingsDialogOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Optional Publish Controls for AI Course</DialogTitle>
            <DialogDescription>
              This organization course will be saved as pending approval and unpublished by default. Keep the default secure exam settings, or adjust quiz mode and malpractice monitoring before it enters the org review flow.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-2">
            <div className="grid gap-4 rounded-2xl border bg-muted/30 p-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Course title</Label>
                <div className="rounded-xl border bg-background px-3 py-2 text-sm font-medium">
                  {courseName}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                {role === 'dept_admin' ? (
                  <div className="rounded-xl border bg-background px-3 py-2 text-sm font-medium">
                    {deptName || orgDepartments.find((dept) => dept._id === deptId)?.name || deptId || 'Assigned department'}
                  </div>
                ) : (
                  <Select
                    value={orgSaveConfig.department || 'all'}
                    onValueChange={(value) => setOrgSaveConfig((prev) => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {orgDepartments.map((department) => (
                        <SelectItem key={department._id} value={department._id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Quiz mode</Label>
                <Select
                  value={orgSaveConfig.quizSettings.quizMode}
                  onValueChange={(value) => {
                    setOrgSaveConfig((prev) => ({
                      ...prev,
                      quizSettings: {
                        ...prev.quizSettings,
                        quizMode: value,
                        examMode: value === 'secure',
                        proctoring: value === 'secure'
                          ? prev.quizSettings.proctoring
                          : disableAllProctoring()
                      }
                    }));
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="secure">Secure Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Review mode</Label>
                <Select
                  value={orgSaveConfig.quizSettings.reviewMode}
                  onValueChange={(value) => updateOrgQuizSetting('reviewMode', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select review mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="after_submit_with_answers">Show answers after submit</SelectItem>
                    <SelectItem value="after_submit_without_answers">Show score only after submit</SelectItem>
                    <SelectItem value="score_only">Score only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Attempt limit</Label>
                <Input
                  type="number"
                  min={1}
                  value={orgSaveConfig.quizSettings.attemptLimit}
                  onChange={(e) => updateOrgQuizSetting('attemptLimit', Number(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label>Cooldown after failed attempt (minutes)</Label>
                <Input
                  type="number"
                  min={0}
                  value={orgSaveConfig.quizSettings.cooldownMinutes}
                  onChange={(e) => updateOrgQuizSetting('cooldownMinutes', Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Pass percentage</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={orgSaveConfig.quizSettings.passPercentage}
                  onChange={(e) => updateOrgQuizSetting('passPercentage', Number(e.target.value) || 50)}
                />
              </div>
              <div className="space-y-2">
                <Label>Questions per attempt</Label>
                <Input
                  type="number"
                  min={1}
                  value={orgSaveConfig.quizSettings.questionCount}
                  onChange={(e) => updateOrgQuizSetting('questionCount', Number(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
              <div className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                Malpractice Monitoring
              </div>
              <p className="mt-2 text-xs text-amber-700/80 dark:text-amber-300/80">
                Malpractice monitoring applies only in <span className="font-semibold">Secure Exam</span> mode.
                Camera/microphone permissions are requested when learners start the quiz (not during course creation).
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {[
                  ['requireCamera', 'Require camera access'],
                  ['requireMicrophone', 'Require microphone access'],
                  ['detectTabSwitch', 'Detect tab switches'],
                  ['detectFullscreenExit', 'Detect fullscreen exit'],
                  ['detectCopyPaste', 'Detect copy/paste'],
                  ['detectContextMenu', 'Detect context menu'],
                  ['detectNoise', 'Detect external noise spikes']
                ].map(([field, label]) => (
                  <label
                    key={field}
                    className={`flex items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2 text-sm ${orgSaveConfig.quizSettings.quizMode === 'secure' ? '' : 'opacity-60'}`}
                  >
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(orgSaveConfig.quizSettings.proctoring[field as keyof typeof defaultQuizSettings.proctoring])}
                      onChange={(e) => updateOrgProctoringSetting(field, e.target.checked)}
                      disabled={orgSaveConfig.quizSettings.quizMode !== 'secure'}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setIsOrgSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => {
                  setOrgSaveConfig((prev) => ({
                    ...prev,
                    quizSettings: {
                      ...defaultQuizSettings,
                      proctoring: { ...defaultQuizSettings.proctoring },
                      sections: { ...defaultQuizSettings.sections }
                    }
                  }));
                }}
              >
                Reset Controls to Defaults
              </Button>
              <Button onClick={handleSaveOrgCourseWithSettings} disabled={!hasGeneratedQuizzes}>
                {role === 'dept_admin' ? 'Save & Request Approval' : 'Save with Current Controls'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoursePreview;
