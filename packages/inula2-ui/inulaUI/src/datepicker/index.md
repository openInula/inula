# DatePicker 日期选择器

用于选择和展示日期

## 何时使用

当需要选择和展示日期时。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/datepicker/demo1"
  style="width: 100%; height: 600px; border: 0;"
></iframe>
<h3>基本datepicker</h3>
<p>支持五种picker、四种varient、两种status</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { DatePicker, Tag } from 'inula-ui';

function DatePickerDemo() {
  const handleChange = (value) => {
    console.log('选择的值:', value);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '500px',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Tag color="geekblue">五种picker基本日期选择器</Tag>
        <DatePicker placeholder="请选择日期" onChange={handleChange} />
        <DatePicker picker="week" placeholder="请选择周" />
        <DatePicker picker="month" placeholder="请选择月份" />
        <DatePicker picker="quarter" placeholder="请选择季度" />
        <DatePicker picker="year" placeholder="请选择年份" />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Tag color="geekblue">不同尺寸日期选择器</Tag>
        <DatePicker size="small" placeholder="小尺寸" />
        <DatePicker size="default" placeholder="默认尺寸" />
        <DatePicker size="large" placeholder="大尺寸" />
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Tag color="geekblue">禁用状态基本日期选择器</Tag>
        <DatePicker disabled placeholder="禁用状态" />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Tag color="geekblue">四种varient变体基本选择器</Tag>
        <DatePicker placeholder="outlined" placement="topLeft" />
        <DatePicker variant="filled" placeholder="filled" placement="topLeft" />
        <DatePicker
          variant="borderless"
          placeholder="borderless"
          placement="topLeft"
        />
        <DatePicker
          variant="underline"
          placeholder="underline"
          placement="topLeft"
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Tag color="geekblue">两种status基本日期选择器</Tag>
        <DatePicker status="error" placeholder="error" placement="topLeft" />
        <DatePicker
          status="warning"
          placeholder="warning"
          placement="topLeft"
        />
      </div>
    </div>
  );
}

export default DatePickerDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/datepicker/demo2"
  style="width: 100%; height: 700px; border: 0;"
></iframe>
<h3>needConfirm，showNow，Icon</h3>
<p>支持needConfirm确认模式，显示今天，自定义图标</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { DatePicker, Tag, Icon } from 'inula-ui';

function DatePickerDemo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '80px',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Tag color="geekblue">需要确认的日期选择器</Tag>
        <DatePicker placeholder="请选择日期" needConfirm />
        <DatePicker picker="week" placeholder="请选择周" needConfirm />
        <DatePicker picker="month" placeholder="请选择月份" needConfirm />
        <DatePicker picker="quarter" placeholder="请选择季度" needConfirm />
        <DatePicker picker="year" placeholder="请选择年份" needConfirm />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Tag color="geekblue">showNow控制今天按钮显示</Tag>
        <DatePicker placeholder="请选择日期" needConfirm showNow={false} />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Tag color="geekblue">自定义prefix,suffixIcon图标</Tag>
        <DatePicker
          prefix={<Icon value="check" theme="filled" size={12} />}
          placeholder="prefix"
        />
        <DatePicker
          suffixIcon={<Icon value="check" theme="filled" size={12} />}
          placeholder="suffixIcon"
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <Tag color="geekblue">自定义日历title切换图标</Tag>
        <DatePicker
          prevIcon={<Icon value="check" theme="filled" size={12} />}
          style={{ width: 200 }}
          placeholder="prevIcon"
          placement="topLeft"
        />
        <DatePicker
          nextIcon={<Icon value="check" theme="filled" size={12} />}
          style={{ width: 200 }}
          placeholder="nextIcon"
          placement="topLeft"
        />
        <DatePicker
          superPrevIcon={<Icon value="check" theme="filled" size={12} />}
          style={{ width: 200 }}
          placeholder="superPrevIcon"
          placement="topLeft"
        />
        <DatePicker
          superNextIcon={<Icon value="check" theme="filled" size={12} />}
          style={{ width: 200 }}
          placeholder="superNextIcon"
          placement="topLeft"
        />
      </div>
    </div>
  );
}

export default DatePickerDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/datepicker/demo3"
  style="width: 100%; height: 520px; border: 0;"
></iframe>
<h3>defaultValue, defaultPickerValue</h3>
<p>支持日期默认值，日期浮层默认值，定义浮层默认值时，每次点击会自动返回默认值面板</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { DatePicker, Tag } from 'inula-ui';

