import fs from 'fs';
import path from 'path';

export default function readDirectory(directoryPath: string): string[] {
  const filesArray: string[] = [];
  const traverseDirectory = (directoryPath: string) => {
    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
      const filePath = path.join(directoryPath, file);

      if (fs.statSync(filePath).isDirectory()) {
        // 如果是目录，则递归读取该目录下的所有文件
        traverseDirectory(filePath);
      } else {
        if (filePath.startsWith('.')) {
          continue;
        }
        // 如果是文件，则将其全路径添加到数组中
        if (filePath.endsWith('.js')) {
          filesArray.push(filePath);
        }
      }
    }
  };

  traverseDirectory(directoryPath);
  return filesArray;
}
