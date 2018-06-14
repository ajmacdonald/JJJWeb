const JJJMessage = require("./JJJMessage");
const JJJMessageType = require("./JJJMessageType");
class ServerSideExceptionMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.frar.jjjrmi.socket.message.ServerSideExceptionMessage";
	}
	static __isEnum() {
		return false;
	}
};

if (typeof module !== "undefined") module.exports = ServerSideExceptionMessage;