import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import axios from 'axios';
import { Collection, Item, ItemGroup, HeaderDefinition, Url } from 'postman-collection';

const ROUTES_DIR = path.join(__dirname, '../src/Routes');
const CONTROLLERS_DIR = path.join(__dirname, '../src/controllers');
const VALIDATION_DIR = path.join(__dirname, '../src/validation');
const OUTPUT_FILE = path.join(__dirname, '../postman_collection.json');
const DEBUG_FILE = path.join(__dirname, '../debug_output.txt');

interface RouteInfo {
  method: string;
  path: string;
  controller: string;
  middleware: string[];
}

const debugLines: string[] = [];
const debug = (line: string) => {
  debugLines.push(line);
};

// ---------------- ROUTE PARSER ----------------
function parseRoutesFile(filePath: string): RouteInfo[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const routes: RouteInfo[] = [];

  for (const line of lines) {
    const match = line.match(/\.(\w+)\("([^"]+)"\s*,\s*(.+)\)/);
    if (!match) continue;

    const method = match[1].toUpperCase();
    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) continue;

    const routePath = match[2];
    const rest = match[3].split(',');

    const controller = rest.pop()?.replace(/\w+Controller\./, '') || "";
    const middleware = rest.filter(Boolean);

    routes.push({ method, path: routePath, controller, middleware });
  }

  return routes;
}

// ---------------- FIND SCHEMA ----------------
function findSchemaInController(controllerName: string, controllerFile: string): string | undefined {
  if (!fs.existsSync(controllerFile)) return;

  const content = fs.readFileSync(controllerFile, 'utf-8');

  const regex = new RegExp(`export const ${controllerName}\\s*=`, 'g');
  const match = regex.exec(content);
  if (!match) return;

  const start = content.indexOf('{', match.index);
  let count = 1;
  let i = start + 1;

  while (count > 0 && i < content.length) {
    if (content[i] === '{') count++;
    else if (content[i] === '}') count--;
    i++;
  }

  const body = content.substring(start, i);
  const schemaMatch = body.match(/(\w+Schema)\.validate/);

  return schemaMatch ? schemaMatch[1] : undefined;
}

// ---------------- BASE PATH ----------------
function getBasePaths() {
  const indexFile = path.join(ROUTES_DIR, 'index.ts');
  const content = fs.readFileSync(indexFile, 'utf-8');

  const basePaths: Record<string, string> = {};
  const regex = /router\.use\("([^"]+)"\s*,\s*(\w+)Router\)/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    basePaths[match[2]] = match[1];
  }

  return basePaths;
}

function generateSampleFromSchemaObject(schemaDesc: any, prefix = ""): { sample: any, validation: string } {
  let sample: any = {};
  let validation = "";

  if (schemaDesc.type === "object" && schemaDesc.keys) {
    for (const [key, details] of Object.entries<any>(schemaDesc.keys)) {
      const isRequired = details.flags?.presence === "required";
      const fullPath = prefix ? `${prefix}.${key}` : key;
      validation += `| ${fullPath} | ${details.type} | ${isRequired ? "Required" : "Optional"} |\n`;

      if (details.type === "object") {
        const nested = generateSampleFromSchemaObject(details, fullPath);
        sample[key] = nested.sample;
        validation += nested.validation;
      } else if (details.type === "array") {
        sample[key] = [];
        if (details.items && details.items.length > 0) {
           const itemSchema = details.items[0];
           if (itemSchema.type === "object") {
             const nested = generateSampleFromSchemaObject(itemSchema, `${fullPath}[]`);
             sample[key].push(nested.sample);
             validation += nested.validation;
           } else {
             sample[key] = [itemSchema.type === "string" ? "sample_string" : 123];
           }
        }
      } else if (details.type === "alternatives") {
         const objectMatch = details.matches?.find((m: any) => m.schema?.type === "object");
         if (objectMatch) {
            const nested = generateSampleFromSchemaObject(objectMatch.schema, fullPath);
            sample[key] = nested.sample;
            validation += nested.validation;
         } else if (details.matches && details.matches.length > 0) {
            sample[key] = `sample_${details.matches[0].schema?.type || 'alt'}`;
         }
      } else if (details.type === "string") {
        if (key.toLowerCase().includes("email")) sample[key] = "test@example.com";
        else if (key.toLowerCase().includes("password")) sample[key] = "Password123!";
        else sample[key] = `sample_${key}`;
      } else if (details.type === "number") {
        if (key === "page") sample[key] = 1;
        else if (key === "limit") sample[key] = 10;
        else sample[key] = 123;
      } else if (details.type === "boolean") {
        sample[key] = true;
      } else if (details.type === "any") {
        sample[key] = "sample_any";
      } else {
        sample[key] = "";
      }
    }
  }

  return { sample, validation };
}

function generateSampleFromSchema(schemaName: string, validationFile: string): { sample: any, validation: string } | null {
  if (!fs.existsSync(validationFile)) return null;

  try {
    const mod = require(validationFile);
    if (mod[schemaName] && typeof mod[schemaName].describe === 'function') {
      const schemaDesc = mod[schemaName].describe();
      const result = generateSampleFromSchemaObject(schemaDesc);
      result.validation = "\n\n### Validation Rules\n| Field | Type | Requirement |\n|---|---|---|\n" + result.validation;
      return result;
    } else {
      debug(`Could not find valid schema ${schemaName} in ${validationFile}`);
    }
  } catch (e: any) {
    debug(`Error requiring validation file ${validationFile}: ${e.message}`);
  }

  return null;
}

