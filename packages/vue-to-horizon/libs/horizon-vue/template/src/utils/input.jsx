import { Input } from 'element-react/next';

export default function (props) {
  const addId = props['v-addId-input']?.replaceAll(/['"]/g, '');
  const inputRef = window.horizon.useRef(null);
  return [
    <input
      id={addId}
      ref={inputRef}
      style={{
        flexGrow: 1,
        background: 'transparent',
        border: '1px solid rgb(72, 87, 106)',
        color: 'white',
        padding: '5px',
        borderRightWidth: props.clearable ? 0 : '1px',
      }}
      className={(props.className || props.class || []).concat('el-input')}
      type={props.type}
      value={props.modelValue}
      onChange={data => {
        props['onUpdate:modelValue']?.(data);
        props.onChange?.(data);
        props.onInput?.(data);
      }}
      onKeyDown={e => {
        if (e.code === 'Enter' || e.code === 'NumpadEnter') {
          props.onEnter(e.target);
        }
      }}
      disabled={props.disabled}
      placeholder={props.placeholder || ''}
    ></input>,
    props.clearable ? (
      <div
        style={{
          display: 'block',
          border: '1px solid rgb(72, 87, 106)',
          borderLeftWidth: 0,
          paddingRight: '5px',
          paddingTop: '0',
          cursor: 'pointer',
          height: '36px',
          width: '24px',
          position: 'relative',
        }}
        onClick={() => {
          inputRef.current = '';
          props['onUpdate:modelValue']('');
        }}
      >
        <i
          class="el-icon el-dialog__close"
          style={{
            position: 'absolute',
            right: '5px',
            top: '5px',
            width: '24px',
            height: '24px',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
            <path
              fill="currentColor"
              d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"
            ></path>
          </svg>
        </i>
      </div>
    ) : null,
  ];
  // return <Input
  //     type={props.type}
  //     value={props.modelValue}
  //     onChange={function (data) {
  //       props['onUpdate:modelValue']?.(data);
  //       props.onChange?.(data);
  //       props.onInput?.(data);
  //     }}
  //     disabled={props.disabled}
  //     placeholder={props.placeholder}
  //     clearable={props.clearable}
  //   />;
}
