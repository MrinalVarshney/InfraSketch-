import { ServiceData } from "@/types/service";

export const services: ServiceData = {
  aws: [
    { label: "EC2", type: "compute", rawLabel: "aws_instance" },
    { label: "S3", type: "storage", rawLabel: "s3_bucket" },
    { label: "RDS", type: "database", rawLabel: "rds_instance" },
    { label: "VPC", type: "network", rawLabel: "vpc" },
    { label: "ECS", type: "container", rawLabel: "ecs_cluster" },
    { label: "EKS", type: "kubernetes", rawLabel: "eks_cluster" },
    { label: "ElasticIP", type: "elastic", rawLabel: "aws_eip" },
    {
      label: "InternetGateway",
      type: "InternetGateway",
      rawLabel: "internet_gateway",
    },
    { label: "Subnet", type: "Subnet", rawLabel: "subnet" },
    {
      label: "SecurityGroup",
      type: "SecurityGroup",
      rawLabel: "security_group",
    },
    { label: "RouteTable", type: "RouteTable", rawLabel: "route_table" },
    { label: "LoadBalancer", type: "LoadBalancer", rawLabel: "load_balancer" },
    { label: "TargetGroup", type: "TargetGroup", rawLabel: "target_group" },
  ],
  gcp: [
    { label: "Compute Engine", type: "compute" },
    { label: "Cloud Storage", type: "storage" },
    { label: "Cloud SQL", type: "database" },
    { label: "VPC Network", type: "network" },
    { label: "Cloud Run", type: "container" },
    { label: "GKE Cluster", type: "kubernetes" },
  ],
  azure: [
    { label: "Virtual Machine", type: "compute" },
    { label: "Blob Storage", type: "storage" },
    { label: "Azure SQL", type: "database" },
    { label: "Virtual Network", type: "network" },
    { label: "Container Instance", type: "container" },
    { label: "AKS Cluster", type: "kubernetes" },
  ],
  docker: [
    { label: "Container", type: "container" },
    { label: "Volume", type: "storage" },
    { label: "Network", type: "network" },
  ],
  kubernetes: [
    { label: "Pod", type: "kubernetes", rawLabel: "pod" },
    { label: "Deployment", type: "kubernetes", rawLabel: "deployment" },
    { label: "Service", type: "network", rawLabel: "service" },
    { label: "ConfigMap", type: "storage", rawLabel: "config_map" },
    { label: "Secret", type: "secret", rawLabel: "secret" },
    {
      label: "PersistentVolume",
      type: "storage",
      rawLabel: "persistent_volume",
    },
    { label: "Ingress", type: "network", rawLabel: "ingress" },
    { label: "NameSpace", type: "kubernetes", rawLabel: "namespace" },
  ],
};
