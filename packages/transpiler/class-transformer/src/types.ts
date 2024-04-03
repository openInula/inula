export interface Option {
  files?: string | string[];
  excludeFiles?: string | string[];
  htmlTags?: string[];
  parseTemplate?: boolean;
  attributeMap?: Record<string, string>;
}
