import MarkdownPage from "@/components/MarkdownPage";

const PRIVACY_MD_URL = "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/doc/privacy.md";

export default function PrivacyPage() {
    return <MarkdownPage mdUrl={PRIVACY_MD_URL} />;
}