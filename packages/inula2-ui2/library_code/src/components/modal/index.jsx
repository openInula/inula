import { Portal } from '@openinula/next';
import Icon from '../icon';
import Button from '../button';
import './index.css';

const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  className = '',
  style = {},
  maskClosable = true,
  zIndex = 1000,
  fullscreen = false,
  centered = false,
  onBeforeClose,
}) => {
  let closing = false;

  // 每次 open 变为 true 时重置 closing
  if (open) {
    console.log(closing);
    closing = false;
  }

  async function handleClose() {
    if (onBeforeClose) {
      closing = true;
      console.log('1',closing);  //true
      let result = onBeforeClose();
      if (result instanceof Promise) {
        result = await result;
      }
      closing = false;
      console.log('2',closing);  //false
      if (result === false) return;
    }
    onClose && onClose();
  }

  // 遮罩点击关闭
  function onMaskClick(e) {
    if (e.target === e.currentTarget && maskClosable) {
      handleClose();
    }
  }

  // 获取 portal-root
  const portalRoot = document.getElementById('root');
  if (!portalRoot) return null;

  // Modal 内容
  const modalNode = (
    <div
      className={`inula-modal-mask${open ? ' inula-modal-mask-show' : ''} ${centered ? 'inula-modal-mask-center' : ''}`}
      style={{ zIndex }}
      onClick={onMaskClick}
    >
      <div
        className={
          `inula-modal` +
          (fullscreen ? ' inula-modal-fullscreen' : '') +
          (className ? ' ' + className : '')
        }
        style={style}
      >
        <div className="inula-modal-header">
          <div className="inula-modal-title">{title}</div>
          <div
            className={`inula-modal-close${closing ? ' inula-modal-close-loading' : ''}`}
            onClick={closing ? undefined : handleClose}
            style={closing ? { pointerEvents: 'none', opacity: 0.6 } : {}}
          >
            <Icon value="xmark" theme="filled" size="16" />
          </div>
        </div>
        <div className="inula-modal-body">{children}</div>
        {footer && (
          <div className="inula-modal-footer">
            {footer}
          </div>
        )}
        {!footer && (
          <div className="inula-modal-footer-default">
            <Button onClick={handleClose}>取消</Button>
            <Button type="primary" onClick={handleClose} disabled={closing} loading={closing}>确定</Button>
          </div>
        )}
      </div>
    </div>
  );

  return open ? <Portal target={portalRoot}>{modalNode}</Portal> : null;
};

export default Modal;