function DatePickerDemo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6,1fr)',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <Tag color="geekblue">日期默认值</Tag>
        <DatePicker defaultValue="2024-03-10" placeholder="日期-默认值" />
        <DatePicker defaultValue="2024-37周" placeholder="周数-默认值" />
        <DatePicker
          defaultValue="2024-10"
          picker="month"
          placeholder="月-默认值"
        />
        <DatePicker
          defaultValue="2024-Q1"
          picker="quarter"
          placeholder="季度-默认值"
        />
        <DatePicker defaultValue="2024" picker="year" placeholder="年-默认值" />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Tag color="geekblue">calendar浮窗面板默认值</Tag>
        <DatePicker defaultPickerValue="2024-10-09" placeholder="默认面板" />
        <DatePicker
          defaultPickerValue="2024-37周"
          placeholder="默认面板"
          picker="week"
        />
        <DatePicker
          defaultPickerValue="2024-10"
          placeholder="默认面板"
          picker="month"
        />
        <DatePicker
          defaultPickerValue="2024-Q3"
          placeholder="默认面板"
          picker="quarter"
        />
        <DatePicker
          defaultPickerValue="2024-10-09"
          placeholder="默认面板"
          picker="year"
        />
      </div>
    </div>
  );
}

export default DatePickerDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/datepicker/demo4"
  style="width: 100%; height: 620px; border: 0;"
></iframe>
<h3>disbaledDate,minDate,maxDate</h3>
<p>可以通过自定义字段来限制选中范围</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { DatePicker, Tag } from 'inula-ui';

function DatePickerDemo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flexWrap: 'wrap',
        padding: '20px',
      }}
    >
      <Tag color="geekblue">范围和选中限制</Tag>
      <DatePicker
        minDate={'2025-08-12'}
        maxDate={'2025-10-24'}
        disabledDate={['2025-09-11']}
        placeholder="日期范围限定"
        style={{ width: 200 }}
      />
      <DatePicker
        minDate={'2025-30周'}
        maxDate={'2025-38周'}
        disabledDate={['2025-33周']}
        placeholder={'周日期范围限定'}
        style={{ width: 200 }}
        picker="week"
      />
      <DatePicker
        minDate={'2024-08'}
        maxDate={'2026-01'}
        disabledDate={['2025-08']}
        placeholder={'月日期范围限定'}
        style={{ width: 200 }}
        picker="month"
      />
      <DatePicker
        minDate={'2023-Q3'}
        maxDate={'2027-Q1'}
        disabledDate={['2025-Q1']}
        placeholder={'季度日期范围限定'}
        style={{ width: 200 }}
        picker="quarter"
      />
      <DatePicker
        minDate={'2000'}
        maxDate={'2060'}
        disabledDate={['2028']}
        placeholder={'年日期范围限定'}
        style={{ width: 200 }}
        picker="year"
      />
    </div>
  );
}

export default DatePickerDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/datepicker/demo5"
  style="width: 100%; height: 680px; border: 0;"
></iframe>
<h3>回调、受控、弹出位置</h3>
<p>可以自定义回调函数、受控控制calendar浮层开关、通过placement控制浮层弹出位置</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { DatePicker, Tag, Button } from 'inula-ui';

