export function insertAfter(fileContent: string, content: string, pattern: RegExp) {
  const lines = fileContent.split("\n");

  const index = lines.findIndex((line) => {
    return line.match(pattern);
  });

  const indent = lines[index].replace(lines[index].trim(), "");
  lines[index] = lines[index] + "\n" + indent + content;

  if (!["]", "}"].includes(lines[index + 1].trim()) && lines[index - 1].slice(-1) === ",") {
    lines[index] += ",";
  }

  return lines.join("\n");
}
