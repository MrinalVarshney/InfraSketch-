"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wand } from "lucide-react";

export function AiAssistant() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a question or request.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // In a real implementation, this would call an API endpoint
    // For now, we'll simulate a response
    setTimeout(() => {
      const responses = [
        "Consider using a load balancer in front of your application servers to improve availability.",
        "For AWS deployments, an S3 bucket with CloudFront is ideal for static content delivery.",
        "You might want to add a database instance to store application data.",
        "Container services like ECS or Kubernetes are great for microservice architectures.",
        "Don't forget to consider security groups and network ACLs in your design.",
      ];
      setResponse(responses[Math.floor(Math.random() * responses.length)]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Wand className="h-4 w-4" />
          <span className="sr-only">AI Assistant</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium">AI Infrastructure Assistant</h3>
          <Textarea
            placeholder="Ask about infrastructure best practices..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Thinking..." : "Get Suggestions"}
          </Button>
          {response && (
            <div className="mt-2 p-3 bg-muted rounded-md text-sm">
              {response}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
