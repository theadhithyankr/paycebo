// Dependency-free financial tests are separate. This checks parsing of every TS/TSX source.
// A compiler path may be supplied to reuse an existing local TypeScript installation offline.
const fs = require("node:fs");
const path = require("node:path");
const ts = require(process.argv[2] || "typescript");
const files = [];
function visit(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (/\.tsx?$/.test(file)) files.push(file);
  }
}
visit("app"); visit("src");
let failures = 0;
for (const file of files) {
  const result = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    fileName: file, reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX, isolatedModules: true },
  });
  for (const diagnostic of result.diagnostics || []) {
    failures++;
    console.error(file + ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
  }
}
console.log(files.length + " TypeScript/TSX files parsed; " + failures + " errors.");
process.exitCode = failures ? 1 : 0;
