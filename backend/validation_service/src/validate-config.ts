import Ajv from "ajv";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

const ajv = new Ajv({ allErrors: true });

const schemaMap: Record<string, string> = {
  aws_ec2_instance: "aws/ec2.json",
  aws_provider: "aws/provider.json",
  aws_eip: "aws/eip/elastic_ip.json",
  aws_eip_association: "aws/eip/eip_association.json",
  aws_routing: "aws/routing/route_table.json",
  aws_route_table_association: "aws/routing/routing_table_association.json",
  aws_s3: "aws/s3/bucket.json",
  aws_security_group: "aws/security_group/security_group.json",
  aws_vpc_security_group_egress_rule:
    "aws/security_group/vpc_security_group_egress_rule.json",
  aws_vpc_security_group_ingress_rule:
    "aws/security_group/vpc_security_group_ingress_rule.json",
  kubernetes_config_map: "kubernetes/configmap.json",
  kubernetes_deployment: "kubernetes/deployment.json",
  kubernetes_persistent_volume: "kubernetes/persistent_volume.json",
  kubernetes_secret: "kubernetes/secret.json",
  kubernetes_service: "kubernetes/service.json",
  kubernetes_ingress: "kubernetes/ingress.json",
  kubernetes_persistent_volume_claim: "kubernetes/persistent_volume_claim.json",
};

function getAllKeys(obj: any) {
  let keys = Object.keys(obj);

  return keys;
}

async function readJsonFileAndGetKeys(filepath: any) {
  try {
    const data = await fs.readFile(filepath, "utf-8");
    const json = JSON.parse(data);
    return getAllKeys(json);
  } catch (err) {
    console.error(`Error reading or parsing the file at ${filepath}:`, err);
    return [];
  }
}

function checkIfAllSchemaKeysExist(testObj: any, schemaKey: any) {
  if (typeof testObj !== "object") {
    console.error(" testObj must be object");
    return false;
  }

  const testKeys = Object.keys(testObj);
  // const schemaKeys = Object.keys(schemaObj);

  console.log(testKeys);
  console.log(schemaKey);
  for (let i = 1; i < schemaKey.length; i++) {
    console.log(`Checking key: ${schemaKey[i]}`);
    if (!testKeys.includes(schemaKey[i])) {
      console.log(`Missing key: ${schemaKey[i]}`);
      return false;
    }
  }

  return true;
}

function getallservices(Obj: any) {
  //let keys=Object.keys(Obj)
  let services = Obj.connected_services[0].services;
  return services;
}

export async function validateConfig(config: any) {
  let schema;

  try {
    let services = getallservices(config);

    console.log("Validation started");

    let testkey = getAllKeys(config);
    services.forEach(async (e: any) => {
      let p = e.provider || "";
      let t = e.type || "";
      if (t === "") {
        throw new Error(
          "Service 'type' is not present in one of the service objects."
        );
      }

      const mapKey = `${p}_${t}`;
      const relativeSchemaPath = schemaMap[mapKey];
      if (!relativeSchemaPath) {
        return true;
        console.error(`Schema not found for ${mapKey}`);
      }

      const homePath = os.homedir();
      const schemaPath = path.join(
        homePath,
        "InfraSketch",
        "backend",
        "validation_service",
        "schemas",
        relativeSchemaPath
      );
      const schema = await readJsonFileAndGetKeys(schemaPath);

      const result = checkIfAllSchemaKeysExist(e, schema);
      if (result) {
        return true;
      } else {
        return false;
      }
    });
  } catch (err) {
    throw new Error(`Schema not found or failed to read at path`);
  }
  return { message: "Configuration is valid" };
}
