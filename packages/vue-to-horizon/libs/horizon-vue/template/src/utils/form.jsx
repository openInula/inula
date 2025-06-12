export function Form(props) {
  const { className, ['hide-required-asterisk']: hideRequiredAsterisk, model, rules, children } = props;
  return (
    <form id={props.id} className={'el-form el-form--default ' + (className || '')}>
      {children}
    </form>
  );
}

export function FormItem(props) {
  return (
    <div className="el-form-item" onFocusIn={props.onFocusIn} onFocusOut={props.onFocusOut}>
      <label
        style={{
          width: '100px',
          display: 'inline-block',
        }}
        className="el-form-item__label"
        for={props.prop}
      >
        {props.label}
      </label>
      <div className="el-form-item__content" style={{ display: 'flex' }}>
        <div className="el-input el-input--suffix" style={{ display: 'flex' }}>
          {props.children}
        </div>
      </div>
    </div>
  );
}
