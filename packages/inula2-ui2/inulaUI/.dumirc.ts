import { defineConfig } from 'dumi';
export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: ({
    name: 'InulaUI',
    nav: [
      {
        title: '指南',
        link: '/guide',
      },
      {
        title: '组件',
        link: '/components/button',
      },
      {
        title: '更新日志',
        link: '/changelog',
      },
      {
        title: '贡献指南',
        link: '/contributing',
      },
    ],
    sidebar: {
      '/components': [
        {
          title: '通用',
          children: [
            { title: 'Button 按钮', link: '/components/button' },
            { title: 'Icon 图标', link: '/components/icon' },
          ],
        },
        {
          title: '导航',
          children: [
            { title: 'Tabs 标签页', link: '/components/tabs' },
          ],
        },
        {
          title: '数据录入',
          children: [
            { title: 'Checkbox 多选框', link: '/components/checkbox' },
            { title: 'DataPicker 日期选择器', link: '/components/datapicker' },
            { title: 'Form 表单', link: '/components/form' },
            { title: 'Input 输入框', link: '/components/input' },
            { title: 'Radio 单选框', link: '/components/radio' },
            { title: 'Select 选择器', link: '/components/select' },
            { title: 'Switch 开关', link: '/components/switch' },
          ],
        },
        {
          title: '数据展示',
          children: [
            { title: 'Card 卡片', link: '/components/card' },
            { title: 'Tooltip 文字提示', link: '/components/tooltip' },
            { title: 'Tag 标签', link: '/components/tag' },
            { title: 'Tree 树形控件', link: '/components/tree' },
          ],
        },
        {
          title: '反馈',
          children: [
            { title: 'Modal 对话框', link: '/components/dialog' },
            { title: 'Spin 加载中', link: '/components/spin' },
            { title: 'Notification 通知提示框', link: '/components/notification' },
          ],
        },
      ],
    },
  }),
});
