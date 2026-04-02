import { execSync } from "child_process";

console.log("[v0] Installing swr...");
try {
  execSync("npm install swr@^2.3.3 --save", { stdio: "inherit", cwd: "/vercel/share/v0-project" });
  console.log("[v0] swr installed successfully");
} catch (e) {
  console.error("[v0] Install failed:", e);
}
