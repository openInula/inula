import { Option, Select } from './select';

export function Pagination(props) {
  const { modelValue, layout, total } = props;
  const onSizeChange = val => {
    props['onSize-change'](val);
  };
  const onCurrentChange = props['onCurrent-change'];
  const addId = props['v-addId-pagination']?.replaceAll(/['"]/g, '');
  const onModelChange = props['onUpdate:modelValue'];
  const pageSizes = props['page-sizes'];
  const pageSize = props['page-size'];
  const popperClass = props['popper-class'];

  function go(val) {
    onCurrentChange(val);
  }

  return (
    <div style={{ display: 'inline-block' }}>
      {layout.split(', ').map(comp => {
        if (comp === 'total') {
          return <Total total={total}></Total>;
        } else if (comp === 'sizes') {
          return (
            <Sizes
              pageSizes={pageSizes}
              onSizeChange={size => {
                onSizeChange(size);
              }}
              pageSize={pageSize}
            ></Sizes>
          );
        } else if (comp === 'prev') {
          return <Prev go={go} pageSize={pageSize} modelValue={modelValue}></Prev>;
        } else if (comp === 'next') {
          return <Next go={go} pageSize={pageSize} modelValue={modelValue} total={total}></Next>;
        } else if (comp === 'pager') {
          return <Pager go={go} pageSize={pageSize} modelValue={modelValue} total={total}></Pager>;
        } else if (comp === 'jumper') {
          return <Jumper go={go} pageSize={pageSize} modelValue={modelValue} total={total}></Jumper>;
        }
      })}
    </div>
  );
}

function Total({ total }) {
  return <div style={{ display: 'inline-block', padding: '10px' }}>共 {total} 条</div>;
}

function Sizes({ pageSizes, onSizeChange, pageSize }) {
  //10条/页
  return (
    <div style={{ display: 'inline-block', padding: '10px' }}>
      <Select
        position={'top'}
        onUpdate={val => {
          onSizeChange(val);
        }}
        modelValue={pageSize}
      >
        {pageSizes.map(size => (
          <Option label={size + ' 条/页'} value={size}></Option>
        ))}
      </Select>
    </div>
  );
}

function Prev({ go, pageSize, modelValue }) {
  const displayPrevious = modelValue > 1;
  return (
    <div
      style={{
        opacity: displayPrevious ? '1' : '0.5',
        cursor: displayPrevious ? 'pointer' : 'initial',
        display: 'inline-block',
        padding: '10px',
      }}
      onClick={
        displayPrevious
          ? () => {
              go(Math.max(modelValue - 1, 0));
            }
          : () => {}
      }
    >
      {'<'}
    </div>
  );
}

function Pager({ go, pageSize, modelValue, total }) {
  const pagesAmount = total ? Math.ceil(total / pageSize) : 1;
  function displayPrevious(offset) {
    return modelValue - offset >= 1;
  }
  function displayNext(offset) {
    return modelValue + offset <= pagesAmount;
  }
  return (
    <div style={{ display: 'inline-block', padding: '10px' }}>
      {displayPrevious(2) ? (
        <span
          style={{
            cursor: 'pointer',
          }}
          onClick={() => {
            go(modelValue - 2);
          }}
        >
          {`  ${modelValue - 2}  `}
        </span>
      ) : null}
      {displayPrevious(1) ? (
        <span
          style={{
            cursor: 'pointer',
          }}
          onClick={() => {
            go(modelValue - 1);
          }}
        >
          {`  ${modelValue - 1}  `}
        </span>
      ) : null}
      <span>
        <b
          style={{
            color: 'rgb(0, 119, 255)',
          }}
        >{`  ${modelValue || 1}  `}</b>
      </span>
      {displayNext(1) ? (
        <span
          style={{
            cursor: 'pointer',
          }}
          onClick={() => {
            go(modelValue + 1);
          }}
        >
          {`  ${modelValue + 1}  `}
        </span>
      ) : null}
      {displayNext(2) ? (
        <span
          style={{
            cursor: 'pointer',
          }}
          onClick={() => {
            go(modelValue + 2);
          }}
        >
          {`  ${modelValue + 2}  `}
        </span>
      ) : null}
    </div>
  );
}

function Next({ go, pageSize, modelValue, total }) {
  const pagesAmount = Math.ceil(total / pageSize);
  const displayNext = modelValue < pagesAmount;
  return (
    <div
      style={{
        opacity: displayNext ? '1' : '0.5',
        cursor: displayNext ? 'pointer' : 'initial',
        display: 'inline-block',
        padding: '10px',
      }}
      onClick={
        displayNext
          ? () => {
              go(Math.min(modelValue + 1, pagesAmount));
            }
          : () => {}
      }
    >
      {'>'}
    </div>
  );
}

function Jumper({ go, pageSize, modelValue, total }) {
  const pagesAmount = Math.ceil(total / pageSize);
  const [currentValue, setCurrentValue] = window.horizon.useState(modelValue);
  const lastModelValue = window.horizon.useRef(modelValue);

  if (lastModelValue.current != modelValue) {
    lastModelValue.current = modelValue;
    setCurrentValue(modelValue);
  }

  function sanitizeInput(val) {
    const parsed = parseInt(val);
    if (parsed.toString() !== val) return currentValue;
    if (parsed < 1) return 1;
    if (parsed > pagesAmount) return pagesAmount;
    return parsed;
  }

  function onChange(val) {
    setCurrentValue(sanitizeInput(val.target.value));
  }

  function onEnter(e) {
    let value = currentValue;
    go(Math.floor(value));
  }

  return (
    <div style={{ display: 'inline-block', padding: '10px' }}>
      前往{' '}
      <div style={{ display: 'inline-block', width: '50px' }}>
        <el-input onEnter={onEnter} modelValue={currentValue} onChange={onChange} />
      </div>{' '}
      页
    </div>
  );
}
