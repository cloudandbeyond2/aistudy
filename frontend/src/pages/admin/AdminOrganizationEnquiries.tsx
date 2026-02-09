import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  DialogDescription,
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

const AdminOrganizationEnquiries = () => {
  const { toast } = useToast();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [status, setStatus] = useState("new");

  /* ================= FETCH ================= */
  useEffect(() => {
    async function fetchEnquiries() {
      try {
        const res = await axios.get(
          `${serverURL}/api/organization-enquiries`
        );
        setData(res.data);
      } catch (err) {
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

  /* ================= ACTIONS ================= */
  const openDialog = (item: any) => {
    setSelected(item);
    setStatus(item.status);
    setOpen(true);
  };

  const updateStatus = async () => {
    try {
      await axios.put(
        `${serverURL}/api/organization-enquiries/${selected._id}`,
        { status }
      );

      toast({
        title: "Updated",
        description: "Status updated successfully",
      });

      setData((prev) =>
        prev.map((item) =>
          item._id === selected._id
            ? { ...item, status }
            : item
        )
      );

      setOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Organization Enquiries
      </h1>

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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ) : filtered.length ? (
                filtered.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      {item.organizationName}
                    </TableCell>
                    <TableCell>
                      {item.contactPerson}
                    </TableCell>
                    <TableCell>
                      <Badge>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          openDialog(item)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center"
                  >
                    No enquiries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ================= DIALOG ================= */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Organization Enquiry
            </DialogTitle>
            <DialogDescription>
              Review enquiry details
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="grid gap-4">
              <Input value={selected.organizationName} disabled />
              <Input value={selected.contactPerson} disabled />
              <Input value={selected.email} disabled />
              <Input value={selected.phone} disabled />
              <Input value={selected.teamSize} disabled />
              <Textarea value={selected.message} disabled />

              <Select
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">
                    Contacted
                  </SelectItem>
                  <SelectItem value="closed">
                    Closed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button onClick={updateStatus}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrganizationEnquiries;
