const fs = require("fs");
const path = require("path");
const esbuild = require("/workspace/abc-app/build/node_modules/esbuild");

const res = esbuild.buildSync({
  entryPoints: [path.join(__dirname, "src/main.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  jsx: "automatic",
  nodePaths: ["/workspace/abc-app/build/node_modules"],
  write: false,
});

const js = res.outputFiles[0].text;
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
<title>Letter Adventure — IB PYP Edition (Year 1 to Year 4)</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #FFFDF7; color: #1E293B; }
  button:hover { filter: brightness(0.97); }
  button:active { transform: scale(0.98); }
</style>
</head>
<body>
<div id="root"></div>
<script>${js}</script>
</body>
</html>
`;

const outPath = path.join(__dirname, "Letter-Adventure-IB-PYP.html");
fs.writeFileSync(outPath, html, "utf8");
console.log("Built:", outPath, "Size:", fs.statSync(outPath).size, "bytes");
