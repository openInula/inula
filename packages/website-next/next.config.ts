import type { NextConfig } from "next";
import nextra from 'nextra'

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openinula-website.obs.ap-southeast-1.myhuaweicloud.com',
        port: '',
        pathname: '/img/**',
      },
    ],
  },
};

const withNextra = nextra({
  defaultShowCopyCode: true,
})

export default withNextra(nextConfig)
