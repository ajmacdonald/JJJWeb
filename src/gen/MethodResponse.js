const JJJMessage = require("./JJJMessage");
const JJJMessageType = require("./JJJMessageType");
class MethodResponse {
	constructor(uid, objectPTR, methodName, rvalue) {
		this.uid = uid;
		this.methodName = methodName;
		this.rvalue = rvalue;
		this.objectPTR = objectPTR;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.frar.jjjrmi.socket.message.MethodResponse";
	}
	static __isEnum() {
		return false;
	}
	getMethodName() {
		return this.methodName;
	}
	getObjectPTR() {
		return this.objectPTR;
	}
	getRvalue() {
		return this.rvalue;
	}
	getUid() {
		return this.uid;
	}
};

if (typeof module !== "undefined") module.exports = MethodResponse;