import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://example.it",
	output: "hybrid",
	adapter: cloudflare({
		imageService: "compile",
	}),
	compressHTML: true,
	redirects: {
		"/admin": "/keystatic",
	},
	vite: {
		worker: {
			format: "es",
		},
	},
	integrations: [react()],
});
