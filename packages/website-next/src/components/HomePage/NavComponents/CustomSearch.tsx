import { Search } from 'nextra/components';

interface CustomSearchProps {
  className?: string;
}

export default function CustomSearch({ 
  className = ""
}: Readonly<CustomSearchProps>) {

  return (
    <div className={`relative ${className}`}>
      <div className={`relative transition-all duration-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:ring-offset-2 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]`}>
        <Search placeholder={"搜索文档、API、示例..."} />
      </div>
    </div>
  );
} 