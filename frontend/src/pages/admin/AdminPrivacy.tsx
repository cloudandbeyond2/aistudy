import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { serverURL } from "@/constants";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { MinimalTiptapEditor } from "../../minimal-tiptap";

const AdminPrivacy = () => {
  const [value, setValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ✅ LOAD existing privacy from DB
  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/policies`);
        setValue(response.data?.privacy || "");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load privacy policy",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchPrivacy();
  }, []);

  // ✅ SAVE updated privacy to DB
  const savePrivacy = async () => {
    setIsLoading(true);

    try {
      await axios.put(`${serverURL}/api/policies`, {
        privacy: value,
      });

      toast({
        title: "Success",
        description: "Privacy policy saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save privacy policy",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your privacy policy content
          </p>
        </div>

        <Button onClick={savePrivacy} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Editor */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Edit Privacy Policy</CardTitle>
        </CardHeader>

        <CardContent>
          {isFetching ? (
            <p className="text-muted-foreground">
              Loading privacy policy...
            </p>
          ) : (
            <MinimalTiptapEditor
              value={value}
              onChange={setValue}
              output="html"
              placeholder="Start writing Privacy Policy..."
              editable
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPrivacy;
