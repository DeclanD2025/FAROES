import type { NextConfig } from "next";

/**
 * Faroe Islands trip journal — static export, ready for GitHub Pages.
 *
 * BASE_PATH lets the same build be mounted at the site root ("") for local
 * development or alongside another site (e.g. "/faroe-islands") when served
 * from a sub-path. Next rewrites its own asset URLs and <Link> hrefs from
 * basePath, so we don't have to touch any trip-day links by hand.
 *
 * Default is empty (local `pnpm run dev` works at /). Set BASE_PATH in CI to
 * "/<repo-name>" for the production GitHub Pages deployment — see
 * .github/workflows/deploy.yml.
 */
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Fully static: every page is prerendered to plain HTML at build time.
  output: "export",
  trailingSlash: true,
  basePath,
  // With output: "export", Next stops running its runtime image pipeline. The
  // editorial layout already pre-sizes every image, so leaving optimisation
  // on would just trip a "use a server" warning at build time.
  images: { unoptimized: true },
};

export default nextConfig;
