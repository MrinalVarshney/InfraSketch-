export function removeConnectionIdFromNode(
  nodeId: string,
  connectionId: string,
  getNode: (nodeId: string) => any
) {
  const node = getNode(nodeId);
  const connections = node?.data?.connections || [];
  const updatedConnections = connections.filter(
    (id: string) => id !== connectionId
  );

  const updatedNode = {
    ...node,
    data: {
      ...node.data,
      connections: updatedConnections,
    },
  };
  return updatedNode;
}

export const handleDeploymentDisconnectFromService = (
  deploymentNodeId: string,
  serviceNodeId: string,
  getNode: (nodeId: string) => any,
  updateNodeData: (nodeId: string, data: any) => void
): void => {
  let deploymentNode = getNode(deploymentNodeId);
  let serviceNode = getNode(serviceNodeId);
  //Remove connection
  serviceNode = removeConnectionIdFromNode(
    serviceNodeId,
    deploymentNodeId,
    getNode
  );
  deploymentNode = removeConnectionIdFromNode(
    deploymentNodeId,
    serviceNodeId,
    getNode
  );

  updateNodeData(deploymentNodeId, deploymentNode.data);

  const deploymentLabels =
    deploymentNode?.data?.properties?.spec?.template?.metadata?.labels || {};

  // Clone existing selector
  const updatedSelector = { ...serviceNode.data?.properties?.spec?.selector };

  // Remove matching key-value pairs
  Object.keys(deploymentLabels).forEach((key) => {
    if (updatedSelector[key] === deploymentLabels[key]) {
      delete updatedSelector[key];
    }
  });

  console.log(updatedSelector);

  const updatedServiceNode = {
    ...serviceNode,
    data: {
      ...serviceNode.data,
      properties: {
        ...serviceNode.data.properties,
        spec: {
          ...serviceNode.data.properties.spec,
          selector: updatedSelector,
        },
      },
    },
  };
  updateNodeData(serviceNodeId, updatedServiceNode.data);
};

export const handleDeploymentDisconnectFromSecret = (
  deploymentNodeId: string,
  secretNodeId: string,
  getNode: (nodeId: string) => any,
  updateNodeData: (nodeId: string, data: any) => void
) => {
  let deploymentNode = getNode(deploymentNodeId);
  let secretNode = getNode(secretNodeId);

  //Remove connection
  secretNode = removeConnectionIdFromNode(
    secretNodeId,
    deploymentNodeId,
    getNode
  );

  updateNodeData(secretNodeId, secretNode.data);

  deploymentNode = removeConnectionIdFromNode(
    deploymentNodeId,
    secretNodeId,
    getNode
  );

  // Update Deployment node data to remove the secret reference in environment variables
  const updatedDeploymentEnv =
    deploymentNode.data?.properties?.spec?.template?.spec?.containers?.map(
      (container: any) => ({
        ...container,
        env: container.env?.map((envVar: any) => {
          if (
            envVar.valueFrom?.secretKeyRef?.name ===
            secretNode.data?.properties?.metadata?.name
          ) {
            // Remove the valueFrom property if it references the disconnected secret
            const { valueFrom, ...rest } = envVar;
            return rest;
          }
          return envVar;
        }),
      })
    );

  const updatedDeploymentNodeData = {
    ...deploymentNode.data,
    properties: {
      ...deploymentNode.data.properties,
      spec: {
        ...deploymentNode.data.properties.spec,
        template: {
          ...deploymentNode.data.properties.spec.template,
          spec: {
            ...deploymentNode.data.properties.spec.template.spec,
            containers: updatedDeploymentEnv,
          },
        },
      },
    },
  };

  updateNodeData(deploymentNodeId, updatedDeploymentNodeData);
};

export const handleDeploymentDisconnectFromConfigMap = (
  deploymentNodeId: string,
  configMapNodeId: string,
  getNode: (nodeId: string) => any,
  updateNodeData: (nodeId: string, data: any) => void
) => {
  let deploymentNode = getNode(deploymentNodeId);
  let configMapNode = getNode(configMapNodeId);

  if (!deploymentNode || !configMapNode) {
    console.warn(
      `Could not find deployment node with ID ${deploymentNodeId} or configMap node with ID ${configMapNodeId} during disconnect.`
    );
    return;
  }

  // Remove connection from ConfigMap node
  configMapNode = removeConnectionIdFromNode(
    configMapNodeId,
    deploymentNodeId,
    getNode
  );
  updateNodeData(configMapNodeId, { ...configMapNode.data });

  // Remove connection from Deployment node
  deploymentNode = removeConnectionIdFromNode(
    deploymentNodeId,
    configMapNodeId,
    getNode
  );

  // Update Deployment node data to remove the ConfigMap reference in environment variables
  const updatedDeploymentEnv =
    deploymentNode.data?.properties?.spec?.template?.spec?.containers?.map(
      (container: any) => ({
        ...container,
        env: container.env?.map((envVar: any) => {
          if (
            envVar.valueFrom?.configMapKeyRef?.name ===
            configMapNode.data?.properties?.metadata?.name
          ) {
            // Remove the valueFrom property if it references the disconnected ConfigMap
            const { valueFrom, ...rest } = envVar;
            return rest;
          }
          return envVar;
        }),
      })
    );

  console.log(
    "Updated Deployment Env after ConfigMap disconnect:",
    updatedDeploymentEnv
  );

  const updatedDeploymentNodeData = {
    ...deploymentNode.data,
    properties: {
      ...deploymentNode.data.properties,
      spec: {
        ...deploymentNode.data.properties.spec,
        template: {
          ...deploymentNode.data.properties.spec.template,
          spec: {
            ...deploymentNode.data.properties.spec.template.spec,
            containers: updatedDeploymentEnv,
          },
        },
      },
    },
  };

  updateNodeData(deploymentNodeId, updatedDeploymentNodeData);
};

