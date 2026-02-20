import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "@/constants";
import StyledText from "@/components/styledText";
import PolicyLayout from "@/components/PolicyLayout";
import { Cookie } from "lucide-react"; // ✅ ADD THIS

const Cookies = () => {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/policies`);
        setData(response.data?.cookies || "");
      } catch (error) {
        console.error("Failed to fetch cookies policy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCookies();
  }, []);

  return (
    <PolicyLayout
      title="Cookies Policy"
      effectiveDate="18 February 2026"
      icon={Cookie}   // ✅ REQUIRED FIX
    >
      {loading ? (
        <p className="text-center text-muted-foreground">
          Loading Cookies Policy...
        </p>
      ) : data ? (
        <StyledText text={data} />
      ) : (
        <p>No cookies policy available.</p>
      )}
    </PolicyLayout>
  );
};

export default Cookies;
