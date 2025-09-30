import './index.css';
import { didMount, willUnmount } from '@openinula/next';

// Tooltip 组件，支持多种触发方式和位置
function Tooltip(props) {
  const {
    title,
    children,
    placement = 'top',
    trigger = 'hover',
    className = '',
    style = {},
  } = props;

  let visible = false;
  let tooltipRef;
  let triggerRef;

  // 事件处理
  function handleMouseEnter() {
    if (trigger === 'hover') visible = true;
    console.log('handleMouseEnter', visible);
  }
  function handleMouseLeave() {
    if (trigger === 'hover') visible = false;
  }
  function handleClick() {
    if (trigger === 'click') visible = !visible;
    console.log('handleClick', visible);
  }
  function handleFocus() {
    if (trigger === 'focus') visible = true;
    console.log('handleFocus111', visible);
  }
  function handleBlur() {
    if (trigger === 'focus') visible = false;
    console.log('handleBlur111', visible);
  }

  // 点击外部关闭
  function handleDocumentClick(e) {
    if (
      tooltipRef &&
      !tooltipRef.contains(e.target) &&
      triggerRef &&
      !triggerRef.contains(e.target)
    ) {
      visible = false;
    }
  }

  // 生命周期钩子
  didMount(() => {
    document.addEventListener('mousedown', handleDocumentClick);
  });
  willUnmount(() => {
    document.removeEventListener('mousedown', handleDocumentClick);
  });

  // className 处理
  const tooltipPrefix = 'inula-tooltip';
  const classes = [
    tooltipPrefix,
    `${tooltipPrefix}-${placement}`,
    visible ? `${tooltipPrefix}-visible` : '',
  ].filter(Boolean).join(' ');
  const wrapperClasses = [`${tooltipPrefix}-wrapper`, className].filter(Boolean).join(' ');

  return (
    <div
      ref={triggerRef}
      className={wrapperClasses}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0} // 让 div 可聚焦
    >
      {children}
      <if cond={visible}>
        {visible}
        <div ref={tooltipRef} className={classes}>
          <div className={`${tooltipPrefix}-arrow`} />
          <div className={`${tooltipPrefix}-content`}>{title}</div>
        </div>
      </if>
    </div>
  );
}

export default Tooltip;