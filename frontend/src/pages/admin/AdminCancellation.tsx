import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { serverURL } from "@/constants";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { MinimalTiptapEditor } from "../../minimal-tiptap";

const AdminCancellation = () => {
  const [value, setValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ✅ LOAD from MongoDB
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/policies`);
        setValue(response.data?.cancellation || "");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load cancellation policy",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchPolicy();
  }, []);

  // ✅ SAVE to MongoDB
  const saveCancellation = async () => {
    setIsLoading(true);

    try {
      await axios.put(`${serverURL}/api/policies`, {
        cancellation: value,
      });

      toast({
        title: "Success",
        description: "Cancellation Policy saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save cancellation policy",
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
            Cancellation Policy
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your cancellation policy content
          </p>
        </div>

        <Button onClick={saveCancellation} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Edit Cancellation Policy</CardTitle>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <p>Loading cancellation policy...</p>
          ) : (
            <MinimalTiptapEditor
              value={value}
              onChange={setValue}
              output="html"
              placeholder="Start writing Cancellation Policy..."
              editable
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCancellation;
