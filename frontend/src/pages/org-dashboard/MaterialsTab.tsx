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
  ArrowUpRight, FileSymlink, GraduationCap, Library
} from 'lucide-react';
import Swal from 'sweetalert2';
// Gradient color style
const gradientBg = {
  background: 'linear-gradient(90deg, #1b253f 0%, #2d3a8c 30%, #4b3bb0 65%, #6b2cc1 100%)'
};

const gradientBgVertical = {
  background: 'linear-gradient(135deg, #1b253f 0%, #2d3a8c 30%, #4b3bb0 65%, #6b2cc1 100%)'
};

const MaterialsTab = () => {
  const [openMaterialDialog, setOpenMaterialDialog] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const role = sessionStorage.getItem('role');
  const deptId = sessionStorage.getItem('deptId');
  const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');
  const { toast } = useToast();

  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    fileUrl: '',
    file: null,
    type: 'PDF',
    department: ''
  });

  // Fetch materials
  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/org/materials?organizationId=${orgId}`);
      if (res.data.success) {
        let materialsData = res.data.materials;
        if (role === 'dept_admin') {
          materialsData = materialsData.filter((m: any) => 
            m.department === deptId || m.departmentId === deptId
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

  const handleCreateMaterial = async () => {
    try {
      let res;
      if (newMaterial.type === 'PDF' && newMaterial.file) {
        const formData = new FormData();
        formData.append('title', newMaterial.title);
        formData.append('description', newMaterial.description);
        formData.append('type', newMaterial.type);
        formData.append('department', newMaterial.department);
        formData.append('organizationId', orgId);
        formData.append('file', newMaterial.file);
        res = await axios.post(`${serverURL}/api/org/material/create`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await axios.post(`${serverURL}/api/org/material/create`, {
          ...newMaterial,
          organizationId: orgId,
        });
      }

      if (res.data.success) {
        toast({ title: "Success", description: "Material added successfully" });
        setNewMaterial({
          title: '',
          description: '',
          fileUrl: '',
          file: null,
          type: 'PDF',
          department: ''
        });
        setOpenMaterialDialog(false);
        fetchMaterials();
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to add material" });
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
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
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
      case 'PDF': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'Link': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Slide': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Video': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700';
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
    <div className="space-y-4 md:space-y-5 lg:space-y-6 p-3 md:p-5 lg:p-6 ">
      {/* Hero Section with Gradient */}
      <div className="relative rounded-xl md:rounded-2xl overflow-hidden" style={gradientBg}>
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
                <Button className="bg-white text-[#1b253f] hover:bg-white/90 shadow-lg text-sm md:text-base px-4 md:px-5 lg:px-6 py-2 md:py-2.5 whitespace-nowrap w-full md:w-auto">
                  <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl md:text-2xl font-bold">
                    <span className="bg-gradient-to-r from-[#1b253f] to-[#6b2cc1] bg-clip-text text-transparent">
                      Add Study Material
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-sm md:text-base">
                    Share educational resources with your students
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
                              ? 'border-[#6b2cc1] bg-[#6b2cc1]/10' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-[#6b2cc1]/50'
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
                      <div className="border-2 border-dashed rounded-lg p-4 md:p-6 text-center hover:border-[#6b2cc1] transition-all">
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={(e: any) => setNewMaterial({ ...newMaterial, file: e.target.files[0] })}
                          className="cursor-pointer text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">Supported: PDF (Max 10MB)</p>
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
                  
                  <Button 
                    onClick={handleCreateMaterial} 
                    className="w-full h-10 md:h-11 text-sm md:text-base font-semibold"
                    style={gradientBg}
                  >
                    <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Publish Resource
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards - Column Based Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Card 1 - Total Resources */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 md:p-4 lg:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mb-0.5 md:mb-1">Total Resources</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                  <span className="bg-gradient-to-r from-[#1b253f] to-[#6b2cc1] bg-clip-text text-transparent">
                    {totalMaterials}
                  </span>
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#1b253f] to-[#2d3a8c] p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl text-white shadow-lg">
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
                  <span className="bg-gradient-to-r from-[#2d3a8c] to-[#4b3bb0] bg-clip-text text-transparent">
                    {pdfCount}
                  </span>
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#2d3a8c] to-[#4b3bb0] p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl text-white shadow-lg">
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
                  <span className="bg-gradient-to-r from-[#4b3bb0] to-[#6b2cc1] bg-clip-text text-transparent">
                    {linkCount}
                  </span>
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#4b3bb0] to-[#6b2cc1] p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl text-white shadow-lg">
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
                  <span className="bg-gradient-to-r from-[#6b2cc1] to-[#4b3bb0] bg-clip-text text-transparent">
                    {recentCount}
                  </span>
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#6b2cc1] to-[#4b3bb0] p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl text-white shadow-lg">
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
                <FolderOpen className="w-4 h-4 md:w-5 md:h-5 text-[#6b2cc1]" />
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
                    viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''
                  }`}
                >
                  <Grid3x3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 md:p-1.5 rounded-md transition-all ${
                    viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''
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
                    className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Gradient Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 md:h-1" style={gradientBg}></div>
                    
                    <div className="p-3 md:p-4 lg:p-5">
                      {/* Header with Icon and Type */}
                      <div className="flex items-start justify-between mb-2 md:mb-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#1b253f] to-[#6b2cc1] rounded-lg opacity-10 group-hover:opacity-20 transition-opacity"></div>
                          <div className="relative p-1.5 md:p-2 lg:p-2.5 bg-gradient-to-br from-[#1b253f]/10 to-[#6b2cc1]/10 rounded-lg">
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
                        <a 
                          href={m.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-0.5 md:gap-1 text-[9px] md:text-[10px] lg:text-xs text-[#6b2cc1] hover:text-[#4b3bb0] transition-colors font-medium"
                        >
                          {m.type === 'PDF' ? 'View PDF' : 'Open'}
                          <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5" />
                        </a>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          onClick={() => handleDeleteMaterial(m._id)}
                        >
                          <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                        </Button>
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
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-2.5 md:p-3 lg:p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-[#6b2cc1]/30 transition-all"
                  >
                    <div className="flex items-center gap-2 md:gap-3 lg:gap-4 flex-1 min-w-0">
                      <div className="bg-gradient-to-br from-[#1b253f]/10 to-[#6b2cc1]/10 p-1.5 md:p-2 rounded-lg">
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
                    <div className="flex items-center gap-1 mt-2 sm:mt-0 sm:ml-4">
                      <a 
                        href={m.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-1.5 md:p-2 hover:text-[#6b2cc1] transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                      </a>
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
                <div className="bg-gradient-to-br from-[#1b253f] to-[#6b2cc1] p-2.5 md:p-3 lg:p-4 rounded-full shadow-lg">
                  <Library className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-white" />
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
                    style={gradientBg}
                    className="text-white text-xs md:text-sm lg:text-base mt-1 md:mt-2"
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