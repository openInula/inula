import { IrProgressEvent } from '../types/interfaces';

function processDownloadProgress(
  stream: ReadableStream | null,
  response: Response,
  onProgress: (progressEvent: IrProgressEvent) => void | null
) {
  // 文件下载过程中更新进度
  if (onProgress) {
    const reader = stream?.getReader();
    let totalBytesRead = 0; // 跟踪已读取的字节数

    return new ReadableStream({
      start(controller) {
        function read() {
          reader?.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }

            totalBytesRead += value.byteLength;
            onProgress!({ loaded: totalBytesRead, total: Number(response.headers.get('Content-Length')) });
            controller.enqueue(value); // 将读取到的数据块添加到新的 ReadableStream 中
            read(); // 递归调用，继续读取 stream 直到结束
          });
        }

        read(); //  调用 read 函数以启动从原始 stream 中读取数据的过程
      },
    });
  } else {
    return stream;
  }
}

export default processDownloadProgress;
