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
import axios from "axios";

export function UserDashboard() {
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedDiagram, setSelectedDiagram] = useState<any>(null);
  const { toast } = useToast();

  const userEmail = "firstone";

  const loadProjectNames = async () => {
    
  };

  const loadSelectedDiagram = async (projectName: string) => {
    
  };

  return (
    <Dialog onOpenChange={(open) => { if (open) loadProjectNames(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">View Projects</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Available Projects</DialogTitle>
          <DialogDescription>
            Click on a project to load its infrastructure diagram.
          </DialogDescription>
        </DialogHeader>

        <ul className="my-4">
          {projectNames.length > 0 ? (
            projectNames.map((projectName) => (
              <li
                key={projectName}
                className="cursor-pointer text-blue-600 underline mt-2"
                onClick={() => loadSelectedDiagram(projectName)}
              >
                {projectName}
              </li>
            ))
          ) : (
            <p>No projects found.</p>
          )}
        </ul>

        {selectedProject && selectedDiagram && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Selected Project: {selectedProject}</h3>
            <pre className="overflow-auto max-h-64 text-sm bg-muted p-2 rounded">
              {JSON.stringify(selectedDiagram, null, 2)}
            </pre>
            {/* You can render the actual diagram here if you use something like React Flow */}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
