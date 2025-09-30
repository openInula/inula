// import Button from './index.jsx';
import demo1 from './demos/demo1.jsx';
import demo2 from './demos/demo2.jsx';
import demo3 from './demos/demo3.jsx';
import demo4 from './demos/demo4.jsx';
import demo5 from './demos/demo5.jsx';
import demo6 from './demos/demo6.jsx';
import demo7 from './demos/demo7.jsx';

function ModalDemo() {
    let loading = false;
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>普通弹窗</h2>
                    <div>演示普通弹窗的用法。</div>
                </div>
                <div style={{ display: 'flex' }}><demo1 /></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>自定义标题样式</h2>
                    <div>演示如何自定义弹窗的标题样式。</div>
                </div>
                <div style={{ display: 'flex' }}><demo2 /></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>自定义内容</h2>
                    <div>可以在对话框内放置任何内容。</div>
                </div>
                <div style={{ display: 'flex' }}><demo3 /></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>自定义页脚</h2>
                    <div>演示如何为弹窗添加自定义页脚。</div>
                </div>
                <div style={{ display: 'flex' }}><demo4 /></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>居中弹窗</h2>
                    <div>设置 centered 可以让对话框垂直居中。</div>
                </div>
                <div style={{ display: 'flex' }}><demo5 /></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>异步关闭弹窗</h2>
                    <div>演示如何设置异步关闭弹窗。</div>
                </div>
                <div style={{ display: 'flex' }}><demo6 /></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>全屏弹窗</h2>
                    <div>演示如何设置全屏弹窗。</div>   
                </div>
                <div style={{ display: 'flex' }}><demo7 /></div>
            </div>



        </div >
    );
}
export default ModalDemo;