import { Button, Alert, /*Tooltip,*/ Checkbox /*, Dialog*/ } from 'element-react/next';
import Dialog from './dialog';
import Input from './input';
import { Table, TableColumn } from './table';
import { Form, FormItem } from './form';
import { Tooltip } from './tooltip';
import { Option, Select } from './select';
import { Radio, RadioGroup } from './radio';
import { Menu, MenuItem, MenuItemGroup, SubMenu } from './menu';
import { Pagination } from './pagination';
import { Dropdown, DropdownMenu, DropdownItem } from './dropdown';
import { Drawer } from './drawer';
import { Tabs, TabPane } from './tabs';

const register = (name, comp) => {
  console.log('register component: ', name, { component: comp });
  // window.horizon.registerComponent(name, comp);
};

// const dialogRef = window.horizon.useRef(null);
export function init() {
  register('el-alert', props => <Alert title={props.title} type={props.type} closable={true} />);
  register('el-button', props => {
    return (
      <span className={props.className}>
        <Button disabled={props.disabled} onClick={props.onClick} type={props.type}>
          {props.children}
        </Button>
      </span>
    );
  });
  register('el-checkbox', props => (
    <Checkbox checked={props.value} disabled={props.disabled}>
      {props.label}
    </Checkbox>
  ));
  register('el-config-provider', props => <div>{props.children}</div>); //mock
  register('el-dialog', props => {
    if (props?.config) {
      // return <p>DIALOG HAS NO TEMPLATES</p>;
      return null;
    }
    if (!Array.isArray(props.children)) {
      props.children = props.children.length ? [props.children] : [];
    }
    const header = props.children.find(child => child.type === 'template' && child.props.name === 'header');
    const footer = props.children.find(child => child.type === 'template' && child.props.name === 'footer');
    const body = props.children.filter(child => child.type !== 'template');
    // props.ref.value.show = ()=>{
    //   props.modelValue.value = true;
    // }
    // const dialog =<p>{props.modelValue?"visible":"notVisible"}</p>
    // const dialog = <Dialog visible={props.modelValue} onUpdate={()=>{
    //   props['onUpdate:modelValue'](false)
    // }} />
    const dialog = (
      <Dialog
        title={props.title}
        width={props.width}
        visible={props.modelValue}
        onClose={() => props.onClose()}
        header={header}
        footer={footer}
      >
        <Dialog.Body>{body.length ? body : null}</Dialog.Body>
      </Dialog>
    );
    // props.ref.current = dialog;
    return [dialog];
  });
  register('el-drawer', Drawer);
  register('el-dropdown', Dropdown);
  register('el-dropdown-menu', DropdownMenu);
  register('el-dropdown-item', DropdownItem);
  register('el-form', Form);
  register('el-form-item', FormItem);
  register('el-group', ({ children }) => {
    return <span>{children}</span>;
  });
  register('el-icon', props => {
    //size color name
    const styleObj = {
      width: `${props.size}px`,
      height: `${props.size}px`,
      backgroundColor: `${props.color}`,
      margin: '0 5px',
      display: 'inline-block',
      '-webkit-mask-image': props.name
        ? `url(./convert/assets/icons/${props.name
            .replace('Icon', '')
            .toLowerCase()}), url(./convert/modules/element-plus-icons-main/packages/svg/${props.name
            .replace('Icon', '')
            .toLowerCase()})`
        : 'none',
      'mask-image': props.name
        ? `url(./convert/assets/icons/${props.name
            .replace('Icon', '')
            .toLowerCase()}), url(./convert/modules/element-plus-icons-main/packages/svg/${props.name
            .replace('Icon', '')
            .toLowerCase()})`
        : 'none',
      verticalAlign: 'middle',
    };

    return <i style={styleObj}>{props.children}</i>;
  }); //todo
  register('el-input', Input);
  register('el-menu', Menu);
  register('el-menu-item', MenuItem);
  register('el-menu-item-group', MenuItemGroup);
  register('el-option', Option);
  register('el-pagination', Pagination);
  register('el-radio', Radio);
  register('el-radio-group', RadioGroup);
  register('el-select', Select);
  register('el-sub-menu', SubMenu);
  register('el-table', Table);
  register('el-table-column', TableColumn);
  register('el-tabs', Tabs);
  register('el-tab-pane', TabPane);
  register('el-tooltip', Tooltip);
  register('el-upload', props => {
    const fileInputRef = window.horizon.useRef(null);
    const { action, accept, ['before-upload']: beforeUpload, ['auto-upload']: autoUpload, children } = props;

    const handleFileChange = async e => {
      const file = e.target.files[0];

      if (autoUpload) {
        beforeUpload(file);
      }
    };

    const clickUpload = () => {
      setTimeout(() => {
        fileInputRef.current.style.display = 'inline-block';
        fileInputRef.current.focus();
        fileInputRef.current.click();
        fileInputRef.current.style.display = 'none';
      }, 1);
    };

    return [
      <input type="file" ref={fileInputRef} style={{ display: 'none', opacity: '0%' }} onChange={handleFileChange} />,
      <div onClick={clickUpload}>{children}</div>,
    ];
  });
}
