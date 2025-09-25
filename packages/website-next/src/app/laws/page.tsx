import MarkdownPage from "@/components/MarkdownPage";

const LAWS_MD_URL = "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/doc/laws.md";

export default function LawsPage() {
  return <MarkdownPage mdUrl={LAWS_MD_URL} />;
}