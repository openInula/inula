import React, { useRef, useState, CSSProperties } from 'react';
import OperationBtn from '../base/operation-btn';
import cn from '@/utils/classnames';

/**
 * 文件上传按钮组件的属性接口
 */
interface FileUploadButtonProps {
  /** 获取到文件内容后的回调函数 */
  onFileContent: (content: any, file: File) => void;
  /** 按钮文本 */
  buttonText?: string;
  /** 接受的文件类型 */
  accept?: string;
  /** 错误处理回调函数 */
  onError?: (error: Error) => void;
}

/**
 * 文件上传按钮组件
 * 点击按钮触发文件选择，文件选择后读取内容并通过回调返回
 */
const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileContent,
  buttonText = '上传文件',
  accept = '*',
  onError,
}) => {
  // 引用隐藏的文件输入
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 状态管理
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 点击按钮时触发文件选择
  const handleButtonClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 文件选择后的处理函数
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsLoading(true);

    // 读取文件内容
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>): void => {
      try {
        const result = e.target?.result;

        if (result) {
          // 判断文件类型，决定如何处理内容
          if (file.type.includes('application/json') && typeof result === 'string') {
            // JSON文件
            const jsonData = JSON.parse(result);
            onFileContent(jsonData, file);
          } else if (
            (file.type.includes('text/csv') ||
              file.type.includes('text/plain') ||
              file.type.includes('text/')) &&
            typeof result === 'string'
          ) {
            // 文本文件，直接返回内容
            onFileContent(result, file);
          } else {
            // 其他类型文件，返回原始内容
            onFileContent(result, file);
          }
        }
      } catch (error) {
        if (onError && error instanceof Error) {
          onError(error);
        } else {
          console.error('Error processing file:', error);
        }
      } finally {
        setIsLoading(false);
        // 重置input，以便可以重新选择同一个文件
        event.target.value = '';
      }
    };

    reader.onerror = (error: ProgressEvent<FileReader>): void => {
      setIsLoading(false);
      if (onError && error.target instanceof Error) {
        onError(error.target);
      } else {
        console.error('Error reading file:', error);
      }
      event.target.value = '';
    };

    // 根据文件类型决定如何读取
    if (file.type.includes('image/') || file.type.includes('application/pdf')) {
      reader.readAsDataURL(file); // 读取为base64
    } else {
      reader.readAsText(file); // 读取为文本
    }
  };

  return (
    <div>
      <button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? (
          '读取中...'
        ) : (
          <OperationBtn type="add" actionName="添加" className={cn(open && 'bg-gray-200')} />
        )}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept={accept}
      />
    </div>
  );
};

export default FileUploadButton;
