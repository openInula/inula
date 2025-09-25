import { redirect } from "next/navigation";

export default function PlaygroundPage() {
  // 直接重定向到第一个教程
  redirect("/playground/basic");
}
