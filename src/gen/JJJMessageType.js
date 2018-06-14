class JJJMessageType {
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

if (typeof module !== "undefined") module.exports = JJJMessageType;