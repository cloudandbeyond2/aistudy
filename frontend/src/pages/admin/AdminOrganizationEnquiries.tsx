import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Search, Eye } from "lucide-react";
import { serverURL } from "@/constants";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 10;

const AdminOrganizationEnquiries = () => {
  const { toast } = useToast();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [status, setStatus] = useState("new");
  const [handledBy, setHandledBy] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "contacted":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "closed":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    async function fetchEnquiries() {
      try {
        const res = await axios.get(
          `${serverURL}/api/organization-enquiries`
        );
        setData(res.data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load enquiries",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchEnquiries();
  }, []);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    return data.filter((item) =>
      item.organizationName
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* ================= OPEN DIALOG ================= */
  const openDialog = (item: any) => {
    setSelected(item);
    setStatus(item.status);
    setHandledBy(item.handledBy || "");
    setOpen(true);
  };

  /* ================= UPDATE ================= */
  const updateStatus = async () => {
    try {
      await axios.put(
        `${serverURL}/api/organization-enquiries/${selected._id}`,
        { status, handledBy }
      );

      setData((prev) =>
        prev.map((item) =>
          item._id === selected._id
            ? { ...item, status, handledBy }
            : item
        )
      );

      toast({
        title: "Updated",
        description: "Enquiry updated successfully",
      });

      setOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Organization Enquiries</h1>

      <Card>
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>All Enquiries</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
<CardContent>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Organization</TableHead>
        <TableHead>Contact</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Refer By</TableHead>
        <TableHead>Handled By</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Action</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {loading ? (
        <TableRow>
          <TableCell colSpan={8}>
            <Skeleton className="h-6 w-full" />
          </TableCell>
        </TableRow>
      ) : paginatedData.length ? (
        paginatedData.map((item) => (
          <TableRow key={item._id}>
            <TableCell>{item.organizationName}</TableCell>
            <TableCell>{item.contactPerson}</TableCell>
            <TableCell>{item.phone || "—"}</TableCell>
            <TableCell>{item.email}</TableCell>
            <TableCell>{item.referBy || "—"}</TableCell>
            <TableCell>{item.handledBy || "—"}</TableCell>
            <TableCell>
              <Badge
                className={`capitalize border ${getStatusStyles(
                  item.status
                )}`}
              >
                {item.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => openDialog(item)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={8} className="text-center">
            No enquiries found
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>

  {/* ================= PAGINATION ================= */}
  {totalPages > 1 && (
    <div className="flex justify-between items-center mt-6">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => prev - 1)}
      >
        Previous
      </Button>

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((prev) => prev + 1)}
      >
        Next
      </Button>
    </div>
  )}
</CardContent>
      </Card>

      {/* ================= DIALOG ================= */}
   {/* ================= DIALOG ================= */}
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-2xl">
    {selected && (
      <>
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold">
            Organization Enquiry
          </DialogTitle>

          <Badge
            className={`capitalize border ${getStatusStyles(
              selected.status
            )}`}
          >
            {selected.status}
          </Badge>
        </DialogHeader>

        {/* ================= DETAILS SECTION ================= */}
        <div className="grid grid-cols-2 gap-6 mt-4">

          <div>
            <Label className="text-xs text-muted-foreground">
              Organization
            </Label>
            <div className="mt-1 bg-muted rounded-md px-3 py-2 text-sm">
              {selected.organizationName}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              Contact Person
            </Label>
            <div className="mt-1 bg-muted rounded-md px-3 py-2 text-sm">
              {selected.contactPerson}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              Email
            </Label>
            <div className="mt-1 bg-muted rounded-md px-3 py-2 text-sm">
              {selected.email}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              Phone
            </Label>
            <div className="mt-1 bg-muted rounded-md px-3 py-2 text-sm">
              {selected.phone || "—"}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              Team Size
            </Label>
            <div className="mt-1 bg-muted rounded-md px-3 py-2 text-sm">
              {selected.teamSize || "—"}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              Refer By
            </Label>
            <div className="mt-1 bg-muted rounded-md px-3 py-2 text-sm">
              {selected.referBy}
            </div>
          </div>

        </div>

        {/* ================= REQUIREMENT ================= */}
        <div className="mt-6">
          <Label className="text-xs text-muted-foreground">
            Requirement Details
          </Label>
          <div className="mt-1 bg-muted rounded-md px-4 py-3 text-sm whitespace-pre-wrap min-h-[80px]">
            {selected.message}
          </div>
        </div>

        {/* ================= UPDATE SECTION ================= */}
        <div className="border-t pt-6 mt-6 space-y-4">

          <div>
            <Label>Update Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Handled By</Label>
            <Input
              value={handledBy}
              onChange={(e) => setHandledBy(e.target.value)}
              placeholder="Enter admin name"
              className="mt-1"
            />
          </div>

        </div>

        <DialogFooter className="mt-6">
          <Button onClick={updateStatus} className="px-6">
            Save Changes
          </Button>
        </DialogFooter>
      </>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
};

export default AdminOrganizationEnquiries;