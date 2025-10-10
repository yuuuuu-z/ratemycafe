import type { NextConfig } from "next";
import createNextIntPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ktzkxcohwybsvdtjsnby.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "qiniu.cambojob.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "scontent.fpnh5-2.fna.fbcdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.browncoffee.com.kh",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
    ],
  },
};
const withNextIntl = createNextIntPlugin();
export default withNextIntl(nextConfig);
