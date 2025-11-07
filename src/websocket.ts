import { defineNitroPlugin } from "nitropack/runtime";
import { defineWebSocketHandler } from "h3";
import { logger } from "./utils/logger";

export default defineNitroPlugin((nitroApp) => {
	(nitroApp as any).h3App.use(
		"/api/v2/websocket",
		defineWebSocketHandler({
			open(peer) {
				try {
					peer.send("connected");
				} catch {}
			},
			message(peer, message) {
				try {
					const text =
						typeof message === "string"
							? message
							: message instanceof ArrayBuffer
							  ? Buffer.from(message).toString()
							  : ArrayBuffer.isView(message)
								? Buffer.from(message.buffer).toString()
								: String(message ?? "");

					// ...
				} catch (err) {
					try {
            peer.send("error: could not process message");
            logger.error("websocket error: " + err);
					} catch {}
				}
			},
			close() {},
			error(_peer, _err) {
				logger.error("websocket error: " + _err);
			},
		}) as any
	);
});