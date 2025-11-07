export type StartupContext = {
	env: "nitro" | "vite-dev";
	nitroApp?: unknown;
};

export function onServerStart(ctx?: StartupContext) {
	
}