export default async function dynamicImport(filePath: string) {
  let importPath = filePath;

  importPath = 'file:///' + importPath;
  return await import(importPath);
}
