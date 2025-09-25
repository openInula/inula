"use client";

import { useState, ReactNode } from "react";

export interface DocumentItem {
  id: string;
  title: string;
  url?: string;
  description: string;
}

interface DocumentSidebarProps {
  documents: DocumentItem[];
  defaultActiveId?: string;
  title?: string;
  onDocumentChange?: (docId: string) => void;
  className?: string;
  children?: (currentDoc: DocumentItem | undefined) => ReactNode;
}

export default function DocumentSidebar({
  documents,
  defaultActiveId,
  title = "文档导航",
  onDocumentChange,
  className = "",
  children,
}: Readonly<DocumentSidebarProps>) {
  const [activeDoc, setActiveDoc] = useState(
    defaultActiveId || documents[0]?.id || ""
  );

  const handleDocumentChange = (docId: string) => {
    setActiveDoc(docId);
    onDocumentChange?.(docId);
  };

  const currentDoc = documents.find((doc) => doc.id === activeDoc);

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-[#111725] flex justify-center ${className}`}
    >
      <div className="w-full max-w-7xl flex flex-col md:flex-row">
        {/* 侧边栏 */}
        <aside className="hidden md:flex flex-col w-64 bg-white/90 dark:bg-[#111725] border border-gray-100 dark:border-gray-800 shadow-sm py-6 px-3 gap-2 h-fit sticky top-20 rounded-2xl mx-6">
          <h3 className="text-base font-bold text-gray-700 dark:text-foreground mb-3 pl-2">
            {title}
          </h3>
          <div className="pr-2">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleDocumentChange(doc.id)}
                className={`w-full text-left flex flex-col gap-1 rounded-lg px-3 py-3 mb-2 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                  activeDoc === doc.id
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    : "text-gray-700 dark:text-foreground hover:border hover:border-gray-200 dark:hover:border-gray-700"
                }`}
              >
                <span
                  className={`font-semibold text-sm ${
                    activeDoc === doc.id
                      ? "text-blue-800 dark:text-blue-200"
                      : ""
                  }`}
                >
                  {doc.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {doc.description}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-4 md:p-6">
          {/* 移动端文档选择器 */}
          <div className="md:hidden mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-foreground mb-3">
              {title}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentChange(doc.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 border-2 ${
                    activeDoc === doc.id
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200"
                      : "bg-white dark:bg-card border-gray-200 dark:border-gray-700 text-gray-700 dark:text-foreground hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <div className="font-semibold text-base mb-1">
                    {doc.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {doc.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {children
              ? children(currentDoc)
              : currentDoc && (
                  <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
                    <h2 className="text-2xl font-bold mb-4">
                      {currentDoc.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {currentDoc.description}
                    </p>
                  </div>
                )}
          </div>
        </main>
      </div>
    </div>
  );
}