// ---------------- FORMAT TITLE ----------------
function formatSchemaToTitle(schemaName: string): string {
  let name = schemaName.replace(/Schema$/, '');
  name = name.replace(/([A-Z])/g, ' $1');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// ---------------- GENERATE NAME ----------------
function generateReadableName(route: RouteInfo, schemaName?: string): string {
  if (schemaName) return formatSchemaToTitle(schemaName);

  const actionMap: any = {
    POST: "Create",
    GET: "Get",
    PUT: "Update",
    DELETE: "Delete"
  };

  const action = actionMap[route.method] || route.method;
  const lastPart = route.path.split('/').filter(Boolean).pop() || "Item";

  return `${action} ${lastPart.charAt(0).toUpperCase() + lastPart.slice(1)}`;
}

// ---------------- SYNC TO POSTMAN ----------------
async function syncToPostman(collectionJSON: any) {
  const apiKey = process.env.POSTMAN_API_KEY;
  const collectionUid = process.env.POSTMAN_COLLECTION_UID;

  if (!apiKey || !collectionUid) {
    console.log("\n⚠️  Postman API Key or Collection UID missing in .env. Skipping cloud sync.");
    console.log("💡 To enable sync, add POSTMAN_API_KEY and POSTMAN_COLLECTION_UID to your .env file.");
    return;
  }

  try {
    console.log(`\nSyncing to Postman Cloud (UID: ${collectionUid})...`);
    
    await axios.put(
      `https://api.getpostman.com/collections/${collectionUid}`,
      { collection: collectionJSON },
      {
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("🚀 Postman collection synced successfully with Postman Cloud!");
  } catch (error: any) {
    console.error("❌ Failed to sync with Postman API:");
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

// ---------------- MAIN ----------------
async function main() {
  const collection = new Collection({
    info: {
      name: "Delvoura API",
      description: {
        content: "Auto generated API collection",
        type: "text/plain"
      }
    }
  });

  // @ts-ignore
  collection.variables.add({ key: "baseUrl", value: `http://localhost:${process.env.PORT || 3000}` });
  // @ts-ignore
  collection.variables.add({ key: "token", value: "" });

  const basePaths = getBasePaths();
  debug(`Base paths found: ${JSON.stringify(basePaths)}`);

  for (const [routerName, basePath] of Object.entries(basePaths)) {
    const routerFile = path.join(ROUTES_DIR, `${routerName}.ts`);
    if (!fs.existsSync(routerFile)) {
      debug(`Skipping router ${routerName} because file was not found`);
      continue;
    }

    const routes = parseRoutesFile(routerFile);
    debug(`Processing router: ${routerName} at ${basePath}`);
    debug(`Found ${routes.length} routes in ${routerName}`);
    const hasJwt = routes.some(r => r.middleware.some(m => m.toLowerCase().includes('jwt')));

    const folder: ItemGroup<Item> = new ItemGroup({
      name: routerName.toUpperCase(),
      description: {
        content: `Routes for ${routerName}`,
        type: "text/plain"
      }
    });

    // ✅ Folder level token
    if (hasJwt) {
      (folder as any).auth = {
        type: "bearer",
        bearer: [
          { key: "token", value: "{{token}}", type: "string" }
        ]
      };
    }

    collection.items.add(folder as any);

    for (const route of routes) {
      debug(`  Processing route: ${route.method} ${route.path}`);
      const controllerFile = path.join(CONTROLLERS_DIR, routerName, 'index.ts');
      const schemaName = findSchemaInController(route.controller, controllerFile);
      if (schemaName) debug(`    Found schema: ${schemaName} for controller: ${route.controller}`);

      const validationFile = path.join(VALIDATION_DIR, `${routerName}.ts`);
      const result = schemaName ? generateSampleFromSchema(schemaName, validationFile) : null;

      const headers: HeaderDefinition[] = [];
      let body: any = undefined;

      if (result?.sample && route.method !== 'GET') {
        headers.push({ key: "Content-Type", value: "application/json" });
        body = {
          mode: 'raw',
          raw: JSON.stringify(result.sample, null, 2)
        };
      }

      const urlPath = route.path.replace(/:(\w+)/g, '{{$1}}');
      const fullUrlStr = `{{baseUrl}}${basePath}${urlPath}`;
      const url = new Url(fullUrlStr);

      if (result?.sample && (route.method === 'GET' || route.method === 'DELETE')) {
        for (const [key, value] of Object.entries(result.sample)) {
          if (key === 'id' && urlPath.includes('{{id}}')) continue;

          if (Array.isArray(value)) {
            for (const item of value) {
              url.addQueryParams([{ key: key, value: String(item) }]);
            }
          } else if (typeof value === 'object' && value !== null) {
            url.addQueryParams([{ key: key, value: JSON.stringify(value) }]);
          } else {
            url.addQueryParams([{ key: key, value: String(value) }]);
          }
        }
      }

      const request = new Item({
        name: generateReadableName(route, schemaName),
        request: {
          method: route.method,
          url: url.toJSON(), // Use toJSON() to get clean plain object
          header: headers,
          body: body,
          auth: null, // inherit from folder
          description: {
            content: `Controller: ${route.controller}${schemaName ? `\nSchema: ${schemaName}` : ""}${result?.validation || ""}`,
            type: "text/markdown"
          }
        }
      });

      folder.items.add(request);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(collection.toJSON(), null, 2));
  fs.writeFileSync(DEBUG_FILE, `${debugLines.join('\n')}\n`);

  console.log("✅ Postman collection generated successfully!");

  // ✅ Sync to Postman Cloud if configured
  await syncToPostman(collection.toJSON());
}

main().catch(console.error);
