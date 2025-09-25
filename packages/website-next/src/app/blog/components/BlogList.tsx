import React from "react";
import BlogCard from "./BlogCard";

type BlogItem = {
  key: number;
  img?: string;
  title: string;
  time: string;
  author: string;
  type: string;
  tags?: string[];
};

interface BlogListProps {
  blogs: BlogItem[];
  theme: string | undefined;
}

export default function BlogList({ blogs, theme }: BlogListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {blogs.map((item) => (
        <BlogCard key={item.key} blog={item} theme={theme} />
      ))}
    </div>
  );
} 