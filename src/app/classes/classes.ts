
export class Page {
  filename: string = '';
  imageData: string = '';
  rawText: string = ''; // raw OCR text
  editedText: string = ''; // text edited by user

  constructor(json: object) {
    Object.assign(this, json);
  }
}

export class Project {
  id: string = '';
  pages: Page[] = [];
  title: string = '';
  description: string = '';
  textReplacements: TextReplacement[] = [];
}

export class Projects {
  projects: Project[] = [];

  constructor(json: object) {
    // Object.assign(this, json);
  }
}

export interface TextReplacement {
  original: string;
  replacement: string;
  enabled: boolean;
}

export function applyTextReplacement(text: string, replacement: TextReplacement): string {
  // chatgpt code with prompt: 'when doing replacements, if the original is a string that is markdown-formatted, don't mess with it.'

  if (!replacement.enabled) return text;
  if (!text) return '';

  // Check if the replacement would add markdown formatting
  const isMarkdownReplacement = 
    (replacement.replacement.startsWith('*') && replacement.replacement.endsWith('*')) ||
    (replacement.replacement.startsWith('_') && replacement.replacement.endsWith('_')) ||
    (replacement.replacement.startsWith('**') && replacement.replacement.endsWith('**'));

  if (isMarkdownReplacement) {
    // Look for already formatted versions of the text
    const markdownPattern = new RegExp(
      `(\\*${replacement.original}\\*|` +
      `_${replacement.original}_|` +
      `\\*\\*${replacement.original}\\*\\*)`,
      'g'
    );
    
    // First replace non-markdown versions
    const nonMarkdownPattern = new RegExp(
      `(?<!\\*|_)(${replacement.original})(?!\\*|_)`,
      'g'
    );
    
    return text
      .replace(nonMarkdownPattern, replacement.replacement)
      .replace(markdownPattern, (match) => match); // Keep already formatted matches as-is
  }

  // For non-markdown replacements, proceed with normal replacement
  return text.replace(
    new RegExp(replacement.original, 'g'),
    replacement.replacement
  );
}

export function applyTextReplacements(text: string, replacements: TextReplacement[]): string {
  if (!replacements) return text;

  return replacements.reduce((currentText, replacement) => {
    return applyTextReplacement(currentText, replacement);
  }, text);
}

export function deHyphenString(text: string): string {
  if (!text) return text;

  console.log('deHyphen', text);
  const newText = text.replace(/(\w+)-\r?\n(\w+)/g, '\n$1$2');
  console.log('newText', newText);
  return newText;

}