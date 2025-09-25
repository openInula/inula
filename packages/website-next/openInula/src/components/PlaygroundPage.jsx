import { useRef, useEffect, useState } from 'openinula';
import { Repl, Editor, Viewer } from '@babytian/openinula-repl-next';
import { getCodeById } from '../lib/code.ts';

function PlaygroundPage() {
    // 从 URL 查询参数获取初始代码 ID，避免首屏回退到 HelloWorld
    let initialId = 1;
    try {
        const params = new URLSearchParams(window.location.search);
        const idParam = params.get('id');
        if (idParam) {
            const parsed = Number(idParam);
            if (!Number.isNaN(parsed)) initialId = parsed;
        }
    } catch (e) {
        // 忽略解析错误，保持默认 id = 1
    }

    const initialCode = getCodeById(initialId) || getCodeById(1) || '';

    const [code, setCode] = useState(initialCode);

    useEffect(() => {
        const handler = (event) => {
            const { type, payload } = event.data || {};

            // 处理传统的代码字符串方式（向下兼容）
            if (type === "SET_CODE" && payload) {
                setCode(payload);
            }
            
            // 处理新的代码ID方式
            if (type === "SET_CODE_BY_ID" && payload) {
                const codeFromId = getCodeById(payload);
                if (codeFromId) {
                    console.log('Setting new code for ID:', payload);
                    setCode(codeFromId);
                } else {
                    console.warn(`未找到ID为 ${payload} 的代码示例`);
                }
            }
        };

        // 添加消息监听器
        window.addEventListener("message", handler);

        // 通知父窗口 iframe 已就绪，方便外部在需要时重发
        try {
            window.parent?.postMessage({ type: 'IFRAME_READY' }, '*');
        } catch (e) {}

        return () => {
            window.removeEventListener("message", handler);
        };
    }, []);

    const editorRef = useRef();
    const viewerRef = useRef();
    const CustomEmptyMenu = () => <div></div>;

    return (
        <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8">
            <Repl
                key={code} // 强制重新渲染
                name="inula-playground"
                className="h-[100vh]"
                split={{ split: 'horizontal', defaultSize: '60%' }}
                code={code}
            >
                <Editor ref={editorRef} Menu={CustomEmptyMenu}/>
                <div className="h-full flex flex-col min-h-0">
                    <Viewer ref={viewerRef}/>
                </div>
            </Repl>
        </div>
    );
}

export default PlaygroundPage;
