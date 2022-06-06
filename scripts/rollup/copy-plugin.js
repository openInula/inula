import fs from 'fs';

export default function copyFiles(copyPairs) {
  return {
    name: 'copy-files',
    generateBundle() {
      copyPairs.forEach(({ from, to }) => {
        console.log(`copy files: ${from} → ${to}`);
        fs.copyFileSync(from, to);
      });
    },
  };
}
