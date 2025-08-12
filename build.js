import { build } from "esbuild";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { createWriteStream } from "fs";
import archiver from "archiver";

const outputFile = "dist/index.js";
const outputDir = "dist";

async function buildProject() {
  try {
    await build({
      entryPoints: ["src/index.ts"],
      bundle: true,
      platform: "node",
      target: "node18",
      outfile: outputFile,
      sourcemap: true,
      minify: true,
    });

    const totalBytes = getFolderSize(outputDir);
    const formattedSize = formatSize(totalBytes);

    console.log(`Build completed 📦 (${formattedSize})`);

    await zipFolder(outputDir, `${outputDir}.zip`);
    console.log(`ZIP created 📦 (${outputDir}.zip)`);
  } catch {
    process.exit(1);
  }
}

function getFolderSize(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });

  return entries.reduce((total, entry) => {
    const path = join(dir, entry.name);
    const stats = statSync(path);

    if (entry.isDirectory()) return total + getFolderSize(path);
    return total + stats.size;
  }, 0);
}

function zipFolder(source, out) {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const stream = createWriteStream(out);

    archive.directory(source, false).on("error", reject).pipe(stream);

    stream.on("close", resolve);
    archive.finalize();
  });
}

const formatSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`);

buildProject();
