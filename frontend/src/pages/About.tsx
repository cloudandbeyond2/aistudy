import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Target,
  BookOpenCheck,
  Award,
} from "lucide-react";
import { appName, companyName } from "@/constants";

import Footer from "@/components/Footer";

const About = () => {
  return (
    <>

    <div className="min-h-screen bg-background">

     

      {/* Hero */}
{/* Hero */}
{/* Hero */}
<section
  className="
    px-4 py-24
    bg-gradient-to-br
    from-muted
    via-background
    to-indigo-50
    dark:from-zinc-900
    dark:via-zinc-950
    dark:to-indigo-950
  "
>
  {/* Top Bar */}
  <div className="max-w-6xl mx-auto flex items-center justify-between mb-16">
    
    {/* Left Side - Logo */}
    <Link to="/" className="flex items-center gap-2">
      <Sparkles className="h-6 w-6 text-primary" />
      <span className="text-lg font-bold">{appName}</span>
    </Link>

    {/* Right Side - Back */}
    <Link
      to="/"
      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition"
    >
      <ArrowLeft className="ml-2 h-4 w-4" />
     Back to Home
    </Link>

  </div>

  {/* Hero Content */}
  <div className="max-w-4xl mx-auto text-center">
    <Sparkles className="h-12 w-12 text-primary mx-auto mb-6" />
    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
      Learning, Reinvented by AI
    </h1>
    <p className="mt-6 text-lg sm:text-xl text-muted-foreground">
      {appName} helps learners and educators create intelligent,
      personalized courses—faster than ever before.
    </p>
  </div>
</section>


      {/* Story Timeline */}
      <section className="px-4 py-20">
        <div className="max-w-5xl mx-auto space-y-16">

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold">Why {appName}?</h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Traditional course creation is slow, rigid, and difficult to
                personalize. We built {appName} to remove those limitations using
                the power of Artificial Intelligence.
              </p>
            </div>
            <Target className="h-16 w-16 text-primary mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <BookOpenCheck className="h-16 w-16 text-primary mx-auto order-last md:order-first" />
            <div>
              <h2 className="text-3xl font-bold">What We Do</h2>
              <p className="mt-4 text-muted-foreground text-lg">
                {appName} generates structured learning paths, tracks progress,
                and issues completion certificates—helping learners stay focused
                and motivated.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold">Who We Serve</h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Educators, professionals, startups, and enterprises use {appName}
                to scale education without sacrificing quality.
              </p>
            </div>
            <Award className="h-16 w-16 text-primary mx-auto" />
          </div>

        </div>
      </section>

      {/* Values */}
      <section className="px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Our Core Values</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              "Innovation First",
              "Learner-Centered Design",
              "Ethical AI Usage",
              "Quality Without Compromise",
            ].map((value) => (
              <div
                key={value}
                className="bg-background p-6 rounded-xl shadow-sm"
              >
                <h3 className="font-semibold text-lg">{value}</h3>
                <p className="mt-3 text-muted-foreground text-sm">
                  We build every feature with intention, responsibility, and
                  long-term impact in mind.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 bg-primary text-primary-foreground text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold">
            Build the Future of Learning with Us
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Whether you're teaching, learning, or scaling education, {companyName}
            is your AI-powered partner.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary"
              asChild
            >
              <Link to="/signup">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary"
              asChild
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
<Footer/>
    </div>
    </>
  );
};

export default About;
