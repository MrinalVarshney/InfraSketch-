"use client";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  Panel,
  Connection,
  Edge,
  Node,
  useOnSelectionChange,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import ServiceNode from "@/components/ServiceNode";
import ServicePanel from "@/components/ServicePanel";
import PropertiesPanel from "@/components/propertiesPanel/PropertiesPanel";
import { getLayoutedElements } from "@/lib/layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Save,
  Trash2,
  Eraser,
  Minimize,
  Maximize,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPropertiesByType } from "@/components/getPropertiesByType";
import LabeledGroupNode from "@/components/LabeledGroupNode";
import ResizableNode from "./ResizableNode";
import {
  resolveServiceToDeployment,
  udpateConnections,
} from "./dependencyResolver";
import {
  handleDependencyCleanup,
  handleNodeDependencyCleanup,
} from "./dependencyCleaner";

let id = 1;
const getId = () => `node_${id++}`;

const nodeTypes = {
  service: ServiceNode,
  resizable: ResizableNode,
};

interface elasticIP_association {
  provider: string;
  type: string;
  id: string;
  refs: {
    instance: string;
    eip: string;
  };
  depends_on: Array<{ type: string; id: string }>;
}

export default function Home() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(240);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [leftResizing, setLeftResizing] = useState(false);
  const [rightResizing, setRightResizing] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showProjectList, setShowProjectList] = useState(false);
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);

  const [elasticIP_association, setElasticIPAssociation] = useState<
    elasticIP_association[]
  >([]);

  const { getViewport, setViewport, screenToFlowPosition, getNode } =
    useReactFlow();

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const userEmail = "firstone";

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    console.log(node);
  }, []);

  // Save to localStorage only *after* the initial mount
  useEffect(() => {
    if (hasMounted) {
      console.log("saving");
      const eip_association = elasticIP_association;
      localStorage.setItem(
        "canvasData",
        JSON.stringify({ nodes, edges, eip_association })
      );
    }
  }, [nodes, edges, hasMounted]);

  useEffect(() => {
    const savedData = localStorage.getItem("canvasData");
    if (savedData) {
      const {
        nodes: savedNodes,
        edges: savedEdges,
        eip_association,
      } = JSON.parse(savedData);
      setNodes(savedNodes);
      setEdges(savedEdges);
      setElasticIPAssociation(eip_association);
    }
    setHasMounted(true); // allow future saves
  }, []);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const dataStr = event.dataTransfer.getData("application/json");
      if (!dataStr) return;

      try {
        const data = JSON.parse(dataStr);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        console.log("data", data);
        let newNode = {
          id: `${data.provider}-${data.type}-${nodes.length + 1}`,
          type: "service",
          position,
          data: {
            label: data.label,
            type: data.type,
            provider: data.provider,
            properties: getPropertiesByType(data.label, data.provider),
            rawLabel: data.rawLabel,
            serviceName: data.label,
          },
        };
        console.log("newNode", newNode, data);
        setNodes((nds) => nds.concat(newNode));
        toast({
          title: "Service added",
          description: `Added ${data.label} to the canvas.`,
        });
      } catch (error) {
        console.error("Error parsing drag data:", error);
        toast({
          title: "Error adding service",
          description: "Failed to add service to canvas.",
          variant: "destructive",
        });
      }
    },
    [screenToFlowPosition, nodes, setNodes, toast]
  );

  const handleConnect = useCallback(
    (params: Connection | Edge) => {
      const source = getNode(params.source);
      const destination = getNode(params.target);
      const source_provider = source?.data.provider;
      const destination_provider = destination?.data.provider;
      const source_type = source?.data.label;
      const destination_type = destination?.data.label;
      const source_raw_type = source?.data.rawLabel;
      const destination_raw_type = destination?.data.rawLabel;

      if (
        source_provider === "kubernetes" &&
        destination_provider === "kubernetes"
      ) {
        if (source_type === "Service" && destination_type === "Deployment") {
          resolveServiceToDeployment(source, destination, updateNodeData);
        } else if (
          source_type === "Deployment" &&
          destination_type === "Service"
        ) {
          resolveServiceToDeployment(destination, source, updateNodeData);
        } else {
          udpateConnections(source, destination.id, updateNodeData);
          udpateConnections(destination, source.id, updateNodeData);
        }
      } else if (source_provider === "aws" && destination_provider == "aws") {
        udpateConnections(source, destination.id, updateNodeData);
        udpateConnections(destination, source.id, updateNodeData);

        if (source_type === "EC2" && destination_type === "SecurityGroup") {
          const updatedData = {
            ...source.data,
            properties: {
              ...source.data.properties,
              refs: {
                ...(source.data.properties?.refs || {}),
                securityGroup: destination.id,
              },
            },
          };
          updateNodeData(source.id, updatedData);
        } else if (
          source_type === "SecurityGroup" &&
          destination_type === "EC2"
        ) {
          const updatedData = {
            ...destination.data,
            properties: {
              ...destination.data.properties,
              refs: {
                ...(destination.data.properties?.refs || {}),
                securityGroup: source.id,
              },
            },
          };
          updateNodeData(destination.id, updatedData);
        } else if (
          source_type === "ElasticIP" ||
          destination_type === "ElasticIP"
        ) {
          const eipId =
            source.data.label === "ElasticIP" ? source.id : destination.id;

          const isAssociated = elasticIP_association.some(
            (assoc) => assoc.refs.eip === eipId
          );

          if (isAssociated) {
            toast({
              title: "Elastic IP already in use",
              description: `ElasticIP ${eipId} is already associated with another instance.`,
              variant: "destructive",
            });
            return;
          }

          const data = {
            provider: source_provider,
            type: "eip_association",
            id: `${source.id}-${destination.id}`,
            refs: {
              instance:
                source_type === "ElasticIP" ? destination.id : source.id,
              eip: source_type === "ElasticIP" ? source.id : destination.id,
            },
            depends_on: [
              {
                type: source_raw_type,
                id: source.id,
              },
              {
                type: destination_raw_type,
                id: destination.id,
              },
            ],
          };
          setElasticIPAssociation((prev) => [...prev, data]);
        } else if (
          source_type === "RouteTable" ||
          destination_type === "RouteTable"
        ) {
          const routeTableId =
            source.data.label === "RouteTable" ? source.id : destination.id;
          const internetGatewayId =
            source.data.label === "InternetGateway"
              ? source.id
              : destination.id;
          const routeTableNode = getNode(routeTableId);
          const updatedData = {
            ...routeTableNode.data,
            properties: {
              ...routeTableNode.data.properties,
              refs: {
                ...(routeTableNode.data.properties?.refs || {}),
                internet_gateway: internetGatewayId,
              },
            },
          };
          updateNodeData(routeTableId, updatedData);
        } else if (
          source_type === "TargetGroup" ||
          destination_type === "TargetGroup"
        ) {
          const targetGroupId =
            source.data.label === "TargetGroup" ? source.id : destination.id;
          const instanceId =
            source.data.label === "EC2" ? source.id : destination.id;
          const targetGroupNode = getNode(targetGroupId);
          const updatedData = {
            ...targetGroupNode.data,
            properties: {
              ...targetGroupNode.data.properties,
              refs: {
                ...(targetGroupNode.data.properties?.refs || {}),
                targets: [
                  ...(targetGroupNode.data.properties?.refs?.targets || []),
                  instanceId,
                ],
              },
            },
          };
          updateNodeData(targetGroupId, updatedData);
        } else if (
          source_type === "LoadBalancer" ||
          destination_type === "LoadBalancer"
        ) {
          /*
          name: string;
  load_balancer_type: "application" | "network" | "gateway";
  internal: boolean;
  enable_deletion_protection: boolean;
  refs: {
    security_groups: [{ value: string }];
    subnets: [{ value: string }];
    listeners: {
      port: number;
      protocol: "HTTP" | "HTTPS" | "TCP" | "TLS" | "UDP" | "TCP_UDP";
      certificate_arn?: string;
      default_action: {
        type: "forward" | "redirect" | "fixed-response";
        target_group_arn?: string;
        // Add more properties for redirect and fixed-response if needed
      }[];
      rules?: [{}];
    }[];
  };
          */
          const loadBalancerId =
            source.data.label === "LoadBalancer" ? source.id : destination.id;
          const other =
            source.data.label === "LoadBalancer" ? destination.id : source.id;
          const loadBalancerNode = getNode(loadBalancerId);
          const updatedData = {
            ...loadBalancerNode.data,
            properties: {
              ...loadBalancerNode.data.properties,
              refs: {
                ...(loadBalancerNode.data.properties?.refs || {}),
                ...(other.data.label === "Subnet" && {
                  subnets: [
                    ...(loadBalancerNode.data.properties?.refs?.subnets || []),
                    other.id,
                  ],
                }),
                ...(other.data.label === "SecurityGroup" && {
                  security_groups: [
                    ...(loadBalancerNode.data.properties?.refs
                      ?.security_groups || []),
                    other.id,
                  ],
                }),
              },
            },
          };
          updateNodeData(loadBalancerId, updatedData);
        }
      }

      setEdges((eds) => addEdge(params, eds));
      toast({
        title: "Connection established",
        description: `Connected ${source.data.label} to ${destination.data.label}.`,
      });
    },
    [setEdges, setNodes, getNode, elasticIP_association]
  );

  const onNodeDragStop = useCallback(
    (_event: any, draggedNode: Node) => {
      const draggedX = draggedNode.position.x;
      const draggedY = draggedNode.position.y;
      console.log("selectedNode", selectedNode);
      const potentialParents = nodes.filter((n) => n.id !== draggedNode.id);
      console.log("position", draggedX, draggedY);
      const CanParent = potentialParents
        .map((parent) => {
          const parentX = parent.position.x;
          const parentY = parent.position.y;
          const parentWidth = Number(parent.measured?.width || 100);
          const parentHeight = Number(parent.measured?.height || 80);

          const isInside =
            draggedX > parentX &&
            draggedX < parentX + parentWidth &&
            draggedY > parentY &&
            draggedY < parentY + parentHeight;

          if (!isInside) return null;

          const distanceLeft = Math.abs(draggedX - parentX);
          const distanceRight = Math.abs(parentX + parentWidth - draggedX);
          const distanceTop = Math.abs(draggedY - parentY);
          const distanceBottom = Math.abs(parentY + parentHeight - draggedY);

          const distance =
            distanceLeft + distanceRight + distanceTop + distanceBottom;

          return { parent, distance };
        })
        .filter(Boolean)
        .sort((a, b) => a!.distance - b!.distance);
      const parent = CanParent?.[0]?.parent;
      console.log("parent", parent);
      console.log("canParent", CanParent);
      if (parent) {
        if (draggedNode.data.label === "ElasticIP") {
          return;
        } else if (
          !(parent.data.label === "VPC" || parent.data.label === "Subnet")
        ) {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === draggedNode.id
                ? {
                    ...n,
                    position: selectedNode?.position,
                  }
                : n
            )
          );
          return;
        }
        let vpcId = "";
        let subnetId = "";
        for (const { parent } of CanParent) {
          if (!vpcId && parent.data.label === "VPC") {
            vpcId = parent.id;
          } else if (!subnetId && parent.data.label === "Subnet") {
            subnetId = parent.id;
          }

          if (vpcId && subnetId) break;
        }
        setNodes((nds) =>
          nds.map((n) =>
            n.id === draggedNode.id
              ? {
                  ...n,
                  parentId: parent.id,
                  extent: "parent",
                  data: {
                    ...n.data,
                    properties: {
                      ...n.data?.properties,
                      refs: {
                        ...(n.data?.properties?.refs || {}),
                        ...(vpcId && { vpc: vpcId }),
                        ...(subnetId && { subnet: subnetId }),
                      },
                    },
                  },
                }
              : n
          )
        );
      }
    },
    [nodes, setNodes]
  );

  const startLeftResizing = useCallback((event: React.MouseEvent) => {
    setLeftResizing(true);
    event.preventDefault();
  }, []);

  const startRightResizing = useCallback((event: React.MouseEvent) => {
    setRightResizing(true);
    event.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setLeftResizing(false);
    setRightResizing(false);
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (leftResizing) {
        const newWidth = event.clientX;
        setLeftPanelWidth(Math.max(200, Math.min(newWidth, 400)));
      } else if (rightResizing) {
        const newWidth = window.innerWidth - event.clientX;
        setRightPanelWidth(Math.max(200, Math.min(newWidth, 500)));
      }
    },
    [leftResizing, rightResizing]
  );

  const toggleLeftPanel = useCallback(() => {
    setLeftPanelCollapsed(!leftPanelCollapsed);
  }, [leftPanelCollapsed]);

  const toggleRightPanel = useCallback(() => {
    setRightPanelCollapsed(!rightPanelCollapsed);
  }, [rightPanelCollapsed]);

  const updateNodeData = useCallback(
    (nodeId: string, data: any) => {
      console.log("updateNodeData", nodeId, data);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...data,
                serviceName:
                  data.properties.name || data.properties.bucket || data.label,
              },
            };
          }
          return node;
        })
      );

      setSelectedNode((prev) => {
        if (prev && prev.id === nodeId) {
          return {
            ...prev,
            data: {
              ...data,
              serviceName: data.name || data.label,
            },
          };
        }
        return prev;
      });
    },
    [setNodes]
  );


  const generateId = () => Math.random().toString(36).substring(2, 10);

  const handleSave = async (
    reactFlowInstance: ReactFlowInstance
  ) => {
    const userEmail = "firstone";

    if (!userEmail) {
      console.error("User email is required");
      return;
    }

    const diagramName =  prompt('Enter a name for your project:');
    if (!diagramName) {
      console.error('Diagram name is required');
      return;
    }

   
    //const viewport = reactFlowInstance.getViewport();

    try {
      await axios.post("/api/save-diagram", {
        userEmail,
        project_name: diagramName,
        nodes,
        edges,
       // viewport,
        elasticIP_association,
      });

      toast({
        title: "Diagram saved",
        description: `Successfully saved ${diagramName}`,
      });

      if (!selectedProject) {
        setSelectedProject(diagramName);
      //  const res = await axios.get(`/api/load-diagram-name?name=${diagramName}`);
        setProjectNames(res.data.map((project: any) => project.project_name));
      }
    } catch (err) {
      console.error("Failed to save diagram:", err);
      toast({
        title: "Error",
        description: "Failed to save diagram.",
        variant: "destructive",
      });
    }
  };

  const loadDiagram = async () => {
    try {
      const res = await axios.get(`/api/load-diagram?email=${userEmail}`);
      const projectNames = res.data.map((project: any) => project.project_name);
      setProjectNames(projectNames);
      setShowProjectList(true);
    } catch (err) {
      console.error("Error loading project names:", err);
      toast({
        title: "Error",
        description: "Failed to load project names.",
        variant: "destructive",
      });
    }
  };

  const loadSpecificDiagram = async (projectName: string) => {
    try {
      const res = await axios.get(`/api/load-diagram-name?name=${projectName}&&email=${userEmail}`);
      const { nodes, edges, viewport, elasticIP_association } = res.data[0];
      console.log("snfsifisf")
      //  console.log(res.data)
      setNodes(nodes);
      setEdges(edges);
      setElasticIPAssociation(elasticIP_association || []);
      
      if (viewport) {
        setViewport(viewport);
      }
      
      setShowProjectList(false);
      setSelectedProject(projectName);
      toast({
        title: "Diagram loaded",
        description: `Successfully loaded ${projectName}`,
      });
    } catch (err) {
      console.error("Error loading diagram:", err);
      toast({
        title: "Error",
        description: "Failed to load diagram.",
        variant: "destructive",
      });
    }
  };

  function handleNodeDelete(nodes: Node[]) {
    console.log("Node deleted", nodes);

    setElasticIPAssociation((prev) =>
      prev.filter(
        (assoc) =>
          !nodes.some(
            (node) =>
              node.id === assoc.refs.eip || node.id === assoc.refs.instance
          )
      )
    );

    nodes.forEach((node) => {
      if (node.data.provider === "kubernetes") {
        handleNodeDependencyCleanup(node, getNode, updateNodeData);
      }
    });
  }

  function handleEdgeDelete(deletedEdges: Edge[]) {
    console.log("Edge deleted", deletedEdges);

    deletedEdges.forEach((edge) => {
      const sourceNode = getNode(edge.source);
      const targetNode = getNode(edge.target);

      const isElasticIP = (node: Node | undefined) =>
        node?.data?.label === "ElasticIP";

      if (isElasticIP(sourceNode) || isElasticIP(targetNode)) {
        setElasticIPAssociation((prev) =>
          prev.filter(
            (assoc) =>
              !(
                (assoc.refs.eip === edge.source &&
                  assoc.refs.instance === edge.target) ||
                (assoc.refs.eip === edge.target &&
                  assoc.refs.instance === edge.source)
              )
          )
        );
      }

      handleDependencyCleanup(
        edge.source,
        edge.target,
        getNode,
        updateNodeData
      );
    });
  }

  function handleExport() {
    const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges);
    console.log(nodes);
    const projectName = "test";
    let services: any[] = [];
    nodes.forEach((node: Node) => {
      if (node.data.label === "SecurityGroup") return;
      services.push({
        id: node.id,
        provider: node.data.provider,
        type: node.data.rawLabel,
        ...(typeof node.data.properties === "object" && node.data.properties
          ? node.data.properties
          : {}),
      });
    });

    elasticIP_association.map((eip_association) => {
      services.push(eip_association);
    });

    const securityGroupNodes = nodes.filter((node: Node) => {
      return node.data.label === "SecurityGroup";
    });

    console.log("securityGroupNodes", securityGroupNodes);

    if (securityGroupNodes.length > 0) {
      securityGroupNodes.forEach((node: Node) => {
        const ingressRules = node.data.properties.ingress || [];
        const egressRules = node.data.properties.egress || [];

        services.push({
          provider: node.data.provider,
          type: node.data.rawLabel,
          id: node.id,
          refs: node.data.properties.refs,
          description: node.data.properties.description,
          tags: node.data.properties.tags,
        });

        ingressRules.forEach((rule: any) => {
          services.push({
            provider: node.data.provider,
            type: "vpc_security_group_ingress_rule",
            id: generateId(),
            refs: {
              security_group: node.id,
            },
            ...rule,
          });
        });

        egressRules.forEach((rule: any) => {
          services.push({
            provider: node.data.provider,
            type: "vpc_security_group_egress_rule",
            id: generateId(),
            refs: {
              security_group: node.id,
            },
            ...rule,
          });
        });
      });
    }
    // / Create JSON data
    const exportData = {
      project: projectName,
      services,
    };

    console.log("export  ", exportData);

    // Trigger download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName}-infra.json`;
    a.click();
    URL.revokeObjectURL(url); // Clean up
  }

  return (
    <div
      className="flex h-full relative"
      onMouseMove={handleMouseMove as any}
      onMouseUp={stopResizing}
      onMouseLeave={stopResizing}
    >
      {/* Left panel (Services) */}
      <div
        className={`flex-shrink-0 border-r bg-card transition-all duration-300 ease-in-out ${
          leftPanelCollapsed ? "w-0 opacity-0 overflow-hidden" : ""
        }`}
        style={{ width: leftPanelCollapsed ? 0 : `${leftPanelWidth}px` }}
      >
        <ServicePanel
          onDragStart={(event, data) => {
            event.dataTransfer.setData("application/json", data);
          }}
        />
      </div>

      {/* Left panel toggle button */}
      <button
        className="absolute left-0 top-4 z-10 bg-card/80 rounded-r-md p-1 shadow-md hover:bg-primary/20 transition-all"
        onClick={toggleLeftPanel}
        title={
          leftPanelCollapsed ? "Show services panel" : "Hide services panel"
        }
      >
        {leftPanelCollapsed ? <Maximize size={16} /> : <Minimize size={16} />}
      </button>

      {/* Left resizer */}
      {!leftPanelCollapsed && (
        <div
          className="panel-resizer flex-shrink-0 h-full w-1 bg-transparent hover:bg-primary/30 cursor-col-resize transition-all"
          onMouseDown={startLeftResizing}
        />
      )}

      {/* Main canvas */}
      <div className="flex-1 h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          deleteKeyCode={"Delete"}
          onNodesDelete={handleNodeDelete}
          onEdgesDelete={handleEdgeDelete}
          onNodeDragStop={onNodeDragStop}
        >
          <Controls />
          <MiniMap zoomable pannable />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

          <Panel position="top-center">
            {showProjectList ? (
              <div className="flex flex-col gap-2 bg-card shadow-sm rounded-md p-4 max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Saved Projects</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowProjectList(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
                <Separator />
                {projectNames.length > 0 ? (
                  <div className="grid gap-2">
                    {projectNames.map((name) => (
                      <Button
                        key={name}
                        variant="outline"
                        className="justify-start"
                        onClick={() => loadSpecificDiagram(name)}
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No saved projects found</p>
                )}
              </div>
            ) : (
              <div className="flex gap-2 items-center bg-card shadow-sm rounded-md p-2">
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save size={16} className="mr-1" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={loadDiagram}>
                  <Save size={16} className="mr-1" />
                  Saved Projects
                </Button>
              </div>
            )}
          </Panel>
        </ReactFlow>
      </div>

      {/* Right resizer */}
      {!rightPanelCollapsed && (
        <div
          className="panel-resizer flex-shrink-0 h-full w-1 bg-transparent hover:bg-primary/30 cursor-col-resize transition-all"
          onMouseDown={startRightResizing}
        />
      )}

      {/* Right panel toggle button */}
      <button
        className="absolute right-0 top-4 z-10 bg-card/80 rounded-l-md p-1 shadow-md hover:bg-primary/20 transition-all"
        onClick={toggleRightPanel}
        title={
          rightPanelCollapsed
            ? "Show properties panel"
            : "Hide properties panel"
        }
      >
        {rightPanelCollapsed ? <Maximize size={16} /> : <Minimize size={16} />}
      </button>

      {/* Right panel (Properties) */}
      <div
        className={`flex-shrink-0 border-l p-3 overflow-y-scroll bg-card transition-all duration-300 ease-in-out ${
          rightPanelCollapsed ? "w-0 opacity-0 overflow-hidden" : ""
        }`}
        style={{ width: rightPanelCollapsed ? 0 : `${rightPanelWidth}px` }}
      >
        <PropertiesPanel
          selectedNode={selectedNode}
          onNodeUpdate={updateNodeData}
        />
      </div>
    </div>
  );
}