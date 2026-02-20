// import React from "react";
// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, Shield } from "lucide-react";

// interface PolicyLayoutProps {
//   title: string;
//   effectiveDate?: string; // ✅ add this
//   children: React.ReactNode;
// }

// const PolicyLayout: React.FC<PolicyLayoutProps> = ({
//   title,
//   effectiveDate,
//   children,
// }) => {
//   return (
//     <div className="min-h-screen bg-background">
//       <div className="max-w-4xl mx-auto px-6 py-16">

//         {/* Back Button */}
//         <div className="mb-10">
//           <Link
//             to="/"
//             className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
//           >
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back to Home
//           </Link>
//         </div>

//         {/* Header */}
//         <div className="text-center mb-12">
//           <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
//           <h1 className="text-4xl font-bold">{title}</h1>

//           {/* ✅ Date only shows if provided */}
//           {effectiveDate && (
//             <p className="text-sm text-primary font-medium mt-4">
//               Effective Date: {effectiveDate}
//             </p>
//           )}
//         </div>

//         {/* Content */}
//         <div>{children}</div>

//         {/* Contact Button */}
//         <div className="text-center mt-16">
//           <Button asChild>
//             <Link to="/contact">Contact Our Legal Team</Link>
//           </Button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default PolicyLayout;
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface PolicyLayoutProps {
  title: string;
  effectiveDate?: string;
  icon: LucideIcon; // ✅ dynamic icon
  children: React.ReactNode;
}

const PolicyLayout: React.FC<PolicyLayoutProps> = ({
  title,
  effectiveDate,
  icon: Icon,
  children,
}) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Back Button */}
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
          <Icon className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold">{title}</h1>

          {effectiveDate && (
            <p className="text-sm text-primary font-medium mt-4">
              Effective Date: {effectiveDate}
            </p>
          )}
        </div>

        {/* Content */}
        <div>{children}</div>

        {/* Contact Button */}
        <div className="text-center mt-16">
          <Button asChild>
            <Link to="/contact">Contact Our Legal Team</Link>
          </Button>
        </div>

      </div>
    </div>
  );
};

export default PolicyLayout;
