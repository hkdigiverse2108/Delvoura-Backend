import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { Collection, Item, ItemGroup, HeaderDefinition } from 'postman-collection';

const ROUTES_DIR = path.join(__dirname, '../src/Routes');
const CONTROLLERS_DIR = path.join(__dirname, '../src/controllers');
const VALIDATION_DIR = path.join(__dirname, '../src/validation');
const OUTPUT_FILE = path.join(__dirname, '../postman_collection.json');

interface RouteInfo {
  method: string;
  path: string;
  controller: string;
  middleware: string[];
}

// ---------------- ROUTE PARSER ----------------
function parseRoutesFile(filePath: string): RouteInfo[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const routes: RouteInfo[] = [];

  for (const line of lines) {
    const match = line.trim().match(/\.(\w+)\("([^"]+)"\s*,\s*(.+)\)/);
    if (!match) continue;

    const method = match[1].toUpperCase();
    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) continue;

    const routePath = match[2];
    const rest = match[3].split(',').map(s => s.trim());

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

// ---------------- SAMPLE GENERATOR ----------------
function generateSampleFromSchema(schemaName: string, validationFile: string): { sample: any, validation: string } | null {
  if (!fs.existsSync(validationFile)) return null;

  const content = fs.readFileSync(validationFile, 'utf-8');

  const regex = new RegExp(`export const ${schemaName} = Joi\\.object\\({([\\s\\S]+?)}\\)`);
  const match = regex.exec(content);
  if (!match) return null;

  const fields = match[1];
  const sample: any = {};
  let validationTable = "\n\n### Validation Rules\n| Field | Type | Requirement |\n|---|---|---|\n";

  const lines = fields.split('\n');

  for (const line of lines) {
    const fieldMatch = line.match(/(\w+)\s*:\s*Joi\.(\w+)/);
    if (!fieldMatch) continue;

    const key = fieldMatch[1];
    const type = fieldMatch[2];
    const required = line.includes('.required()');

    validationTable += `| ${key} | ${type} | ${required ? "Required" : "Optional"} |\n`;

    if (type === 'string') {
      if (key.includes('email')) sample[key] = "test@example.com";
      else if (key.includes('password')) sample[key] = "Password123!";
      else sample[key] = "sample_" + key;
    } else if (type === 'number') sample[key] = 123;
    else if (type === 'boolean') sample[key] = true;
    else sample[key] = "";
  }

  return { sample, validation: validationTable };
}

// ---------------- FORMAT TITLE ----------------
function formatSchemaToTitle(schemaName: string): string {
  let name = schemaName.replace(/Schema$/, '');
  name = name.replace(/([A-Z])/g, ' $1').trim();
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

  for (const [routerName, basePath] of Object.entries(basePaths)) {
    const routerFile = path.join(ROUTES_DIR, `${routerName}.ts`);
    if (!fs.existsSync(routerFile)) continue;

    const routes = parseRoutesFile(routerFile);
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
      const controllerFile = path.join(CONTROLLERS_DIR, routerName, 'index.ts');
      const schemaName = findSchemaInController(route.controller, controllerFile);

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

      const request = new Item({
        name: generateReadableName(route, schemaName),
        request: {
          method: route.method,
          url: `{{baseUrl}}${basePath}${urlPath}`,
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

  console.log("✅ Postman collection generated successfully!");
}

main().catch(console.error);