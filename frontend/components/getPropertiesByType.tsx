export function getPropertiesByType(type: string, provider: string) {
  console.log("getPropertiesByType", type, provider);
  switch (provider) {
    case "kubernetes":
      switch (type) {
        case "Deployment":
          return {
            id: "",
            metadata: {
              name: "",
              labels: {},
            },
            spec: {
              replicas: 1,
              selector: {
                matchLabels: {},
              },
              template: {
                metadata: {
                  labels: {},
                },
                spec: {
                  containers: [],
                },
              },
            },
          };
        case "Service":
          return {
            id: "",
            provider: provider,
            type: "",
            metadata: {
              name: "",
              labels: {},
              annotations: {},
            },
            spec: {
              type: "",
              selector: {},
              ports: [{ port: 80 }],
              clusterIP: "",
              externalIPs: [],
            },
          };
        case "Secret":
          return {
            id: "",
            provider: provider,
            type: "",
            metadata: {
              name: "",
              labels: {},
              annotations: {},
            },
            secret_type: "Opaque",
            data: {},
          };
        case "ConfigMap":
          return {
            id: "",
            provider: provider,
            type: "",
            metadata: {
              name: "",
              labels: {},
              annotations: {},
            },
            data: {},
          };
      }
    case "aws":
      switch (type) {
        case "VPC":
          return {
            name: "",
            cidr_block: "",
            enable_dns_support: true,
            enable_dns_hostname: true,
            tags: {},
          };
        case "subnet":
          return {
            name: "",
            cidr_block: "",
            availability_zone: "",
            map_public_ip_on_launch: false,
            tags: {},
            refs: {
              vpc: "",
            },
          };
        case "internet_gateway":
          return {
            name: "",
            tags: {},
            refs: {
              vpc: "",
            },
          };
        case "eip":
          return {
            name: "",
            type: "eip",
            domain: "vpc",
            tags: {},
          };

        case "nat_gateway":
          return {
            name: "",
            tags: {},
            refs: {
              subnet: "",
              eip: "",
            },
            vpc_ref: "",
          };
        case "RouteTable":
          return {
            name: "",
            tags: {},
            refs: {},
            routes: [],
          };
        case "route_table_association":
          return {
            id: "",
            refs: {
              subnet: "",
              route_table: "",
            },
          };
        case "S3":
          return {
            bucket: "",
            region: "",
            acl: "private",
            versioning: {
              enabled: false,
            },
            tags: {},
          };
        case "SecurityGroup":
          return {
            refs: {
              vpc: "",
            },
            ingress: [],
            egress: [],
            name: "",
            description: "",
            tags: {},
          };
        case "vpc_security_group_ingress_rule":
          return {
            refs: {
              security_group: "",
            },
            protocol: "tcp",
            from_port: 22,
            to_port: 22,
            cidr_blocks: [],
            description: "",
          };
        case "vpc_security_group_egress_rule":
          return {
            refs: {
              security_group: "",
            },
            protocol: "-1",
            from_port: 0,
            to_port: 0,
            cidr_blocks: [],
            description: "",
          };
        case "EC2":
          return {
            name: "",
            ami: "",
            instance_type: "",
            // region: "",
            tags: {},
            refs: {},
          };

        case "eip_association":
          return {
            refs: {
              instance: "",
              eip: "",
            },
            depends_on: [],
          };
        case "LoadBalancer":
          return {
            name: "",
            load_balancer_type: "application",
            internal: false,
            enable_deletion_protection: false,
            subnets: [],
            security_groups: [],
            listeners: [
              {
                port: 80,
                protocol: "HTTP",
                default_action: [
                  {
                    type: "forward",
                    target_group_arn: "",
                  },
                ],
              },
            ],
            tags: {},
          };
        case "TargetGroup":
          return {
            name: "",
            protocol: "HTTP",
            port: 80,
            health_check: {},
            target_type: "instance",
            refs: {},
            tags: {},
          };
      }
  }
}
