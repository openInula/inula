import { ReactNode } from 'react'
import { Layout } from 'nextra-theme-docs'
/*import { getPageMap } from 'nextra/page-map'*/
import 'nextra-theme-docs/style.css'

export default async function RootLayout({children}: Readonly<{ children: ReactNode }>) {
    //const allPages = await getPageMap()

    const docsMap = [
        {
            name: "概述",
            route: '/docs',
            title: '概述',
            kind: 'MdxPage',
        },
        {
            name: 'introduction',
            route: '/docs/introduction',
            title: 'Introduction',
            kind: 'MdxPage'
        },
        {
            name: 'Quick start',
            route: '/docs/quick-start',
            title: '快速开始',
            kind: 'MdxPage'
        },
        {
            name: 'reactivity',
            route: '/docs/reactivity',
            title: '响应式系统',
            kind: 'Folder',
            children: [
                {
                    name: 'state',
                    route: '/docs/reactivity/state',
                    title: '状态管理',
                    kind: 'MdxPage'
                },
                {
                    name: 'computed',
                    route: '/docs/reactivity/computed',
                    title: '计算值',
                    kind: 'MdxPage'
                },
                {
                    name: 'watch',
                    route: '/docs/reactivity/watch',
                    title: '监听系统',
                    kind: 'MdxPage'
                },
                {
                    name: 'untrack',
                    route: '/docs/reactivity/untrack',
                    title: 'untrack（非响应式访问）',
                    kind: 'MdxPage'
                }
            ]
        },
        {
            name: 'template-system',
            route: '/docs/template-system',
            title: '模板系统',
            kind: 'Folder',
            children: [
                {
                    name: 'conditional',
                    route: '/docs/template-system/conditional',
                    title: '条件渲染',
                    kind: 'MdxPage'
                },
                {
                    name: 'event-handling',
                    route: '/docs/template-system/event-handling',
                    title: '事件处理',
                    kind: 'MdxPage'
                },
                {
                    name: 'list-rendering',
                    route: '/docs/template-system/list-rendering',
                    title: '列表渲染',
                    kind: 'MdxPage'
                }
            ]
        },
        {
            name: 'lifecycle',
            route: '/docs/lifecycle',
            title: '生命周期',
            kind: 'Folder',
            children: [
                {
                    name: 'mounting',
                    route: '/docs/lifecycle/mounting',
                    title: '挂载阶段',
                    kind: 'MdxPage'
                },
                {
                    name: 'unmounting',
                    route: '/docs/lifecycle/unmounting',
                    title: '卸载阶段',
                    kind: 'MdxPage'
                },
                {
                    name: 'cleanup',
                    route: '/docs/lifecycle/cleanup',
                    title: '清理阶段',
                    kind: 'MdxPage'
                }
            ]
        },
        {
            name: 'components',
            route: '/docs/components',
            title: '组件',
            kind: 'Folder',
            children: [
                {
                    name: 'composition',
                    route: '/docs/components/composition',
                    title: '组合模式',
                    kind: 'MdxPage'
                },
                {
                    name: 'context',
                    route: '/docs/components/context',
                    title: '上下文',
                    kind: 'MdxPage'
                },
                {
                    name: 'Dynamic',
                    route: '/docs/components/Dynamic',
                    title: '动态组件',
                    kind: 'MdxPage'
                },
                {
                    name: 'ErrorBoundary',
                    route: '/docs/components/ErrorBoundary',
                    title: '错误边界',
                    kind: 'MdxPage'
                },
                {
                    name: 'Fragment',
                    route: '/docs/components/Fragment',
                    title: 'Fragment',
                    kind: 'MdxPage'
                },
                {
                    name: 'Portal',
                    route: '/docs/components/Portal',
                    title: 'Portal',
                    kind: 'MdxPage'
                },
                {
                    name: 'props',
                    route: '/docs/components/props',
                    title: 'Props',
                    kind: 'MdxPage'
                },
                {
                    name: 'Suspense',
                    route: '/docs/components/Suspense',
                    title: 'Suspense',
                    kind: 'MdxPage'
                }
            ]
        },
        {
            name: 'conventional',
            route: '/docs/conventional',
            title: '传统API文档',
            kind: 'Folder',
            children: [
                {
                    name: 'UserInstruction',
                    route: '/docs/conventional/UserInstruction',
                    title: '用户指南',
                    kind: 'MdxPage',
                },
                {
                    name: 'QuickStart',
                    route: '/docs/conventional/QuickStart',
                    title: '快速入门',
                    kind: 'MdxPage'
                },
                {
                    name: 'SwitchingGuide',
                    route: '/docs/conventional/SwitchingGuide',
                    title: '切换指导书',
                    kind: 'MdxPage'
                },
                {
                    name: 'ReleaseNotes',
                    route: '/docs/conventional/ReleaseNotes',
                    title: '发行说明',
                    kind: 'MdxPage'
                },
                {
                    name: 'FAQ',
                    route: '/docs/conventional/FAQ',
                    title: '常见问题',
                    kind: 'MdxPage'
                },
                {
                    name: 'CodeOfConduct',
                    route: '/docs/conventional/CodeOfConduct',
                    title: '行为准则',
                    kind: 'MdxPage'
                },
                {
                    name: 'ContributingGuide',
                    route: '/docs/conventional/ContributingGuide',
                    title: '贡献指南',
                    kind: 'MdxPage'
                }
            ]
        }
    ]

    return (
            <div className="w-full max-w-[90rem] mx-auto px-4">
                <Layout
                    pageMap={docsMap}
                    docsRepositoryBase="https://github.com/shuding/nextra/tree/main/docs"
                    // ... Your additional layout options
                    editLink={null}
                    feedback={{ content: null }}
                >
                    {children}
                </Layout>
            </div>
    )
}