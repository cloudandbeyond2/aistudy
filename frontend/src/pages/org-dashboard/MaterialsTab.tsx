import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import { Badge } from "@/components/ui/badge";
import { 
  Plus, FileText, Download, ExternalLink, Trash2, BookOpen, 
  Link, Presentation, Video, Users, Sparkles, Clock, Eye,
  FolderOpen, Grid3x3, List, Search, Filter, X, CheckCircle,
  ArrowUpRight, FileSymlink, GraduationCap, Library, Pencil,
} from 'lucide-react';
import Swal from 'sweetalert2';

const MaterialsTab = () => {
  const [openMaterialDialog, setOpenMaterialDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [editMaterial, setEditMaterial] = useState(null);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [existingPdfFile, setExistingPdfFile] = useState<string | null>(null);
  
  const role = sessionStorage.getItem('role');
  const deptId = sessionStorage.getItem('deptId');
  const deptName = sessionStorage.getItem('deptName') || '';
  const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');
  const { toast } = useToast();

  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    fileUrl: '',
    file: null,
    type: 'PDF',
    department: role === 'dept_admin' ? deptId || '' : ''
  });

  // Helper function to resolve material URL
  const resolveMaterialUrl = (fileUrl) => {
    const trimmed = String(fileUrl || '').trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('/')) return `${serverURL}${trimmed}`;
    return `${serverURL}/${trimmed}`;
  };

  const matchesDepartmentScope = (materialDepartment: any, materialDepartmentId?: any) => {
    const normalizedDepartment = typeof materialDepartment === 'string'
      ? materialDepartment
      : materialDepartment?._id || materialDepartment?.name || '';
    const normalizedDepartmentId = typeof materialDepartmentId === 'string'
      ? materialDepartmentId
      : materialDepartmentId?._id || materialDepartmentId?.name || '';

    return Boolean(
      (deptId && (normalizedDepartment === deptId || normalizedDepartmentId === deptId)) ||
      (deptName && (normalizedDepartment === deptName || normalizedDepartmentId === deptName))
    );
  };

  // Fetch materials
  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/org/materials?organizationId=${orgId}`);
      if (res.data.success) {
        let materialsData = res.data.materials;
        if (role === 'dept_admin') {
          materialsData = materialsData.filter((m: any) => 
            matchesDepartmentScope(m.department, m.departmentId)
          );
        }
        setMaterials(materialsData);
      }
    } catch (e) {
      console.error("Failed to fetch materials", e);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/org/departments?organizationId=${orgId}`);
      if (res.data.success) setDepartmentsList(res.data.departments);
    } catch (e) {
      console.error("Failed to fetch departments", e);
    }
  };

  useEffect(() => {
    if (orgId) {
      fetchMaterials();
      fetchDepartments();
    }
  }, [orgId]);

  useEffect(() => {
    if (role === 'dept_admin' && deptId) {
      setNewMaterial((prev) => ({
        ...prev,
        department: deptId
      }));
    }
  }, [role, deptId]);

  useEffect(() => {
    if (role !== 'dept_admin' || !departmentsList.length) return;

    const resolvedDepartment = departmentsList.find((department: any) =>
      department._id === deptId ||
      department.name === deptId ||
      department.name === deptName
    );

    if (resolvedDepartment?._id) {
      setNewMaterial((prev) => ({
        ...prev,
        department: resolvedDepartment._id
      }));
    }
  }, [role, deptId, deptName, departmentsList]);

  const handleCreateMaterial = async () => {
    try {
      let res;
      const scopedDepartment = role === 'dept_admin' ? deptId || newMaterial.department : newMaterial.department;

      if (editMaterial) {
        // ✏️ UPDATE
        res = await axios.put(
          `${serverURL}/api/org/material/${editMaterial._id}`,
          { ...newMaterial, department: scopedDepartment, organizationId: orgId }
        );

        if (res.data.success) {
          toast({ title: "Updated", description: "Material updated successfully" });
        }

      } else {
        // ➕ CREATE
        if (newMaterial.type === 'PDF' && newMaterial.file) {
          const formData = new FormData();
          formData.append('title', newMaterial.title);
          formData.append('description', newMaterial.description);
          formData.append('type', newMaterial.type);
          formData.append('department', scopedDepartment);
          formData.append('organizationId', orgId);
          formData.append('file', newMaterial.file);

          res = await axios.post(`${serverURL}/api/org/material/create`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          res = await axios.post(`${serverURL}/api/org/material/create`, {
            ...newMaterial,
            department: scopedDepartment,
            organizationId: orgId,
          });
        }

        if (res.data.success) {
          toast({ title: "Created", description: "Material added successfully" });
        }
      }

      // 🔥 RESET
      setEditMaterial(null);
      setExistingPdfFile(null);

      setNewMaterial({
        title: '',
        description: '',
        fileUrl: '',
        file: null,
        type: 'PDF',
        department: role === 'dept_admin' ? deptId || '' : ''
      });

      setOpenMaterialDialog(false);
      fetchMaterials();

    } catch (e) {
      toast({ title: "Error", description: "Operation failed" });
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete this material?',
      text: "This action cannot be undone",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'No',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(`${serverURL}/api/org/material/${id}`);
      if (res.data.success) {
        Swal.fire('Deleted!', 'Material deleted successfully.', 'success');
        fetchMaterials();
      }
    } catch (e) {
      Swal.fire('Error!', 'Failed to delete material.', 'error');
    }
  };

  const handleEditMaterial = (material) => {
    setEditMaterial(material);
    
    // Store the existing PDF URL for display - ensure it has the server URL prefix
    if (material.type === 'PDF' && material.fileUrl) {
      const pdfUrl = resolveMaterialUrl(material.fileUrl);
      setExistingPdfFile(pdfUrl);
    } else {
      setExistingPdfFile(null);
    }

    setNewMaterial({
      title: material.title,
      description: material.description || '',
      fileUrl: material.fileUrl || '',
      file: null, // don't prefill file
      type: material.type,
      department: role === 'dept_admin' ? deptId || material.department || '' : material.department || ''
    });

    setOpenMaterialDialog(true);
  };

  const handleViewMaterial = (material) => {
    setViewingMaterial(material);
    setOpenViewDialog(true);
  };

  // Get icon based on material type
  const getMaterialIcon = (type: string) => {
    switch(type) {
      case 'PDF': return <FileText className="w-5 h-5 md:w-6 md:h-6" />;
      case 'Link': return <Link className="w-5 h-5 md:w-6 md:h-6" />;
      case 'Slide': return <Presentation className="w-5 h-5 md:w-6 md:h-6" />;
      case 'Video': return <Video className="w-5 h-5 md:w-6 md:h-6" />;
      default: return <FileText className="w-5 h-5 md:w-6 md:h-6" />;
    }
  };

  // Get type badge color
  const getTypeBadgeStyle = (type: string) => {
    switch(type) {
      case 'PDF': return 'bg-primary/12 text-primary';
      case 'Link': return 'bg-accent/15 text-accent-foreground dark:text-foreground';
      case 'Slide': return 'bg-secondary/15 text-secondary-foreground';
      case 'Video': return 'bg-primary/18 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Filter materials
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  // Stats
  const totalMaterials = materials.length;
  const pdfCount = materials.filter(m => m.type === 'PDF').length;
  const linkCount = materials.filter(m => m.type === 'Link').length;
  const recentCount = materials.filter(m => {
    if (!m.createdAt) return false;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(m.createdAt) >= weekAgo;
  }).length;

  return (
    <div className="container space-y-4 md:space-y-5 lg:space-y-6 p-3 md:p-5 lg:p-6  pt-0 lg:pt-[60px]">
      {/* Hero Section with Gradient */}
      <div className="relative rounded-xl md:rounded-2xl overflow-hidden bg-brand-gradient">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-4 md:px-6 lg:px-8 py-5 md:py-7 lg:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="bg-white/20 p-1.5 md:p-2 rounded-lg md:rounded-xl backdrop-blur-sm">
                  <Library className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white">Resource Library</h1>
              </div>
              <p className="text-white/90 text-xs md:text-sm lg:text-base max-w-2xl leading-relaxed">
                Share documents, PDF notes, presentations, and useful links with your students.
                Organize learning resources in one centralized hub.
              </p>
            </div>
            
            <Dialog open={openMaterialDialog} onOpenChange={setOpenMaterialDialog}>
              <DialogTrigger asChild>
                <Button className="bg-background text-foreground hover:bg-background/90 shadow-lg text-sm md:text-base px-4 md:px-5 lg:px-6 py-2 md:py-2.5 whitespace-nowrap w-full md:w-auto">
                  <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl md:text-2xl font-bold">
                    <span className="text-brand-gradient">
                      {editMaterial ? "Edit Study Material" : "Add Study Material"}
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-sm md:text-base">
                    {editMaterial ? "Update your educational resource" : "Share educational resources with your students"}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 md:gap-5 py-4">
                  {/* Material Title */}
                  <div className="grid gap-2">
                    <Label className="text-sm md:text-base font-semibold">Resource Title *</Label>
                    <Input 
                      value={newMaterial.title} 
                      onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })} 
                      placeholder="e.g., Python Programming Complete Notes"
                      className="text-sm md:text-base h-10 md:h-11"
                    />
                  </div>
                  
                  {/* Material Type */}
                  <div className="grid gap-2">
                    <Label className="text-sm md:text-base font-semibold">Resource Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['PDF', 'Link', 'Slide', 'Video'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setNewMaterial({ ...newMaterial, type })}
                          className={`flex items-center justify-center gap-2 p-2 md:p-3 rounded-lg border-2 transition-all ${
                            newMaterial.type === type 
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {type === 'PDF' && <FileText className="w-4 h-4 md:w-5 md:h-5" />}
                          {type === 'Link' && <Link className="w-4 h-4 md:w-5 md:h-5" />}
                          {type === 'Slide' && <Presentation className="w-4 h-4 md:w-5 md:h-5" />}
                          {type === 'Video' && <Video className="w-4 h-4 md:w-5 md:h-5" />}
                          <span className="text-xs md:text-sm font-medium">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* File/Link Input */}
                  <div className="grid gap-2">
                    <Label className="text-sm md:text-base font-semibold">
                      {newMaterial.type === 'PDF' ? 'Upload PDF File' : 'Resource Link / URL'}
                    </Label>
                    {newMaterial.type === 'PDF' ? (
                      <div className="border-2 border-dashed border-border rounded-lg p-4 md:p-6 text-center hover:border-primary transition-all">
                        {editMaterial && existingPdfFile && !newMaterial.file && (
                          <div className="mb-3 p-2 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Current PDF:</p>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const fileUrl = resolveMaterialUrl(existingPdfFile);
                                if (fileUrl) window.open(fileUrl, '_blank', 'noopener,noreferrer');
                              }}
                              className="text-sm text-primary hover:underline flex items-center gap-1 justify-center w-full"
                            >
                              <FileText className="w-3 h-3" />
                              View existing PDF
                            </button>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={(e: any) => {
                            setNewMaterial({ ...newMaterial, file: e.target.files[0] });
                            if (editMaterial) setExistingPdfFile(null);
                          }}
                          className="cursor-pointer text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          {editMaterial ? "Leave empty to keep existing PDF, or upload a new one" : "Supported: PDF (Max 10MB)"}
                        </p>
                      </div>
                    ) : (
                      <Input
                        value={newMaterial.fileUrl}
                        onChange={(e) => setNewMaterial({ ...newMaterial, fileUrl: e.target.value })}
                        placeholder="https://example.com/resource"
                        className="text-sm md:text-base h-10 md:h-11"
                      />
                    )}
                  </div>
                  
                  {/* Description */}
                  <div className="grid gap-2">
                    <Label className="text-sm md:text-base font-semibold">Description (Optional)</Label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                      placeholder="Brief description of this resource..."
                    />
                  </div>
                  
                  {/* Department */}
                  <div className="grid gap-2">
                    <Label className="text-sm md:text-base font-semibold">Department (Optional)</Label>
                    <select
                      className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:text-base"
                      value={newMaterial.department}
                      onChange={(e) => setNewMaterial({ ...newMaterial, department: e.target.value })}
                      disabled={role === 'dept_admin'}
                    >
                      {role !== 'dept_admin' && <option value="">📚 All Students</option>}
                      {departmentsList.map((d: any) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => {
                        setEditMaterial(null);
                        setExistingPdfFile(null);
                        setNewMaterial({
                          title: '',
                          description: '',
                          fileUrl: '',
                          file: null,
                          type: 'PDF',
                          department: role === 'dept_admin' ? deptId || '' : ''
                        });
                        setOpenMaterialDialog(false);
                      }} 
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateMaterial} 
                      className="flex-1 bg-brand-gradient text-primary-foreground hover:opacity-95"
                    >
                      <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      {editMaterial ? "Update Resource" : "Publish Resource"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* View Material Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <span className="text-brand-gradient">Resource Details</span>
            </DialogTitle>
            <DialogDescription>
              View complete information about this study material
            </DialogDescription>
          </DialogHeader>
          
          {viewingMaterial && (
            <div className="space-y-4 md:space-y-5">
              {/* Type Badge */}
              <div className="flex justify-center">
                <Badge className={`${getTypeBadgeStyle(viewingMaterial.type)} border-0 text-sm px-3 py-1`}>
                  {getMaterialIcon(viewingMaterial.type)}
                  <span className="ml-2">{viewingMaterial.type}</span>
                </Badge>
              </div>
              
              {/* Title */}
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold mb-2">{viewingMaterial.title}</h2>
                {viewingMaterial.department && (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Users className="w-4 h-4" />
                    {departmentsList.find(d => d._id === viewingMaterial.department || d.name === viewingMaterial.department)?.name || viewingMaterial.department}
                  </p>
                )}
              </div>
              
              {/* Description */}
              {viewingMaterial.description && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Description
                  </h3>
                  <p className="text-sm leading-relaxed">{viewingMaterial.description}</p>
                </div>
              )}
              
              {/* Resource Preview/Content */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/20 px-4 py-3 border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Resource Content
                  </h3>
                </div>
                <div className="p-4">
                  {viewingMaterial.type === 'PDF' ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">PDF Document - Click below to view or download</p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const fileUrl = resolveMaterialUrl(viewingMaterial.fileUrl);
                            if (fileUrl) window.open(fileUrl, '_blank', 'noopener,noreferrer');
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View PDF
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const fileUrl = resolveMaterialUrl(viewingMaterial.fileUrl);
                            if (fileUrl) {
                              const link = document.createElement('a');
                              link.href = fileUrl;
                              link.download = viewingMaterial.title || 'document.pdf';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm break-all">
                        <span className="font-semibold">URL: </span>
                        <a 
                          href={viewingMaterial.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {viewingMaterial.fileUrl}
                        </a>
                      </p>
                      <div className="flex justify-center">
                        <a 
                          href={viewingMaterial.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open Resource
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {viewingMaterial.createdAt && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">Created</p>
                    <p className="font-medium">{new Date(viewingMaterial.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
                {viewingMaterial.updatedAt && viewingMaterial.updatedAt !== viewingMaterial.createdAt && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">Last Updated</p>
                    <p className="font-medium">{new Date(viewingMaterial.updatedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats Cards - Column Based Responsive Grid */}
     <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
  {/* Card 1 - Total Resources */}
  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
    <CardContent className="p-3 md:p-4 lg:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mb-0.5 md:mb-1">Total Resources</p>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
            <span className="text-brand-gradient">
              {totalMaterials}
            </span>
          </p>
        </div>
        <div className="bg-brand-gradient p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl text-primary-foreground shadow-lg">
          <Library className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Card 2 - PDF Documents */}
  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
    <CardContent className="p-3 md:p-4 lg:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mb-0.5 md:mb-1">PDF Documents</p>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
            <span className="text-brand-gradient">
              {pdfCount}
            </span>
          </p>
        </div>
        <div className="bg-brand-gradient p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl text-primary-foreground shadow-lg">
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Card 3 - External Links */}
  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
    <CardContent className="p-3 md:p-4 lg:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mb-0.5 md:mb-1">External Links</p>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
            <span className="text-brand-gradient">
              {linkCount}
            </span>
          </p>
        </div>
        <div className="bg-brand-gradient p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl text-primary-foreground shadow-lg">
          <Link className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Card 4 - New This Week */}
  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
    <CardContent className="p-3 md:p-4 lg:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mb-0.5 md:mb-1">New This Week</p>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
            <span className="text-brand-gradient">
              {recentCount}
            </span>
          </p>
        </div>
        <div className="bg-brand-gradient p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl text-primary-foreground shadow-lg">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
        </div>
      </div>
    </CardContent>
  </Card>
</div>

      {/* Main Content Card */}
      <Card className="border-0 shadow-xl overflow-hidden">
        {/* Search and Filter Bar */}
        <div className="border-b bg-muted/20 p-3 md:p-4 lg:p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div>
              <CardTitle className="text-sm md:text-base lg:text-lg xl:text-xl flex items-center gap-1.5 md:gap-2">
                <FolderOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                Resource Library
              </CardTitle>
              <CardDescription className="text-[10px] md:text-xs lg:text-sm">
                Browse and manage all study materials and resources
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 md:p-1.5 rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-background shadow-sm' : ''
                  }`}
                >
                  <Grid3x3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 md:p-1.5 rounded-md transition-all ${
                    viewMode === 'list' ? 'bg-background shadow-sm' : ''
                  }`}
                >
                  <List className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative flex-1 md:flex-none min-w-[120px]">
                <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 md:pl-9 w-full md:w-36 lg:w-44 xl:w-48 text-xs md:text-sm h-8 md:h-9 lg:h-10"
                />
              </div>
              
              {/* Filter Dropdown */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-8 md:h-9 lg:h-10 px-2 md:px-3 rounded-md border border-input bg-background text-xs md:text-sm"
              >
                <option value="all">All Types</option>
                <option value="PDF">PDF</option>
                <option value="Link">Link</option>
                <option value="Slide">Slide</option>
                <option value="Video">Video</option>
              </select>
            </div>
          </div>
        </div>

        <CardContent className="p-3 md:p-4 lg:p-5 xl:p-6">
          {filteredMaterials.length > 0 ? (
            viewMode === 'grid' ? (
              /* Grid View - Column Based Responsive Layout */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
                {filteredMaterials.map((m: any) => (
                  <div 
                    key={m._id} 
                    className="group relative bg-card rounded-xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Gradient Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 md:h-1 bg-brand-gradient"></div>
                    
                    <div className="p-3 md:p-4 lg:p-5">
                      {/* Header with Icon and Type */}
                      <div className="flex items-start justify-between mb-2 md:mb-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-brand-gradient rounded-lg opacity-10 group-hover:opacity-20 transition-opacity"></div>
                          <div className="relative p-1.5 md:p-2 lg:p-2.5 bg-brand-gradient-soft rounded-lg text-primary">
                            {getMaterialIcon(m.type)}
                          </div>
                        </div>
                        <Badge className={`${getTypeBadgeStyle(m.type)} border-0 text-[9px] md:text-[10px] lg:text-xs font-medium px-1.5 md:px-2 py-0.5`}>
                          {m.type}
                        </Badge>
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-semibold text-xs md:text-sm lg:text-base mb-1.5 md:mb-2 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem] lg:min-h-[3rem]">
                        {m.title}
                      </h3>
                      
                      {/* Description Preview */}
                      {m.description && (
                        <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground mb-2 md:mb-3 line-clamp-2">
                          {m.description}
                        </p>
                      )}
                      
                      {/* Department Info */}
                      <p className="text-[9px] md:text-[10px] lg:text-xs text-muted-foreground mb-2 md:mb-3 flex items-center gap-0.5 md:gap-1">
                        <Users className="w-2 h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3" />
                        {m.department ? (departmentsList.find(d => d._id === m.department || d.name === m.department)?.name || m.department) : 'All Students'}
                      </p>
                 
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2 md:pt-3 border-t">
                        {/* LEFT: VIEW */}
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          className="inline-flex items-center gap-0.5 md:gap-1 text-[9px] md:text-[10px] lg:text-xs text-primary hover:text-accent transition-colors font-medium p-0 h-auto"
                          onClick={() => handleViewMaterial(m)}
                        >
                          <Eye className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                          View Details
                        </Button> */}

                        {/* RIGHT: GROUPED BUTTONS */}
                        <div className="flex items-center gap-2">
                          {/* OPEN PDF (for quick access) */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-brand-gradient-soft text-primary hover:bg-brand-gradient hover:text-primary-foreground shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const fileUrl = resolveMaterialUrl(m.fileUrl);
                              if (fileUrl) window.open(fileUrl, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                          </Button>

                          {/* ✏️ EDIT */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-brand-gradient-soft text-primary hover:bg-brand-gradient hover:text-primary-foreground shadow-sm"
                            onClick={() => handleEditMaterial(m)}
                          >
                            <Pencil className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                          </Button>

                          {/* 🗑️ DELETE */}
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                            onClick={() => handleDeleteMaterial(m._id)}
                          >
                            <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View - Table Layout */
              <div className="space-y-1.5 md:space-y-2">
                {filteredMaterials.map((m: any) => (
                  <div 
                    key={m._id} 
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-2.5 md:p-3 lg:p-4 rounded-lg border border-border hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-2 md:gap-3 lg:gap-4 flex-1 min-w-0">
                      <div className="bg-brand-gradient-soft p-1.5 md:p-2 rounded-lg text-primary">
                        {getMaterialIcon(m.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
                          <p className="font-semibold text-xs md:text-sm lg:text-base truncate">{m.title}</p>
                          <Badge className={`${getTypeBadgeStyle(m.type)} border-0 text-[8px] md:text-[9px] lg:text-[10px] px-1.5 py-0`}>
                            {m.type}
                          </Badge>
                        </div>
                        {m.description && (
                          <p className="text-[9px] md:text-[10px] lg:text-xs text-muted-foreground truncate">{m.description}</p>
                        )}
                        <p className="text-[8px] md:text-[9px] lg:text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                          <Users className="w-2 h-2 md:w-2.5 md:h-2.5" />
                          {m.department ? (departmentsList.find(d => d._id === m.department || d.name === m.department)?.name || m.department) : 'All Students'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-4">
                      {/* 👁️ VIEW */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary hover:text-primary/80"
                        onClick={() => handleViewMaterial(m)}
                      >
                        <Eye className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                      </Button>

                      {/* OPEN (for quick access) */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary hover:text-primary/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          const fileUrl = resolveMaterialUrl(m.fileUrl);
                          if (fileUrl) window.open(fileUrl, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                      </Button>

                      {/* ✏️ EDIT */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary hover:text-primary/80"
                        onClick={() => handleEditMaterial(m)}
                      >
                        <Pencil className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                      </Button>

                      {/* 🗑️ DELETE */}
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-destructive hover:text-destructive/80"
                        onClick={() => handleDeleteMaterial(m._id)}
                      >
                        <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Empty State */
            <div className="py-8 md:py-10 lg:py-12 xl:py-16 text-center border-2 border-dashed rounded-xl bg-muted/10">
              <div className="flex flex-col items-center gap-2 md:gap-3 lg:gap-4">
                <div className="bg-brand-gradient p-2.5 md:p-3 lg:p-4 rounded-full shadow-lg">
                  <Library className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-primary-foreground" />
                </div>
                <h3 className="text-sm md:text-base lg:text-xl font-semibold">No Resources Found</h3>
                <p className="text-xs md:text-sm lg:text-base text-muted-foreground max-w-md px-3 md:px-4">
                  {searchQuery || filterType !== 'all' 
                    ? "No resources match your search criteria. Try adjusting your filters."
                    : "Share your first study material. Click the button above to add PDFs, links, or other resources."}
                </p>
                {!searchQuery && filterType === 'all' && (
                  <Button 
                    onClick={() => setOpenMaterialDialog(true)}
                    className="bg-brand-gradient text-primary-foreground hover:opacity-95 text-xs md:text-sm lg:text-base mt-1 md:mt-2"
                  >
                    <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                    Add Your First Resource
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialsTab;