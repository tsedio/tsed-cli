export function insertImport(fileContent: string, content: string) {
  const lines = fileContent.split("\n");

  const index = lines.findIndex((line) => {
    if (line.startsWith("#!")) {
      return false;
    }
    return !line.startsWith("import ");
  });

  lines[index] = content + "\n" + lines[index];

  return lines.join("\n");
}
