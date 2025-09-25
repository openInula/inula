import { useEffect, useRef } from "react";
import { PlaygroundContentProps } from "../../../../index";

export default function PlaygroundContent({
  selectedItem,
}: PlaygroundContentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && selectedItem) {
      const currentIframe = iframeRef.current;

      // 等待 iframe 加载完成后再发送消息
      const handleLoad = () => {
        // 添加一个小延迟，确保 iframe 完全准备就绪
        setTimeout(() => {
          const iframeWindow = currentIframe?.contentWindow;
          if (iframeWindow) {
            // 发送消息到 OpenInula 项目（只传递ID）
            iframeWindow.postMessage(
              { type: "SET_CODE_BY_ID", payload: selectedItem.id },
              "http://localhost:5173" // 移除 /playground 路径
            );
          }
        }, 100);
      };

      // 监听 iframe 加载完成事件
      currentIframe.addEventListener("load", handleLoad);

      // 如果 iframe 已经加载完成，立即发送消息
      if (currentIframe.contentDocument?.readyState === "complete") {
        handleLoad();
      }

      // 监听来自 iframe 的消息
      const messageHandler = (event: MessageEvent) => {
        if (event.origin === "http://localhost:5173") {
          // 如果收到 IFRAME_READY 消息，重新发送代码ID
          if (event.data.type === "IFRAME_READY") {
            setTimeout(() => {
              const iframeWindow = currentIframe?.contentWindow;
              if (iframeWindow && selectedItem.id) {
                iframeWindow.postMessage(
                  { type: "SET_CODE_BY_ID", payload: selectedItem.id },
                  "http://localhost:5173"
                );
              }
            }, 200);
          }
        }
      };

      window.addEventListener("message", messageHandler);

      return () => {
        currentIframe?.removeEventListener("load", handleLoad);
        window.removeEventListener("message", messageHandler);
      };
    }
  }, [selectedItem]);

  const src = selectedItem?.id
    ? `http://localhost:5173/playground?id=${encodeURIComponent(
        String(selectedItem.id)
      )}`
    : "http://localhost:5173/playground";

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 pl-6">
        <div className="w-full h-full  overflow-hidden">
          <iframe
            ref={iframeRef}
            id="playground-iframe"
            src={src}
            key={src}
            className="w-full h-full border-0"
            title="OpenInula Playground"
            allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
            onLoad={() =>
              console.log("PlaygroundContent: iframe onLoad event fired")
            }
          />
        </div>
      </div>
    </div>
  );
}
