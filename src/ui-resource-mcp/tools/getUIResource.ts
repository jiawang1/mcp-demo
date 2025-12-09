import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Get page resource data from pageResource.md
 * @returns Promise that resolves to the content of pageResource.md file
 */
export async function getPageResource(): Promise<string> {
  try {
    // Use process.cwd() to get the project root, then navigate to the resource
    const projectRoot = process.cwd();
    const filePath = path.join(projectRoot, 'src/resources/pageResource.md');
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read pageResource.md: ${error.message}`);
  }
}

/**
 * Get widget resource data from widgetResource.md
 * @returns Promise that resolves to the content of widgetResource.md file
 */
export async function getWidgetResource(): Promise<string> {
  try {
    // Use process.cwd() to get the project root, then navigate to the resource
    const projectRoot = process.cwd();
    const filePath = path.join(
      projectRoot,
      'src/admin-center/resources/widgetResource.md',
    );
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read widgetResource.md: ${error.message}`);
  }
}

/**
 * Parse page resource content into structured data
 * @param content Raw content from pageResource.md
 * @returns Promise that resolves to array of page objects
 */
export async function parsePageResource(content?: string): Promise<
  Array<{
    id: string;
    url: string;
    description: string;
    techType?: string;
    hasChild?: boolean;
  }>
> {
  const pageContent = content || (await getPageResource());
  const pages: Array<{
    id: string;
    url: string;
    description: string;
    techType?: string;
    hasChild?: boolean;
  }> = [];

  const pageBlocks = pageContent.split(/## page \d+/);

  for (const block of pageBlocks) {
    if (block.trim()) {
      const lines = block.trim().split('\n');
      const page: any = {};

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('- url:')) {
          page.url = trimmedLine.replace('- url:', '').trim();
        } else if (trimmedLine.startsWith('- id:')) {
          page.id = trimmedLine.replace('- id:', '').trim();
        } else if (trimmedLine.startsWith('- description:')) {
          page.description = trimmedLine.replace('- description:', '').trim();
        } else if (trimmedLine.startsWith('- techType:')) {
          page.techType = trimmedLine.replace('- techType:', '').trim();
        } else if (trimmedLine.startsWith('- hasChild:')) {
          page.hasChild =
            trimmedLine.replace('- hasChild:', '').trim() === 'true';
        }
      }

      if (page.id && page.url && page.description) {
        pages.push(page);
      }
    }
  }

  return pages;
}

/**
 * Parse widget resource content into structured data
 * @param content Raw content from widgetResource.md
 * @returns Promise that resolves to array of widget objects
 */
export async function parseWidgetResource(content?: string): Promise<
  Array<{
    id: string;
    widget: string;
    name: string;
    path: string;
    description: string;
    prerequisite?: Array<{
      name: string;
      type: string;
      description: string;
    }>;
  }>
> {
  const widgetContent = content || (await getWidgetResource());
  const widgets: Array<{
    id: string;
    widget: string;
    name: string;
    path: string;
    description: string;
    prerequisite?: Array<{
      name: string;
      type: string;
      description: string;
    }>;
  }> = [];

  const widgetBlocks = widgetContent.split(/## widget \d+/);

  for (const block of widgetBlocks) {
    if (block.trim()) {
      const lines = block.trim().split('\n');
      const widget: any = {};
      const prerequisites: Array<{
        name: string;
        type: string;
        description: string;
      }> = [];

      let inPrerequisite = false;

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine === '- prerequisite') {
          inPrerequisite = true;
          continue;
        }

        if (inPrerequisite && trimmedLine.match(/^\d+\./)) {
          // Parse prerequisite like "1. requestId: (number), job request id"
          const match = trimmedLine.match(
            /^\d+\.\s*([^:]+):\s*\(([^)]+)\)[,\s]*(.*)$/,
          );
          if (match) {
            prerequisites.push({
              name: match[1].trim(),
              type: match[2].trim(),
              description: match[3].trim(),
            });
          }
        } else if (!inPrerequisite) {
          if (trimmedLine.startsWith('- widget:')) {
            widget.widget = trimmedLine.replace('- widget:', '').trim();
          } else if (trimmedLine.startsWith('- id:')) {
            widget.id = trimmedLine.replace('- id:', '').trim();
          } else if (trimmedLine.startsWith('- name:')) {
            widget.name = trimmedLine.replace('- name:', '').trim();
          } else if (trimmedLine.startsWith('- path:')) {
            widget.path = trimmedLine.replace('- path:', '').trim();
          } else if (trimmedLine.startsWith('- description:')) {
            widget.description = trimmedLine
              .replace('- description:', '')
              .trim();
          }
        }
      }

      if (
        widget.id &&
        widget.widget &&
        widget.name &&
        widget.path &&
        widget.description
      ) {
        if (prerequisites.length > 0) {
          widget.prerequisite = prerequisites;
        }
        widgets.push(widget);
      }
    }
  }

  return widgets;
}
