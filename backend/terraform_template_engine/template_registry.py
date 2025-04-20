from jinja2 import FileSystemLoader , Environment

class TemplateRegistry:
    _env = None
    _template_map = {
        "docker_container": "docker/container.tf.j2",
        "docker_network": "docker/network.tf.j2",
        "docker_provider": "docker/provider.tf.j2",
        "kubernetes_deployment": "kubernetes/deployment.yaml.j2",
        "kubernetes_service": "kubernetes/service.yaml.j2",
        "kubernetes_secret": "kubernetes/secret.yaml.j2",
        "kubernetes_config_map": "kubernetes/configMap.yaml.j2",
        "kubernetes_ingress": "kubernetes/ingress.yaml.j2",
        "kubernetes_persistent_volume": "kubernetes/persistent_volume.yaml.j2",
        "kubernetes_persistent_volume_claim": "kubernetes/persistentVolumeClaim.yaml.j2",
        "aws_ec2_instance": "aws/ec2.tf.j2",
        "aws_provider": "aws/provider.tf.j2",
        "aws_eip": "aws/eip/elastic_ip.tf.j2",
        "aws_eip_association": "aws/eip/eip_association.tf.j2",
        "aws_vpc": "aws/vpc.tf.j2",
        "aws_subnet": "aws/subnet.tf.j2",
        "aws_internet_gateway": "aws/internet_gateway.tf.j2",
        "aws_nat_gateway": "aws/nat_gateway.tf.j2",
        "aws_route_table": "aws/routing/route_table.tf.j2",
        "aws_route_table_association": "aws/routing/route_table_association.tf.j2",
        "aws_security_group": "aws/security_group/security_group.tf.j2",
        "aws_vpc_security_group_ingress_rule": "aws/security_group/vpc_security_group_ingress_rule.tf.j2",
        "aws_vpc_security_group_egress_rule": "aws/security_group/vpc_security_group_egress_rule.tf.j2",
        "aws_s3_bucket": "aws/s3/bucket.tf.j2",
        # Add more mappings as needed
    }

    def __init__(self, template_dir='templates'):
        if TemplateRegistry._env is None:
            TemplateRegistry._env = Environment(
                loader=FileSystemLoader(template_dir),
                auto_reload=True,
                trim_blocks=True,
                lstrip_blocks=True
            )

    def get_template(self, name: str):
        if name not in self._template_map:
            raise ValueError(f"Template '{name}' not found in template map.")
        return TemplateRegistry._env.get_template(self._template_map[name])
