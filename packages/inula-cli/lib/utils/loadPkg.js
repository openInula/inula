import fs from 'fs';
export const loadPkg = (path) => {
    const packageJson = fs.readFileSync(path, 'utf8');
    const packageData = JSON.parse(packageJson);
    return packageData;
};
