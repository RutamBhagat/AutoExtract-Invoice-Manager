import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HydrateClient, api } from "@/trpc/server";

import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-secondary" />
        <div className="relative z-10 space-y-6 text-center">
          <h1 className="text-5xl font-bold leading-tight md:text-6xl">
            AutoExtract: Invoice Manager
          </h1>
          <p className="text-lg text-white/90 md:text-xl">
            Effortlessly extract, organize, and manage invoices, products, and
            customers.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="default"
              size="lg"
              className="border border-secondary hover:bg-primary/90"
            >
              Get Started
            </Button>
            <Button
              className="bg-secondary text-primary-foreground hover:bg-secondary/80"
              variant="outline"
              size="lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background py-16 text-foreground">
        <div className="container mx-auto space-y-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Why Choose AutoExtract?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Smart File Upload",
                description:
                  "Upload Excel, PDF, or image files, and let our AI handle the rest.",
              },
              {
                title: "Real-Time Synchronization",
                description:
                  "Seamlessly sync changes across invoices, products, and customers.",
              },
              {
                title: "Data Validation",
                description:
                  "Ensure data accuracy and get prompts for missing or incorrect fields.",
              },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="transform transition-transform hover:scale-105"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-primary">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto space-y-12 text-center">
          <h2 className="text-3xl font-bold text-primary md:text-4xl">
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
              <div key={idx} className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-primary">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="container mx-auto space-y-6 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
            Start Your Journey Today
          </h2>
          <p className="text-lg text-primary-foreground md:text-xl">
            Simplify your invoice, product, and customer management with
            AutoExtract.
          </p>
          <Button variant="default" size="lg" className="hover:bg-primary/90">
            Get Started for Free
          </Button>
        </div>
      </section>
    </HydrateClient>
  );
}
