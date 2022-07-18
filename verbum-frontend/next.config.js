/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

const nextConfig = withBundleAnalyzer({
  reactStrictMode: false // TODO - Disabled this since centrifuge-js has an issue where calling disconnect does not abort a connection that's about to happen.
});

module.exports = nextConfig
