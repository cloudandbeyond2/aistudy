
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import SEO from '@/components/SEO';
import { ArrowLeft, Upload, Send } from 'lucide-react';

const AssignmentPage = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [assignment, setAssignment] = useState<any>(null);
    const [submission, setSubmission] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch assignment details
        // Mock for now or implement fetch
        // fetchAssignment();
    }, [assignmentId]);

    const handleSubmit = async () => {
        if (!submission) return;
        setIsLoading(true);
        try {
            const res = await axios.post(`${serverURL}/api/student/assignment/submit`, {
                assignmentId,
                studentId: sessionStorage.getItem('uid'),
                content: submission,
                fileUrl: '' // File upload to be implemented
            });
            if (res.data.success) {
                toast({ title: "Submitted", description: "Good luck!" });
                navigate('/dashboard/student');
            } else {
                toast({ title: "Error", description: "Submission failed" });
            }
        } catch (e) {
            toast({ title: "Error", description: "Network error" });
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
                        <p>{assignment?.description || 'Please complete the attached questions.'}</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-medium">Your Submission</label>
                        <Textarea
                            className="min-h-[200px]"
                            placeholder="Type your answer here..."
                            value={submission}
                            onChange={(e) => setSubmission(e.target.value)}
                        />

                        <div className="flex items-center gap-4">
                            <Button variant="outline" className="w-full">
                                <Upload className="w-4 h-4 mr-2" /> Upload File
                            </Button>
                            <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
                                <Send className="w-4 h-4 mr-2" /> Submit
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AssignmentPage;
