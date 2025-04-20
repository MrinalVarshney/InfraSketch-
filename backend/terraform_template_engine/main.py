from template_registry import TemplateRegistry
from generators.orcherastor import TerraformOrchestrator
import json
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import os
import shutil
import tempfile
from fastapi.responses import FileResponse

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
async def generate(payload: Dict[str, Any]):
    try:
        
        zip_file_path = generate_tf_code(payload)
        print(f"Generated zip file path: {zip_file_path}")
        
        # Return the zip file as a response
        return FileResponse(
            path=zip_file_path,
            media_type='application/zip',
            filename='generated_k8s_files.zip'
        )
        
    except FileNotFoundError as e:
        print(f"File not found: {e}")
        raise HTTPException(status_code=404, detail="File not found")
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
def generate_tf_code(config_data=None):
    config_path = "data/test-infra1.json"

    # Load JSON config if not passed
    if config_data is None:
        with open(config_path, 'r') as f:
            config_data = json.load(f)

    templates_path = "templates"

    # Initialize template registry
    template_registry = TemplateRegistry(templates_path)

    # Initialize orchestrator
    orchestrator = TerraformOrchestrator(config_data, template_registry)

    # Generate terraform code
    terraform_code = orchestrator.generate()

    # Create a temp directory to hold all files
    current_dir = os.getcwd()
    temp_base = tempfile.mkdtemp(dir=current_dir)
    output_dir = os.path.join(temp_base, "tf_output")
    os.makedirs(output_dir, exist_ok=True)

    for infra_name, file in terraform_code.items():
        infra_dir = os.path.join(output_dir, infra_name)
        os.makedirs(infra_dir, exist_ok=True)

        # Handle Kubernetes YAML files
        if "k8s" in file:
            for filename, obj in file["k8s"].items():
                file_path = os.path.join(infra_dir, f"{filename}.{obj['type']}")
                print(f"Creating {file_path}")
                with open(file_path, "w") as f:
                    f.write(obj["code"])

        # Handle Terraform TF files (combine into main.tf)
        if "tf" in file:
            tf_file_path = os.path.join(infra_dir, "main.tf")
            with open(tf_file_path, "w") as f:
                for obj in file["tf"]:
                    f.write(obj)
                    f.write("\n")

    # Create zip file of output
    print("Zipping files...")
    zip_file_path = shutil.make_archive(output_dir, 'zip', output_dir)
    print(f"Zip file created at: {zip_file_path}")

    return zip_file_path