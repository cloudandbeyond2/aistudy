import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { serverURL } from "@/constants";

const OrganizationEnquiry = () => {
  const { toast } = useToast();

  const [form, setForm] = useState({
    organizationName: "",
    contactPerson: "",
    email: "",
    phone: "",
    teamSize: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

await axios.post(`${serverURL}/api/organization-enquiries`, form);


      toast({
        title: "Enquiry submitted",
        description: "Our team will contact you shortly.",
      });

      setForm({
        organizationName: "",
        contactPerson: "",
        email: "",
        phone: "",
        teamSize: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Organization Enquiry
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="organizationName"
            placeholder="Organization Name"
            value={form.organizationName}
            onChange={handleChange}
            required
          />

          <Input
            name="contactPerson"
            placeholder="Contact Person Name"
            value={form.contactPerson}
            onChange={handleChange}
            required
          />

          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <Input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
          />

          <Input
            name="teamSize"
            placeholder="Team Size (e.g. 50, 200)"
            value={form.teamSize}
            onChange={handleChange}
          />

          <Textarea
            name="message"
            placeholder="Tell us about your requirement"
            value={form.message}
            onChange={handleChange}
            rows={4}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Enquiry"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OrganizationEnquiry;
