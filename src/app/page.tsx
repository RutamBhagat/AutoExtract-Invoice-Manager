import { ArrowRight, Edit3, Upload, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground lg:py-32">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-10"></div>
          <div className="container relative z-10 mx-auto px-4">
            <div className="mx-auto max-w-3xl space-y-8 text-center">
              <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                AutoExtract: Invoice Manager
              </h1>
              <p className="text-xl text-primary-foreground/80 md:text-2xl">
                Effortlessly extract, organize, and manage invoices, products,
                and customers.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="w-full bg-secondary text-background hover:bg-gray-800 sm:w-40"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-primary text-secondary-foreground hover:bg-gray-100 sm:w-40"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-background py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
              Why Choose AutoExtract?
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Smart File Upload",
                  description:
                    "Upload Excel, PDF, or image files, and let our AI handle the rest.",
                  icon: Upload,
                },
                {
                  title: "Real-Time Synchronization",
                  description:
                    "Seamlessly sync changes across invoices, products, and customers.",
                  icon: Zap,
                },
                {
                  title: "Data Validation",
                  description:
                    "Ensure data accuracy and get prompts for missing or incorrect fields.",
                  icon: Edit3,
                },
              ].map((feature, idx) => (
                <Card
                  key={idx}
                  className="transition-transform hover:scale-105"
                >
                  <CardHeader>
                    <feature.icon className="mb-4 h-10 w-10 text-primary" />
                    <CardTitle className="text-xl font-semibold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
              How It Works
            </h2>
            <div className="grid gap-12 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Upload Files",
                  description:
                    "Drag and drop invoices, products, or customer data in various formats.",
                },
                {
                  step: "2",
                  title: "AI-Powered Extraction",
                  description:
                    "Automatically categorize and extract data for each tab.",
                },
                {
                  step: "3",
                  title: "Edit & Sync",
                  description:
                    "Make edits and see real-time updates across all tabs.",
                },
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-secondary py-20 text-secondary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
              Start Your Journey Today
            </h2>
            <p className="mb-8 text-xl text-primary-foreground">
              Simplify your invoice, product, and customer management with
              AutoExtract.
            </p>
            <Button
              size="lg"
              variant="default"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Get Started for Free
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
