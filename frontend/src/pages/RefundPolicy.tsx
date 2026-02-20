
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { ArrowLeft, FileText } from 'lucide-react';
// import { serverURL } from '@/constants';
// import axios from 'axios';
// import StyledText from '@/components/styledText';

// const RefundPolicy = () => {

//   const [data, setData] = useState('');

//   useEffect(() => {
//     async function dashboardData() {
//       const postURL = serverURL + `/api/policies`;
//       const response = await axios.get(postURL);
//       setData(response.data[0].refund)
//     }
//     dashboardData();
//   }, []);

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container max-w-4xl mx-auto px-4 py-12">
//         <div className="mb-10">
//           <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back to Home
//           </Link>
//         </div>

//         <div className="space-y-12">
//           <div className="text-center mb-12">
//             <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
//             <h1 className="text-4xl font-bold">Refund Policy</h1>
//           </div>

//           <div className="prose prose-slate dark:prose-invert max-w-none">
//             <StyledText text={data} />
//           </div>

//           <div className="text-center mt-16">
//             <Button asChild>
//               <Link to="/contact">Contact Our Legal Team</Link>
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RefundPolicy;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "@/constants";
import StyledText from "@/components/styledText";
import PolicyLayout from "@/components/PolicyLayout";
import { CreditCard } from "lucide-react"; // ✅ Better icon for refund

const RefundPolicy = () => {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRefund = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/policies`);
        setData(response.data?.refund || "");
      } catch (error) {
        console.error("Failed to fetch refund policy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRefund();
  }, []);

  return (
    <PolicyLayout
      title="Refund Policy"
      effectiveDate="18 February 2026"
      icon={CreditCard}   // ✅ consistent icon usage
    >
      {loading ? (
        <p className="text-center text-muted-foreground">
          Loading Refund Policy...
        </p>
      ) : data ? (
        <StyledText text={data} />
      ) : (
        <p>No refund policy available.</p>
      )}
    </PolicyLayout>
  );
};

export default RefundPolicy;
