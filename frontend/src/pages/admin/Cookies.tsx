import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie } from "lucide-react";
import { serverURL } from "@/constants";
import axios from "axios";
import StyledText from "@/components/styledText";

const Cookies = () => {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCookiesPolicy() {
      try {
        const response = await axios.get(`${serverURL}/api/policies`);

        const policyDoc = response.data.find(
          (item: any) => item.cookies && item.cookies.trim() !== ""
        );

        setData(policyDoc?.cookies || "");
      } catch (error) {
        console.error("Failed to fetch cookies policy:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCookiesPolicy();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">

        {/* Back to Home */}
        <div className="mb-10">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <Cookie className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold">Cookies Policy</h1>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {loading ? (
            <p>Loading cookies policy…</p>
          ) : data ? (
            <StyledText text={data} />
          ) : (
            <p>No cookies policy available.</p>
          )}
        </div>

        {/* Contact */}
        <div className="text-center mt-16">
          <Button asChild>
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>

      </div>
    </div>
  );
};

export default Cookies;
