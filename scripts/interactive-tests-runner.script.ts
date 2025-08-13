import inquirer from "inquirer";
import { readdir, stat, readFile } from "fs/promises";
import { join, resolve, dirname, relative } from "path";
import { fileURLToPath } from "url";
import { handler } from "../src/index";

const __dirname = dirname(fileURLToPath(import.meta.url));

type MenuOption = {
  name: string;
  value: string;
  isDirectory: boolean;
};

async function runSingleTest(rootPathRel: string) {
  const rootPath = resolve(__dirname, rootPathRel);
  let currentPath = rootPath;

  while (true) {
    const items = await readdir(currentPath);
    const options: MenuOption[] = [];

    for (const item of items) {
      const fullPath = join(currentPath, item);
      const stats = await stat(fullPath);
      if (stats.isDirectory()) {
        options.push({ name: `[DIR] ${item}`, value: fullPath, isDirectory: true });
      } else if (item.endsWith(".json")) {
        options.push({ name: item, value: fullPath, isDirectory: false });
      }
    }

    options.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    if (options.length === 0) {
      if (currentPath === rootPath) {
        console.log("\nNo tests found in the root directory specified.\n");
        process.exit(0);
      }

      console.log("\nDirectory is empty.\n");
      currentPath = resolve(currentPath, "..");
      continue;
    }

    const choices = options.map((o) => ({ name: o.name, value: o.value }));
    if (currentPath !== rootPath) choices.push({ name: "Go back", value: "__BACK__" });
    choices.push({ name: "Exit", value: "__EXIT__" });

    const { choice } = await inquirer.prompt<{ choice: string }>([
      {
        type: "list",
        name: "choice",
        message: `Select file or folder: ${relative(rootPath, currentPath)}`,
        choices,
        pageSize: 15,
      },
    ]);

    if (choice === "__EXIT__") process.exit(0);

    if (choice === "__BACK__") {
      const parent = resolve(currentPath, "..");
      if (!parent.startsWith(rootPath)) process.exit(0);

      currentPath = parent;
      continue;
    }

    const selected = options.find((o) => o.value === choice);
    if (!selected) continue;

    if (selected.isDirectory) {
      currentPath = selected.value;
      continue;
    }

    console.log(`\nExecuting test: ${relative(rootPath, selected.value)}\n`);
    console.log("-".repeat(40) + "\n");

    try {
      const content = await readFile(selected.value, "utf-8");
      const event = JSON.parse(content);

      console.log("Running...");

      const start = Date.now();
      const response = await handler(event);
      const duration = Date.now() - start;

      console.log("\nResponse:");
      console.log("\n" + JSON.stringify(response, null, 2));
      console.log(`\nExecution time: ${duration}ms`);
    } catch (error) {
      console.error("\nTest failed:", error.message || error);
    }

    console.log("\n" + "-".repeat(40));

    process.exit(0);
  }
}

const testRootFolder = process.argv[2];
if (!testRootFolder) {
  console.error("Error: You must pass the test root folder as the first argument, relative to this script.");
  process.exit(1);
}

runSingleTest(testRootFolder).catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