function DatePickerDemo() {
  let open = false;
  let defaultOpen = false;
  let placement = 'bottomLeft';
  let picker = 'date';
  let size = 'default';

  const handleControllOpenChange = (isOpen) => {
    open = !isOpen;
  };

  const handleChange = (value) => {
    console.log('选择的值:', value);
  };

  const handleOpenChange = (isOpen) => {
    console.log(isOpen);
  };

  const handlePanleChange = (value, mode) => {
    console.log(value, mode);
  };

  const handleClickOk = (value) => {
    console.log('ok', value);
  };

  const onBlur = () => {
    console.log(111);
  };

  const onFocus = () => {
    console.log(111);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '20px',
        maxWidth: '800px',
      }}
    >
      <div>
        <Tag color="geekblue" size="large">
          回调函数示例
        </Tag>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: 10,
          }}
        >
          <DatePicker
            placeholder="onChange"
            showNow={false}
            onChange={handleChange}
          />
          <DatePicker
            placeholder="onOpenChange"
            onOpenChange={handleOpenChange}
          />
          <DatePicker
            placeholder="onPanleChange"
            onPanleChange={handlePanleChange}
          />
          <DatePicker
            placeholder="onClickOk"
            needConfirm
            onOk={handleClickOk}
          />
          <DatePicker
            placeholder="onBlur & onFocus"
            style={{ width: 150 }}
            onBlur={onBlur}
            onFocus={onFocus}
          />
        </div>
      </div>

      <div>
        <Tag color="geekblue" size="large">
          open受控示例
        </Tag>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <DatePicker placeholder="defaultOpen" defaultOpen={defaultOpen} />
          <DatePicker
            placeholder="open受控"
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={handleControllOpenChange}
          />
        </div>
      </div>

      <div>
        <Tag color="geekblue" size="large">
          日历弹出位置控制
        </Tag>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <DatePicker
            placeholder="placement & picker & size"
            style={{ width: 700 }}
            placement={placement}
            picker={picker}
            size={size}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            alignItems: 'center',
            gap: 10,
            width: 600,
          }}
        >
          <Button onClick={() => (placement = 'bottomLeft')}>bottomLeft</Button>
          <Button onClick={() => (placement = 'bottomRight')}>
            bottomRight
          </Button>
          <Button onClick={() => (placement = 'topLeft')}>topLeft</Button>
          <Button onClick={() => (placement = 'topRight')}>topRight</Button>
          <Button onClick={() => (picker = 'date')}>date</Button>
          <Button onClick={() => (picker = 'week')}>week</Button>
          <Button onClick={() => (picker = 'month')}>month</Button>
          <Button onClick={() => (picker = 'quarter')}>quarter</Button>
          <Button onClick={() => (picker = 'year')}>year</Button>
          <Button onClick={() => (size = 'small')}>small</Button>
          <Button onClick={() => (size = 'default')}>default</Button>
          <Button onClick={() => (size = 'large')}>large</Button>
        </div>
      </div>
    </div>
  );
}

export default DatePickerDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/datepicker/demo6"
  style="width: 100%; height: 1000px; border: 0;"
></iframe>
<h3>rangepicker</h3>
<p>支持五种picker、四种varient、两种status</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { RangePicker, Tag } from 'inula-ui';

function RangePickerDemo() {
  const handleChange = (value) => {
    console.log('选择的值:', value);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          五种picker-range日期选择器
        </Tag>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <RangePicker placeholder="请选择日期" onChange={handleChange} />
          <RangePicker picker="week" placeholder="请选择周" />
          <RangePicker picker="month" placeholder="请选择月份" />
          <RangePicker picker="quarter" placeholder="请选择季度" />
          <RangePicker picker="year" placeholder="请选择年份" />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          三种size-range日期选择器
        </Tag>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <RangePicker size="small" placeholder="小尺寸" />
          <RangePicker size="default" placeholder="默认尺寸" />
          <RangePicker size="large" placeholder="大尺寸" />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          禁用状态range日期选择器
        </Tag>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <RangePicker disabled placeholder="禁用状态" />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          四种varient-range日期选择器
        </Tag>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <RangePicker placeholder="outlined" />
          <RangePicker variant="filled" placeholder="filled" />
          <RangePicker variant="borderless" placeholder="borderless" />
          <RangePicker variant="underline" placeholder="underline" />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          两种status-range日期选择器
        </Tag>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <RangePicker status="error" placeholder="error" placement="topLeft" />
          <RangePicker
            status="warning"
            placeholder="warning"
            placement="topLeft"
          />
        </div>
      </div>
    </div>
  );
}

export default RangePickerDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/datepicker/demo7"
  style="width: 100%; height: 1100px; border: 0;"
></iframe>
<h3>needConfirm,Icon,defaultValue,范围限制</h3>
<p>rangepicker也支持确认模式，自定义图标，默认值，日期范围限制</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { RangePicker, Tag, Icon } from 'inula-ui';

