from generators.generic_template_generator import GenericTemplateGenerator
from template_registry import TemplateRegistry

class TerraformOrchestrator:
    def __init__(self, config_data: dict, template_registry: TemplateRegistry):
        self.config = config_data
        self.template_registry = template_registry

    def generate(self):
        tf_blocks = {}

        if "connected_services" in self.config:
            for infra in self.config["connected_services"]:
                infra_name = infra["name"]

                # Initialize structure for this infra
                tf_blocks[infra_name] = {"k8s": {}, "tf": []}

                if "services" in infra:
                    for service in infra["services"]:
                        provider = service.get("provider")
                        service_type = service.get("type")
                        template_name = f"{provider}_{service_type}"
                        generator = GenericTemplateGenerator(service, self.template_registry, template_name)
                        rendered_template = generator.render()
                        # tf_blocks[infra_name]["tf"].append(rendered_template)
                        if provider == "kubernetes":
                            service_name = service["metadata"]["name"]
                            tf_blocks[infra_name]["k8s"][service_name] = {"type": "yaml", "code": rendered_template}
                        else:
                            try:
                                print(rendered_template)
                                tf_blocks[infra_name]["tf"].append(rendered_template)
                            except Exception as e:
                                print(f"Error rendering template for {provider}: {e}")
                                raise e
                else:
                    print(f"No services found for {infra_name}. Skipping.")
        else:
            print("No connected services found in the configuration. Skipping.")
            return

        return tf_blocks
