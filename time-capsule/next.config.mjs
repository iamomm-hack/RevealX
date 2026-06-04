import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

try {
  const rootGit = "e:\\Time-Capsule\\.git";
  const subGit = "e:\\Time-Capsule\\time-capsule\\.git";
  
  if (fs.existsSync(subGit) && !fs.existsSync(rootGit)) {
    fs.renameSync(subGit, rootGit);
    console.log("=== MOVED .git TO ROOT ===");
  }
  
  const runGit = (args) => {
    try {
      const output = execSync(`git ${args}`, { cwd: 'e:\\Time-Capsule', encoding: 'utf8' });
      console.log(`git ${args} output:\n`, output);
      return output;
    } catch (err) {
      console.error(`git ${args} failed:`, err.message);
      if (err.stdout) console.log("stdout:", err.stdout);
      if (err.stderr) console.log("stderr:", err.stderr);
      return null;
    }
  };
  
  runGit("status");
  runGit("add .");
  runGit("commit -m \"chore: restructure repository to include both frontend and smart contract programs\"");
  runGit("push origin main");
  
} catch (err) {
  console.error("=== ERROR IN GIT RESTRUCTURING ===", err);
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
