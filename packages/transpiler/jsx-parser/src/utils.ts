import type { types as t } from '@babel/core';

/**
 * Cleans a JSX text node by removing leading and trailing whitespace and newlines.
 * It also collapses multiple lines into a single line, preserving one space between non-empty lines.
 *
 * @param {t.JSXText} node - The JSX text node to clean.
 * @returns {string} The cleaned text.
 *
 * @example
 * <div>
 *   Hello
 *   World
 * </div>
 * const jsxText = { type: "JSXText", value: "\n    Hello\n      World\n  " };
 * console.log(cleanJSXText(jsxText)); // Outputs: "Hello World"
 */
export function cleanJSXText(node: t.JSXText): string {
  const textLines = node.value.split(/\r\n|\n|\r/);
  let indexOfLastNonEmptyLine = textLines.length - 1;

  // Find last non-empty line
  for (let i = 0; i < textLines.length; i++) {
    if (/[^ \t]/.test(textLines[i])) {
      indexOfLastNonEmptyLine = i;
      break;
    }
  }

  return textLines.reduce((cleanedText, currentLine, currentIndex) => {
    // Replace tabs with spaces
    let processedLine = currentLine.replace(/\t/g, ' ');

    // Trim start of line if not first line
    if (currentIndex !== 0) {
      processedLine = processedLine.replace(/^[ ]+/, '');
    }

    // Trim end of line if not last line
    if (currentIndex !== textLines.length - 1) {
      processedLine = processedLine.replace(/[ ]+$/, '');
    }

    if (processedLine) {
      cleanedText += processedLine;
      // Add space between non-empty lines
      if (currentIndex !== indexOfLastNonEmptyLine) {
        cleanedText += ' ';
      }
    }

    return cleanedText;
  }, '');
}
