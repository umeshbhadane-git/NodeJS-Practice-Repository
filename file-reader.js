const fs = require("fs");
const path = require("path");

// Get directory path from command-line arguments
const directory = process.argv[2];

if (!directory) {
  console.error("Error: Please provide a directory path.");
  console.error("Usage: node file-reader.js <directory>");
  process.exit(1);
}

// Check whether the path exists
if (!fs.existsSync(directory)) {
  console.error(`Error: Directory does not exist: ${directory}`);
  process.exit(1);
}

// Check whether it is actually a directory
if (!fs.statSync(directory).isDirectory()) {
  console.error(`Error: Not a directory: ${directory}`);
  process.exit(1);
}

// Recursively find JS and TS files
function findFiles(dir) {
  let entries;

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    console.error(`Error reading directory: ${dir}`);
    console.error(error.message);
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findFiles(fullPath);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".js") || entry.name.endsWith(".ts"))
    ) {
      printFileInfo(fullPath);
    }
  }
}

// Read file and count lines
function printFileInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    const lineCount = content === "" ? 0 : content.split(/\r?\n/).length;

    console.log(`${filePath} -> ${lineCount} lines`);
  } catch (error) {
    console.error(`Error reading file: ${filePath}`);
    console.error(error.message);
  }
}

findFiles(directory);