let jjjrmi = {};
ServerSideExceptionMessage = class ServerSideExceptionMessage {
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
jjjrmi.ServerSideExceptionMessage = ServerSideExceptionMessage;
RejectedConnectionMessage = class RejectedConnectionMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.frar.jjjrmi.socket.message.RejectedConnectionMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.RejectedConnectionMessage = RejectedConnectionMessage;
ReadyMessage = class ReadyMessage {
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
jjjrmi.ReadyMessage = ReadyMessage;
MethodResponse = class MethodResponse {
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
};
jjjrmi.MethodResponse = MethodResponse;
MethodRequest = class MethodRequest {
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
jjjrmi.MethodRequest = MethodRequest;
JJJMessageType = class JJJMessageType {
	constructor(value) {
		this.__value = value;
	}
	toString() {
		return this.__value;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.frar.jjjrmi.socket.message.JJJMessageType";
	}
	static __isEnum() {
		return true;
	}
};
JJJMessageType.valueArray = [];
JJJMessageType.valueArray.push(JJJMessageType.LOCAL = new JJJMessageType("LOCAL"));
JJJMessageType.valueArray.push(JJJMessageType.REMOTE = new JJJMessageType("REMOTE"));
JJJMessageType.valueArray.push(JJJMessageType.READY = new JJJMessageType("READY"));
JJJMessageType.valueArray.push(JJJMessageType.LOAD = new JJJMessageType("LOAD"));
JJJMessageType.valueArray.push(JJJMessageType.EXCEPTION = new JJJMessageType("EXCEPTION"));
JJJMessageType.valueArray.push(JJJMessageType.FORGET = new JJJMessageType("FORGET"));
JJJMessageType.valueArray.push(JJJMessageType.REJECTED_CONNECTION = new JJJMessageType("REJECTED_CONNECTION"));
JJJMessageType.values = function(){return JJJMessageType.valueArray;};
jjjrmi.JJJMessageType = JJJMessageType;
JJJMessage = class JJJMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.frar.jjjrmi.socket.message.JJJMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.JJJMessage = JJJMessage;
ForgetMessage = class ForgetMessage {
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
jjjrmi.ForgetMessage = ForgetMessage;
ClientRequestMessage = class ClientRequestMessage {
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
	getUid() {
		return this.uid;
	}
};
jjjrmi.ClientRequestMessage = ClientRequestMessage;
ClientMessageType = class ClientMessageType {
	constructor(value) {
		this.__value = value;
	}
	toString() {
		return this.__value;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.frar.jjjrmi.socket.message.ClientMessageType";
	}
	static __isEnum() {
		return true;
	}
};
ClientMessageType.valueArray = [];
ClientMessageType.valueArray.push(ClientMessageType.METHOD_REQUEST = new ClientMessageType("METHOD_REQUEST"));
ClientMessageType.valueArray.push(ClientMessageType.INVOCATION_RESPONSE = new ClientMessageType("INVOCATION_RESPONSE"));
ClientMessageType.values = function(){return ClientMessageType.valueArray;};
jjjrmi.ClientMessageType = ClientMessageType;
ClientMessage = class ClientMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.frar.jjjrmi.socket.message.ClientMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.ClientMessage = ClientMessage;

if (typeof module !== "undefined") module.exports = jjjrmi;