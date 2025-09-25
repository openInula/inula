"use client";

import DocumentSidebar, { DocumentItem } from "@/app/contribute/components/DocumentSidebar";
import MarkdownPage from "@/components/MarkdownPage";
import Contributors from "@/app/contribute/components/Contributors";

const PRIVATE_URL1 = "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/doc/guide.md"
const PRIVATE_URL2 = "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/doc/behavior.md"

const documents: DocumentItem[] = [
  {
    id: "guide",
    title: "贡献指南",
    url: PRIVATE_URL1,
    description: "了解如何为OpenInula项目做出贡献"
  },
  {
    id: "behavior", 
    title: "行为准则",
    url: PRIVATE_URL2,
    description: "社区行为准则和规范"
  },
  {
    id: "contributors",
    title: "贡献者",
    description: "查看OpenInula项目的贡献者列表"
  }
];

export default function ContributePage() {
  return (
    <DocumentSidebar 
      documents={documents}
      defaultActiveId="guide"
      title="贡献指南"
    >
      {(currentDoc) => {
        if (!currentDoc) return null;
        
        if (currentDoc.id === "contributors") {
          return <Contributors />;
        }
        
        return (
          <MarkdownPage 
            mdUrl={currentDoc.url!} 
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800"
          />
        );
      }}
    </DocumentSidebar>
  );
}