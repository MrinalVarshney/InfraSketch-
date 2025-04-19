"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Server, Database, Cloud } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const templates: Template[] = [
  {
    id: "three-tier",
    name: "Three-Tier Web App",
    description: "Web servers, app servers, and database",
    icon: <Server className="h-8 w-8 text-primary" />,
  },
  {
    id: "microservices",
    name: "Microservices",
    description: "Container-based microservices architecture",
    icon: <Cloud className="h-8 w-8 text-primary" />,
  },
  {
    id: "data-warehouse",
    name: "Data Warehouse",
    description: "Data storage and analytics platform",
    icon: <Database className="h-8 w-8 text-primary" />,
  },
];

export function TemplateGallery() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const { toast } = useToast();

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      toast({
        title: "Template Selected",
        description: `${selectedTemplate.name} template has been applied.`,
      });
      // In a real implementation, this would load the template nodes
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Templates</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Infrastructure Templates</DialogTitle>
          <DialogDescription>
            Choose a pre-configured infrastructure template to get started
            quickly.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                selectedTemplate?.id === template.id
                  ? "border-primary bg-primary/5"
                  : ""
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="mr-4">{template.icon}</div>
              <div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleUseTemplate} disabled={!selectedTemplate}>
            Use Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
