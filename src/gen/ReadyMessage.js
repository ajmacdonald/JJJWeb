const JJJMessage = require("./JJJMessage");
const JJJMessageType = require("./JJJMessageType");
class ReadyMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.frar.jjjrmi.socket.message.ReadyMessage";
	}
	static __isEnum() {
		return false;
	}
	getRoot() {
		return this.root;
	}
};

if (typeof module !== "undefined") module.exports = ReadyMessage;