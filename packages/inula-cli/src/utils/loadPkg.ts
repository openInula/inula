import fs from 'fs';
import { PackageJSON } from 'resolve';

export const loadPkg = (path: string): PackageJSON => {
  const packageJson = fs.readFileSync(path, 'utf8');
  const packageData: PackageJSON = JSON.parse(packageJson);
  return packageData;
};