function RangePickerDemo() {
  const handleChange = (value) => {
    console.log('选择的值:', value);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '20px',
        maxWidth: '800px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          需要确认的rang日期选择器
        </Tag>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <RangePicker placeholder="请选择日期" needConfirm showNow={false} />
          <RangePicker picker="week" placeholder="请选择周" needConfirm />
          <RangePicker picker="month" placeholder="请选择月份" needConfirm />
          <RangePicker picker="quarter" placeholder="请选择季度" needConfirm />
          <RangePicker picker="year" placeholder="请选择年份" needConfirm />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          自定义前后缀图标和title切换图标的range日期选择器
        </Tag>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <RangePicker
            prefix={<Icon value="check" theme="filled" size={12} />}
            placeholder="prefix"
          />
          <RangePicker
            suffixIcon={<Icon value="check" theme="filled" size={12} />}
            placeholder="suffixIcon"
          />
          <RangePicker
            prevIcon={<Icon value="check" theme="filled" size={12} />}
            placeholder="prevIcon"
          />
          <RangePicker
            nextIcon={<Icon value="check" theme="filled" size={12} />}
            placeholder="nextIcon"
          />
          <RangePicker
            superPrevIcon={<Icon value="check" theme="filled" size={12} />}
            placeholder="superPrevIcon"
          />
          <RangePicker
            superNextIcon={<Icon value="check" theme="filled" size={12} />}
            placeholder="superNextIcon"
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          带defaultValue的range日期选择器
        </Tag>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <RangePicker
            defaultValue={['2024-03-10', '2024-04-20']}
            placeholder="日期-默认值"
          />
          <RangePicker
            defaultValue={['2024-37周', '2024-40周']}
            placeholder="周数-默认值"
            picker="week"
          />
          <RangePicker
            defaultValue={['2024-10', '2025-10']}
            picker="month"
            placeholder="月-默认值"
          />
          <RangePicker
            defaultValue={['2024-Q1', '2025-Q4']}
            picker="quarter"
            placeholder="季度-默认值"
          />
          <RangePicker
            defaultValue={['2024', '2036']}
            picker="year"
            placeholder="年-默认值"
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          带日期范围限制的range日期选择器
        </Tag>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <RangePicker
            minDate={'2025-08-12'}
            maxDate={'2025-10-24'}
            disabledDate={['2025-09-11']}
            placeholder="日期范围限定"
            style={{ width: 250 }}
          />
          <RangePicker
            minDate={'2025-30周'}
            maxDate={'2025-38周'}
            disabledDate={['2025-33周']}
            placeholder={'周日期范围限定'}
            style={{ width: 250 }}
            picker="week"
          />
          <RangePicker
            minDate={'2024-08'}
            maxDate={'2026-01'}
            disabledDate={['2025-08']}
            placeholder={'月日期范围限定'}
            style={{ width: 250 }}
            picker="month"
          />
          <RangePicker
            minDate={'2023-Q3'}
            maxDate={'2027-Q1'}
            disabledDate={['2025-Q1']}
            placeholder={'季度日期范围限定'}
            style={{ width: 250 }}
            picker="quarter"
          />
          <RangePicker
            minDate={'2000'}
            maxDate={'2060'}
            disabledDate={['2028']}
            placeholder={'年日期范围限定'}
            style={{ width: 250 }}
            picker="year"
            placement="topLeft"
          />
        </div>
      </div>
    </div>
  );
}

export default RangePickerDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/datepicker/demo8"
  style="width: 100%; height: 800px; border: 0;"
></iframe>
<h3>回调、受控、弹出位置</h3>
<p>rangepikcer也可以自定义回调函数、受控控制calendar浮层开关、通过placement控制浮层弹出位置</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { RangePicker, Tag, Button } from 'inula-ui';