function handleServiceDisconnectFromingress(
  serviceNodeId: string,
  ingressNodeId: string,
  getNode: (nodeId: string) => any,
  updateNodeData: (nodeId: string, data: any) => void
) {
  let serviceNode = getNode(serviceNodeId);
  let ingressNode = getNode(ingressNodeId);
  //Remove connection
  const updatedIngress = removeConnectionIdFromNode(
    ingressNodeId,
    serviceNodeId,
    getNode
  );
  const updatedService = removeConnectionIdFromNode(
    serviceNodeId,
    ingressNodeId,
    getNode
  );

  // Remove service reference from ingress rules
  const serviceName = serviceNode.data.properties?.metadata?.name;
  if (serviceName && updatedIngress.data.properties?.spec?.rules) {
    updatedIngress.data.properties.spec.rules =
      updatedIngress.data.properties.spec.rules
        .map((rule: HttpRule) => ({
          ...rule,
          http: {
            ...rule.http,
            paths: rule.http.paths.filter(
              (path) => path.backend.service.name !== serviceName
            ),
          },
        }))
        .filter((rule: HttpRule) => rule.http.paths.length > 0);
  }

  // Update both nodes
  updateNodeData(serviceNodeId, updatedService.data);
  updateNodeData(ingressNodeId, updatedIngress.data);
}

export function handleDependencyCleanup(
  sourceNodeId: string,
  destinationNodeId: string,
  getNode: (nodeId: string) => any,
  updateNodeData: (nodeId: string, data: any) => void
) {
  const sourceNode = getNode(sourceNodeId);
  const destinationNode = getNode(destinationNodeId);
  const sourceProvider = sourceNode?.data.provider;
  const destinationProvider = destinationNode?.data.provider;
  const sourceType = sourceNode?.data?.label;
  const destinationType = destinationNode?.data?.label;

  if (sourceProvider === "kubernetes" && destinationProvider === "kubernetes") {
    // Check if the source node is a Deployment and the destination node is a Service
    if (sourceType === "Deployment" && destinationType === "Service") {
      // Remove the selector from the Service node
      handleDeploymentDisconnectFromService(
        sourceNodeId,
        destinationNodeId,
        getNode,
        updateNodeData
      );
    } else if (sourceType === "Service" && destinationType === "Deployment") {
      // Remove the selector from the Service node
      handleDeploymentDisconnectFromService(
        destinationNodeId,
        sourceNodeId,
        getNode,
        updateNodeData
      );
    } else if (sourceType === "Deployment" && destinationType === "Secret") {
      handleDeploymentDisconnectFromSecret(
        sourceNodeId,
        destinationNodeId,
        getNode,
        updateNodeData
      );
    } else if (sourceType === "Secret" && destinationType === "Deployment") {
      handleDeploymentDisconnectFromSecret(
        destinationNodeId,
        sourceNodeId,
        getNode,
        updateNodeData
      );
    } else if (sourceType === "Deployment" && destinationType === "ConfigMap") {
      handleDeploymentDisconnectFromConfigMap(
        sourceNodeId,
        destinationNodeId,
        getNode,
        updateNodeData
      );
    } else if (sourceType === "ConfigMap" && destinationType === "Deployment") {
      handleDeploymentDisconnectFromConfigMap(
        destinationNodeId,
        sourceNodeId,
        getNode,
        updateNodeData
      );
    } else if (sourceType === "Service" && destinationType === "Ingress") {
      handleServiceDisconnectFromingress(
        sourceNodeId,
        destinationNodeId,
        getNode,
        updateNodeData
      );
    } else if (sourceType === "Ingress" && destinationType === "Service") {
      handleServiceDisconnectFromingress(
        destinationNodeId,
        sourceNodeId,
        getNode,
        updateNodeData
      );
    }
  }
}

export function handleNodeDependencyCleanup(
  node: any,
  getNode: (nodeId: string) => any,
  updateNodeData: (nodeId: string, data: any) => void
) {
  const connections = node.data?.connections || [];
  connections.forEach((connectionId: string) => {
    handleDependencyCleanup(
      node.data.id,
      connectionId,
      getNode,
      updateNodeData
    );
  });
}
