import { ReactNode } from 'react'
import { Layout } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
    // Define your metadata here
    // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
}

export default async function RootLayout({children}: Readonly<{ children: ReactNode }>) {
    //const allPages = await getPageMap()

    const docsMap = [
        {
            name: 'api',
            route: '/api',
            title: '官方组件',
            kind: 'Folder',
            children: [
                {
                    name: 'core',
                    route: '/api/core',
                    title: 'Inula',
                    kind: 'MdxPage'
                },
                {
                    name: 'inulax',
                    route: '/api/inulax',
                    title: 'Inula-X',
                    kind: 'MdxPage'
                },
                {
                    name: 'intl',
                    route: '/api/intl',
                    title: 'Inula-intl',
                    kind: 'MdxPage'
                },
                {
                    name: 'router',
                    route: '/api/router',
                    title: 'Inula-router',
                    kind: 'MdxPage'
                },
                {
                    name: 'request',
                    route: '/api/request',
                    title: 'Inula-request',
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
                >
                    {children}
                </Layout>
            </div>
    )
}