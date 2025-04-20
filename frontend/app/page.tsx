import Canvas from "@/components/Canvas";
import { ReactFlowProvider } from "@xyflow/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AiAssistant } from "@/components/AiAssistant";
import { TemplateGallery } from "@/components/TemplateGallery";
import { UserDashboard } from "@/components/UserDashboard";
import { ThemeProvider } from "@/components/ThemeProvider";

const Index = () => {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="border-b p-2 flex justify-between items-center bg-card z-10">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg">InfraSketch</h1>
          </div>
          <div className="flex items-center gap-2">
            <UserDashboard />
            <TemplateGallery />
            <AiAssistant />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-hidden">
          <ReactFlowProvider>
            <Canvas />
          </ReactFlowProvider>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
