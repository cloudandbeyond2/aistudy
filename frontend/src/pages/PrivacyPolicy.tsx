import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "@/constants";
import StyledText from "@/components/styledText";
import PolicyLayout from "@/components/PolicyLayout";
import { Shield } from "lucide-react"; // ✅ ADD THIS

const PrivacyPolicy = () => {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/policies`);
        setData(response.data?.privacy || "");
      } catch (error) {
        console.error("Failed to fetch privacy policy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacy();
  }, []);

  return (
    <PolicyLayout
      title="Privacy Policy"
      effectiveDate="18 February 2026"
      icon={Shield}   // ✅ REQUIRED NOW
    >
      {loading ? (
        <p className="text-center text-muted-foreground">
          Loading Privacy Policy...
        </p>
      ) : (
        <StyledText text={data} />
      )}
    </PolicyLayout>
  );
};

export default PrivacyPolicy;
