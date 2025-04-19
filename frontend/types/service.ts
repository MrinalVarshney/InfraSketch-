export type ServiceProviderType =
  | "aws"
  | "gcp"
  | "azure"
  | "docker"
  | "kubernetes";

export type K8sServiceType =
  | "Deployment"
  | "Service"
  | "Pod"
  | "ConfigMap"
  | "Secret"
  | "PersistentVolume"
  | "InternetGateway"
  | "ElasticIP"
  | "Subnet"
  | "Ingress";

export type AwsServiceType =
  | "EC2"
  | "S3"
  | "VPC"
  | "RDS"
  | "EKS"
  | "ECS"
  | "SecurityGroup"
  | "RouteTable"
  | "LoadBalancer"
  | "TargetGroup";

export interface Service {
  label: string;
  type: any;
  rawLabel?: string;
}

export interface ServiceData {
  [provider: string]: Service[];
}
