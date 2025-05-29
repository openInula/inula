import React, { useRef, useEffect } from 'react';

interface JsonViewerProps {
  data: any;
  readOnly?: boolean;
  height?: string;
  theme?: 'light' | 'dark';
  showLineNumbers?: boolean;
  foldable?: boolean;
  onChange?: (value: string) => void;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ 
  data, 
  readOnly = true, 
  height = '400px',
  theme = 'light',
  showLineNumbers = true,
  foldable = true,
  onChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // 格式化JSON数据
  const formatJsonData = (inputData: any): string => {
    try {
      if (typeof inputData === 'string') {
        const parsed = JSON.parse(inputData);
        return JSON.stringify(parsed, null, 2);
      } else {
        return JSON.stringify(inputData, null, 2);
      }
    } catch (error) {
      return typeof inputData === 'string' ? inputData : JSON.stringify(inputData, null, 2);
    }
  };

  // 基于tokenizer的语法高亮
  const highlightJson = (jsonString: string, isDark: boolean): string => {
    const colors = {
      key: isDark ? '#60a5fa' : '#2563eb',
      string: isDark ? '#22d3ee' : '#0891b2',
      number: isDark ? '#fbbf24' : '#d97706',
      boolean: isDark ? '#f87171' : '#dc2626',
      null: isDark ? '#f87171' : '#dc2626',
      bracket: isDark ? '#e2e8f0' : '#475569',
      punctuation: isDark ? '#cbd5e1' : '#6b7280'
    };

    let result = '';
    let i = 0;
    let inKey = false;
    let inString = false;
    let keyContext = false;

    const escapeHtml = (text: string) => {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    while (i < jsonString.length) {
      const char = jsonString[i];
      
      if (char === '"') {
        let str = '"';
        i++;
        while (i < jsonString.length && jsonString[i] !== '"') {
          if (jsonString[i] === '\\') {
            str += jsonString[i] + (jsonString[i + 1] || '');
            i += 2;
          } else {
            str += jsonString[i];
            i++;
          }
        }
        if (i < jsonString.length) {
          str += '"';
          i++;
        }
        
        // 检查是否是key（紧跟着冒号）
        let nextNonSpace = i;
        while (nextNonSpace < jsonString.length && /\s/.test(jsonString[nextNonSpace])) {
          nextNonSpace++;
        }
        
        if (nextNonSpace < jsonString.length && jsonString[nextNonSpace] === ':') {
          result += `<span style="color: ${colors.key}; font-weight: 500;">${escapeHtml(str)}</span>`;
        } else {
          result += `<span style="color: ${colors.string}; font-weight: 500;">${escapeHtml(str)}</span>`;
        }
      }
      else if (/\d/.test(char) || (char === '-' && /\d/.test(jsonString[i + 1] || ''))) {
        let num = '';
        if (char === '-') {
          num += char;
          i++;
        }
        while (i < jsonString.length && /[\d.]/.test(jsonString[i])) {
          num += jsonString[i];
          i++;
        }
        result += `<span style="color: ${colors.number}; font-weight: 600;">${num}</span>`;
      }
      else if (jsonString.substr(i, 4) === 'true') {
        result += `<span style="color: ${colors.boolean}; font-weight: 500;">true</span>`;
        i += 4;
      }
      else if (jsonString.substr(i, 5) === 'false') {
        result += `<span style="color: ${colors.boolean}; font-weight: 500;">false</span>`;
        i += 5;
      }
      else if (jsonString.substr(i, 4) === 'null') {
        result += `<span style="color: ${colors.null}; font-weight: 500;">null</span>`;
        i += 4;
      }
      else if (char === '{' || char === '}' || char === '[' || char === ']') {
        result += `<span style="color: ${colors.bracket}; font-weight: bold;">${char}</span>`;
        i++;
      }
      else if (char === ',' || char === ':') {
        result += `<span style="color: ${colors.punctuation};">${char}</span>`;
        i++;
      }
      else {
        result += escapeHtml(char);
        i++;
      }
    }

    return result;
  };

  // 添加行号
  const addLineNumbers = (content: string): string => {
    const lines = content.split('\n');
    const maxLineNumber = lines.length;
    const lineNumberWidth = Math.max(40, maxLineNumber.toString().length * 8 + 16);

    return `
      <div style="display: flex; font-family: inherit; height: 100%;">
        <div style="
          color: ${theme === 'dark' ? '#64748b' : '#94a3b8'};
          background-color: ${theme === 'dark' ? '#020617' : '#f8fafc'};
          border-right: 1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'};
          padding: 16px 12px 16px 8px;
          font-size: 12px;
          width: ${lineNumberWidth}px;
          text-align: right;
          user-select: none;
          flex-shrink: 0;
          line-height: 1.6;
        ">
          ${lines.map((_, index) => index + 1).join('<br>')}
        </div>
        <div style="
          flex: 1; 
          padding: 16px 16px 16px 8px; 
          line-height: 1.6; 
          white-space: pre;
          overflow-x: auto;
        ">
          ${content}
        </div>
      </div>
    `;
  };

  useEffect(() => {
    if (!editorRef.current) return;

    const formattedData = formatJsonData(data);
    const highlightedData = highlightJson(formattedData, theme === 'dark');
    const finalContent = showLineNumbers ? addLineNumbers(highlightedData) : highlightedData;

    // 创建容器
    editorRef.current.innerHTML = `
      <div style="
        margin: 0;
        ${!showLineNumbers ? 'padding: 16px;' : ''}
        background-color: ${theme === 'dark' ? '#0f172a' : '#ffffff'};
        color: ${theme === 'dark' ? '#f1f5f9' : '#334155'};
        border: 1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'};
        border-radius: 8px;
        font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
        font-size: 14px;
        line-height: 1.6;
        overflow: auto;
        ${!showLineNumbers ? 'white-space: pre;' : ''}
        transition: all 0.2s ease;
      ">
        ${finalContent}
      </div>
    `;

  }, [data, readOnly, height, theme, showLineNumbers, onChange]);

  return (
    <div 
      className={`json-viewer-container transition-all duration-200 ${
        theme === 'dark' ? 'dark' : 'light'
      }`}
      style={{ 
        borderRadius: '8px', 
        overflow: 'hidden',
        boxShadow: theme === 'dark' 
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div ref={editorRef} className="json-viewer" />
    </div>
  );
};

export default JsonViewer;