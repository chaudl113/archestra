"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorBoundary } from "@/app/_parts/error-boundary";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
}

const CATEGORIES = [
  "All",
  "Development",
  "Content",
  "Data",
  "Support",
  "General",
];

export default function AgentTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(
    null
  );

  // Fetch templates from API
  useEffect(() => {
    fetch("/api/agent-templates")
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch templates:", err);
        toast.error("Failed to load templates");
        setLoading(false);
      });
  }, []);

  const filteredTemplates =
    selectedCategory === "All"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleCreateFromTemplate = useCallback(
    async (templateId: string) => {
      setCreatingTemplateId(templateId);
      try {
        const response = await fetch(
          `/api/agent-templates/${templateId}/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create agent");
        }

        const agent = await response.json();
        toast.success("Agent created from template!");
        router.push(`/agents/${agent.id}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create agent"
        );
      } finally {
        setCreatingTemplateId(null);
      }
    },
    [router]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ErrorBoundary>
        <PageLayout
          title="Agent Templates"
          description="Quickstart with pre-built agent configurations"
          actionButton={
            <Link href="/agents">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Agents
              </Button>
            </Link>
          }
        >
          {/* Category Filter */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={
                  selectedCategory === category ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="flex flex-col hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{template.icon}</span>
                    <div>
                      <CardTitle className="text-lg">
                        {template.name}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleCreateFromTemplate(template.id)}
                    disabled={creatingTemplateId === template.id}
                  >
                    {creatingTemplateId === template.id ? (
                      <>
                        <LoadingSpinner className="h-4 w-4 mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Use Template
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </PageLayout>
      </ErrorBoundary>
    </div>
  );
}
