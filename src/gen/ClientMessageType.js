class ClientMessageType {
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

if (typeof module !== "undefined") module.exports = ClientMessageType;