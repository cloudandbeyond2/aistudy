// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TestimonialSubmission = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    userName: sessionStorage.getItem('name') || '',
    userEmail: sessionStorage.getItem('email') || '',
    message: '',
    rating: '5',
    profession: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      rating: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userName || !formData.userEmail || !formData.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${serverURL}/api/testimonials/submit`, {
        ...formData,
        rating: parseInt(formData.rating),
      });

      if (response.data.success) {
        setIsSubmitted(true);
        toast({
          title: 'Success',
          description: response.data.message,
        });
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            userName: sessionStorage.getItem('name') || '',
            userEmail: sessionStorage.getItem('email') || '',
            message: '',
            rating: '5',
            profession: '',
          });
          setIsSubmitted(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit testimonial. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Thank you for your testimonial! It has been submitted for admin review and will be visible on our website once approved.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Share Your Experience</CardTitle>
              <CardDescription>
                Help other students by sharing your experience with AiCourse
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="userName">Name *</Label>
              <Input
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Your full name"
                disabled={isLoading}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email *</Label>
              <Input
                id="userEmail"
                name="userEmail"
                type="email"
                value={formData.userEmail}
                onChange={handleChange}
                placeholder="your.email@example.com"
                disabled={isLoading}
                required
              />
            </div>

            {/* Profession */}
            <div className="space-y-2">
              <Label htmlFor="profession">Profession (Optional)</Label>
              <Input
                id="profession"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                placeholder="e.g., Web Developer, Teacher, etc."
                disabled={isLoading}
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating">Rating *</Label>
              <Select value={formData.rating} onValueChange={handleRatingChange} disabled={isLoading}>
                <SelectTrigger id="rating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ Very Good</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ Good</SelectItem>
                  <SelectItem value="2">⭐⭐ Fair</SelectItem>
                  <SelectItem value="1">⭐ Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Your Testimonial *</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Share your experience with AiCourse. What did you like? How has it helped you?"
                rows={6}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.message.length} / 1000 characters
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || formData.message.length === 0}
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              {isLoading ? 'Submitting...' : 'Submit Testimonial'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Your testimonial will be reviewed by our admin team before being published on the website.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestimonialSubmission;
