from template_registry import TemplateRegistry
from generators.orcherastor import TerraformOrchestrator
import json
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# CORS config for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/generate")
def generate(config: str = Body(...)):
    try:
        tf_code = generate_tf_code(config)
        return {"status":"success","terraform_code":tf_code}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

def generate_tf_code(config_data):
    config_path = "data/test-infra.json"

    # load json config 
    f = open(config_path, 'r') 
    config_data = json.load(f)
    f.close()

    templates_path = "templates"

    # initialize template registry
    template_registry = TemplateRegistry(templates_path)

    # initialize orcherastor
    orcherastor = TerraformOrchestrator(config_data, template_registry)

    # generate terraform code
    terraform_code = orcherastor.generate()

    print(terraform_code)

    for infra_name, file in terraform_code.items():
        infra_dir = f"tf_output/{infra_name}"
        os.makedirs(infra_dir, exist_ok=True)

    # Handle Kubernetes YAML files
        if "k8s" in file:
            print(file)
            for filename, obj in file["k8s"].items():
                file_path = f"{infra_dir}/{filename}.{obj['type']}"
                with open(file_path, "w") as f:
                    f.write(obj["code"])

    # Handle Terraform TF files
    # Put in single file
        # if "tf" in file:
        #     file_path = f"{infra_dir}/main.tf"
        #     with open(file_path, "w") as f:
        #         for obj in file["tf"]:
        #             f.write(obj)
        #             f.write("\n")

    # Optional: return the terraform_code for response if needed


generate_tf_code("")