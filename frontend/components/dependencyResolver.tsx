// dependencyResolvers.ts

export function udpateConnections(
  node: any,
  targetNodeid: string,
  updateNodeData: (nodeId: string, data: any) => void
) {
  //Check if the service node is connected to the deployment node
  const connectedNodes = node.data.connections || [];
  const isConnected = connectedNodes.some(
    (nodeId: string) => nodeId === targetNodeid
  );
  if (!isConnected) {
    node.data.connections = [...connectedNodes, targetNodeid];
    updateNodeData(node.id, node.data);
  }
}

export function resolveServiceToDeployment(
  serviceNode: any,
  deploymentNode: any,
  updateNodeData: (nodeId: string, data: any) => void
) {
  const podLabels =
    deploymentNode?.data?.properties?.spec?.template?.metadata?.labels || {};

  serviceNode.data = {
    ...serviceNode.data,
    properties: {
      ...serviceNode.data.properties,
      spec: {
        ...serviceNode.data.properties?.spec,
        selector: {
          ...podLabels,
        },
      },
    },
  };

  udpateConnections(deploymentNode, serviceNode.id, updateNodeData);
  udpateConnections(serviceNode, deploymentNode.id, updateNodeData);
}

export function resolveIngressToService(ingressNode: any, serviceNode: any) {
  // similar pattern for ingress → service
}

export function resolveVolumeToPod(volumeNode: any, podNode: any) {
  // etc.
}
