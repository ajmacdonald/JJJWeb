const JJJMessage = require("./JJJMessage");
const JJJMessageType = require("./JJJMessageType");
class ForgetMessage {
	constructor() {
		
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.frar.jjjrmi.socket.message.ForgetMessage";
	}
	static __isEnum() {
		return false;
	}
};

if (typeof module !== "undefined") module.exports = ForgetMessage;