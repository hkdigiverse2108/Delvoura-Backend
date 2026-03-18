import path from 'path';
const valPath = path.join(__dirname, 'src/validation/auth.ts');
const mod = require(valPath);
console.log(Object.keys(mod));
console.log(mod.signupSchema.describe().type);
