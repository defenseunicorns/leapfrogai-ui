import { unlink, readdir, stat } from "fs/promises";
import path from "path";

export const clearTmp = async (tempDir: string) => {
  try {
    const files = await readdir(tempDir);

    for (const file of files) {
      // don't delete hidden system files
      if (file.startsWith(".")) {
        continue;
      }

      // only check for text files
      const ext = path.extname(file);
      if (ext !== ".txt") {
        continue;
      }

      const filePath = path.join(tempDir, file);
      const stats = await stat(filePath);

      if (Date.now() - stats.mtimeMs > 86400000) {
        // file older than 1 day -> delete it
        await unlink(filePath);
      }
    }
  } catch (error) {
    console.log(`\tTemp directory clean-up failed: ${(error as Error).message}`);
  }
};
