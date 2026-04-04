import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, ExternalLink, Loader2, MessageSquare, Plus } from "lucide-react";

import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { serverURL } from "@/constants";

const getInternshipTaskStatusMeta = (status: string) => {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        className: "bg-primary/10 text-primary border-primary/20",
      };
    case "submitted":
      return {
        label: "Submitted",
        className: "bg-muted text-primary border-border",
      };
    case "revision":
      return {
        label: "Revision Needed",
        className: "bg-secondary text-secondary-foreground border-border",
      };
    case "in-progress":
      return {
        label: "In Progress",
        className: "bg-accent text-accent-foreground border-border",
      };
    default:
      return {
        label: "Pending",
        className: "bg-muted text-muted-foreground border-border",
      };
  }
};

const OrgInternshipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [internship, setInternship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "" });
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState({ title: "", url: "" });

  const fetchInternship = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const res = await axios.get(`${serverURL}/api/internship/${id}`);
      if (res.data.success) {
        setInternship(res.data.internship);
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.response?.data?.message || "Failed to load internship details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternship();
  }, [id]);

  const handleUpdateInternship = async (updates: any) => {
    if (!internship?._id) return;

    try {
      const res = await axios.patch(`${serverURL}/api/internship/${internship._id}`, updates);
      if (res.data.success) {
        setInternship(res.data.internship);
        toast({ title: "Updated", description: "Internship updated" });
        fetchInternship();
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Update failed", variant: "destructive" });
    }
  };

  const handleUpdateInternshipTask = async (taskId: string, updates: any) => {
    if (!internship?._id) return;

    try {
      const res = await axios.patch(`${serverURL}/api/internship/${internship._id}/task/${taskId}`, updates);
      if (res.data.success) {
        toast({ title: "Success", description: "Task updated" });
        fetchInternship();
      }
    } catch {
      toast({ title: "Error", description: "Task update failed", variant: "destructive" });
    }
  };

  const handleUpdateInternshipFollowup = async (followupId: string, updates: any) => {
    if (!internship?._id) return;

    try {
      const res = await axios.patch(`${serverURL}/api/internship/${internship._id}/followup/${followupId}`, updates);
      if (res.data.success) {
        toast({ title: "Success", description: "Daily log updated" });
        fetchInternship();
      }
    } catch {
      toast({ title: "Error", description: "Daily log update failed", variant: "destructive" });
    }
  };

  const handleAddTask = async () => {
    if (!internship?._id) return;
    if (!newTask.title || !newTask.dueDate) {
      toast({ title: "Required", description: "Please enter title and due date" });
      return;
    }

    try {
      const res = await axios.post(`${serverURL}/api/internship/${internship._id}/task`, newTask);
      if (res.data.success) {
        setIsAddingTask(false);
        setNewTask({ title: "", description: "", dueDate: "" });
        toast({ title: "Task Added", description: "New task assigned successfully." });
        fetchInternship();
      }
    } catch {
      toast({ title: "Error", description: "Failed to add task", variant: "destructive" });
    }
  };

  const handleAddResource = async () => {
    if (!internship?._id) return;
    if (!newResource.title || !newResource.url) {
      toast({ title: "Required", description: "Please enter title and URL" });
      return;
    }

    const newResources = [...(internship.studyPlan?.resources || []), { title: newResource.title, link: newResource.url }];
    await handleUpdateInternship({
      studyPlan: {
        ...internship.studyPlan,
        resources: newResources,
      },
    });
    setIsAddingResource(false);
    setNewResource({ title: "", url: "" });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-border">
          <CardContent className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-2xl font-bold">Internship not found</h1>
            <p className="text-muted-foreground">This internship may have been removed or the link is invalid.</p>
            <Button onClick={() => navigate("/dashboard/org?tab=internships")}>Back to Internships</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <SEO title={`${internship.title} | Internship`} description="Manage internship tasks, daily logs, and study plan." />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/org?tab=internships")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Internships
          </Button>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Internship Workspace</p>
            <h1 className="text-3xl font-bold">{internship.title}</h1>
            <p className="mt-2 text-muted-foreground">
              Student: {internship.studentId?.mName || "Unknown"} ({internship.studentId?.email || "No email"})
            </p>
          </div>
        </div>

        <Card className="w-full max-w-sm border-border bg-card/80">
          <CardContent className="grid grid-cols-3 gap-4 p-5 text-center">
            <div>
              <p className="text-2xl font-bold">{internship.tasks?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Tasks</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{internship.dailyFollowups?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Daily Logs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{internship.studyPlan?.resources?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Resources</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardContent className="p-6">
          <Tabs defaultValue="tasks">
            <TabsList className="grid w-full grid-cols-3 border border-border bg-card/80">
              <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Tasks ({internship.tasks?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="followups" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Daily Logs ({internship.dailyFollowups?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="studyplan" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Study Plan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Internship Tasks</h2>
                <Button size="sm" onClick={() => setIsAddingTask(true)} disabled={isAddingTask}>
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </div>

              {isAddingTask && (
                <Card className="border-border bg-muted/30 p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Task Title</Label>
                        <Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe what the student needs to do..."
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsAddingTask(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleAddTask}>Save Task</Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="grid gap-3">
                {internship.tasks?.length ? internship.tasks.map((task: any) => {
                  const statusMeta = getInternshipTaskStatusMeta(task.status);

                  return (
                    <div key={task._id} className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-muted/20 p-4 md:flex-row md:items-center">
                      <div>
                        <p className="font-bold">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                          <span className={new Date(task.dueDate) < new Date() ? "font-bold text-destructive" : "text-muted-foreground"}>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className={statusMeta.className}>{statusMeta.label}</Badge>
                          {task.submissionUrl && (
                            <a href={task.submissionUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary">
                              <ExternalLink className="h-3 w-3" /> View Submission
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <select
                          className="rounded border border-border bg-background p-1 text-xs"
                          value={task.status}
                          onChange={(e) => handleUpdateInternshipTask(task._id, { status: e.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="submitted">Submitted</option>
                          <option value="completed">Completed</option>
                          <option value="revision">Revision Needed</option>
                        </select>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 text-muted-foreground" />
                          <Input
                            placeholder="Feedback..."
                            className="h-7 w-32 text-[10px]"
                            defaultValue={task.feedback || ""}
                            onBlur={(e) => {
                              if (e.target.value !== task.feedback) {
                                handleUpdateInternshipTask(task._id, { feedback: e.target.value });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <Card className="border-border">
                    <CardContent className="py-10 text-center text-muted-foreground">No tasks added yet.</CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="followups" className="space-y-4 pt-6">
              <h2 className="text-xl font-bold">Student Progress Logs</h2>
              <div className="grid gap-3">
                {internship.dailyFollowups?.length ? internship.dailyFollowups.map((log: any) => (
                  <div key={log._id} className="rounded-lg border border-border bg-muted/10 p-4">
                    <div className="flex justify-between gap-3">
                      <span className="text-sm font-bold">Date: {new Date(log.date).toLocaleDateString()}</span>
                      {log.reviewedBy && <Badge variant="secondary">Reviewed</Badge>}
                    </div>
                    <p className="mt-2 rounded-lg border border-border bg-background p-3 text-sm italic">"{log.log}"</p>
                    <div className="mt-3 flex flex-col gap-2 md:flex-row">
                      <Input
                        placeholder="Add mentor notes..."
                        className="h-8 text-sm"
                        defaultValue={log.mentorNote}
                        onBlur={(e) =>
                          handleUpdateInternshipFollowup(log._id, {
                            mentorNote: e.target.value,
                            reviewedBy: sessionStorage.getItem("uid"),
                          })
                        }
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUpdateInternshipFollowup(log._id, { reviewedBy: sessionStorage.getItem("uid") })}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                )) : (
                  <Card className="border-border">
                    <CardContent className="py-10 text-center text-muted-foreground">No daily logs submitted yet.</CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="studyplan" className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Personalized Study Plan</h2>
                  <p className="text-sm text-muted-foreground">{internship.studyPlan?.summary || "Add curated resources for this internship."}</p>
                </div>
                <Button size="sm" onClick={() => setIsAddingResource(true)} disabled={isAddingResource}>
                  <Plus className="mr-2 h-4 w-4" /> Add Resource
                </Button>
              </div>

              {isAddingResource && (
                <Card className="border-border bg-muted/30 p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Resource Title</Label>
                        <Input value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Resource URL</Label>
                        <Input value={newResource.url} onChange={(e) => setNewResource({ ...newResource, url: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsAddingResource(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleAddResource}>Add Resource</Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="grid gap-2">
                {internship.studyPlan?.resources?.length ? internship.studyPlan.resources.map((resource: any, index: number) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{resource.title}</span>
                    </div>
                    <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      View Resource <ExternalLink className="inline h-3 w-3" />
                    </a>
                  </div>
                )) : (
                  <Card className="border-border">
                    <CardContent className="py-10 text-center text-muted-foreground">No resources added yet.</CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgInternshipDetails;
