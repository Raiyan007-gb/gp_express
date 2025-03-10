import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['webcam.privcom.ch'], // Replace with your stream URL's hostname
  },
};

export default nextConfig;
