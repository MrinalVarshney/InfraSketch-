import ComputeFields from "./aws/ComputeFields";
import ContainerFields from "./ContainerFields";
import DatabaseFields from "./aws/DatabaseFields";
import StorageFields from "./aws/StorageFields";
import ElasticIPFields from "./aws/ElasticIPFields";
import SubnetFields from "./aws/SubnetFields";
import InternetGatewayFields from "./aws/InternetGateway"; // ✅ Import here
import { Node } from "@xyflow/react";
import KubernetesFields from "./KubernetesFields";
import KubernetesDeploymentFields from "./k8s/deployment";
import KubernetesServiceFields from "./k8s/service";
import KubernetesIngressFields from "./k8s/ingress";
import KubernetesSecretFields from "./k8s/secret";
import SecurityGroupFields from "./aws/Security_group";

import {
  ServiceProviderType,
  K8sServiceType,
  AwsServiceType,
} from "@/types/service";
import VPCfields from "./aws/VPCfields";
import ConfigMapFields from "./k8s/configMap";
import RouteTableFields from "./aws/RouteTableFields";
import LoadBalancerFields from "./aws/LoadBalancer";
import TargetGroupFields from "./aws/TargetGroup";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

export default function PropertiesPanel({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const provider = selectedNode?.data.provider as ServiceProviderType;
  const nodeType = selectedNode?.data.label as K8sServiceType | AwsServiceType;
  // console.log(provider, nodeType);

  switch (provider) {
    case "kubernetes":
      switch (nodeType) {
        case "Service":
          return (
            <KubernetesServiceFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
        case "Deployment":
          return (
            <KubernetesDeploymentFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
        case "ConfigMap":
          return (
            <ConfigMapFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );

        case "Secret":
          return (
            <KubernetesSecretFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
        case "Ingress":
          return (
            <KubernetesIngressFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );

        default:
          return (
            <KubernetesFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
      }

    case "aws":
      switch (nodeType) {
        case "EC2":
          return (
            <ComputeFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
        case "S3":
          return (
            <StorageFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
        case "ElasticIP":
          return (
            <ElasticIPFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
        case "InternetGateway": // ✅ Handle Internet Gateway
          return (
            <InternetGatewayFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
        case "RDS":
          return (
            <DatabaseFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
        case "Subnet":
          return (
            <SubnetFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
        case "VPC":
          return (
            <VPCfields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
        case "SecurityGroup":
          return (
            <SecurityGroupFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
        case "RouteTable":
          return (
            <RouteTableFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
        case "LoadBalancer":
          return (
            <LoadBalancerFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
        case "TargetGroup":
          return (
            <TargetGroupFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );

        default:
          return (
            <ContainerFields
              selectedNode={selectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          );
      }
  }
}
