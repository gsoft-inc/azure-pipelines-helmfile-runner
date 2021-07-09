const fs = require('fs-extra');
const path = require("path");
const glob = require("glob");
const { execSync } = require('child_process');

const taskDir = path.dirname(__dirname);
const buildDir = path.join(taskDir, "build");
const publishDir = path.join(taskDir, "dist");

if (!fs.existsSync(buildDir)) {
    console.error(`no build output at ${buildDir}`);
    return;
}

if (!fs.existsSync(publishDir)) {
    fs.mkdirSync(publishDir);
}

console.log("syncing build directory...")
const files = glob.sync("src/**/*.js", { cwd: buildDir });
files.forEach(file => fs.copySync(path.join(buildDir, file), path.join(publishDir, file)));
console.log(`Done! Synced ${files.length} files.`)

console.log("syncing task dependencies...")
fs.copyFileSync(path.join(taskDir, "task.json"), path.join(publishDir, "task.json"));
fs.copyFileSync(path.join(taskDir, "icon.png"), path.join(publishDir, "icon.png"));
console.log("done!");

console.log("installing production only node modules...");
fs.copyFileSync(path.join(taskDir, "package.json"), path.join(publishDir, "package.json"));
execSync("npm install --production", { cwd: publishDir });
console.log("done!");

console.log("fixing node modules for tfx package...");
fs.moveSync(
    path.join(publishDir, "node_modules/azure-pipelines-tasks-azure-arm-rest-v2/openssl/OpenSSL License.txt"),
    path.join(publishDir, "node_modules/azure-pipelines-tasks-azure-arm-rest-v2/openssl/OpenSSL_License.txt"));
console.log("done!");