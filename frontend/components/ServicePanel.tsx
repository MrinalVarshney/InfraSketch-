"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { services } from "@/data/services";
import ServiceItem from "./ServiceItem";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

interface ServicePanelProps {
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string
  ) => void;
}

export default function ServicePanel({ onDragStart }: ServicePanelProps) {
  const providers = Object.keys(services);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;

    return providers.filter((provider) => {
      // Check if provider name matches search
      if (provider.toLowerCase().includes(searchQuery.toLowerCase()))
        return true;

      // Check if any service in this provider matches search
      return services[provider].some((service) =>
        service.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [providers, searchQuery]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Services</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Drag services to the canvas to build your infrastructure
        </p>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <Accordion type="multiple" defaultValue={providers} className="w-full">
          {filteredProviders.map((provider) => (
            <AccordionItem key={provider} value={provider}>
              <AccordionTrigger className="capitalize py-2 px-2">
                {provider}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-1 mt-1 mb-2">
                  {services[provider]
                    .filter(
                      (service) =>
                        !searchQuery.trim() ||
                        service.label
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                    )
                    .map((service) => {
                      return (
                        <ServiceItem
                          key={`${provider}-${service.type}-${service.label}`}
                          label={service.label}
                          type={service.type}
                          provider={provider}
                          rawLabel={service.rawLabel}
                          onDragStart={onDragStart}
                        />
                      );
                    })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="p-3 border-t bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          Drag and drop services to design your infrastructure
        </p>
      </div>
    </div>
  );
}
