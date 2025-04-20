"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = validateConfig;
var ajv_1 = require("ajv");
var fs = require("fs/promises");
var path = require("path");
var os = require("os");
var ajv = new ajv_1.default({ allErrors: true });
var schemaMap = {
    "aws_ec2_instance": "aws/ec2.json",
    "aws_provider": "aws/provider.json",
    "aws_eip": "aws/eip/elastic_ip.json",
    "aws_eip_association": "aws/eip/eip_association.json",
    "aws_routing": "aws/routing/route_table.json",
    "aws_route_table_association": "aws/routing/routing_table_association.json",
    "aws_s3": "aws/s3/bucket.json",
    "aws_security_group": "aws/security_group/security_group.json",
    "aws_vpc_security_group_egress_rule": "aws/security_group/vpc_security_group_egress_rule.json",
    "aws_vpc_security_group_ingress_rule": "aws/security_group/vpc_security_group_ingress_rule.json",
    "aws_kubernetes_configmap": "aws_kubernetes_configmap.json",
    "aws_kubernetes_deployment": "aws_kubernetes_deployment.json",
    "aws_kubernetes_persistent_volume": "aws_kubernetes_persistent_volume.json",
    "aws_kubernetes_secret": "aws_kubernetes_secret.json",
    "aws_kubernetes_service": "aws_kubernetes_service.json"
};
function getAllKeys(obj) {
    var keys = Object.keys(obj);
    return keys;
}
function readJsonFileAndGetKeys(filepath) {
    return __awaiter(this, void 0, void 0, function () {
        var data, json, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs.readFile(filepath, 'utf-8')];
                case 1:
                    data = _a.sent();
                    json = JSON.parse(data);
                    return [2 /*return*/, getAllKeys(json)];
                case 2:
                    err_1 = _a.sent();
                    console.error("Error reading or parsing the file at ".concat(filepath, ":"), err_1);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function checkIfAllSchemaKeysExist(testObj, schemaKey) {
    if (typeof testObj !== 'object') {
        console.error(" testObj must be object");
        return false;
    }
    var testKeys = Object.keys(testObj);
    // const schemaKeys = Object.keys(schemaObj);
    console.log(testKeys);
    console.log(schemaKey);
    for (var i = 1; i < schemaKey.length; i++) {
        console.log("Checking key: ".concat(schemaKey[i]));
        if (!testKeys.includes(schemaKey[i])) {
            console.log("Missing key: ".concat(schemaKey[i]));
            return false;
        }
    }
    return true;
}
function getallservices(Obj) {
    //let keys=Object.keys(Obj)
    var services = Obj.connected_services[0].services;
    return services;
}
function validateConfig(config) {
    return __awaiter(this, void 0, void 0, function () {
        var schema, services, testkey;
        var _this = this;
        return __generator(this, function (_a) {
            try {
                services = getallservices(config);
                testkey = getAllKeys(config);
                services.forEach(function (e) { return __awaiter(_this, void 0, void 0, function () {
                    var p, t, mapKey, relativeSchemaPath, homePath, schemaPath, schema, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                p = e.provider || "";
                                t = e.type || "";
                                if (t === "") {
                                    throw new Error("Service 'type' is not present in one of the service objects.");
                                }
                                mapKey = "".concat(p, "_").concat(t);
                                relativeSchemaPath = schemaMap[mapKey];
                                console.log("realtive", relativeSchemaPath);
                                if (!relativeSchemaPath) {
                                    console.error("Schema not found for ".concat(mapKey));
                                }
                                homePath = os.homedir();
                                schemaPath = path.join(homePath, 'InfraSketch', 'backend', 'validation_service', 'schemas', relativeSchemaPath);
                                return [4 /*yield*/, readJsonFileAndGetKeys(schemaPath)];
                            case 1:
                                schema = _a.sent();
                                result = checkIfAllSchemaKeysExist(e, schema);
                                if (result) {
                                    console.log("validated");
                                }
                                else {
                                    console.log("failed");
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
            }
            catch (err) {
                throw new Error("Schema not found or failed to read at path");
            }
            return [2 /*return*/, { message: 'Configuration is valid' }];
        });
    });
}
// Run the validation
var config = { "connected_services": [
        {
            "name": "test",
            "services": [
                {
                    "id": "aws-compute-1",
                    "provider": "aws",
                    "type": "ec2_instance",
                    "name": "",
                    "ami": "",
                    "instance_type": "",
                    "tags": {},
                    "refs": {}
                },
                {
                    "id": "aws-storage-2",
                    "provider": "aws",
                    "bucket": "",
                    "region": "",
                    "acl": "private",
                    "versioning": {
                        "enabled": false
                    },
                    "tags": {}
                }
            ]
        }
    ]
};
validateConfig(config)
    .then(function () { return console.log("Validation successful"); })
    .catch(function (err) { return console.log("Validation failed:", err); });
