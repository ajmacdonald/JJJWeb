const ClientMessage = require("./ClientMessage");
const ClientMessageType = require("./ClientMessageType");
class MethodRequest {
	constructor(uid, ptr, methodName, args) {
		this.uid = uid;
		this.objectPTR = ptr;
		this.methodName = methodName;
		this.methodArguments = args;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.frar.jjjrmi.socket.message.MethodRequest";
	}
	static __isEnum() {
		return false;
	}
};

if (typeof module !== "undefined") module.exports = MethodRequest;