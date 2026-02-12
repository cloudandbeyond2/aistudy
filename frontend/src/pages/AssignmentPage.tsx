
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import StyledText from '@/components/styledText';
import SEO from '@/components/SEO';
import { ArrowLeft, Upload, Send, FileText, X } from 'lucide-react';

const AssignmentPage = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [assignment, setAssignment] = useState<any>(null);
    const [submission, setSubmission] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const res = await axios.get(`${serverURL}/api/org/assignment/${assignmentId}`);
                if (res.data.success) {
                    setAssignment(res.data.assignment);
                }
            } catch (e) {
                console.error('Error fetching assignment:', e);
                toast({ title: "Error", description: "Failed to load assignment details" });
            }
        };

        if (assignmentId) {
            fetchAssignment();
        }
    }, [assignmentId, toast]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast({ title: "Invalid File", description: "Please upload a PDF file." });
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast({ title: "File Too Large", description: "File size should be less than 10MB." });
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSubmit = async () => {
        if (!submission && !selectedFile) {
            toast({ title: "Empty Submission", description: "Please provide either text content or a file." });
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('assignmentId', assignmentId || '');
            formData.append('studentId', sessionStorage.getItem('uid') || '');
            formData.append('content', submission);
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const res = await axios.post(`${serverURL}/api/student/assignment/submit`, formData);

            if (res.data.success) {
                toast({ title: "Submitted", description: "Assignment submitted successfully!" });
                navigate('/dashboard/student');
            } else {
                toast({ title: "Error", description: res.data.message || "Submission failed" });
            }
        } catch (e) {
            console.error('Submission error:', e);
            toast({ title: "Error", description: "Network error during submission" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-3xl animate-fade-in">
            <SEO title="Assignment" description="Submit your work." />

            <Button variant="ghost" className="mb-4" onClick={() => navigate('/dashboard/student')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>{assignment?.topic || 'Assignment Topic'}</CardTitle>
                    <CardDescription>Due Date: {assignment?.dueDate || 'Tomorrow'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded-lg">
                        <StyledText text={assignment?.description || 'Please complete the following task.'} />
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-medium">Your Submission</label>
                        <Textarea
                            className="min-h-[200px]"
                            placeholder="Type your answer here..."
                            value={submission}
                            onChange={(e) => setSubmission(e.target.value)}
                        />

                        <div className="space-y-4">
                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />

                            {selectedFile ? (
                                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                                            <span className="text-xs text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full h-12 border-dashed border-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-4 h-4 mr-2" /> Upload PDF (Max 10MB)
                                </Button>
                            )}

                            <Button className="w-full h-12 text-base font-semibold" onClick={handleSubmit} disabled={isLoading}>
                                <Send className="w-4 h-4 mr-2" /> {isLoading ? 'Submitting...' : 'Submit Assignment'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AssignmentPage;
