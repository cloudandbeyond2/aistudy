import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { serverURL } from "@/constants";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { MinimalTiptapEditor } from "../../minimal-tiptap";
import { Content } from "@tiptap/react";


const AdminCookies = () => {
  const [value, setValue] = useState<Content>(
    sessionStorage.getItem("cookies") || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  async function saveCookies() {
    setIsLoading(true);
    try {
      const postURL = serverURL + "/api/saveadmin";
      const response = await axios.post(postURL, {
        data: value,
        type: "cookies",
      });

      if (response.data.success) {
        sessionStorage.setItem("cookies", String(value));
        toast({
          title: "Saved",
          description: "Cookies Policy saved successfully",
        });
      } else {
        throw new Error("Save failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Cookies Policy
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your cookies policy content
          </p>
        </div>

        <Button onClick={saveCookies} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Edit Cookies Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <MinimalTiptapEditor
            value={value}
            onChange={setValue}
            output="html"
            placeholder="Start writing Cookies Policy."
            autofocus
            editable
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCookies;