function RangePickerDemo() {
  let open = false;
  let defaultOpen = false;
  let placement = 'bottomLeft';
  let picker = 'date';
  let size = 'default';

  const handleControllOpenChange = (isOpen) => {
    open = !isOpen;
  };

  const handleChange = (value) => {
    console.log('选择的值:', value);
  };

  const handleOpenChange = (isOpen) => {
    console.log(isOpen);
  };

  const handlePanleChange = (value, mode) => {
    console.log(value, mode);
  };

  const handleClickOk = (value) => {
    console.log('ok', value);
  };

  const onBlur = () => {
    console.log(111);
  };

  const onFocus = () => {
    console.log(111);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '20px',
        maxWidth: '800px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          自定义回调函数的range日期选择器
        </Tag>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <RangePicker
            placeholder="onChange"
            showNow={false}
            onChange={handleChange}
          />
          <RangePicker
            placeholder="onOpenChange"
            onOpenChange={handleOpenChange}
          />
          <RangePicker
            placeholder="onPanleChange"
            onPanleChange={handlePanleChange}
          />
          <RangePicker
            placeholder="onClickOk"
            needConfirm
            onOk={handleClickOk}
          />
          <RangePicker
            placeholder="onBlur & onFocus"
            style={{ width: 150 }}
            onBlur={onBlur}
            onFocus={onFocus}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          浮层弹出受控示例
        </Tag>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <RangePicker placeholder="defaultOpen" defaultOpen={defaultOpen} />
          <RangePicker
            placeholder="open受控"
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={handleControllOpenChange}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          控制日历弹出位置
        </Tag>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <RangePicker
            placeholder="placement & picker & size"
            style={{ width: 700 }}
            placement={placement}
            picker={picker}
            size={size}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            alignItems: 'center',
            gap: 10,
            width: 600,
          }}
        >
          <Button onClick={() => (placement = 'bottomLeft')}>bottomLeft</Button>
          <Button onClick={() => (placement = 'bottomRight')}>
            bottomRight
          </Button>
          <Button onClick={() => (placement = 'topLeft')}>topLeft</Button>
          <Button onClick={() => (placement = 'topRight')}>topRight</Button>
          <Button onClick={() => (picker = 'date')}>date</Button>
          <Button onClick={() => (picker = 'week')}>week</Button>
          <Button onClick={() => (picker = 'month')}>month</Button>
          <Button onClick={() => (picker = 'quarter')}>quarter</Button>
          <Button onClick={() => (picker = 'year')}>year</Button>
          <Button onClick={() => (size = 'small')}>small</Button>
          <Button onClick={() => (size = 'default')}>default</Button>
          <Button onClick={() => (size = 'large')}>large</Button>
        </div>
      </div>
    </div>
  );
}

export default RangePickerDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

### DatePicker

| 属性               | 说明                 | 类型                        | 可选值                                                     | 默认值         |
| ------------------ | -------------------- | --------------------------- | ---------------------------------------------------------- | -------------- |
| allowClear         | 自定义清除按钮       | `node`                      | -                                                          | -              |
| showNow            | 是否展示“今天”按钮   | `boolean`                   | -                                                          | `true`         |
| autoFocus          | 自动获取焦点         | `boolean`                   | -                                                          | `false`        |
| inputReadOnly      | 设置输入框只读       | `boolean`                   | -                                                          | `false`        |
| defaultOpen        | 是否默认展开控制弹层 | `boolean`                   | -                                                          | `false`        |
| disabled           | 禁用                 | `boolean`                   | -                                                          | `false`        |
| disabledDate       | 不可选择的日期       | `dateType[]`                | -                                                          | -              |
| onChange           | 时间变化回调         | `(value:dateType) => void`  | -                                                          | -              |
| onOk               | 点击确定回调         | `(value:dateType) => void`  | -                                                          | -              |
| open               | 控制弹层是否展开     | `boolean`                   | -                                                          | -              |
| defaultPickerValue | 默认面板日期         | `dateType`                  | -                                                          | -              |
| defaultValue       | 默认值               | `dateType`                  | -                                                          | -              |
| minDate            | 最小日期             | `dateType`                  | -                                                          | -              |
| maxDate            | 最大日期             | `dateType`                  | -                                                          | -              |
| needConfirm        | 是否需要确认按钮     | `boolean`                   | -                                                          | `false`        |
| picker             | 设置选择器类型       | `string`                    | `'date' \| 'week' \| 'month' \| 'quarter'` `year`          | `'date'`       |
| placeholder        | 输入框提示文字       | `string`                    | -                                                          | -              |
| placement          | 选择器弹出的位置     | `string`                    | `'bottomLeft' \| 'bottomRight' \| 'topLeft' \| 'topRight'` | `'bottomLeft'` |
| prefix             | 自定义前缀           | `node`                      | -                                                          | -              |
| prevIcon           | 自定义上一个图标-月  | `node`                      | -                                                          | -              |
| nextIcon           | 自定义下一个图标-月  | `node`                      | -                                                          | -              |
| suffixIcon         | 自定义后缀           | `node`                      | -                                                          | -              |
| superNextIcon      | 自定义下一个图标-年  | `node`                      | -                                                          | -              |
| superPrevIcon      | 自定义上一个图标-年  | `node`                      | -                                                          | -              |
| size               | input 大小           | `string`                    | `'large':40px, 'small':24px, 'default':32px`               | -              |
| status             | 设置校验状态         | `string`                    | `'error' \| 'warning'` -                                   | -              |
| disabled           | 是否禁用             | `boolean`                   | -                                                          | `false`        |
| variant            | 复选框形态           | `string`                    | `'outlined' \| 'filled' \| 'borderless' \| 'underlined'`   | `'outlined'`   |
| onOpenChange       | 变化时回调           | `(value: dateType) => void` | -                                                          | -              |
| onPanleChange      | 变化时回调           | `(value: dateType) => void` | -                                                          | -              |
| onBlur             | 失去焦点时回调       | `(value: dateType) => void` | -                                                          | -              |
| onFocus            | 获得焦点时回调       | `(value: dateType) => void` | -                                                          | -              |
| className          | 自定义类名           | `string`                    | -                                                          | -              |
| style              | 行内样式             | `CSSProperties`             | -                                                          | -              |

