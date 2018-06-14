const JJJMessage = require("./JJJMessage");
const JJJMessageType = require("./JJJMessageType");
class ClientRequestMessage {
	constructor(uid, ptr, methodName, args) {
		this.uid = uid;
		this.ptr = ptr;
		this.methodName = methodName;
		this.args = args;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.frar.jjjrmi.socket.message.ClientRequestMessage";
	}
	static __isEnum() {
		return false;
	}
	getArgs() {
		return Arrays.copyOf(this.args, this.args.length);
	}
	getMethodName() {
		return this.methodName;
	}
	getPtr() {
		return this.ptr;
	}
	getUid() {
		return this.uid;
	}
};

if (typeof module !== "undefined") module.exports = ClientRequestMessage;