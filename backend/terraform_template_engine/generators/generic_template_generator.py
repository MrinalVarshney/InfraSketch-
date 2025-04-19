
class GenericTemplateGenerator():
    def __init__(self, config: dict, template_registry, template_name: str):
        self.config = config
        self.template_registry = template_registry
        self.template_name = template_name

    def render(self) -> str:
        template = self.template_registry.get_template(self.template_name)
        return template.render(self.config)
