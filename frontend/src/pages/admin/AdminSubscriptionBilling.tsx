import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { serverURL } from "@/constants";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { MinimalTiptapEditor } from "../../minimal-tiptap";
import { Content } from "@tiptap/react";

const AdminSubscriptionBilling = () => {
  const [value, setValue] = useState<Content>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ✅ LOAD existing subscriptionBilling
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/policies`);
        setValue(response.data?.subscriptionBilling || "");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load Subscription & Billing policy",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchPolicy();
  }, []);

  // ✅ SAVE subscriptionBilling
  const saveBilling = async () => {
    setIsLoading(true);

    try {
      await axios.put(`${serverURL}/api/policies`, {
        subscriptionBilling: value,   // ✅ FIXED FIELD NAME
      });

      toast({
        title: "Success",
        description: "Subscription & Billing policy saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Subscription & Billing policy",
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
            Subscription & Billing Policy
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage subscription and billing policy content
          </p>
        </div>

        <Button onClick={saveBilling} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Edit Subscription & Billing Policy</CardTitle>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <p>Loading Subscription & Billing policy...</p>
          ) : (
            <MinimalTiptapEditor
              value={value}
              onChange={setValue}
              output="html"
              placeholder="Start writing Subscription & Billing Policy..."
              editable
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptionBilling;
