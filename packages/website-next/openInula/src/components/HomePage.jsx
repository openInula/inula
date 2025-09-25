
import Inula, {useMemo, useRef} from 'openinula';
import { Repl, Editor, Viewer } from '@babytian/openinula-repl-next'

export default function App() {
    const coded = useMemo(() => `
import { render } from '@openinula/next';
function HelloWorld() {
  return <h1>Hello OpenInula_next!!</h1>;
}

render(HelloWorld(), document.getElementById('app'));
`, []);

    const editorRef = useRef();
    const viewerRef = useRef();
    return (
        <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8">
            <Repl
                name="inula-playground"
                className="h-[100vh]"
                split={{ split: 'vertical', defaultSize: '40%' }}
                code={coded}
            >
                <Editor ref={editorRef}/>
                <div className="h-full flex flex-col min-h-0">
                    <Viewer />
                </div>
            </Repl>
        </div>
    );
}