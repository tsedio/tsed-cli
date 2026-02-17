import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import unified from "unified";

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkStringify, {fences: true, bullet: "-"})
  .use(remarkCleanApiMarkdown);

export async function transformMarkdown(content) {
  const {frontmatter, body} = extractFrontmatter(content);
  const processed = await markdownProcessor.process(body.trimStart());
  const cleanedBody = String(processed).trimStart();
  return frontmatter ? `${frontmatter}\n${cleanedBody}` : cleanedBody;
}

function remarkCleanApiMarkdown() {
  return (tree) => {
    let headingInfo;

    tree.children = tree.children.filter((node) => {
      if (node.type === "html") {
        const trimmed = node.value.trim();

        if (trimmed.startsWith("<script setup>")) {
          return false;
        }

        if (trimmed.startsWith('<div class="flex space-x-3"')) {
          headingInfo = headingInfo ?? extractHeading(trimmed);
          return false;
        }
      }

      return true;
    });

    if (headingInfo?.title) {
      const headingNode = {
        type: "heading",
        depth: 1,
        children: [
          {
            type: "text",
            value: headingInfo.module ? `${headingInfo.title} - ${headingInfo.module}` : headingInfo.title
          }
        ]
      };

      const insertIndex = tree.children.findIndex((node) => node.type !== "yaml");
      const targetIndex = insertIndex === -1 ? tree.children.length : insertIndex;
      tree.children.splice(targetIndex, 0, headingNode);
    }
  };
}

function extractFrontmatter(content) {
  if (!content.startsWith("---")) {
    return {frontmatter: "", body: content};
  }

  const match = content.match(/^(---[\s\S]*?\n---\s*\n?)/);

  if (!match) {
    return {frontmatter: "", body: content};
  }

  const frontmatter = match[1].trimEnd();
  const body = content.slice(match[1].length);

  return {frontmatter, body};
}

function extractHeading(value) {
  const titleMatch = value.match(/<h1>([\s\S]*?)<\/h1>/i);
  const moduleMatch = value.match(/<div class="module-name">([\s\S]*?)<\/div>/i);

  return {
    title: titleMatch?.[1]?.trim() ?? "",
    module: moduleMatch?.[1]?.trim() ?? ""
  };
}
