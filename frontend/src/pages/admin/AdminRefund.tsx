import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { serverURL } from "@/constants";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { MinimalTiptapEditor } from "../../minimal-tiptap";

const AdminRefund = () => {
  const [value, setValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ✅ LOAD from MongoDB
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/policies`);
        setValue(response.data?.refund || "");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load refund policy",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchPolicy();
  }, []);

  // ✅ SAVE to MongoDB
  const saveRefund = async () => {
    setIsLoading(true);

    try {
      await axios.put(`${serverURL}/api/policies`, {
        refund: value,
      });

      toast({
        title: "Success",
        description: "Refund Policy saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save refund policy",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Refund Policy
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your refund policy content
          </p>
        </div>

        <Button onClick={saveRefund} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Edit Refund Policy</CardTitle>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <p>Loading refund policy...</p>
          ) : (
            <MinimalTiptapEditor
              value={value}
              onChange={setValue}
              output="html"
              placeholder="Start writing Refund Policy..."
              editable
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRefund;
