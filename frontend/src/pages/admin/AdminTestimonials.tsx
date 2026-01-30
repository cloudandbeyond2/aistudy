// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Trash2, Star, MessageSquare } from 'lucide-react';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface Testimonial {
  _id: string;
  userName: string;
  userEmail: string;
  message: string;
  rating: number;
  profession: string;
  photoUrl: string;
  approved: boolean;
  featured: boolean;
  createdAt: string;
}

const AdminTestimonials = () => {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const fetchTestimonials = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${serverURL}/api/admin/testimonials`);
      if (response.data.success) {
        setTestimonials(response.data.testimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load testimonials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleApprove = async (id: string) => {
    try {
      const response = await axios.post(
        `${serverURL}/api/admin/testimonials/${id}/update`,
        { approved: true }
      );
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Testimonial approved',
        });
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error approving testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve testimonial',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await axios.delete(
        `${serverURL}/api/admin/testimonials/${id}`
      );
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Testimonial rejected',
        });
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject testimonial',
        variant: 'destructive',
      });
    }
  };

  const handleFeature = async (id: string, featured: boolean) => {
    try {
      const response = await axios.post(
        `${serverURL}/api/admin/testimonials/${id}/update`,
        { featured: !featured }
      );
      if (response.data.success) {
        toast({
          title: 'Success',
          description: featured ? 'Testimonial unfeatured' : 'Testimonial featured',
        });
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to update testimonial',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${serverURL}/api/admin/testimonials/${id}`
      );
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Testimonial deleted',
        });
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete testimonial',
        variant: 'destructive',
      });
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'pending') return !t.approved;
    if (filter === 'approved') return t.approved;
    return true;
  });

  const pendingCount = testimonials.filter(t => !t.approved).length;
  const approvedCount = testimonials.filter(t => t.approved).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testimonials Management</h1>
          <p className="text-muted-foreground mt-2">Manage customer testimonials and approvals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Testimonials Management</h1>
        <p className="text-muted-foreground mt-2">Manage customer testimonials and approvals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{testimonials.length}</p>
              <p className="text-sm text-muted-foreground">Total Testimonials</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All ({testimonials.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
        >
          Approved ({approvedCount})
        </Button>
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        {filteredTestimonials.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No testimonials found {filter !== 'all' && `in ${filter} status`}
            </AlertDescription>
          </Alert>
        ) : (
          filteredTestimonials.map((testimonial) => (
            <Card key={testimonial._id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{testimonial.userName}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {testimonial.profession && <span>{testimonial.profession} • </span>}
                          {new Date(testimonial.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {testimonial.approved ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-orange-200 text-orange-700">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {testimonial.featured && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-foreground">{testimonial.message}</p>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">{testimonial.userEmail}</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {!testimonial.approved ? (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(testimonial._id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(testimonial._id)}
                      className="text-orange-600 border-orange-200"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant={testimonial.featured ? 'default' : 'outline'}
                    onClick={() => handleFeature(testimonial._id, testimonial.featured)}
                    disabled={!testimonial.approved}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {testimonial.featured ? 'Unfeature' : 'Feature'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(testimonial._id)}
                    className="text-red-600 border-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTestimonials;