### RangePicker

| 属性          | 说明                 | 类型                        | 可选值                                                     | 默认值         |
| ------------- | -------------------- | --------------------------- | ---------------------------------------------------------- | -------------- |
| allowClear    | 自定义清除按钮       | `node`                      | -                                                          | -              |
| showNow       | 是否展示“今天”按钮   | `boolean`                   | -                                                          | `true`         |
| autoFocus     | 自动获取焦点         | `boolean`                   | -                                                          | `false`        |
| inputReadOnly | 设置输入框只读       | `boolean`                   | -                                                          | `false`        |
| defaultOpen   | 是否默认展开控制弹层 | `boolean`                   | -                                                          | `false`        |
| disabled      | 禁用                 | `boolean`                   | -                                                          | `false`        |
| disabledDate  | 不可选择的日期       | `dateType[]`                | -                                                          | -              |
| onChange      | 时间变化回调         | `(value:dateType) => void`  | -                                                          | -              |
| onOk          | 点击确定回调         | `(value:dateType) => void`  | -                                                          | -              |
| open          | 控制弹层是否展开     | `boolean`                   | -                                                          | -              |
| order         | 是否自动排序         | `boolean`                   | -                                                          | `true`         |
| defaultValue  | 默认值               | `dateType[]`                | -                                                          | -              |
| minDate       | 最小日期             | `dateType`                  | -                                                          | -              |
| maxDate       | 最大日期             | `dateType`                  | -                                                          | -              |
| needConfirm   | 是否需要确认按钮     | `boolean`                   | -                                                          | `false`        |
| picker        | 设置选择器类型       | `string`                    | `'date' \| 'week' \| 'month' \| 'quarter'` `year`          | `'date'`       |
| placeholder   | 输入框提示文字       | `string[]`                  | -                                                          | -              |
| placement     | 选择器弹出的位置     | `string`                    | `'bottomLeft' \| 'bottomRight' \| 'topLeft' \| 'topRight'` | `'bottomLeft'` |
| prefixIcon    | 自定义前缀           | `node`                      | -                                                          | -              |
| prevIcon      | 自定义上一个图标-月  | `node`                      | -                                                          | -              |
| nextIcon      | 自定义下一个图标-月  | `node`                      | -                                                          | -              |
| suffixIcon    | 自定义后缀           | `node`                      | -                                                          | -              |
| superNextIcon | 自定义下一个图标-年  | `node`                      | -                                                          | -              |
| superPrevIcon | 自定义上一个图标-年  | `node`                      | -                                                          | -              |
| size          | input 大小           | `string`                    | `'large':40px, 'small':24px, 'default':32px`               | -              |
| status        | 设置校验状态         | `string`                    | `'error' \| 'warning'` -                                   | -              |
| disabled      | 是否禁用             | `boolean`                   | -                                                          | `false`        |
| variant       | 复选框形态           | `string`                    | `'outlined' \| 'filled' \| 'borderless' \| 'underlined'`   | `'outlined'`   |
| onOpenChange  | 变化时回调           | `(value: dateType) => void` | -                                                          | -              |
| onPanelChange | 变化时回调           | `(value: dateType) => void` | -                                                          | -              |
| onBlur        | 失去焦点时回调       | `(value: dateType) => void` | -                                                          | -              |
| onFocus       | 获得焦点时回调       | `(value: dateType) => void` | -                                                          | -              |
| className     | 自定义类名           | `string`                    | -                                                          | -              |
| style         | 行内样式             | `CSSProperties`             | -                                                          | -              |

说明：

- dateType：为对应 picker 日期选择器的格式，`date`为`YYYY-MM-DD`，`week`为`YYYY-WW周`，`month`为`YYYY-MM`，`quarter`为`YYYY-QW`，`year`为`YYYY`。
- 受控模式：当传入`open`字段时，calendar 浮层的打开会变成受控模式。
