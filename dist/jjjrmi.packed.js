(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
class Constants {
	constructor() {
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.Constants";
	}
	static __isEnum() {
		return false;
	}
};

Constants.KeyParam = "key";
Constants.FlagParam = "flags";
Constants.TypeParam = "type";
Constants.PrimitiveParam = "primitive";
Constants.ValueParam = "value";
Constants.FieldsParam = "fields";
Constants.NameParam = "name";
Constants.ElementsParam = "elements";
Constants.DepthParam = "depth";
Constants.PointerParam = "ptr";
Constants.EnumParam = "enum";
Constants.CustomType = "@custom";
Constants.TransientValue = "trans";
Constants.NullValue = "null";
Constants.PrimativeTypeString = "string";
Constants.PrimativeTypeNumber = "number";
Constants.PrimativeTypeBoolean = "boolean";

module.exports = Constants;
},{}],2:[function(require,module,exports){
let Constants = require("./Constants");
let EncodedJSON = require("./EncodedJSON");

class RestoredObject {
    constructor(json, translator) {
        this.json = json;
        this.translator = translator;
        this.fields = json.get(Constants.FieldsParam);
    }
    decode() {
        let className = this.json.get(Constants.TypeParam);
        let aClass = this.translator.getClass(className);

        let newInstance = null;

        /* aready restored, retrieve restored object */;
        /* if handler, create new object with handler */;
        /* create new object from description */;
        if (this.json.has(Constants.KeyParam) && this.translator.hasReference(this.json.get(Constants.KeyParam))) {
            newInstance = this.translator.getReferredObject(this.json.get(Constants.KeyParam));
            return newInstance;
        } else if (this.translator.hasHandler(aClass)) {
            let handler = this.translator.getHandler(aClass);
            newInstance = handler.instatiate();
        } else {
            newInstance = new aClass();
        }

        if (!aClass.__isTransient()) this.translator.addReference(this.json.get(Constants.KeyParam), newInstance);
        else this.translator.addTempReference(this.json.get(Constants.KeyParam), newInstance);

        if (this.translator.hasHandler(aClass)) {
            let handler = this.translator.getHandler(aClass);
            handler.decode(this, newInstance);
        } else if (typeof newInstance.jjjDecode === "function") {
            newInstance.jjjDecode(this);
        } else {
            for (let field in this.json.get(Constants.FieldsParam)) {
                new Decoder(new EncodedJSON(this.json.get(Constants.FieldsParam)[field]), this.translator).decode(r=>newInstance[field] = r);
            }
        }

        this.translator.notifyDecode(newInstance);
        if (typeof newInstance.jjjOnDecode === "function"){
            newInstance.jjjOnDecode();
        }
        return newInstance;
    }
    decodeField(name, callback) {
        new Decoder(new EncodedJSON(this.fields[name]), this.translator).decode(r=>callback(r));
    }
    getJavaField(aClass, name) {
        while (aClass !== Object.class) {
            for (let field of aClass.getDeclaredFields()) {
                if (field.getName() === name) return field;
            }
            aClass = aClass.getSuperclass();
        }
        return null;
    }
    getType() {
        return this.json.get(Constants.TypeParam);
    }
}

class RestoredArray {
    constructor(json, translator) {
        this.json = json;
        this.translator = translator;
        this.elements = json.get(Constants.ElementsParam);
    }
    decode() {
        let newInstance = [];

        for (let i = 0; i < this.elements.length; i++) {
            let element = this.elements[i];
            new Decoder(new EncodedJSON(element), this.translator).decode(r=>newInstance[i] = r);
        }

        return newInstance;
    }
}

class Decoder {
    constructor(json, translator) {
        this.json = json;
        this.translator = translator;
    }
    decode(callback) {
        this.callback = callback;
        /* the value is a primative, check expected type */;
        /* expected type not found, refer to primitive type */;
        if (this.json.has(Constants.TypeParam) && this.json.get(Constants.TypeParam) === Constants.NullValue) callback(null);
        else if (this.json.has(Constants.PointerParam)) {
            if (!this.translator.hasReference(this.json.get(Constants.PointerParam))) this.translator.deferDecoding(this);
            let referredObject = this.translator.getReferredObject(this.json.get(Constants.PointerParam));
            callback(referredObject);
        } else if (this.json.has(Constants.EnumParam)) {
            let className = this.json.get(Constants.EnumParam);
            let fieldName = this.json.get(Constants.ValueParam);
            let aClass = this.translator.getClass(className);
            let result = aClass[fieldName];
            callback(result);
        } else if (this.json.has(Constants.ValueParam)) {
            callback(this.json.get(Constants.ValueParam));
        } else if (this.json.has(Constants.ElementsParam)) {
            let array = new RestoredArray(this.json, this.translator).decode();
            callback(array);
        } else if (this.json.has(Constants.FieldsParam)) {
            let object = new RestoredObject(this.json, this.translator).decode();
            callback(object);
        } else {
            console.log(this.json.toString(2));
            throw new Error("java.lang.RuntimeException");
        }
    }
    resume() {
        this.decode(this.callback);
    }
}

module.exports = Decoder;
},{"./Constants":1,"./EncodedJSON":3}],3:[function(require,module,exports){
class EncodedJSON{
    constructor(json){
        if (json === null) throw new Error("JSON object is null.");
        if (typeof json === "undefined") throw new Error("JSON object is undefined.");  
        this.json = json;
    }

    has(key){
        return typeof this.json[key] !== "undefined";
    }

    get(key){
        return this.json[key];
    }

    toString(){
        return JSON.stringify(this.json, null, 2);
    }
}

module.exports = EncodedJSON;
},{}],4:[function(require,module,exports){
let Constants = require("./Constants");

class Encoder {
    constructor(object, translator, keys) {
        if (object !== null && typeof object === "object" && !object instanceof Array) {
            if (typeof object.constructor === "undefined") {
                throw new Error(`Object missing constructor.`);
            }
            if (typeof object.constructor.__isTransient !== "function") {
                throw new Error(`Class "${object.constructor.name}" missing method "__isTransient".`);
            }
            if (typeof object.constructor.__isEnum !== "function") {
                throw new Error(`Class "${object.constructor.name}" missing method "__isEnum".`);
            }
            if (typeof object.constructor.__getClass !== "function") {
                throw new Error(`Class "${object.constructor.name}" missing method "__getClass".`);
            }
        }
        
        this.object = object;
        this.translator = translator;
        this.keys = keys;
    }
    encode() {
        /* undefined & NULL objects are treated as NULL */
        if (typeof this.object === "undefined" || this.object === null) {
            return new EncodedNull().toJSON();
        }
        /* primitives */
        else if (typeof this.object === "number" || typeof this.object === "string" || typeof this.object === "boolean") {
            return new EncodedPrimitive(this.object).toJSON();
        }
        /* object is stored from previous transaction */
        else if (this.translator.hasReferredObject(this.object)) {
            return new EncodedReference(this.translator.getReference(this.object)).toJSON();
        }
        /* is array */
        else if (this.object instanceof Array) {
            return new EncodedArray(this.object, this.translator, this.keys).toJSON();
        }
        /* set to null skips encoding all together */
        else if (this.object["jjjEncode"] === null) {
            return null;
        }        
        /* is Enum */
        else if (this.object.constructor.__isEnum()) {
            return new EncodedEnum(this.object, this.translator, this.keys).toJSON();
        }
        /* handler has been registered */
        else if (this.translator.hasHandler(this.object.constructor)) {
            let handler = this.translator.getHandler(this.object.constructor);
            let encodedObject = new EncodedObject(this.object, this.translator, this.keys);
            handler.encode(encodedObject, this.object);
            return encodedObject.toJSON();
        }
        /* object handles it's self */
        else if (typeof this.object["jjjEncode"] === "function") {
            let encodedObject = new EncodedObject(this.object, this.translator, this.keys);
            this.object.jjjEncode(encodedObject);
            return encodedObject.toJSON();
        }
        /* encode object */
        else {
            let encodedObject = new EncodedObject(this.object, this.translator, this.keys);
            encodedObject.encode();
            return encodedObject.toJSON();
        }
    }
}

class EncodedNull {
    constructor() {
        this.json = {};
        this.json[Constants.TypeParam] = Constants.NullValue;
    }
    toJSON() {
        return this.json;
    }
}

class EncodedPrimitive {
    constructor(value) {
        this.json = {};
        this.json[Constants.PrimitiveParam] = typeof value;
        this.json[Constants.ValueParam] = value;
    }
    toJSON() {
        return this.json;
    }
}

class EncodedReference {
    constructor(ref) {
        this.json = {};
        this.json[Constants.PointerParam] = ref;
    }
    toJSON() {
        return this.json;
    }
}

class EncodedArray {
    constructor(object, translator, keys) {
        this.json = {};
        this.object = object;
        this.translator = translator;
        this.keys = keys;
        this.json[Constants.ElementsParam] = [];
        this.encode();
    }
    encode() {
        this.setValues(this.json[Constants.ElementsParam], this.object);
    }
    setValues(parent, current) {
        for (let i = 0; i < current.length; i++) {
            let element = current[i];
            let value = new Encoder(element, this.translator, this.keys).encode();
            if (value !== null) parent.push(value);
        }
    }
    toJSON() {
        return this.json;
    }
}

class EncodedEnum {
    constructor(object, translator, keys) {
        this.json = {};
        this.json[Constants.ValueParam] = object.toString();
        this.json[Constants.EnumParam] = object.constructor.__getClass();
    }

    toJSON() {
        return this.json;
    }
}

class EncodedObject {
    constructor(object, translator, keys) {
        this.json = {};
        this.object = object;
        this.translator = translator;
        this.keys = keys;

        this.json[Constants.TypeParam] = this.object.constructor.__getClass();
        this.json[Constants.FieldsParam] = {};

        let key = this.translator.allocNextKey();
        this.json[Constants.KeyParam] = key;

        if (this.object.constructor.__isTransient()) {
            this.translator.addTempReference(key, this.object);
        } else {
            this.translator.addReference(key, this.object);
        }

        if (typeof object.constructor.__isTransient !== "function") {
            window.object = object;
            throw new Error(`Field '__isTransient' of class '${object.constructor.name}' is not of type function, found type '${typeof object.constructor.__isTransient}'.`);
        }
    }

    encode() {
        for (let field in this.object) {
            this.setField(field, this.object[field]);
        }
        return this.json;
    }

    setField(name, value) {
        let encodedValue = new Encoder(value, this.translator, this.keys).encode();
        if (encodedValue !== null) this.json[Constants.FieldsParam][name] = encodedValue;
    }

    toJSON() {
        return this.json;
    }
}

module.exports = Encoder;
},{"./Constants":1}],5:[function(require,module,exports){
let Translator = require("./Translator");
let jjjrmi = require("./gen/package");
let ArrayList = require("./java-equiv/ArrayList");
let HashMap = require("./java-equiv/HashMap");

class JJJRMISocket {
    constructor(socketName) {
        this.jjjSocketName = socketName;
        this.translator = new Translator();
        this.callback = {};
        this.flags = Object.assign(JJJRMISocket.flags);
        this.socket = null;
        this.translator.copyFrom(JJJRMISocket.classes);

        this.translator.addDecodeListener(obj=>obj.__jjjWebsocket = this);
        this.translator.addEncodeListener(obj=>obj.__jjjWebsocket = this);
        this.jjjEncode = null;
    }

	getHandler(aClass) {
		return this.translator.getHandler(aClass);
	}
	hasHandler(aClass) {
		return this.translator.hasHandler(aClass);
	}
	setHandler(aClass, handler) {
		this.translator.setHandler(aClass, handler);
	}

    async connect(url) {
        if (this.flags.CONNECT) console.log(`${this.jjjSocketName} connecting`);
        if (!url) url = this.getAddress();

        let cb = function (resolve, reject) {
            this.socket = new WebSocket(url);
            this.onready = resolve;
            this.onreject = reject;
            this.socket.onerror = (err) => {
                console.error("websocket error");
                console.error(err);
                reject(err);
            };
            this.socket.onmessage = (evt) => this.onMessage(evt);
            this.nextUID = 0;
            this.callback = {};
        }.bind(this);

        return new Promise(cb);
    }

    getAddress(){
        let prequel = "ws://";
        if (window.location.protocol === "https:") prequel = "wss://";
        let pathname = window.location.pathname.substr(1);
        pathname = pathname.substr(0, pathname.indexOf("/"));
        return `${prequel}${window.location.host}/${pathname}/${this.jjjSocketName}`;
    }

    reset(){
        this.translator.clear();
    }

    /**
     * Send a method request to the server.
     * callbacks.
     * @param {type} src
     * @param {type} methodName
     * @param {type} args
     * @returns {undefined}
     */
    methodRequest(src, methodName, args) {
        if (!this.translator.hasReferredObject(src)){
            console.warn("see window.debug for source");
            window.debug = src;
            throw new Error(`Attempting to call server side method on non-received object: ${src.constructor.name}.${methodName}`);
        }
        let uid = this.nextUID++;
        let ptr = this.translator.getReference(src);

        let argsArray = [];
        for (let i in args) argsArray.push(args[i]);

        let f = function (resolve, reject) {
            this.callback[uid] = {
                resolve: resolve,
                reject: reject
            };
            let packet = new MethodRequest(uid, ptr, methodName, argsArray);
            let encodedPacket = this.translator.encode(packet);
            if (this.flags.SENT) console.log(encodedPacket);
            let encodedString = JSON.stringify(encodedPacket, null, 4);
            if (this.flags.SENT && this.flags.VERBOSE) console.log(encodedString);

            if (this.socket !== null) this.socket.send(encodedString);
            else console.warn(`Socket "${this.socketName}" not connected.`);
        }.bind(this);

        return new Promise(f);
    }
    /**
     * All received messages are parsed by this method.  All messages must of the java type 'RMIResponse' which will
     * always contain the field 'type:RMIResponseType'.
     * @param {type} evt
     * @returns {undefined}
     */
    onMessage(evt) {
        if (this.flags.RECEIVED && this.flags.VERBOSE){
            let json = JSON.parse(evt.data);
            console.log(JSON.stringify(json, null, 2));
        }
        let rmiMessage = this.translator.decode(evt.data);
        if (this.flags.RECEIVED) console.log(rmiMessage);

        switch (rmiMessage.type) {
            case jjjrmi.JJJMessageType.FORGET:{
                if (this.flags.ONMESSAGE) console.log(this.jjjSocketName + " FORGET");
                this.translator.removeByKey(rmiMessage.key);
                break;
            }
            case jjjrmi.JJJMessageType.READY:{
                if (this.flags.CONNECT || this.flags.ONMESSAGE) console.log(this.jjjSocketName + " READY");
                this.onready(rmiMessage.getRoot());
                break;
            }
            /* client originated request */
            case jjjrmi.JJJMessageType.LOCAL:{
                if (this.flags.ONMESSAGE) console.log(`Response to client side request: ${this.jjjSocketName} ${rmiMessage.methodName}`);
                let callback = this.callback[rmiMessage.uid];
                delete(this.callback[rmiMessage.uid]);
                callback.resolve(rmiMessage.rvalue);
                break;
            }
            /* server originated request */
            case jjjrmi.JJJMessageType.REMOTE:{
            if (this.flags.ONMESSAGE) console.log(`Server side originated request: ${this.jjjSocketName} ${rmiMessage.methodName}`);
                let target = this.translator.getReferredObject(rmiMessage.ptr);
                this.remoteMethodCallback(target, rmiMessage.methodName, rmiMessage.args);
//                let response = new InvocationResponse(rmiMessage.uid, InvocationResponseCode.SUCCESS);
//                let encodedResponse = this.translator.encode(response);
//                let encodedString = JSON.stringify(encodedResponse, null, 4);
//
//                if (this.flags.ONMESSAGE) console.log(`Server side request: ${this.jjjSocketName} ${target.constructor.name}.${rmiMessage.methodName}`);
//                if (socket !== null) this.socket.send(encodedString);
//                else console.warn(`Socket "${this.socketName}" not connected.`);
                break;
            }
            case jjjrmi.JJJMessageType.EXCEPTION:{
                if (!this.flags.SILENT) console.log(this.jjjSocketName + " EXCEPTION " + rmiMessage.methodName);
                if (!this.flags.SILENT) console.warn(rmiMessage);
                let callback = this.callback[rmiMessage.uid];
                delete(this.callback[rmiMessage.uid]);
                callback.reject(rmiMessage);
                break;
            }
            case jjjrmi.JJJMessageType.REJECTED_CONNECTION:{
                if (this.flags.CONNECT || this.flags.ONMESSAGE) console.log(this.jjjSocketName + " REJECTED_CONNECTION");
                this.onreject();
                break;
            }
        }
    }

    /**
     * Handles a server originated request.  Will throw a warning if the client does not have a method to handle the
     * request.
     * @param {type} target
     * @param {type} methodName
     * @param {type} args
     * @returns {undefined}
     */
    remoteMethodCallback(target, methodName, args) {
        if (typeof target[methodName] !== "function") {
            if (!JJJRMISocket.silent) console.warn(this.socket.url + ":" + target.constructor.name + " does not have remotely invokable method '" + methodName + "'.");
        } else {
            return target[methodName].apply(target, args);
        }
    }
};

JJJRMISocket.flags = {
        SILENT: false, /* do not print exceptions to console */
        CONNECT: false, /* show the subset of ONMESSAGE that deals with the initial connection */
        ONMESSAGE: false, /* describe the action taken when a message is received */
        SENT: false, /* show the send object, versbose shows the json text as well */
        RECEIVED: false, /* show the received server object, verbose shows the json text as well */
        VERBOSE: false,
        ONREGISTER: false /* report classes as they are registered */
};

JJJRMISocket.classes = new Map();

JJJRMISocket.registerClass = function(aClass){
    if (typeof aClass !== "function") throw new Error(`paramater 'class' of method 'registerClass' is '${typeof aClass.__getClass}', expected 'function'`);
    if (typeof aClass.__getClass !== "function") throw new Error(`in Class ${aClass.constructor.name} method __getClass of type ${typeof aClass.__getClass}`);
    if (JJJRMISocket.flags.ONREGISTER) console.log(`Register ${aClass.__getClass()}`);
    JJJRMISocket.classes.set(aClass.__getClass(), aClass);
};

/* for registering all classes returned from generated JS */
JJJRMISocket.registerPackage = function(package){
    for (let aClass in package) JJJRMISocket.registerClass(package[aClass]);
};

/* register the classes required for JJJRMISocket */
JJJRMISocket.registerPackage(jjjrmi);
JJJRMISocket.registerClass(ArrayList);
JJJRMISocket.registerClass(HashMap);

jjjrmisocket = {};
jjjrmisocket.JJJRMISocket = JJJRMISocket;
jjjrmisocket.Translator = Translator;
jjjrmisocket.ArrayList = ArrayList;
jjjrmisocket.HashMap = HashMap;
module.exports = jjjrmisocket;
},{"./Translator":6,"./gen/package":18,"./java-equiv/ArrayList":19,"./java-equiv/HashMap":20}],6:[function(require,module,exports){
let Encoder = require("./Encoder");
let Decoder = require("./Decoder");
let ArrayList = require("./java-equiv/ArrayList");
let EncodedJSON = require("./EncodedJSON");

class BiMap {
    constructor() {
        this.objectMap = new Map();
        this.reverseMap = new Map();
    }
    clear() {
        this.objectMap.clear();
        this.reverseMap.clear();
    }
    keys() {
        return this.objectMap.keys();
    }
    removeByKey(key) {
        let obj = this.objectMap.get(key);
        this.objectMap.delete(key);
        this.reverseMap.delete(obj);
    }
    removeByValue(obj) {
        let key = this.reverseMap.get(obj);
        this.objectMap.delete(key);
        this.reverseMap.delete(obj);
    }
    get(key) {
        return this.objectMap.get(key);
    }
    put(key, value) {
        this.objectMap.set(key, value);
        this.reverseMap.set(value, key);
    }
    getKey(value) {
        return this.reverseMap.get(value);
    }
    containsKey(key) {
        return this.objectMap.has(key);
    }
    containsValue(value) {
        return this.reverseMap.has(value);
    }
    /* remove target freom the translator replacing it with source, maintaining the same key */
    swap(source, target) {
        let key = this.getKey(target);
        this.objectMap.set(key, source);
        this.reverseMap.delete(target);
        this.reverseMap.set(source, key);
    }
}

class ClassMap {
    constructor() {
        this.classmap = new Map();
    }
    registerPackage(pkg) {
        for (let aClass in pkg)
            this.registerClass(pkg[aClass]);
    }

    registerClass(aClass) {
        if (typeof aClass !== "function") throw new Error(`paramater 'class' of method 'registerClass' is '${typeof aClass.__getClass}', expected 'function'`);
        if (typeof aClass.__getClass !== "function") throw new Error(`in Class ${aClass.constructor.name} method __getClass of type ${typeof aClass.__getClass}`);
        this.classmap.set(aClass.__getClass(), aClass);
    }

    getClass(classname) {
        if (!this.classmap.has(classname)) throw new Error(`Class ${classname} not registered.`);
        return this.classmap.get(classname);
    }

    copyFrom(map) {
        for (let classname of map.keys()) {
            this.classmap.set(classname, map.get(classname));
        }
    }
}

class Translator extends ClassMap {
    constructor() {
        super();
        this.handlers = new Map();
        this.encodeListeners = new ArrayList();
        this.decodeListeners = new ArrayList();
        this.deferred = new ArrayList();
        this.objectMap = new BiMap();
        this.tempReferences = new ArrayList();
        this.nextKey = 0;
    }
    addDecodeListener(lst) {
        this.decodeListeners.add(lst);
    }
    addEncodeListener(lst) {
        this.encodeListeners.add(lst);
    }
    addReference(reference, object) {
        this.objectMap.put(reference, object);
    }
    addTempReference(reference, object) {
        this.objectMap.put(reference, object);
        this.tempReferences.add(reference);
    }
    allocNextKey() {
        return "C" + this.nextKey++;
    }
    clear() {
        this.objectMap.clear();
        this.tempReferences.clear();
    }
    clearTempReferences() {
        for (let ref of this.tempReferences) {
            this.removeByKey(ref);
        }
        this.tempReferences.clear();
    }
    decode(json) {
        if (json === null) throw new Error("JSON object is null.");
        if (typeof json === "undefined") throw new Error("JSON object is undefined.");
        if (typeof json === "string") json = JSON.parse(json);

        let rvalue = null;
        let eson = new EncodedJSON(json);
        new Decoder(eson, this, null).decode(r => {
            while (!this.deferred.isEmpty())
                this.deferred.remove(0).resume();
            this.clearTempReferences();
            rvalue = r;
        });
        return rvalue;
    }
    deferDecoding(decoder) {
        this.deferred.add(decoder);
    }
    encode(object) {
        let toJSON = new Encoder(object, this).encode();
        this.clearTempReferences();
        return toJSON;
    }
    getAllReferredObjects() {
        let values = this.objectMap.values();
        return new ArrayList(values);
    }
    getHandler(aClass) {
        return this.handlers.get(aClass.__getClass());
    }
    hasHandler(aClass) {
        return this.handlers.has(aClass.__getClass());
    }
    setHandler(aClass, handler) {
        this.handlers.set(aClass.__getClass(), handler);
    }
    getReference(object) {
        return this.objectMap.getKey(object);
    }
    getReferredObject(reference) {
        return this.objectMap.get(reference);
    }
    hasReference(reference) {
        return this.objectMap.containsKey(reference);
    }
    hasReferredObject(object) {
        return this.objectMap.containsValue(object);
    }
    notifyDecode(object) {
        for (let decodeListener of this.decodeListeners) {
            decodeListener(object);
        }
    }
    notifyEncode(object) {
        for (let encodeListener of this.encodeListeners) {
            encodeListener(object);
        }
    }
    removeByKey(key) {
        if (!this.objectMap.containsKey(key))
            return false;
        this.objectMap.removeByKey(key);
        return true;
    }
    removeByValue(obj) {
        if (!this.objectMap.containsValue(obj))
            return false;

        this.objectMap.remove(this.objectMap.getKey(obj));
        return true;
    }
}

module.exports = Translator;
},{"./Decoder":2,"./EncodedJSON":3,"./Encoder":4,"./java-equiv/ArrayList":19}],7:[function(require,module,exports){
const ClientMessageType = require("./ClientMessageType");
class ClientMessage {
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

if (typeof module !== "undefined") module.exports = ClientMessage;
},{"./ClientMessageType":8}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{"./JJJMessage":11,"./JJJMessageType":12}],10:[function(require,module,exports){
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
},{"./JJJMessage":11,"./JJJMessageType":12}],11:[function(require,module,exports){
const JJJMessageType = require("./JJJMessageType");
class JJJMessage {
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

if (typeof module !== "undefined") module.exports = JJJMessage;
},{"./JJJMessageType":12}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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
},{"./ClientMessage":7,"./ClientMessageType":8}],14:[function(require,module,exports){
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
},{"./JJJMessage":11,"./JJJMessageType":12}],15:[function(require,module,exports){
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
},{"./JJJMessage":11,"./JJJMessageType":12}],16:[function(require,module,exports){
const JJJMessage = require("./JJJMessage");
const JJJMessageType = require("./JJJMessageType");
class RejectedConnectionMessage {
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

if (typeof module !== "undefined") module.exports = RejectedConnectionMessage;
},{"./JJJMessage":11,"./JJJMessageType":12}],17:[function(require,module,exports){
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
},{"./JJJMessage":11,"./JJJMessageType":12}],18:[function(require,module,exports){
let package = {};
package.ServerSideExceptionMessage = require("./ServerSideExceptionMessage");
package.RejectedConnectionMessage = require("./RejectedConnectionMessage");
package.ReadyMessage = require("./ReadyMessage");
package.MethodResponse = require("./MethodResponse");
package.MethodRequest = require("./MethodRequest");
package.JJJMessageType = require("./JJJMessageType");
package.JJJMessage = require("./JJJMessage");
package.ForgetMessage = require("./ForgetMessage");
package.ClientRequestMessage = require("./ClientRequestMessage");
package.ClientMessageType = require("./ClientMessageType");
package.ClientMessage = require("./ClientMessage");

if (typeof module !== "undefined") module.exports = package;
},{"./ClientMessage":7,"./ClientMessageType":8,"./ClientRequestMessage":9,"./ForgetMessage":10,"./JJJMessage":11,"./JJJMessageType":12,"./MethodRequest":13,"./MethodResponse":14,"./ReadyMessage":15,"./RejectedConnectionMessage":16,"./ServerSideExceptionMessage":17}],19:[function(require,module,exports){
class ArrayList {
    constructor() {
        this.elementData = [];
    }
    static __isTransient() {
        return false;
    }
    static __getClass() {
        return "java.util.ArrayList";
    }
    static __isEnum() {
        return false;
    }
    addAll(c) {
        if (typeof c === "number") throw new Error("unsupported java to js operation");
        for (let e of c)
            this.add(e);
    }
    isEmpty() {
        return this.size() === 0;
    }
    removeAll(c) {
        for (let e of c) {
            this.remove(e);
        }
    }
    retainAll(c) {
        let newElementData = [];
        for (let e of c) {
            if (this.contains(e)) newElementData.add(e);
        }
        this.elementData = newElementData;
    }
    size() {
        return this.elementData.length;
    }
    clone() {
        let that = new ArrayList();
        for (let e of this) {
            that.add(e);
        }
        return that;
    }
    get(index) {
        return this.elementData[index];
    }
    set(index, element) {
        let old = this.elementData[index];
        this.elementData[index] = element;
        return old;
    }
    toArray(a = []) {
        for (let i = 0; i < this.elementData.length; i++)
            a[i] = this.elementData[i];
        return a;
    }
    iterator() {
        throw new Error("unsupported java to js operation");
    }
    subList(fromIndex, toIndex) {
        throw new Error("unsupported java to js operation");
    }
    listIterator() {
        throw new Error("unsupported java to js operation");
    }
    listIterator(index) {
        throw new Error("unsupported java to js operation");
    }
    add(index, element) {
        this.splice(index, 0, element);
    }
    add(e) {
        this.elementData.push(e);
        return true;
    }
    clear() {
        this.elementData = [];
    }
    contains(o) {
        return this.elementData.indexOf(o) !== -1;
    }
    indexOf(o) {
        return this.elementData.indexOf(o);
    }
    [Symbol.iterator] () {
        return this.elementData[Symbol.iterator]();
    }
    lastIndexOf(o) {
        return this.elementData.lastIndexOf(o);
    }
    remove(o) {
        if (typeof o === "number") return this.removeIndex(o);
        let index = this.indexOf(o);
        if (index === -1) return undefined;
        let r = this.elementData.splice(index, 1);
        return r[0];
    }
    removeRange(fromIndex, toIndex) {
        this.elementData.splice(fromIndex, toIndex - fromIndex);
    }
    removeIndex (index) {
        if (this.size >= index) throw new Error(`index '${index}' out of range`);
        if (this.size < 0) throw new Error(`index '${index}' out of range`);
        let r = this.elementData.splice(index, 1);
        return r[0];
    }
};

module.exports = ArrayList;
},{}],20:[function(require,module,exports){
class HashMap {
    constructor() {
        this.map = new Map();
    }
    static __isTransient() {
        return false;
    }
    static __getClass() {
        return "java.util.HashMap";
    }
    static __isEnum() {
        return false;
    }
    /**
     * Returns the number of key-value mappings in this map.
     *
     * @return the number of key-value mappings in this map
     */
    size() {
        return this.map.size;
    }
    /**
     * Returns <tt>true</tt> if this map contains no key-value mappings.
     *
     * @return <tt>true</tt> if this map contains no key-value mappings
     */
    isEmpty() {
        return this.map.size === 0;
    }
    /**
     * Returns the value to which the specified key is mapped,
     * or {@code null} if this map contains no mapping for the key.
     *
     * <p>More formally, if this map contains a mapping from a key
     * {@code k} to a value {@code v} such that {@code (key==null ? k==null :
     * key.equals(k))}, then this method returns {@code v}; otherwise
     * it returns {@code null}.  (There can be at most one such mapping.)
     *
     * <p>A return value of {@code null} does not <i>necessarily</i>
     * indicate that the map contains no mapping for the key; it's also
     * possible that the map explicitly maps the key to {@code null}.
     * The {@link #containsKey containsKey} operation may be used to
     * distinguish these two cases.
     *
     * @see #put(Object, Object)
     */
    get(key) {
        return this.map.get(key);
    }
    /**
     * Returns <tt>true</tt> if this map contains a mapping for the
     * specified key.
     *
     * @param   key   The key whose presence in this map is to be tested
     * @return <tt>true</tt> if this map contains a mapping for the specified
     * key.
     */
    containsKey(key) {
        return this.map.has(key);
    }
    /**
     * Associates the specified value with the specified key in this map.
     * If the map previously contained a mapping for the key, the old
     * value is replaced.
     *
     * @param key key with which the specified value is to be associated
     * @param value value to be associated with the specified key
     * @return the previous value associated with <tt>key</tt>, or
     *         <tt>null</tt> if there was no mapping for <tt>key</tt>.
     *         (A <tt>null</tt> return can also indicate that the map
     *         previously associated <tt>null</tt> with <tt>key</tt>.)
     */
    put(key, value) {
        let r = this.get(key);
        this.map.set(key, value);
        return r;
    }
    /**
     * Copies all of the mappings from the specified map to this map.
     * These mappings will replace any mappings that this map had for
     * any of the keys currently in the specified map.
     *
     * @param m mappings to be stored in this map
     * @throws NullPointerException if the specified map is null
     */
    putAll(that) {

    }
    /**
     * Removes the mapping for the specified key from this map if present.
     *
     * @param  key key whose mapping is to be removed from the map
     * @return the previous value associated with <tt>key</tt>, or
     *         <tt>null</tt> if there was no mapping for <tt>key</tt>.
     *         (A <tt>null</tt> return can also indicate that the map
     *         previously associated <tt>null</tt> with <tt>key</tt>.)
     */
    remove(key) {
        let r = this.get(key);
        this.map.delete(key);
        return r;
    }
    /**
     * Removes all of the mappings from this map.
     * The map will be empty after this call returns.
     */
    clear() {
        this.map.clear();
    }
    /**
     * Returns <tt>true</tt> if this map maps one or more keys to the
     * specified value.
     *
     * @param value value whose presence in this map is to be tested
     * @return <tt>true</tt> if this map maps one or more keys to the
     *         specified value
     */
    containsValue(value) {
        for (let v of this.map.values()) {
            if (v === value) return true;
        }
        return false;
    }
    /**
     * Returns a {@link Set} view of the keys contained in this map.
     * The set is backed by the map, so changes to the map are
     * reflected in the set, and vice-versa.  If the map is modified
     * while an iteration over the set is in progress (except through
     * the iterator's own <tt>remove</tt> operation), the results of
     * the iteration are undefined.  The set supports element removal,
     * which removes the corresponding mapping from the map, via the
     * <tt>Iterator.remove</tt>, <tt>Set.remove</tt>,
     * <tt>removeAll</tt>, <tt>retainAll</tt>, and <tt>clear</tt>
     * operations.  It does not support the <tt>add</tt> or <tt>addAll</tt>
     * operations.
     */
    keySet() {
        return this.map.keys();
    }
    /**
     * Returns a {@link Collection} view of the values contained in this map.
     * The collection is backed by the map, so changes to the map are
     * reflected in the collection, and vice-versa.  If the map is
     * modified while an iteration over the collection is in progress
     * (except through the iterator's own <tt>remove</tt> operation),
     * the results of the iteration are undefined.  The collection
     * supports element removal, which removes the corresponding
     * mapping from the map, via the <tt>Iterator.remove</tt>,
     * <tt>Collection.remove</tt>, <tt>removeAll</tt>,
     * <tt>retainAll</tt> and <tt>clear</tt> operations.  It does not
     * support the <tt>add</tt> or <tt>addAll</tt> operations.
     */
    values() {
        return this.map.values();
    }

    jjjDecode(resObj) {
        let keys = null;
        let values = null;

        let cb1 = function (r) {
            keys = r;
            resObj.decodeField("values", cb2);
        };

        let cb2 = function (r) {
            values = r;
            for (let i = 0; i < keys.length; i++) {
                this.put(keys[i], values[i]);
            }
        }.bind(this);

        resObj.decodeField("keys", cb1);
    }

    jjjEncode(encodedObject) {
        let keys = [];
        let values = [];

        this.map.forEach((value, key)=>{
            keys.push(key);
            values.push(value);
        });

        encodedObject.setField("keys", keys);
        encodedObject.setField("values", values);
    }
};

module.exports = HashMap;
},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyZC9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQ29uc3RhbnRzLmpzIiwic3JjL0RlY29kZXIuanMiLCJzcmMvRW5jb2RlZEpTT04uanMiLCJzcmMvRW5jb2Rlci5qcyIsInNyYy9KSkpSTUlTb2NrZXQuanMiLCJzcmMvVHJhbnNsYXRvci5qcyIsInNyYy9nZW4vQ2xpZW50TWVzc2FnZS5qcyIsInNyYy9nZW4vQ2xpZW50TWVzc2FnZVR5cGUuanMiLCJzcmMvZ2VuL0NsaWVudFJlcXVlc3RNZXNzYWdlLmpzIiwic3JjL2dlbi9Gb3JnZXRNZXNzYWdlLmpzIiwic3JjL2dlbi9KSkpNZXNzYWdlLmpzIiwic3JjL2dlbi9KSkpNZXNzYWdlVHlwZS5qcyIsInNyYy9nZW4vTWV0aG9kUmVxdWVzdC5qcyIsInNyYy9nZW4vTWV0aG9kUmVzcG9uc2UuanMiLCJzcmMvZ2VuL1JlYWR5TWVzc2FnZS5qcyIsInNyYy9nZW4vUmVqZWN0ZWRDb25uZWN0aW9uTWVzc2FnZS5qcyIsInNyYy9nZW4vU2VydmVyU2lkZUV4Y2VwdGlvbk1lc3NhZ2UuanMiLCJzcmMvZ2VuL3BhY2thZ2UuanMiLCJzcmMvamF2YS1lcXVpdi9BcnJheUxpc3QuanMiLCJzcmMvamF2YS1lcXVpdi9IYXNoTWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwiY2xhc3MgQ29uc3RhbnRzIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdH1cblx0c3RhdGljIF9faXNUcmFuc2llbnQoKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdHN0YXRpYyBfX2dldENsYXNzKCkge1xuXHRcdHJldHVybiBcImNhLmZhLmpqanJtaS50cmFuc2xhdG9yLkNvbnN0YW50c1wiO1xuXHR9XG5cdHN0YXRpYyBfX2lzRW51bSgpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbkNvbnN0YW50cy5LZXlQYXJhbSA9IFwia2V5XCI7XG5Db25zdGFudHMuRmxhZ1BhcmFtID0gXCJmbGFnc1wiO1xuQ29uc3RhbnRzLlR5cGVQYXJhbSA9IFwidHlwZVwiO1xuQ29uc3RhbnRzLlByaW1pdGl2ZVBhcmFtID0gXCJwcmltaXRpdmVcIjtcbkNvbnN0YW50cy5WYWx1ZVBhcmFtID0gXCJ2YWx1ZVwiO1xuQ29uc3RhbnRzLkZpZWxkc1BhcmFtID0gXCJmaWVsZHNcIjtcbkNvbnN0YW50cy5OYW1lUGFyYW0gPSBcIm5hbWVcIjtcbkNvbnN0YW50cy5FbGVtZW50c1BhcmFtID0gXCJlbGVtZW50c1wiO1xuQ29uc3RhbnRzLkRlcHRoUGFyYW0gPSBcImRlcHRoXCI7XG5Db25zdGFudHMuUG9pbnRlclBhcmFtID0gXCJwdHJcIjtcbkNvbnN0YW50cy5FbnVtUGFyYW0gPSBcImVudW1cIjtcbkNvbnN0YW50cy5DdXN0b21UeXBlID0gXCJAY3VzdG9tXCI7XG5Db25zdGFudHMuVHJhbnNpZW50VmFsdWUgPSBcInRyYW5zXCI7XG5Db25zdGFudHMuTnVsbFZhbHVlID0gXCJudWxsXCI7XG5Db25zdGFudHMuUHJpbWF0aXZlVHlwZVN0cmluZyA9IFwic3RyaW5nXCI7XG5Db25zdGFudHMuUHJpbWF0aXZlVHlwZU51bWJlciA9IFwibnVtYmVyXCI7XG5Db25zdGFudHMuUHJpbWF0aXZlVHlwZUJvb2xlYW4gPSBcImJvb2xlYW5cIjtcblxubW9kdWxlLmV4cG9ydHMgPSBDb25zdGFudHM7IiwibGV0IENvbnN0YW50cyA9IHJlcXVpcmUoXCIuL0NvbnN0YW50c1wiKTtcbmxldCBFbmNvZGVkSlNPTiA9IHJlcXVpcmUoXCIuL0VuY29kZWRKU09OXCIpO1xuXG5jbGFzcyBSZXN0b3JlZE9iamVjdCB7XG4gICAgY29uc3RydWN0b3IoanNvbiwgdHJhbnNsYXRvcikge1xuICAgICAgICB0aGlzLmpzb24gPSBqc29uO1xuICAgICAgICB0aGlzLnRyYW5zbGF0b3IgPSB0cmFuc2xhdG9yO1xuICAgICAgICB0aGlzLmZpZWxkcyA9IGpzb24uZ2V0KENvbnN0YW50cy5GaWVsZHNQYXJhbSk7XG4gICAgfVxuICAgIGRlY29kZSgpIHtcbiAgICAgICAgbGV0IGNsYXNzTmFtZSA9IHRoaXMuanNvbi5nZXQoQ29uc3RhbnRzLlR5cGVQYXJhbSk7XG4gICAgICAgIGxldCBhQ2xhc3MgPSB0aGlzLnRyYW5zbGF0b3IuZ2V0Q2xhc3MoY2xhc3NOYW1lKTtcblxuICAgICAgICBsZXQgbmV3SW5zdGFuY2UgPSBudWxsO1xuXG4gICAgICAgIC8qIGFyZWFkeSByZXN0b3JlZCwgcmV0cmlldmUgcmVzdG9yZWQgb2JqZWN0ICovO1xuICAgICAgICAvKiBpZiBoYW5kbGVyLCBjcmVhdGUgbmV3IG9iamVjdCB3aXRoIGhhbmRsZXIgKi87XG4gICAgICAgIC8qIGNyZWF0ZSBuZXcgb2JqZWN0IGZyb20gZGVzY3JpcHRpb24gKi87XG4gICAgICAgIGlmICh0aGlzLmpzb24uaGFzKENvbnN0YW50cy5LZXlQYXJhbSkgJiYgdGhpcy50cmFuc2xhdG9yLmhhc1JlZmVyZW5jZSh0aGlzLmpzb24uZ2V0KENvbnN0YW50cy5LZXlQYXJhbSkpKSB7XG4gICAgICAgICAgICBuZXdJbnN0YW5jZSA9IHRoaXMudHJhbnNsYXRvci5nZXRSZWZlcnJlZE9iamVjdCh0aGlzLmpzb24uZ2V0KENvbnN0YW50cy5LZXlQYXJhbSkpO1xuICAgICAgICAgICAgcmV0dXJuIG5ld0luc3RhbmNlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudHJhbnNsYXRvci5oYXNIYW5kbGVyKGFDbGFzcykpIHtcbiAgICAgICAgICAgIGxldCBoYW5kbGVyID0gdGhpcy50cmFuc2xhdG9yLmdldEhhbmRsZXIoYUNsYXNzKTtcbiAgICAgICAgICAgIG5ld0luc3RhbmNlID0gaGFuZGxlci5pbnN0YXRpYXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdJbnN0YW5jZSA9IG5ldyBhQ2xhc3MoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghYUNsYXNzLl9faXNUcmFuc2llbnQoKSkgdGhpcy50cmFuc2xhdG9yLmFkZFJlZmVyZW5jZSh0aGlzLmpzb24uZ2V0KENvbnN0YW50cy5LZXlQYXJhbSksIG5ld0luc3RhbmNlKTtcbiAgICAgICAgZWxzZSB0aGlzLnRyYW5zbGF0b3IuYWRkVGVtcFJlZmVyZW5jZSh0aGlzLmpzb24uZ2V0KENvbnN0YW50cy5LZXlQYXJhbSksIG5ld0luc3RhbmNlKTtcblxuICAgICAgICBpZiAodGhpcy50cmFuc2xhdG9yLmhhc0hhbmRsZXIoYUNsYXNzKSkge1xuICAgICAgICAgICAgbGV0IGhhbmRsZXIgPSB0aGlzLnRyYW5zbGF0b3IuZ2V0SGFuZGxlcihhQ2xhc3MpO1xuICAgICAgICAgICAgaGFuZGxlci5kZWNvZGUodGhpcywgbmV3SW5zdGFuY2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBuZXdJbnN0YW5jZS5qampEZWNvZGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgbmV3SW5zdGFuY2UuampqRGVjb2RlKHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgZmllbGQgaW4gdGhpcy5qc29uLmdldChDb25zdGFudHMuRmllbGRzUGFyYW0pKSB7XG4gICAgICAgICAgICAgICAgbmV3IERlY29kZXIobmV3IEVuY29kZWRKU09OKHRoaXMuanNvbi5nZXQoQ29uc3RhbnRzLkZpZWxkc1BhcmFtKVtmaWVsZF0pLCB0aGlzLnRyYW5zbGF0b3IpLmRlY29kZShyPT5uZXdJbnN0YW5jZVtmaWVsZF0gPSByKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudHJhbnNsYXRvci5ub3RpZnlEZWNvZGUobmV3SW5zdGFuY2UpO1xuICAgICAgICBpZiAodHlwZW9mIG5ld0luc3RhbmNlLmpqak9uRGVjb2RlID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAgICAgbmV3SW5zdGFuY2UuampqT25EZWNvZGUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3SW5zdGFuY2U7XG4gICAgfVxuICAgIGRlY29kZUZpZWxkKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgIG5ldyBEZWNvZGVyKG5ldyBFbmNvZGVkSlNPTih0aGlzLmZpZWxkc1tuYW1lXSksIHRoaXMudHJhbnNsYXRvcikuZGVjb2RlKHI9PmNhbGxiYWNrKHIpKTtcbiAgICB9XG4gICAgZ2V0SmF2YUZpZWxkKGFDbGFzcywgbmFtZSkge1xuICAgICAgICB3aGlsZSAoYUNsYXNzICE9PSBPYmplY3QuY2xhc3MpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGZpZWxkIG9mIGFDbGFzcy5nZXREZWNsYXJlZEZpZWxkcygpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpZWxkLmdldE5hbWUoKSA9PT0gbmFtZSkgcmV0dXJuIGZpZWxkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYUNsYXNzID0gYUNsYXNzLmdldFN1cGVyY2xhc3MoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZ2V0VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuanNvbi5nZXQoQ29uc3RhbnRzLlR5cGVQYXJhbSk7XG4gICAgfVxufVxuXG5jbGFzcyBSZXN0b3JlZEFycmF5IHtcbiAgICBjb25zdHJ1Y3Rvcihqc29uLCB0cmFuc2xhdG9yKSB7XG4gICAgICAgIHRoaXMuanNvbiA9IGpzb247XG4gICAgICAgIHRoaXMudHJhbnNsYXRvciA9IHRyYW5zbGF0b3I7XG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSBqc29uLmdldChDb25zdGFudHMuRWxlbWVudHNQYXJhbSk7XG4gICAgfVxuICAgIGRlY29kZSgpIHtcbiAgICAgICAgbGV0IG5ld0luc3RhbmNlID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuZWxlbWVudHNbaV07XG4gICAgICAgICAgICBuZXcgRGVjb2RlcihuZXcgRW5jb2RlZEpTT04oZWxlbWVudCksIHRoaXMudHJhbnNsYXRvcikuZGVjb2RlKHI9Pm5ld0luc3RhbmNlW2ldID0gcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3SW5zdGFuY2U7XG4gICAgfVxufVxuXG5jbGFzcyBEZWNvZGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihqc29uLCB0cmFuc2xhdG9yKSB7XG4gICAgICAgIHRoaXMuanNvbiA9IGpzb247XG4gICAgICAgIHRoaXMudHJhbnNsYXRvciA9IHRyYW5zbGF0b3I7XG4gICAgfVxuICAgIGRlY29kZShjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIC8qIHRoZSB2YWx1ZSBpcyBhIHByaW1hdGl2ZSwgY2hlY2sgZXhwZWN0ZWQgdHlwZSAqLztcbiAgICAgICAgLyogZXhwZWN0ZWQgdHlwZSBub3QgZm91bmQsIHJlZmVyIHRvIHByaW1pdGl2ZSB0eXBlICovO1xuICAgICAgICBpZiAodGhpcy5qc29uLmhhcyhDb25zdGFudHMuVHlwZVBhcmFtKSAmJiB0aGlzLmpzb24uZ2V0KENvbnN0YW50cy5UeXBlUGFyYW0pID09PSBDb25zdGFudHMuTnVsbFZhbHVlKSBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5qc29uLmhhcyhDb25zdGFudHMuUG9pbnRlclBhcmFtKSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnRyYW5zbGF0b3IuaGFzUmVmZXJlbmNlKHRoaXMuanNvbi5nZXQoQ29uc3RhbnRzLlBvaW50ZXJQYXJhbSkpKSB0aGlzLnRyYW5zbGF0b3IuZGVmZXJEZWNvZGluZyh0aGlzKTtcbiAgICAgICAgICAgIGxldCByZWZlcnJlZE9iamVjdCA9IHRoaXMudHJhbnNsYXRvci5nZXRSZWZlcnJlZE9iamVjdCh0aGlzLmpzb24uZ2V0KENvbnN0YW50cy5Qb2ludGVyUGFyYW0pKTtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlZmVycmVkT2JqZWN0KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmpzb24uaGFzKENvbnN0YW50cy5FbnVtUGFyYW0pKSB7XG4gICAgICAgICAgICBsZXQgY2xhc3NOYW1lID0gdGhpcy5qc29uLmdldChDb25zdGFudHMuRW51bVBhcmFtKTtcbiAgICAgICAgICAgIGxldCBmaWVsZE5hbWUgPSB0aGlzLmpzb24uZ2V0KENvbnN0YW50cy5WYWx1ZVBhcmFtKTtcbiAgICAgICAgICAgIGxldCBhQ2xhc3MgPSB0aGlzLnRyYW5zbGF0b3IuZ2V0Q2xhc3MoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBhQ2xhc3NbZmllbGROYW1lXTtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5qc29uLmhhcyhDb25zdGFudHMuVmFsdWVQYXJhbSkpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHRoaXMuanNvbi5nZXQoQ29uc3RhbnRzLlZhbHVlUGFyYW0pKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmpzb24uaGFzKENvbnN0YW50cy5FbGVtZW50c1BhcmFtKSkge1xuICAgICAgICAgICAgbGV0IGFycmF5ID0gbmV3IFJlc3RvcmVkQXJyYXkodGhpcy5qc29uLCB0aGlzLnRyYW5zbGF0b3IpLmRlY29kZSgpO1xuICAgICAgICAgICAgY2FsbGJhY2soYXJyYXkpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuanNvbi5oYXMoQ29uc3RhbnRzLkZpZWxkc1BhcmFtKSkge1xuICAgICAgICAgICAgbGV0IG9iamVjdCA9IG5ldyBSZXN0b3JlZE9iamVjdCh0aGlzLmpzb24sIHRoaXMudHJhbnNsYXRvcikuZGVjb2RlKCk7XG4gICAgICAgICAgICBjYWxsYmFjayhvYmplY3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5qc29uLnRvU3RyaW5nKDIpKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImphdmEubGFuZy5SdW50aW1lRXhjZXB0aW9uXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlc3VtZSgpIHtcbiAgICAgICAgdGhpcy5kZWNvZGUodGhpcy5jYWxsYmFjayk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlY29kZXI7IiwiY2xhc3MgRW5jb2RlZEpTT057XG4gICAgY29uc3RydWN0b3IoanNvbil7XG4gICAgICAgIGlmIChqc29uID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJKU09OIG9iamVjdCBpcyBudWxsLlwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBqc29uID09PSBcInVuZGVmaW5lZFwiKSB0aHJvdyBuZXcgRXJyb3IoXCJKU09OIG9iamVjdCBpcyB1bmRlZmluZWQuXCIpOyAgXG4gICAgICAgIHRoaXMuanNvbiA9IGpzb247XG4gICAgfVxuXG4gICAgaGFzKGtleSl7XG4gICAgICAgIHJldHVybiB0eXBlb2YgdGhpcy5qc29uW2tleV0gIT09IFwidW5kZWZpbmVkXCI7XG4gICAgfVxuXG4gICAgZ2V0KGtleSl7XG4gICAgICAgIHJldHVybiB0aGlzLmpzb25ba2V5XTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpe1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5qc29uLCBudWxsLCAyKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW5jb2RlZEpTT047IiwibGV0IENvbnN0YW50cyA9IHJlcXVpcmUoXCIuL0NvbnN0YW50c1wiKTtcblxuY2xhc3MgRW5jb2RlciB7XG4gICAgY29uc3RydWN0b3Iob2JqZWN0LCB0cmFuc2xhdG9yLCBrZXlzKSB7XG4gICAgICAgIGlmIChvYmplY3QgIT09IG51bGwgJiYgdHlwZW9mIG9iamVjdCA9PT0gXCJvYmplY3RcIiAmJiAhb2JqZWN0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0LmNvbnN0cnVjdG9yID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBPYmplY3QgbWlzc2luZyBjb25zdHJ1Y3Rvci5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0LmNvbnN0cnVjdG9yLl9faXNUcmFuc2llbnQgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2xhc3MgXCIke29iamVjdC5jb25zdHJ1Y3Rvci5uYW1lfVwiIG1pc3NpbmcgbWV0aG9kIFwiX19pc1RyYW5zaWVudFwiLmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmplY3QuY29uc3RydWN0b3IuX19pc0VudW0gIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2xhc3MgXCIke29iamVjdC5jb25zdHJ1Y3Rvci5uYW1lfVwiIG1pc3NpbmcgbWV0aG9kIFwiX19pc0VudW1cIi5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0LmNvbnN0cnVjdG9yLl9fZ2V0Q2xhc3MgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2xhc3MgXCIke29iamVjdC5jb25zdHJ1Y3Rvci5uYW1lfVwiIG1pc3NpbmcgbWV0aG9kIFwiX19nZXRDbGFzc1wiLmApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLm9iamVjdCA9IG9iamVjdDtcbiAgICAgICAgdGhpcy50cmFuc2xhdG9yID0gdHJhbnNsYXRvcjtcbiAgICAgICAgdGhpcy5rZXlzID0ga2V5cztcbiAgICB9XG4gICAgZW5jb2RlKCkge1xuICAgICAgICAvKiB1bmRlZmluZWQgJiBOVUxMIG9iamVjdHMgYXJlIHRyZWF0ZWQgYXMgTlVMTCAqL1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMub2JqZWN0ID09PSBcInVuZGVmaW5lZFwiIHx8IHRoaXMub2JqZWN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEVuY29kZWROdWxsKCkudG9KU09OKCk7XG4gICAgICAgIH1cbiAgICAgICAgLyogcHJpbWl0aXZlcyAqL1xuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdGhpcy5vYmplY3QgPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIHRoaXMub2JqZWN0ID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiB0aGlzLm9iamVjdCA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRW5jb2RlZFByaW1pdGl2ZSh0aGlzLm9iamVjdCkudG9KU09OKCk7XG4gICAgICAgIH1cbiAgICAgICAgLyogb2JqZWN0IGlzIHN0b3JlZCBmcm9tIHByZXZpb3VzIHRyYW5zYWN0aW9uICovXG4gICAgICAgIGVsc2UgaWYgKHRoaXMudHJhbnNsYXRvci5oYXNSZWZlcnJlZE9iamVjdCh0aGlzLm9iamVjdCkpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRW5jb2RlZFJlZmVyZW5jZSh0aGlzLnRyYW5zbGF0b3IuZ2V0UmVmZXJlbmNlKHRoaXMub2JqZWN0KSkudG9KU09OKCk7XG4gICAgICAgIH1cbiAgICAgICAgLyogaXMgYXJyYXkgKi9cbiAgICAgICAgZWxzZSBpZiAodGhpcy5vYmplY3QgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFbmNvZGVkQXJyYXkodGhpcy5vYmplY3QsIHRoaXMudHJhbnNsYXRvciwgdGhpcy5rZXlzKS50b0pTT04oKTtcbiAgICAgICAgfVxuICAgICAgICAvKiBzZXQgdG8gbnVsbCBza2lwcyBlbmNvZGluZyBhbGwgdG9nZXRoZXIgKi9cbiAgICAgICAgZWxzZSBpZiAodGhpcy5vYmplY3RbXCJqampFbmNvZGVcIl0gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9ICAgICAgICBcbiAgICAgICAgLyogaXMgRW51bSAqL1xuICAgICAgICBlbHNlIGlmICh0aGlzLm9iamVjdC5jb25zdHJ1Y3Rvci5fX2lzRW51bSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEVuY29kZWRFbnVtKHRoaXMub2JqZWN0LCB0aGlzLnRyYW5zbGF0b3IsIHRoaXMua2V5cykudG9KU09OKCk7XG4gICAgICAgIH1cbiAgICAgICAgLyogaGFuZGxlciBoYXMgYmVlbiByZWdpc3RlcmVkICovXG4gICAgICAgIGVsc2UgaWYgKHRoaXMudHJhbnNsYXRvci5oYXNIYW5kbGVyKHRoaXMub2JqZWN0LmNvbnN0cnVjdG9yKSkge1xuICAgICAgICAgICAgbGV0IGhhbmRsZXIgPSB0aGlzLnRyYW5zbGF0b3IuZ2V0SGFuZGxlcih0aGlzLm9iamVjdC5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICBsZXQgZW5jb2RlZE9iamVjdCA9IG5ldyBFbmNvZGVkT2JqZWN0KHRoaXMub2JqZWN0LCB0aGlzLnRyYW5zbGF0b3IsIHRoaXMua2V5cyk7XG4gICAgICAgICAgICBoYW5kbGVyLmVuY29kZShlbmNvZGVkT2JqZWN0LCB0aGlzLm9iamVjdCk7XG4gICAgICAgICAgICByZXR1cm4gZW5jb2RlZE9iamVjdC50b0pTT04oKTtcbiAgICAgICAgfVxuICAgICAgICAvKiBvYmplY3QgaGFuZGxlcyBpdCdzIHNlbGYgKi9cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHRoaXMub2JqZWN0W1wiampqRW5jb2RlXCJdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGxldCBlbmNvZGVkT2JqZWN0ID0gbmV3IEVuY29kZWRPYmplY3QodGhpcy5vYmplY3QsIHRoaXMudHJhbnNsYXRvciwgdGhpcy5rZXlzKTtcbiAgICAgICAgICAgIHRoaXMub2JqZWN0LmpqakVuY29kZShlbmNvZGVkT2JqZWN0KTtcbiAgICAgICAgICAgIHJldHVybiBlbmNvZGVkT2JqZWN0LnRvSlNPTigpO1xuICAgICAgICB9XG4gICAgICAgIC8qIGVuY29kZSBvYmplY3QgKi9cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgZW5jb2RlZE9iamVjdCA9IG5ldyBFbmNvZGVkT2JqZWN0KHRoaXMub2JqZWN0LCB0aGlzLnRyYW5zbGF0b3IsIHRoaXMua2V5cyk7XG4gICAgICAgICAgICBlbmNvZGVkT2JqZWN0LmVuY29kZSgpO1xuICAgICAgICAgICAgcmV0dXJuIGVuY29kZWRPYmplY3QudG9KU09OKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNsYXNzIEVuY29kZWROdWxsIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5qc29uID0ge307XG4gICAgICAgIHRoaXMuanNvbltDb25zdGFudHMuVHlwZVBhcmFtXSA9IENvbnN0YW50cy5OdWxsVmFsdWU7XG4gICAgfVxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuanNvbjtcbiAgICB9XG59XG5cbmNsYXNzIEVuY29kZWRQcmltaXRpdmUge1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuanNvbiA9IHt9O1xuICAgICAgICB0aGlzLmpzb25bQ29uc3RhbnRzLlByaW1pdGl2ZVBhcmFtXSA9IHR5cGVvZiB2YWx1ZTtcbiAgICAgICAgdGhpcy5qc29uW0NvbnN0YW50cy5WYWx1ZVBhcmFtXSA9IHZhbHVlO1xuICAgIH1cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmpzb247XG4gICAgfVxufVxuXG5jbGFzcyBFbmNvZGVkUmVmZXJlbmNlIHtcbiAgICBjb25zdHJ1Y3RvcihyZWYpIHtcbiAgICAgICAgdGhpcy5qc29uID0ge307XG4gICAgICAgIHRoaXMuanNvbltDb25zdGFudHMuUG9pbnRlclBhcmFtXSA9IHJlZjtcbiAgICB9XG4gICAgdG9KU09OKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5qc29uO1xuICAgIH1cbn1cblxuY2xhc3MgRW5jb2RlZEFycmF5IHtcbiAgICBjb25zdHJ1Y3RvcihvYmplY3QsIHRyYW5zbGF0b3IsIGtleXMpIHtcbiAgICAgICAgdGhpcy5qc29uID0ge307XG4gICAgICAgIHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuICAgICAgICB0aGlzLnRyYW5zbGF0b3IgPSB0cmFuc2xhdG9yO1xuICAgICAgICB0aGlzLmtleXMgPSBrZXlzO1xuICAgICAgICB0aGlzLmpzb25bQ29uc3RhbnRzLkVsZW1lbnRzUGFyYW1dID0gW107XG4gICAgICAgIHRoaXMuZW5jb2RlKCk7XG4gICAgfVxuICAgIGVuY29kZSgpIHtcbiAgICAgICAgdGhpcy5zZXRWYWx1ZXModGhpcy5qc29uW0NvbnN0YW50cy5FbGVtZW50c1BhcmFtXSwgdGhpcy5vYmplY3QpO1xuICAgIH1cbiAgICBzZXRWYWx1ZXMocGFyZW50LCBjdXJyZW50KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY3VycmVudC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBjdXJyZW50W2ldO1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gbmV3IEVuY29kZXIoZWxlbWVudCwgdGhpcy50cmFuc2xhdG9yLCB0aGlzLmtleXMpLmVuY29kZSgpO1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSBwYXJlbnQucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdG9KU09OKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5qc29uO1xuICAgIH1cbn1cblxuY2xhc3MgRW5jb2RlZEVudW0ge1xuICAgIGNvbnN0cnVjdG9yKG9iamVjdCwgdHJhbnNsYXRvciwga2V5cykge1xuICAgICAgICB0aGlzLmpzb24gPSB7fTtcbiAgICAgICAgdGhpcy5qc29uW0NvbnN0YW50cy5WYWx1ZVBhcmFtXSA9IG9iamVjdC50b1N0cmluZygpO1xuICAgICAgICB0aGlzLmpzb25bQ29uc3RhbnRzLkVudW1QYXJhbV0gPSBvYmplY3QuY29uc3RydWN0b3IuX19nZXRDbGFzcygpO1xuICAgIH1cblxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuanNvbjtcbiAgICB9XG59XG5cbmNsYXNzIEVuY29kZWRPYmplY3Qge1xuICAgIGNvbnN0cnVjdG9yKG9iamVjdCwgdHJhbnNsYXRvciwga2V5cykge1xuICAgICAgICB0aGlzLmpzb24gPSB7fTtcbiAgICAgICAgdGhpcy5vYmplY3QgPSBvYmplY3Q7XG4gICAgICAgIHRoaXMudHJhbnNsYXRvciA9IHRyYW5zbGF0b3I7XG4gICAgICAgIHRoaXMua2V5cyA9IGtleXM7XG5cbiAgICAgICAgdGhpcy5qc29uW0NvbnN0YW50cy5UeXBlUGFyYW1dID0gdGhpcy5vYmplY3QuY29uc3RydWN0b3IuX19nZXRDbGFzcygpO1xuICAgICAgICB0aGlzLmpzb25bQ29uc3RhbnRzLkZpZWxkc1BhcmFtXSA9IHt9O1xuXG4gICAgICAgIGxldCBrZXkgPSB0aGlzLnRyYW5zbGF0b3IuYWxsb2NOZXh0S2V5KCk7XG4gICAgICAgIHRoaXMuanNvbltDb25zdGFudHMuS2V5UGFyYW1dID0ga2V5O1xuXG4gICAgICAgIGlmICh0aGlzLm9iamVjdC5jb25zdHJ1Y3Rvci5fX2lzVHJhbnNpZW50KCkpIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNsYXRvci5hZGRUZW1wUmVmZXJlbmNlKGtleSwgdGhpcy5vYmplY3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50cmFuc2xhdG9yLmFkZFJlZmVyZW5jZShrZXksIHRoaXMub2JqZWN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0LmNvbnN0cnVjdG9yLl9faXNUcmFuc2llbnQgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgd2luZG93Lm9iamVjdCA9IG9iamVjdDtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmllbGQgJ19faXNUcmFuc2llbnQnIG9mIGNsYXNzICcke29iamVjdC5jb25zdHJ1Y3Rvci5uYW1lfScgaXMgbm90IG9mIHR5cGUgZnVuY3Rpb24sIGZvdW5kIHR5cGUgJyR7dHlwZW9mIG9iamVjdC5jb25zdHJ1Y3Rvci5fX2lzVHJhbnNpZW50fScuYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlbmNvZGUoKSB7XG4gICAgICAgIGZvciAobGV0IGZpZWxkIGluIHRoaXMub2JqZWN0KSB7XG4gICAgICAgICAgICB0aGlzLnNldEZpZWxkKGZpZWxkLCB0aGlzLm9iamVjdFtmaWVsZF0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmpzb247XG4gICAgfVxuXG4gICAgc2V0RmllbGQobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgbGV0IGVuY29kZWRWYWx1ZSA9IG5ldyBFbmNvZGVyKHZhbHVlLCB0aGlzLnRyYW5zbGF0b3IsIHRoaXMua2V5cykuZW5jb2RlKCk7XG4gICAgICAgIGlmIChlbmNvZGVkVmFsdWUgIT09IG51bGwpIHRoaXMuanNvbltDb25zdGFudHMuRmllbGRzUGFyYW1dW25hbWVdID0gZW5jb2RlZFZhbHVlO1xuICAgIH1cblxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuanNvbjtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW5jb2RlcjsiLCJsZXQgVHJhbnNsYXRvciA9IHJlcXVpcmUoXCIuL1RyYW5zbGF0b3JcIik7XG5sZXQgampqcm1pID0gcmVxdWlyZShcIi4vZ2VuL3BhY2thZ2VcIik7XG5sZXQgQXJyYXlMaXN0ID0gcmVxdWlyZShcIi4vamF2YS1lcXVpdi9BcnJheUxpc3RcIik7XG5sZXQgSGFzaE1hcCA9IHJlcXVpcmUoXCIuL2phdmEtZXF1aXYvSGFzaE1hcFwiKTtcblxuY2xhc3MgSkpKUk1JU29ja2V0IHtcbiAgICBjb25zdHJ1Y3Rvcihzb2NrZXROYW1lKSB7XG4gICAgICAgIHRoaXMuampqU29ja2V0TmFtZSA9IHNvY2tldE5hbWU7XG4gICAgICAgIHRoaXMudHJhbnNsYXRvciA9IG5ldyBUcmFuc2xhdG9yKCk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSB7fTtcbiAgICAgICAgdGhpcy5mbGFncyA9IE9iamVjdC5hc3NpZ24oSkpKUk1JU29ja2V0LmZsYWdzKTtcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLnRyYW5zbGF0b3IuY29weUZyb20oSkpKUk1JU29ja2V0LmNsYXNzZXMpO1xuXG4gICAgICAgIHRoaXMudHJhbnNsYXRvci5hZGREZWNvZGVMaXN0ZW5lcihvYmo9Pm9iai5fX2pqaldlYnNvY2tldCA9IHRoaXMpO1xuICAgICAgICB0aGlzLnRyYW5zbGF0b3IuYWRkRW5jb2RlTGlzdGVuZXIob2JqPT5vYmouX19qampXZWJzb2NrZXQgPSB0aGlzKTtcbiAgICAgICAgdGhpcy5qampFbmNvZGUgPSBudWxsO1xuICAgIH1cblxuXHRnZXRIYW5kbGVyKGFDbGFzcykge1xuXHRcdHJldHVybiB0aGlzLnRyYW5zbGF0b3IuZ2V0SGFuZGxlcihhQ2xhc3MpO1xuXHR9XG5cdGhhc0hhbmRsZXIoYUNsYXNzKSB7XG5cdFx0cmV0dXJuIHRoaXMudHJhbnNsYXRvci5oYXNIYW5kbGVyKGFDbGFzcyk7XG5cdH1cblx0c2V0SGFuZGxlcihhQ2xhc3MsIGhhbmRsZXIpIHtcblx0XHR0aGlzLnRyYW5zbGF0b3Iuc2V0SGFuZGxlcihhQ2xhc3MsIGhhbmRsZXIpO1xuXHR9XG5cbiAgICBhc3luYyBjb25uZWN0KHVybCkge1xuICAgICAgICBpZiAodGhpcy5mbGFncy5DT05ORUNUKSBjb25zb2xlLmxvZyhgJHt0aGlzLmpqalNvY2tldE5hbWV9IGNvbm5lY3RpbmdgKTtcbiAgICAgICAgaWYgKCF1cmwpIHVybCA9IHRoaXMuZ2V0QWRkcmVzcygpO1xuXG4gICAgICAgIGxldCBjYiA9IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldCh1cmwpO1xuICAgICAgICAgICAgdGhpcy5vbnJlYWR5ID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIHRoaXMub25yZWplY3QgPSByZWplY3Q7XG4gICAgICAgICAgICB0aGlzLnNvY2tldC5vbmVycm9yID0gKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJ3ZWJzb2NrZXQgZXJyb3JcIik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuc29ja2V0Lm9ubWVzc2FnZSA9IChldnQpID0+IHRoaXMub25NZXNzYWdlKGV2dCk7XG4gICAgICAgICAgICB0aGlzLm5leHRVSUQgPSAwO1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFjayA9IHt9O1xuICAgICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGNiKTtcbiAgICB9XG5cbiAgICBnZXRBZGRyZXNzKCl7XG4gICAgICAgIGxldCBwcmVxdWVsID0gXCJ3czovL1wiO1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLnByb3RvY29sID09PSBcImh0dHBzOlwiKSBwcmVxdWVsID0gXCJ3c3M6Ly9cIjtcbiAgICAgICAgbGV0IHBhdGhuYW1lID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cigxKTtcbiAgICAgICAgcGF0aG5hbWUgPSBwYXRobmFtZS5zdWJzdHIoMCwgcGF0aG5hbWUuaW5kZXhPZihcIi9cIikpO1xuICAgICAgICByZXR1cm4gYCR7cHJlcXVlbH0ke3dpbmRvdy5sb2NhdGlvbi5ob3N0fS8ke3BhdGhuYW1lfS8ke3RoaXMuampqU29ja2V0TmFtZX1gO1xuICAgIH1cblxuICAgIHJlc2V0KCl7XG4gICAgICAgIHRoaXMudHJhbnNsYXRvci5jbGVhcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgYSBtZXRob2QgcmVxdWVzdCB0byB0aGUgc2VydmVyLlxuICAgICAqIGNhbGxiYWNrcy5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHNyY1xuICAgICAqIEBwYXJhbSB7dHlwZX0gbWV0aG9kTmFtZVxuICAgICAqIEBwYXJhbSB7dHlwZX0gYXJnc1xuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgbWV0aG9kUmVxdWVzdChzcmMsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICAgICAgaWYgKCF0aGlzLnRyYW5zbGF0b3IuaGFzUmVmZXJyZWRPYmplY3Qoc3JjKSl7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJzZWUgd2luZG93LmRlYnVnIGZvciBzb3VyY2VcIik7XG4gICAgICAgICAgICB3aW5kb3cuZGVidWcgPSBzcmM7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEF0dGVtcHRpbmcgdG8gY2FsbCBzZXJ2ZXIgc2lkZSBtZXRob2Qgb24gbm9uLXJlY2VpdmVkIG9iamVjdDogJHtzcmMuY29uc3RydWN0b3IubmFtZX0uJHttZXRob2ROYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIGxldCB1aWQgPSB0aGlzLm5leHRVSUQrKztcbiAgICAgICAgbGV0IHB0ciA9IHRoaXMudHJhbnNsYXRvci5nZXRSZWZlcmVuY2Uoc3JjKTtcblxuICAgICAgICBsZXQgYXJnc0FycmF5ID0gW107XG4gICAgICAgIGZvciAobGV0IGkgaW4gYXJncykgYXJnc0FycmF5LnB1c2goYXJnc1tpXSk7XG5cbiAgICAgICAgbGV0IGYgPSBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrW3VpZF0gPSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZTogcmVzb2x2ZSxcbiAgICAgICAgICAgICAgICByZWplY3Q6IHJlamVjdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxldCBwYWNrZXQgPSBuZXcgTWV0aG9kUmVxdWVzdCh1aWQsIHB0ciwgbWV0aG9kTmFtZSwgYXJnc0FycmF5KTtcbiAgICAgICAgICAgIGxldCBlbmNvZGVkUGFja2V0ID0gdGhpcy50cmFuc2xhdG9yLmVuY29kZShwYWNrZXQpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZmxhZ3MuU0VOVCkgY29uc29sZS5sb2coZW5jb2RlZFBhY2tldCk7XG4gICAgICAgICAgICBsZXQgZW5jb2RlZFN0cmluZyA9IEpTT04uc3RyaW5naWZ5KGVuY29kZWRQYWNrZXQsIG51bGwsIDQpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZmxhZ3MuU0VOVCAmJiB0aGlzLmZsYWdzLlZFUkJPU0UpIGNvbnNvbGUubG9nKGVuY29kZWRTdHJpbmcpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zb2NrZXQgIT09IG51bGwpIHRoaXMuc29ja2V0LnNlbmQoZW5jb2RlZFN0cmluZyk7XG4gICAgICAgICAgICBlbHNlIGNvbnNvbGUud2FybihgU29ja2V0IFwiJHt0aGlzLnNvY2tldE5hbWV9XCIgbm90IGNvbm5lY3RlZC5gKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWxsIHJlY2VpdmVkIG1lc3NhZ2VzIGFyZSBwYXJzZWQgYnkgdGhpcyBtZXRob2QuICBBbGwgbWVzc2FnZXMgbXVzdCBvZiB0aGUgamF2YSB0eXBlICdSTUlSZXNwb25zZScgd2hpY2ggd2lsbFxuICAgICAqIGFsd2F5cyBjb250YWluIHRoZSBmaWVsZCAndHlwZTpSTUlSZXNwb25zZVR5cGUnLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZXZ0XG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2UoZXZ0KSB7XG4gICAgICAgIGlmICh0aGlzLmZsYWdzLlJFQ0VJVkVEICYmIHRoaXMuZmxhZ3MuVkVSQk9TRSl7XG4gICAgICAgICAgICBsZXQganNvbiA9IEpTT04ucGFyc2UoZXZ0LmRhdGEpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoanNvbiwgbnVsbCwgMikpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBybWlNZXNzYWdlID0gdGhpcy50cmFuc2xhdG9yLmRlY29kZShldnQuZGF0YSk7XG4gICAgICAgIGlmICh0aGlzLmZsYWdzLlJFQ0VJVkVEKSBjb25zb2xlLmxvZyhybWlNZXNzYWdlKTtcblxuICAgICAgICBzd2l0Y2ggKHJtaU1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBqampybWkuSkpKTWVzc2FnZVR5cGUuRk9SR0VUOntcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mbGFncy5PTk1FU1NBR0UpIGNvbnNvbGUubG9nKHRoaXMuampqU29ja2V0TmFtZSArIFwiIEZPUkdFVFwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0b3IucmVtb3ZlQnlLZXkocm1pTWVzc2FnZS5rZXkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBqampybWkuSkpKTWVzc2FnZVR5cGUuUkVBRFk6e1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZsYWdzLkNPTk5FQ1QgfHwgdGhpcy5mbGFncy5PTk1FU1NBR0UpIGNvbnNvbGUubG9nKHRoaXMuampqU29ja2V0TmFtZSArIFwiIFJFQURZXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMub25yZWFkeShybWlNZXNzYWdlLmdldFJvb3QoKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBjbGllbnQgb3JpZ2luYXRlZCByZXF1ZXN0ICovXG4gICAgICAgICAgICBjYXNlIGpqanJtaS5KSkpNZXNzYWdlVHlwZS5MT0NBTDp7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmxhZ3MuT05NRVNTQUdFKSBjb25zb2xlLmxvZyhgUmVzcG9uc2UgdG8gY2xpZW50IHNpZGUgcmVxdWVzdDogJHt0aGlzLmpqalNvY2tldE5hbWV9ICR7cm1pTWVzc2FnZS5tZXRob2ROYW1lfWApO1xuICAgICAgICAgICAgICAgIGxldCBjYWxsYmFjayA9IHRoaXMuY2FsbGJhY2tbcm1pTWVzc2FnZS51aWRdO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSh0aGlzLmNhbGxiYWNrW3JtaU1lc3NhZ2UudWlkXSk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sucmVzb2x2ZShybWlNZXNzYWdlLnJ2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBzZXJ2ZXIgb3JpZ2luYXRlZCByZXF1ZXN0ICovXG4gICAgICAgICAgICBjYXNlIGpqanJtaS5KSkpNZXNzYWdlVHlwZS5SRU1PVEU6e1xuICAgICAgICAgICAgaWYgKHRoaXMuZmxhZ3MuT05NRVNTQUdFKSBjb25zb2xlLmxvZyhgU2VydmVyIHNpZGUgb3JpZ2luYXRlZCByZXF1ZXN0OiAke3RoaXMuampqU29ja2V0TmFtZX0gJHtybWlNZXNzYWdlLm1ldGhvZE5hbWV9YCk7XG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9IHRoaXMudHJhbnNsYXRvci5nZXRSZWZlcnJlZE9iamVjdChybWlNZXNzYWdlLnB0cik7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdGVNZXRob2RDYWxsYmFjayh0YXJnZXQsIHJtaU1lc3NhZ2UubWV0aG9kTmFtZSwgcm1pTWVzc2FnZS5hcmdzKTtcbi8vICAgICAgICAgICAgICAgIGxldCByZXNwb25zZSA9IG5ldyBJbnZvY2F0aW9uUmVzcG9uc2Uocm1pTWVzc2FnZS51aWQsIEludm9jYXRpb25SZXNwb25zZUNvZGUuU1VDQ0VTUyk7XG4vLyAgICAgICAgICAgICAgICBsZXQgZW5jb2RlZFJlc3BvbnNlID0gdGhpcy50cmFuc2xhdG9yLmVuY29kZShyZXNwb25zZSk7XG4vLyAgICAgICAgICAgICAgICBsZXQgZW5jb2RlZFN0cmluZyA9IEpTT04uc3RyaW5naWZ5KGVuY29kZWRSZXNwb25zZSwgbnVsbCwgNCk7XG4vL1xuLy8gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmxhZ3MuT05NRVNTQUdFKSBjb25zb2xlLmxvZyhgU2VydmVyIHNpZGUgcmVxdWVzdDogJHt0aGlzLmpqalNvY2tldE5hbWV9ICR7dGFyZ2V0LmNvbnN0cnVjdG9yLm5hbWV9LiR7cm1pTWVzc2FnZS5tZXRob2ROYW1lfWApO1xuLy8gICAgICAgICAgICAgICAgaWYgKHNvY2tldCAhPT0gbnVsbCkgdGhpcy5zb2NrZXQuc2VuZChlbmNvZGVkU3RyaW5nKTtcbi8vICAgICAgICAgICAgICAgIGVsc2UgY29uc29sZS53YXJuKGBTb2NrZXQgXCIke3RoaXMuc29ja2V0TmFtZX1cIiBub3QgY29ubmVjdGVkLmApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBqampybWkuSkpKTWVzc2FnZVR5cGUuRVhDRVBUSU9OOntcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZmxhZ3MuU0lMRU5UKSBjb25zb2xlLmxvZyh0aGlzLmpqalNvY2tldE5hbWUgKyBcIiBFWENFUFRJT04gXCIgKyBybWlNZXNzYWdlLm1ldGhvZE5hbWUpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5mbGFncy5TSUxFTlQpIGNvbnNvbGUud2FybihybWlNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBsZXQgY2FsbGJhY2sgPSB0aGlzLmNhbGxiYWNrW3JtaU1lc3NhZ2UudWlkXTtcbiAgICAgICAgICAgICAgICBkZWxldGUodGhpcy5jYWxsYmFja1tybWlNZXNzYWdlLnVpZF0pO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLnJlamVjdChybWlNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2Ugampqcm1pLkpKSk1lc3NhZ2VUeXBlLlJFSkVDVEVEX0NPTk5FQ1RJT046e1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZsYWdzLkNPTk5FQ1QgfHwgdGhpcy5mbGFncy5PTk1FU1NBR0UpIGNvbnNvbGUubG9nKHRoaXMuampqU29ja2V0TmFtZSArIFwiIFJFSkVDVEVEX0NPTk5FQ1RJT05cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5vbnJlamVjdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyBhIHNlcnZlciBvcmlnaW5hdGVkIHJlcXVlc3QuICBXaWxsIHRocm93IGEgd2FybmluZyBpZiB0aGUgY2xpZW50IGRvZXMgbm90IGhhdmUgYSBtZXRob2QgdG8gaGFuZGxlIHRoZVxuICAgICAqIHJlcXVlc3QuXG4gICAgICogQHBhcmFtIHt0eXBlfSB0YXJnZXRcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1ldGhvZE5hbWVcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGFyZ3NcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHJlbW90ZU1ldGhvZENhbGxiYWNrKHRhcmdldCwgbWV0aG9kTmFtZSwgYXJncykge1xuICAgICAgICBpZiAodHlwZW9mIHRhcmdldFttZXRob2ROYW1lXSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBpZiAoIUpKSlJNSVNvY2tldC5zaWxlbnQpIGNvbnNvbGUud2Fybih0aGlzLnNvY2tldC51cmwgKyBcIjpcIiArIHRhcmdldC5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgZG9lcyBub3QgaGF2ZSByZW1vdGVseSBpbnZva2FibGUgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFttZXRob2ROYW1lXS5hcHBseSh0YXJnZXQsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuSkpKUk1JU29ja2V0LmZsYWdzID0ge1xuICAgICAgICBTSUxFTlQ6IGZhbHNlLCAvKiBkbyBub3QgcHJpbnQgZXhjZXB0aW9ucyB0byBjb25zb2xlICovXG4gICAgICAgIENPTk5FQ1Q6IGZhbHNlLCAvKiBzaG93IHRoZSBzdWJzZXQgb2YgT05NRVNTQUdFIHRoYXQgZGVhbHMgd2l0aCB0aGUgaW5pdGlhbCBjb25uZWN0aW9uICovXG4gICAgICAgIE9OTUVTU0FHRTogZmFsc2UsIC8qIGRlc2NyaWJlIHRoZSBhY3Rpb24gdGFrZW4gd2hlbiBhIG1lc3NhZ2UgaXMgcmVjZWl2ZWQgKi9cbiAgICAgICAgU0VOVDogZmFsc2UsIC8qIHNob3cgdGhlIHNlbmQgb2JqZWN0LCB2ZXJzYm9zZSBzaG93cyB0aGUganNvbiB0ZXh0IGFzIHdlbGwgKi9cbiAgICAgICAgUkVDRUlWRUQ6IGZhbHNlLCAvKiBzaG93IHRoZSByZWNlaXZlZCBzZXJ2ZXIgb2JqZWN0LCB2ZXJib3NlIHNob3dzIHRoZSBqc29uIHRleHQgYXMgd2VsbCAqL1xuICAgICAgICBWRVJCT1NFOiBmYWxzZSxcbiAgICAgICAgT05SRUdJU1RFUjogZmFsc2UgLyogcmVwb3J0IGNsYXNzZXMgYXMgdGhleSBhcmUgcmVnaXN0ZXJlZCAqL1xufTtcblxuSkpKUk1JU29ja2V0LmNsYXNzZXMgPSBuZXcgTWFwKCk7XG5cbkpKSlJNSVNvY2tldC5yZWdpc3RlckNsYXNzID0gZnVuY3Rpb24oYUNsYXNzKXtcbiAgICBpZiAodHlwZW9mIGFDbGFzcyAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoYHBhcmFtYXRlciAnY2xhc3MnIG9mIG1ldGhvZCAncmVnaXN0ZXJDbGFzcycgaXMgJyR7dHlwZW9mIGFDbGFzcy5fX2dldENsYXNzfScsIGV4cGVjdGVkICdmdW5jdGlvbidgKTtcbiAgICBpZiAodHlwZW9mIGFDbGFzcy5fX2dldENsYXNzICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihgaW4gQ2xhc3MgJHthQ2xhc3MuY29uc3RydWN0b3IubmFtZX0gbWV0aG9kIF9fZ2V0Q2xhc3Mgb2YgdHlwZSAke3R5cGVvZiBhQ2xhc3MuX19nZXRDbGFzc31gKTtcbiAgICBpZiAoSkpKUk1JU29ja2V0LmZsYWdzLk9OUkVHSVNURVIpIGNvbnNvbGUubG9nKGBSZWdpc3RlciAke2FDbGFzcy5fX2dldENsYXNzKCl9YCk7XG4gICAgSkpKUk1JU29ja2V0LmNsYXNzZXMuc2V0KGFDbGFzcy5fX2dldENsYXNzKCksIGFDbGFzcyk7XG59O1xuXG4vKiBmb3IgcmVnaXN0ZXJpbmcgYWxsIGNsYXNzZXMgcmV0dXJuZWQgZnJvbSBnZW5lcmF0ZWQgSlMgKi9cbkpKSlJNSVNvY2tldC5yZWdpc3RlclBhY2thZ2UgPSBmdW5jdGlvbihwYWNrYWdlKXtcbiAgICBmb3IgKGxldCBhQ2xhc3MgaW4gcGFja2FnZSkgSkpKUk1JU29ja2V0LnJlZ2lzdGVyQ2xhc3MocGFja2FnZVthQ2xhc3NdKTtcbn07XG5cbi8qIHJlZ2lzdGVyIHRoZSBjbGFzc2VzIHJlcXVpcmVkIGZvciBKSkpSTUlTb2NrZXQgKi9cbkpKSlJNSVNvY2tldC5yZWdpc3RlclBhY2thZ2Uoampqcm1pKTtcbkpKSlJNSVNvY2tldC5yZWdpc3RlckNsYXNzKEFycmF5TGlzdCk7XG5KSkpSTUlTb2NrZXQucmVnaXN0ZXJDbGFzcyhIYXNoTWFwKTtcblxuampqcm1pc29ja2V0ID0ge307XG5qampybWlzb2NrZXQuSkpKUk1JU29ja2V0ID0gSkpKUk1JU29ja2V0O1xuampqcm1pc29ja2V0LlRyYW5zbGF0b3IgPSBUcmFuc2xhdG9yO1xuampqcm1pc29ja2V0LkFycmF5TGlzdCA9IEFycmF5TGlzdDtcbmpqanJtaXNvY2tldC5IYXNoTWFwID0gSGFzaE1hcDtcbm1vZHVsZS5leHBvcnRzID0gampqcm1pc29ja2V0OyIsImxldCBFbmNvZGVyID0gcmVxdWlyZShcIi4vRW5jb2RlclwiKTtcbmxldCBEZWNvZGVyID0gcmVxdWlyZShcIi4vRGVjb2RlclwiKTtcbmxldCBBcnJheUxpc3QgPSByZXF1aXJlKFwiLi9qYXZhLWVxdWl2L0FycmF5TGlzdFwiKTtcbmxldCBFbmNvZGVkSlNPTiA9IHJlcXVpcmUoXCIuL0VuY29kZWRKU09OXCIpO1xuXG5jbGFzcyBCaU1hcCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMub2JqZWN0TWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLnJldmVyc2VNYXAgPSBuZXcgTWFwKCk7XG4gICAgfVxuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLm9iamVjdE1hcC5jbGVhcigpO1xuICAgICAgICB0aGlzLnJldmVyc2VNYXAuY2xlYXIoKTtcbiAgICB9XG4gICAga2V5cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub2JqZWN0TWFwLmtleXMoKTtcbiAgICB9XG4gICAgcmVtb3ZlQnlLZXkoa2V5KSB7XG4gICAgICAgIGxldCBvYmogPSB0aGlzLm9iamVjdE1hcC5nZXQoa2V5KTtcbiAgICAgICAgdGhpcy5vYmplY3RNYXAuZGVsZXRlKGtleSk7XG4gICAgICAgIHRoaXMucmV2ZXJzZU1hcC5kZWxldGUob2JqKTtcbiAgICB9XG4gICAgcmVtb3ZlQnlWYWx1ZShvYmopIHtcbiAgICAgICAgbGV0IGtleSA9IHRoaXMucmV2ZXJzZU1hcC5nZXQob2JqKTtcbiAgICAgICAgdGhpcy5vYmplY3RNYXAuZGVsZXRlKGtleSk7XG4gICAgICAgIHRoaXMucmV2ZXJzZU1hcC5kZWxldGUob2JqKTtcbiAgICB9XG4gICAgZ2V0KGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5vYmplY3RNYXAuZ2V0KGtleSk7XG4gICAgfVxuICAgIHB1dChrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMub2JqZWN0TWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgdGhpcy5yZXZlcnNlTWFwLnNldCh2YWx1ZSwga2V5KTtcbiAgICB9XG4gICAgZ2V0S2V5KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJldmVyc2VNYXAuZ2V0KHZhbHVlKTtcbiAgICB9XG4gICAgY29udGFpbnNLZXkoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9iamVjdE1hcC5oYXMoa2V5KTtcbiAgICB9XG4gICAgY29udGFpbnNWYWx1ZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXZlcnNlTWFwLmhhcyh2YWx1ZSk7XG4gICAgfVxuICAgIC8qIHJlbW92ZSB0YXJnZXQgZnJlb20gdGhlIHRyYW5zbGF0b3IgcmVwbGFjaW5nIGl0IHdpdGggc291cmNlLCBtYWludGFpbmluZyB0aGUgc2FtZSBrZXkgKi9cbiAgICBzd2FwKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICAgIGxldCBrZXkgPSB0aGlzLmdldEtleSh0YXJnZXQpO1xuICAgICAgICB0aGlzLm9iamVjdE1hcC5zZXQoa2V5LCBzb3VyY2UpO1xuICAgICAgICB0aGlzLnJldmVyc2VNYXAuZGVsZXRlKHRhcmdldCk7XG4gICAgICAgIHRoaXMucmV2ZXJzZU1hcC5zZXQoc291cmNlLCBrZXkpO1xuICAgIH1cbn1cblxuY2xhc3MgQ2xhc3NNYXAge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNsYXNzbWFwID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgICByZWdpc3RlclBhY2thZ2UocGtnKSB7XG4gICAgICAgIGZvciAobGV0IGFDbGFzcyBpbiBwa2cpXG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyQ2xhc3MocGtnW2FDbGFzc10pO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyQ2xhc3MoYUNsYXNzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYUNsYXNzICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihgcGFyYW1hdGVyICdjbGFzcycgb2YgbWV0aG9kICdyZWdpc3RlckNsYXNzJyBpcyAnJHt0eXBlb2YgYUNsYXNzLl9fZ2V0Q2xhc3N9JywgZXhwZWN0ZWQgJ2Z1bmN0aW9uJ2ApO1xuICAgICAgICBpZiAodHlwZW9mIGFDbGFzcy5fX2dldENsYXNzICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihgaW4gQ2xhc3MgJHthQ2xhc3MuY29uc3RydWN0b3IubmFtZX0gbWV0aG9kIF9fZ2V0Q2xhc3Mgb2YgdHlwZSAke3R5cGVvZiBhQ2xhc3MuX19nZXRDbGFzc31gKTtcbiAgICAgICAgdGhpcy5jbGFzc21hcC5zZXQoYUNsYXNzLl9fZ2V0Q2xhc3MoKSwgYUNsYXNzKTtcbiAgICB9XG5cbiAgICBnZXRDbGFzcyhjbGFzc25hbWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNsYXNzbWFwLmhhcyhjbGFzc25hbWUpKSB0aHJvdyBuZXcgRXJyb3IoYENsYXNzICR7Y2xhc3NuYW1lfSBub3QgcmVnaXN0ZXJlZC5gKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xhc3NtYXAuZ2V0KGNsYXNzbmFtZSk7XG4gICAgfVxuXG4gICAgY29weUZyb20obWFwKSB7XG4gICAgICAgIGZvciAobGV0IGNsYXNzbmFtZSBvZiBtYXAua2V5cygpKSB7XG4gICAgICAgICAgICB0aGlzLmNsYXNzbWFwLnNldChjbGFzc25hbWUsIG1hcC5nZXQoY2xhc3NuYW1lKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNsYXNzIFRyYW5zbGF0b3IgZXh0ZW5kcyBDbGFzc01hcCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuaGFuZGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuZW5jb2RlTGlzdGVuZXJzID0gbmV3IEFycmF5TGlzdCgpO1xuICAgICAgICB0aGlzLmRlY29kZUxpc3RlbmVycyA9IG5ldyBBcnJheUxpc3QoKTtcbiAgICAgICAgdGhpcy5kZWZlcnJlZCA9IG5ldyBBcnJheUxpc3QoKTtcbiAgICAgICAgdGhpcy5vYmplY3RNYXAgPSBuZXcgQmlNYXAoKTtcbiAgICAgICAgdGhpcy50ZW1wUmVmZXJlbmNlcyA9IG5ldyBBcnJheUxpc3QoKTtcbiAgICAgICAgdGhpcy5uZXh0S2V5ID0gMDtcbiAgICB9XG4gICAgYWRkRGVjb2RlTGlzdGVuZXIobHN0KSB7XG4gICAgICAgIHRoaXMuZGVjb2RlTGlzdGVuZXJzLmFkZChsc3QpO1xuICAgIH1cbiAgICBhZGRFbmNvZGVMaXN0ZW5lcihsc3QpIHtcbiAgICAgICAgdGhpcy5lbmNvZGVMaXN0ZW5lcnMuYWRkKGxzdCk7XG4gICAgfVxuICAgIGFkZFJlZmVyZW5jZShyZWZlcmVuY2UsIG9iamVjdCkge1xuICAgICAgICB0aGlzLm9iamVjdE1hcC5wdXQocmVmZXJlbmNlLCBvYmplY3QpO1xuICAgIH1cbiAgICBhZGRUZW1wUmVmZXJlbmNlKHJlZmVyZW5jZSwgb2JqZWN0KSB7XG4gICAgICAgIHRoaXMub2JqZWN0TWFwLnB1dChyZWZlcmVuY2UsIG9iamVjdCk7XG4gICAgICAgIHRoaXMudGVtcFJlZmVyZW5jZXMuYWRkKHJlZmVyZW5jZSk7XG4gICAgfVxuICAgIGFsbG9jTmV4dEtleSgpIHtcbiAgICAgICAgcmV0dXJuIFwiQ1wiICsgdGhpcy5uZXh0S2V5Kys7XG4gICAgfVxuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLm9iamVjdE1hcC5jbGVhcigpO1xuICAgICAgICB0aGlzLnRlbXBSZWZlcmVuY2VzLmNsZWFyKCk7XG4gICAgfVxuICAgIGNsZWFyVGVtcFJlZmVyZW5jZXMoKSB7XG4gICAgICAgIGZvciAobGV0IHJlZiBvZiB0aGlzLnRlbXBSZWZlcmVuY2VzKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUJ5S2V5KHJlZik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50ZW1wUmVmZXJlbmNlcy5jbGVhcigpO1xuICAgIH1cbiAgICBkZWNvZGUoanNvbikge1xuICAgICAgICBpZiAoanNvbiA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwiSlNPTiBvYmplY3QgaXMgbnVsbC5cIik7XG4gICAgICAgIGlmICh0eXBlb2YganNvbiA9PT0gXCJ1bmRlZmluZWRcIikgdGhyb3cgbmV3IEVycm9yKFwiSlNPTiBvYmplY3QgaXMgdW5kZWZpbmVkLlwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBqc29uID09PSBcInN0cmluZ1wiKSBqc29uID0gSlNPTi5wYXJzZShqc29uKTtcblxuICAgICAgICBsZXQgcnZhbHVlID0gbnVsbDtcbiAgICAgICAgbGV0IGVzb24gPSBuZXcgRW5jb2RlZEpTT04oanNvbik7XG4gICAgICAgIG5ldyBEZWNvZGVyKGVzb24sIHRoaXMsIG51bGwpLmRlY29kZShyID0+IHtcbiAgICAgICAgICAgIHdoaWxlICghdGhpcy5kZWZlcnJlZC5pc0VtcHR5KCkpXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlcnJlZC5yZW1vdmUoMCkucmVzdW1lKCk7XG4gICAgICAgICAgICB0aGlzLmNsZWFyVGVtcFJlZmVyZW5jZXMoKTtcbiAgICAgICAgICAgIHJ2YWx1ZSA9IHI7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcnZhbHVlO1xuICAgIH1cbiAgICBkZWZlckRlY29kaW5nKGRlY29kZXIpIHtcbiAgICAgICAgdGhpcy5kZWZlcnJlZC5hZGQoZGVjb2Rlcik7XG4gICAgfVxuICAgIGVuY29kZShvYmplY3QpIHtcbiAgICAgICAgbGV0IHRvSlNPTiA9IG5ldyBFbmNvZGVyKG9iamVjdCwgdGhpcykuZW5jb2RlKCk7XG4gICAgICAgIHRoaXMuY2xlYXJUZW1wUmVmZXJlbmNlcygpO1xuICAgICAgICByZXR1cm4gdG9KU09OO1xuICAgIH1cbiAgICBnZXRBbGxSZWZlcnJlZE9iamVjdHMoKSB7XG4gICAgICAgIGxldCB2YWx1ZXMgPSB0aGlzLm9iamVjdE1hcC52YWx1ZXMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBBcnJheUxpc3QodmFsdWVzKTtcbiAgICB9XG4gICAgZ2V0SGFuZGxlcihhQ2xhc3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlcnMuZ2V0KGFDbGFzcy5fX2dldENsYXNzKCkpO1xuICAgIH1cbiAgICBoYXNIYW5kbGVyKGFDbGFzcykge1xuICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVycy5oYXMoYUNsYXNzLl9fZ2V0Q2xhc3MoKSk7XG4gICAgfVxuICAgIHNldEhhbmRsZXIoYUNsYXNzLCBoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlcnMuc2V0KGFDbGFzcy5fX2dldENsYXNzKCksIGhhbmRsZXIpO1xuICAgIH1cbiAgICBnZXRSZWZlcmVuY2Uob2JqZWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9iamVjdE1hcC5nZXRLZXkob2JqZWN0KTtcbiAgICB9XG4gICAgZ2V0UmVmZXJyZWRPYmplY3QocmVmZXJlbmNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9iamVjdE1hcC5nZXQocmVmZXJlbmNlKTtcbiAgICB9XG4gICAgaGFzUmVmZXJlbmNlKHJlZmVyZW5jZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5vYmplY3RNYXAuY29udGFpbnNLZXkocmVmZXJlbmNlKTtcbiAgICB9XG4gICAgaGFzUmVmZXJyZWRPYmplY3Qob2JqZWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9iamVjdE1hcC5jb250YWluc1ZhbHVlKG9iamVjdCk7XG4gICAgfVxuICAgIG5vdGlmeURlY29kZShvYmplY3QpIHtcbiAgICAgICAgZm9yIChsZXQgZGVjb2RlTGlzdGVuZXIgb2YgdGhpcy5kZWNvZGVMaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGRlY29kZUxpc3RlbmVyKG9iamVjdCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbm90aWZ5RW5jb2RlKG9iamVjdCkge1xuICAgICAgICBmb3IgKGxldCBlbmNvZGVMaXN0ZW5lciBvZiB0aGlzLmVuY29kZUxpc3RlbmVycykge1xuICAgICAgICAgICAgZW5jb2RlTGlzdGVuZXIob2JqZWN0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZW1vdmVCeUtleShrZXkpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9iamVjdE1hcC5jb250YWluc0tleShrZXkpKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLm9iamVjdE1hcC5yZW1vdmVCeUtleShrZXkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmVtb3ZlQnlWYWx1ZShvYmopIHtcbiAgICAgICAgaWYgKCF0aGlzLm9iamVjdE1hcC5jb250YWluc1ZhbHVlKG9iaikpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5vYmplY3RNYXAucmVtb3ZlKHRoaXMub2JqZWN0TWFwLmdldEtleShvYmopKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zbGF0b3I7IiwiY29uc3QgQ2xpZW50TWVzc2FnZVR5cGUgPSByZXF1aXJlKFwiLi9DbGllbnRNZXNzYWdlVHlwZVwiKTtcbmNsYXNzIENsaWVudE1lc3NhZ2Uge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0fVxuXHRzdGF0aWMgX19pc1RyYW5zaWVudCgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRzdGF0aWMgX19nZXRDbGFzcygpIHtcblx0XHRyZXR1cm4gXCJjYS5mcmFyLmpqanJtaS5zb2NrZXQubWVzc2FnZS5DbGllbnRNZXNzYWdlXCI7XG5cdH1cblx0c3RhdGljIF9faXNFbnVtKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIpIG1vZHVsZS5leHBvcnRzID0gQ2xpZW50TWVzc2FnZTsiLCJjbGFzcyBDbGllbnRNZXNzYWdlVHlwZSB7XG5cdGNvbnN0cnVjdG9yKHZhbHVlKSB7XG5cdFx0dGhpcy5fX3ZhbHVlID0gdmFsdWU7XG5cdH1cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX192YWx1ZTtcblx0fVxuXHRzdGF0aWMgX19pc1RyYW5zaWVudCgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRzdGF0aWMgX19nZXRDbGFzcygpIHtcblx0XHRyZXR1cm4gXCJjYS5mcmFyLmpqanJtaS5zb2NrZXQubWVzc2FnZS5DbGllbnRNZXNzYWdlVHlwZVwiO1xuXHR9XG5cdHN0YXRpYyBfX2lzRW51bSgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxufTtcbkNsaWVudE1lc3NhZ2VUeXBlLnZhbHVlQXJyYXkgPSBbXTtcbkNsaWVudE1lc3NhZ2VUeXBlLnZhbHVlQXJyYXkucHVzaChDbGllbnRNZXNzYWdlVHlwZS5NRVRIT0RfUkVRVUVTVCA9IG5ldyBDbGllbnRNZXNzYWdlVHlwZShcIk1FVEhPRF9SRVFVRVNUXCIpKTtcbkNsaWVudE1lc3NhZ2VUeXBlLnZhbHVlQXJyYXkucHVzaChDbGllbnRNZXNzYWdlVHlwZS5JTlZPQ0FUSU9OX1JFU1BPTlNFID0gbmV3IENsaWVudE1lc3NhZ2VUeXBlKFwiSU5WT0NBVElPTl9SRVNQT05TRVwiKSk7XG5DbGllbnRNZXNzYWdlVHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpe3JldHVybiBDbGllbnRNZXNzYWdlVHlwZS52YWx1ZUFycmF5O307XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiKSBtb2R1bGUuZXhwb3J0cyA9IENsaWVudE1lc3NhZ2VUeXBlOyIsImNvbnN0IEpKSk1lc3NhZ2UgPSByZXF1aXJlKFwiLi9KSkpNZXNzYWdlXCIpO1xuY29uc3QgSkpKTWVzc2FnZVR5cGUgPSByZXF1aXJlKFwiLi9KSkpNZXNzYWdlVHlwZVwiKTtcbmNsYXNzIENsaWVudFJlcXVlc3RNZXNzYWdlIHtcblx0Y29uc3RydWN0b3IodWlkLCBwdHIsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcblx0XHR0aGlzLnVpZCA9IHVpZDtcblx0XHR0aGlzLnB0ciA9IHB0cjtcblx0XHR0aGlzLm1ldGhvZE5hbWUgPSBtZXRob2ROYW1lO1xuXHRcdHRoaXMuYXJncyA9IGFyZ3M7XG5cdH1cblx0c3RhdGljIF9faXNUcmFuc2llbnQoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0c3RhdGljIF9fZ2V0Q2xhc3MoKSB7XG5cdFx0cmV0dXJuIFwiY2EuZnJhci5qampybWkuc29ja2V0Lm1lc3NhZ2UuQ2xpZW50UmVxdWVzdE1lc3NhZ2VcIjtcblx0fVxuXHRzdGF0aWMgX19pc0VudW0oKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGdldEFyZ3MoKSB7XG5cdFx0cmV0dXJuIEFycmF5cy5jb3B5T2YodGhpcy5hcmdzLCB0aGlzLmFyZ3MubGVuZ3RoKTtcblx0fVxuXHRnZXRNZXRob2ROYW1lKCkge1xuXHRcdHJldHVybiB0aGlzLm1ldGhvZE5hbWU7XG5cdH1cblx0Z2V0UHRyKCkge1xuXHRcdHJldHVybiB0aGlzLnB0cjtcblx0fVxuXHRnZXRVaWQoKSB7XG5cdFx0cmV0dXJuIHRoaXMudWlkO1xuXHR9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIikgbW9kdWxlLmV4cG9ydHMgPSBDbGllbnRSZXF1ZXN0TWVzc2FnZTsiLCJjb25zdCBKSkpNZXNzYWdlID0gcmVxdWlyZShcIi4vSkpKTWVzc2FnZVwiKTtcbmNvbnN0IEpKSk1lc3NhZ2VUeXBlID0gcmVxdWlyZShcIi4vSkpKTWVzc2FnZVR5cGVcIik7XG5jbGFzcyBGb3JnZXRNZXNzYWdlIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0XG5cdH1cblx0c3RhdGljIF9faXNUcmFuc2llbnQoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0c3RhdGljIF9fZ2V0Q2xhc3MoKSB7XG5cdFx0cmV0dXJuIFwiY2EuZnJhci5qampybWkuc29ja2V0Lm1lc3NhZ2UuRm9yZ2V0TWVzc2FnZVwiO1xuXHR9XG5cdHN0YXRpYyBfX2lzRW51bSgpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiKSBtb2R1bGUuZXhwb3J0cyA9IEZvcmdldE1lc3NhZ2U7IiwiY29uc3QgSkpKTWVzc2FnZVR5cGUgPSByZXF1aXJlKFwiLi9KSkpNZXNzYWdlVHlwZVwiKTtcbmNsYXNzIEpKSk1lc3NhZ2Uge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0fVxuXHRzdGF0aWMgX19pc1RyYW5zaWVudCgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRzdGF0aWMgX19nZXRDbGFzcygpIHtcblx0XHRyZXR1cm4gXCJjYS5mcmFyLmpqanJtaS5zb2NrZXQubWVzc2FnZS5KSkpNZXNzYWdlXCI7XG5cdH1cblx0c3RhdGljIF9faXNFbnVtKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIpIG1vZHVsZS5leHBvcnRzID0gSkpKTWVzc2FnZTsiLCJjbGFzcyBKSkpNZXNzYWdlVHlwZSB7XG5cdGNvbnN0cnVjdG9yKHZhbHVlKSB7XG5cdFx0dGhpcy5fX3ZhbHVlID0gdmFsdWU7XG5cdH1cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX192YWx1ZTtcblx0fVxuXHRzdGF0aWMgX19pc1RyYW5zaWVudCgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRzdGF0aWMgX19nZXRDbGFzcygpIHtcblx0XHRyZXR1cm4gXCJjYS5mcmFyLmpqanJtaS5zb2NrZXQubWVzc2FnZS5KSkpNZXNzYWdlVHlwZVwiO1xuXHR9XG5cdHN0YXRpYyBfX2lzRW51bSgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxufTtcbkpKSk1lc3NhZ2VUeXBlLnZhbHVlQXJyYXkgPSBbXTtcbkpKSk1lc3NhZ2VUeXBlLnZhbHVlQXJyYXkucHVzaChKSkpNZXNzYWdlVHlwZS5MT0NBTCA9IG5ldyBKSkpNZXNzYWdlVHlwZShcIkxPQ0FMXCIpKTtcbkpKSk1lc3NhZ2VUeXBlLnZhbHVlQXJyYXkucHVzaChKSkpNZXNzYWdlVHlwZS5SRU1PVEUgPSBuZXcgSkpKTWVzc2FnZVR5cGUoXCJSRU1PVEVcIikpO1xuSkpKTWVzc2FnZVR5cGUudmFsdWVBcnJheS5wdXNoKEpKSk1lc3NhZ2VUeXBlLlJFQURZID0gbmV3IEpKSk1lc3NhZ2VUeXBlKFwiUkVBRFlcIikpO1xuSkpKTWVzc2FnZVR5cGUudmFsdWVBcnJheS5wdXNoKEpKSk1lc3NhZ2VUeXBlLkxPQUQgPSBuZXcgSkpKTWVzc2FnZVR5cGUoXCJMT0FEXCIpKTtcbkpKSk1lc3NhZ2VUeXBlLnZhbHVlQXJyYXkucHVzaChKSkpNZXNzYWdlVHlwZS5FWENFUFRJT04gPSBuZXcgSkpKTWVzc2FnZVR5cGUoXCJFWENFUFRJT05cIikpO1xuSkpKTWVzc2FnZVR5cGUudmFsdWVBcnJheS5wdXNoKEpKSk1lc3NhZ2VUeXBlLkZPUkdFVCA9IG5ldyBKSkpNZXNzYWdlVHlwZShcIkZPUkdFVFwiKSk7XG5KSkpNZXNzYWdlVHlwZS52YWx1ZUFycmF5LnB1c2goSkpKTWVzc2FnZVR5cGUuUkVKRUNURURfQ09OTkVDVElPTiA9IG5ldyBKSkpNZXNzYWdlVHlwZShcIlJFSkVDVEVEX0NPTk5FQ1RJT05cIikpO1xuSkpKTWVzc2FnZVR5cGUudmFsdWVzID0gZnVuY3Rpb24oKXtyZXR1cm4gSkpKTWVzc2FnZVR5cGUudmFsdWVBcnJheTt9O1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIikgbW9kdWxlLmV4cG9ydHMgPSBKSkpNZXNzYWdlVHlwZTsiLCJjb25zdCBDbGllbnRNZXNzYWdlID0gcmVxdWlyZShcIi4vQ2xpZW50TWVzc2FnZVwiKTtcbmNvbnN0IENsaWVudE1lc3NhZ2VUeXBlID0gcmVxdWlyZShcIi4vQ2xpZW50TWVzc2FnZVR5cGVcIik7XG5jbGFzcyBNZXRob2RSZXF1ZXN0IHtcblx0Y29uc3RydWN0b3IodWlkLCBwdHIsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcblx0XHR0aGlzLnVpZCA9IHVpZDtcblx0XHR0aGlzLm9iamVjdFBUUiA9IHB0cjtcblx0XHR0aGlzLm1ldGhvZE5hbWUgPSBtZXRob2ROYW1lO1xuXHRcdHRoaXMubWV0aG9kQXJndW1lbnRzID0gYXJncztcblx0fVxuXHRzdGF0aWMgX19pc1RyYW5zaWVudCgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRzdGF0aWMgX19nZXRDbGFzcygpIHtcblx0XHRyZXR1cm4gXCJjYS5mcmFyLmpqanJtaS5zb2NrZXQubWVzc2FnZS5NZXRob2RSZXF1ZXN0XCI7XG5cdH1cblx0c3RhdGljIF9faXNFbnVtKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIpIG1vZHVsZS5leHBvcnRzID0gTWV0aG9kUmVxdWVzdDsiLCJjb25zdCBKSkpNZXNzYWdlID0gcmVxdWlyZShcIi4vSkpKTWVzc2FnZVwiKTtcbmNvbnN0IEpKSk1lc3NhZ2VUeXBlID0gcmVxdWlyZShcIi4vSkpKTWVzc2FnZVR5cGVcIik7XG5jbGFzcyBNZXRob2RSZXNwb25zZSB7XG5cdGNvbnN0cnVjdG9yKHVpZCwgb2JqZWN0UFRSLCBtZXRob2ROYW1lLCBydmFsdWUpIHtcblx0XHR0aGlzLnVpZCA9IHVpZDtcblx0XHR0aGlzLm1ldGhvZE5hbWUgPSBtZXRob2ROYW1lO1xuXHRcdHRoaXMucnZhbHVlID0gcnZhbHVlO1xuXHRcdHRoaXMub2JqZWN0UFRSID0gb2JqZWN0UFRSO1xuXHR9XG5cdHN0YXRpYyBfX2lzVHJhbnNpZW50KCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHN0YXRpYyBfX2dldENsYXNzKCkge1xuXHRcdHJldHVybiBcImNhLmZyYXIuampqcm1pLnNvY2tldC5tZXNzYWdlLk1ldGhvZFJlc3BvbnNlXCI7XG5cdH1cblx0c3RhdGljIF9faXNFbnVtKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRnZXRNZXRob2ROYW1lKCkge1xuXHRcdHJldHVybiB0aGlzLm1ldGhvZE5hbWU7XG5cdH1cblx0Z2V0T2JqZWN0UFRSKCkge1xuXHRcdHJldHVybiB0aGlzLm9iamVjdFBUUjtcblx0fVxuXHRnZXRSdmFsdWUoKSB7XG5cdFx0cmV0dXJuIHRoaXMucnZhbHVlO1xuXHR9XG5cdGdldFVpZCgpIHtcblx0XHRyZXR1cm4gdGhpcy51aWQ7XG5cdH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiKSBtb2R1bGUuZXhwb3J0cyA9IE1ldGhvZFJlc3BvbnNlOyIsImNvbnN0IEpKSk1lc3NhZ2UgPSByZXF1aXJlKFwiLi9KSkpNZXNzYWdlXCIpO1xuY29uc3QgSkpKTWVzc2FnZVR5cGUgPSByZXF1aXJlKFwiLi9KSkpNZXNzYWdlVHlwZVwiKTtcbmNsYXNzIFJlYWR5TWVzc2FnZSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHR9XG5cdHN0YXRpYyBfX2lzVHJhbnNpZW50KCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHN0YXRpYyBfX2dldENsYXNzKCkge1xuXHRcdHJldHVybiBcImNhLmZyYXIuampqcm1pLnNvY2tldC5tZXNzYWdlLlJlYWR5TWVzc2FnZVwiO1xuXHR9XG5cdHN0YXRpYyBfX2lzRW51bSgpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0Z2V0Um9vdCgpIHtcblx0XHRyZXR1cm4gdGhpcy5yb290O1xuXHR9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIikgbW9kdWxlLmV4cG9ydHMgPSBSZWFkeU1lc3NhZ2U7IiwiY29uc3QgSkpKTWVzc2FnZSA9IHJlcXVpcmUoXCIuL0pKSk1lc3NhZ2VcIik7XG5jb25zdCBKSkpNZXNzYWdlVHlwZSA9IHJlcXVpcmUoXCIuL0pKSk1lc3NhZ2VUeXBlXCIpO1xuY2xhc3MgUmVqZWN0ZWRDb25uZWN0aW9uTWVzc2FnZSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHR9XG5cdHN0YXRpYyBfX2lzVHJhbnNpZW50KCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHN0YXRpYyBfX2dldENsYXNzKCkge1xuXHRcdHJldHVybiBcImNhLmZyYXIuampqcm1pLnNvY2tldC5tZXNzYWdlLlJlamVjdGVkQ29ubmVjdGlvbk1lc3NhZ2VcIjtcblx0fVxuXHRzdGF0aWMgX19pc0VudW0oKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIikgbW9kdWxlLmV4cG9ydHMgPSBSZWplY3RlZENvbm5lY3Rpb25NZXNzYWdlOyIsImNvbnN0IEpKSk1lc3NhZ2UgPSByZXF1aXJlKFwiLi9KSkpNZXNzYWdlXCIpO1xuY29uc3QgSkpKTWVzc2FnZVR5cGUgPSByZXF1aXJlKFwiLi9KSkpNZXNzYWdlVHlwZVwiKTtcbmNsYXNzIFNlcnZlclNpZGVFeGNlcHRpb25NZXNzYWdlIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdH1cblx0c3RhdGljIF9faXNUcmFuc2llbnQoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0c3RhdGljIF9fZ2V0Q2xhc3MoKSB7XG5cdFx0cmV0dXJuIFwiY2EuZnJhci5qampybWkuc29ja2V0Lm1lc3NhZ2UuU2VydmVyU2lkZUV4Y2VwdGlvbk1lc3NhZ2VcIjtcblx0fVxuXHRzdGF0aWMgX19pc0VudW0oKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIikgbW9kdWxlLmV4cG9ydHMgPSBTZXJ2ZXJTaWRlRXhjZXB0aW9uTWVzc2FnZTsiLCJsZXQgcGFja2FnZSA9IHt9O1xucGFja2FnZS5TZXJ2ZXJTaWRlRXhjZXB0aW9uTWVzc2FnZSA9IHJlcXVpcmUoXCIuL1NlcnZlclNpZGVFeGNlcHRpb25NZXNzYWdlXCIpO1xucGFja2FnZS5SZWplY3RlZENvbm5lY3Rpb25NZXNzYWdlID0gcmVxdWlyZShcIi4vUmVqZWN0ZWRDb25uZWN0aW9uTWVzc2FnZVwiKTtcbnBhY2thZ2UuUmVhZHlNZXNzYWdlID0gcmVxdWlyZShcIi4vUmVhZHlNZXNzYWdlXCIpO1xucGFja2FnZS5NZXRob2RSZXNwb25zZSA9IHJlcXVpcmUoXCIuL01ldGhvZFJlc3BvbnNlXCIpO1xucGFja2FnZS5NZXRob2RSZXF1ZXN0ID0gcmVxdWlyZShcIi4vTWV0aG9kUmVxdWVzdFwiKTtcbnBhY2thZ2UuSkpKTWVzc2FnZVR5cGUgPSByZXF1aXJlKFwiLi9KSkpNZXNzYWdlVHlwZVwiKTtcbnBhY2thZ2UuSkpKTWVzc2FnZSA9IHJlcXVpcmUoXCIuL0pKSk1lc3NhZ2VcIik7XG5wYWNrYWdlLkZvcmdldE1lc3NhZ2UgPSByZXF1aXJlKFwiLi9Gb3JnZXRNZXNzYWdlXCIpO1xucGFja2FnZS5DbGllbnRSZXF1ZXN0TWVzc2FnZSA9IHJlcXVpcmUoXCIuL0NsaWVudFJlcXVlc3RNZXNzYWdlXCIpO1xucGFja2FnZS5DbGllbnRNZXNzYWdlVHlwZSA9IHJlcXVpcmUoXCIuL0NsaWVudE1lc3NhZ2VUeXBlXCIpO1xucGFja2FnZS5DbGllbnRNZXNzYWdlID0gcmVxdWlyZShcIi4vQ2xpZW50TWVzc2FnZVwiKTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIpIG1vZHVsZS5leHBvcnRzID0gcGFja2FnZTsiLCJjbGFzcyBBcnJheUxpc3Qge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmVsZW1lbnREYXRhID0gW107XG4gICAgfVxuICAgIHN0YXRpYyBfX2lzVHJhbnNpZW50KCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHN0YXRpYyBfX2dldENsYXNzKCkge1xuICAgICAgICByZXR1cm4gXCJqYXZhLnV0aWwuQXJyYXlMaXN0XCI7XG4gICAgfVxuICAgIHN0YXRpYyBfX2lzRW51bSgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhZGRBbGwoYykge1xuICAgICAgICBpZiAodHlwZW9mIGMgPT09IFwibnVtYmVyXCIpIHRocm93IG5ldyBFcnJvcihcInVuc3VwcG9ydGVkIGphdmEgdG8ganMgb3BlcmF0aW9uXCIpO1xuICAgICAgICBmb3IgKGxldCBlIG9mIGMpXG4gICAgICAgICAgICB0aGlzLmFkZChlKTtcbiAgICB9XG4gICAgaXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2l6ZSgpID09PSAwO1xuICAgIH1cbiAgICByZW1vdmVBbGwoYykge1xuICAgICAgICBmb3IgKGxldCBlIG9mIGMpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldGFpbkFsbChjKSB7XG4gICAgICAgIGxldCBuZXdFbGVtZW50RGF0YSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBlIG9mIGMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRhaW5zKGUpKSBuZXdFbGVtZW50RGF0YS5hZGQoZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbGVtZW50RGF0YSA9IG5ld0VsZW1lbnREYXRhO1xuICAgIH1cbiAgICBzaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50RGF0YS5sZW5ndGg7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICBsZXQgdGhhdCA9IG5ldyBBcnJheUxpc3QoKTtcbiAgICAgICAgZm9yIChsZXQgZSBvZiB0aGlzKSB7XG4gICAgICAgICAgICB0aGF0LmFkZChlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhhdDtcbiAgICB9XG4gICAgZ2V0KGluZGV4KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnREYXRhW2luZGV4XTtcbiAgICB9XG4gICAgc2V0KGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgIGxldCBvbGQgPSB0aGlzLmVsZW1lbnREYXRhW2luZGV4XTtcbiAgICAgICAgdGhpcy5lbGVtZW50RGF0YVtpbmRleF0gPSBlbGVtZW50O1xuICAgICAgICByZXR1cm4gb2xkO1xuICAgIH1cbiAgICB0b0FycmF5KGEgPSBbXSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZWxlbWVudERhdGEubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICBhW2ldID0gdGhpcy5lbGVtZW50RGF0YVtpXTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuICAgIGl0ZXJhdG9yKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bnN1cHBvcnRlZCBqYXZhIHRvIGpzIG9wZXJhdGlvblwiKTtcbiAgICB9XG4gICAgc3ViTGlzdChmcm9tSW5kZXgsIHRvSW5kZXgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5zdXBwb3J0ZWQgamF2YSB0byBqcyBvcGVyYXRpb25cIik7XG4gICAgfVxuICAgIGxpc3RJdGVyYXRvcigpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5zdXBwb3J0ZWQgamF2YSB0byBqcyBvcGVyYXRpb25cIik7XG4gICAgfVxuICAgIGxpc3RJdGVyYXRvcihpbmRleCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bnN1cHBvcnRlZCBqYXZhIHRvIGpzIG9wZXJhdGlvblwiKTtcbiAgICB9XG4gICAgYWRkKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuc3BsaWNlKGluZGV4LCAwLCBlbGVtZW50KTtcbiAgICB9XG4gICAgYWRkKGUpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50RGF0YS5wdXNoKGUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudERhdGEgPSBbXTtcbiAgICB9XG4gICAgY29udGFpbnMobykge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50RGF0YS5pbmRleE9mKG8pICE9PSAtMTtcbiAgICB9XG4gICAgaW5kZXhPZihvKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnREYXRhLmluZGV4T2Yobyk7XG4gICAgfVxuICAgIFtTeW1ib2wuaXRlcmF0b3JdICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudERhdGFbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICAgIH1cbiAgICBsYXN0SW5kZXhPZihvKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnREYXRhLmxhc3RJbmRleE9mKG8pO1xuICAgIH1cbiAgICByZW1vdmUobykge1xuICAgICAgICBpZiAodHlwZW9mIG8gPT09IFwibnVtYmVyXCIpIHJldHVybiB0aGlzLnJlbW92ZUluZGV4KG8pO1xuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmluZGV4T2Yobyk7XG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIGxldCByID0gdGhpcy5lbGVtZW50RGF0YS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gclswXTtcbiAgICB9XG4gICAgcmVtb3ZlUmFuZ2UoZnJvbUluZGV4LCB0b0luZGV4KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudERhdGEuc3BsaWNlKGZyb21JbmRleCwgdG9JbmRleCAtIGZyb21JbmRleCk7XG4gICAgfVxuICAgIHJlbW92ZUluZGV4IChpbmRleCkge1xuICAgICAgICBpZiAodGhpcy5zaXplID49IGluZGV4KSB0aHJvdyBuZXcgRXJyb3IoYGluZGV4ICcke2luZGV4fScgb3V0IG9mIHJhbmdlYCk7XG4gICAgICAgIGlmICh0aGlzLnNpemUgPCAwKSB0aHJvdyBuZXcgRXJyb3IoYGluZGV4ICcke2luZGV4fScgb3V0IG9mIHJhbmdlYCk7XG4gICAgICAgIGxldCByID0gdGhpcy5lbGVtZW50RGF0YS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gclswXTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5TGlzdDsiLCJjbGFzcyBIYXNoTWFwIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgTWFwKCk7XG4gICAgfVxuICAgIHN0YXRpYyBfX2lzVHJhbnNpZW50KCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHN0YXRpYyBfX2dldENsYXNzKCkge1xuICAgICAgICByZXR1cm4gXCJqYXZhLnV0aWwuSGFzaE1hcFwiO1xuICAgIH1cbiAgICBzdGF0aWMgX19pc0VudW0oKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGtleS12YWx1ZSBtYXBwaW5ncyBpbiB0aGlzIG1hcC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gdGhlIG51bWJlciBvZiBrZXktdmFsdWUgbWFwcGluZ3MgaW4gdGhpcyBtYXBcbiAgICAgKi9cbiAgICBzaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAuc2l6ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyA8dHQ+dHJ1ZTwvdHQ+IGlmIHRoaXMgbWFwIGNvbnRhaW5zIG5vIGtleS12YWx1ZSBtYXBwaW5ncy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gPHR0PnRydWU8L3R0PiBpZiB0aGlzIG1hcCBjb250YWlucyBubyBrZXktdmFsdWUgbWFwcGluZ3NcbiAgICAgKi9cbiAgICBpc0VtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAuc2l6ZSA9PT0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgdmFsdWUgdG8gd2hpY2ggdGhlIHNwZWNpZmllZCBrZXkgaXMgbWFwcGVkLFxuICAgICAqIG9yIHtAY29kZSBudWxsfSBpZiB0aGlzIG1hcCBjb250YWlucyBubyBtYXBwaW5nIGZvciB0aGUga2V5LlxuICAgICAqXG4gICAgICogPHA+TW9yZSBmb3JtYWxseSwgaWYgdGhpcyBtYXAgY29udGFpbnMgYSBtYXBwaW5nIGZyb20gYSBrZXlcbiAgICAgKiB7QGNvZGUga30gdG8gYSB2YWx1ZSB7QGNvZGUgdn0gc3VjaCB0aGF0IHtAY29kZSAoa2V5PT1udWxsID8gaz09bnVsbCA6XG4gICAgICoga2V5LmVxdWFscyhrKSl9LCB0aGVuIHRoaXMgbWV0aG9kIHJldHVybnMge0Bjb2RlIHZ9OyBvdGhlcndpc2VcbiAgICAgKiBpdCByZXR1cm5zIHtAY29kZSBudWxsfS4gIChUaGVyZSBjYW4gYmUgYXQgbW9zdCBvbmUgc3VjaCBtYXBwaW5nLilcbiAgICAgKlxuICAgICAqIDxwPkEgcmV0dXJuIHZhbHVlIG9mIHtAY29kZSBudWxsfSBkb2VzIG5vdCA8aT5uZWNlc3NhcmlseTwvaT5cbiAgICAgKiBpbmRpY2F0ZSB0aGF0IHRoZSBtYXAgY29udGFpbnMgbm8gbWFwcGluZyBmb3IgdGhlIGtleTsgaXQncyBhbHNvXG4gICAgICogcG9zc2libGUgdGhhdCB0aGUgbWFwIGV4cGxpY2l0bHkgbWFwcyB0aGUga2V5IHRvIHtAY29kZSBudWxsfS5cbiAgICAgKiBUaGUge0BsaW5rICNjb250YWluc0tleSBjb250YWluc0tleX0gb3BlcmF0aW9uIG1heSBiZSB1c2VkIHRvXG4gICAgICogZGlzdGluZ3Vpc2ggdGhlc2UgdHdvIGNhc2VzLlxuICAgICAqXG4gICAgICogQHNlZSAjcHV0KE9iamVjdCwgT2JqZWN0KVxuICAgICAqL1xuICAgIGdldChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwLmdldChrZXkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIDx0dD50cnVlPC90dD4gaWYgdGhpcyBtYXAgY29udGFpbnMgYSBtYXBwaW5nIGZvciB0aGVcbiAgICAgKiBzcGVjaWZpZWQga2V5LlxuICAgICAqXG4gICAgICogQHBhcmFtICAga2V5ICAgVGhlIGtleSB3aG9zZSBwcmVzZW5jZSBpbiB0aGlzIG1hcCBpcyB0byBiZSB0ZXN0ZWRcbiAgICAgKiBAcmV0dXJuIDx0dD50cnVlPC90dD4gaWYgdGhpcyBtYXAgY29udGFpbnMgYSBtYXBwaW5nIGZvciB0aGUgc3BlY2lmaWVkXG4gICAgICoga2V5LlxuICAgICAqL1xuICAgIGNvbnRhaW5zS2V5KGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAuaGFzKGtleSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFzc29jaWF0ZXMgdGhlIHNwZWNpZmllZCB2YWx1ZSB3aXRoIHRoZSBzcGVjaWZpZWQga2V5IGluIHRoaXMgbWFwLlxuICAgICAqIElmIHRoZSBtYXAgcHJldmlvdXNseSBjb250YWluZWQgYSBtYXBwaW5nIGZvciB0aGUga2V5LCB0aGUgb2xkXG4gICAgICogdmFsdWUgaXMgcmVwbGFjZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5IGtleSB3aXRoIHdoaWNoIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgdG8gYmUgYXNzb2NpYXRlZFxuICAgICAqIEBwYXJhbSB2YWx1ZSB2YWx1ZSB0byBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXlcbiAgICAgKiBAcmV0dXJuIHRoZSBwcmV2aW91cyB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggPHR0PmtleTwvdHQ+LCBvclxuICAgICAqICAgICAgICAgPHR0Pm51bGw8L3R0PiBpZiB0aGVyZSB3YXMgbm8gbWFwcGluZyBmb3IgPHR0PmtleTwvdHQ+LlxuICAgICAqICAgICAgICAgKEEgPHR0Pm51bGw8L3R0PiByZXR1cm4gY2FuIGFsc28gaW5kaWNhdGUgdGhhdCB0aGUgbWFwXG4gICAgICogICAgICAgICBwcmV2aW91c2x5IGFzc29jaWF0ZWQgPHR0Pm51bGw8L3R0PiB3aXRoIDx0dD5rZXk8L3R0Pi4pXG4gICAgICovXG4gICAgcHV0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgbGV0IHIgPSB0aGlzLmdldChrZXkpO1xuICAgICAgICB0aGlzLm1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb3BpZXMgYWxsIG9mIHRoZSBtYXBwaW5ncyBmcm9tIHRoZSBzcGVjaWZpZWQgbWFwIHRvIHRoaXMgbWFwLlxuICAgICAqIFRoZXNlIG1hcHBpbmdzIHdpbGwgcmVwbGFjZSBhbnkgbWFwcGluZ3MgdGhhdCB0aGlzIG1hcCBoYWQgZm9yXG4gICAgICogYW55IG9mIHRoZSBrZXlzIGN1cnJlbnRseSBpbiB0aGUgc3BlY2lmaWVkIG1hcC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBtIG1hcHBpbmdzIHRvIGJlIHN0b3JlZCBpbiB0aGlzIG1hcFxuICAgICAqIEB0aHJvd3MgTnVsbFBvaW50ZXJFeGNlcHRpb24gaWYgdGhlIHNwZWNpZmllZCBtYXAgaXMgbnVsbFxuICAgICAqL1xuICAgIHB1dEFsbCh0aGF0KSB7XG5cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgbWFwcGluZyBmb3IgdGhlIHNwZWNpZmllZCBrZXkgZnJvbSB0aGlzIG1hcCBpZiBwcmVzZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtICBrZXkga2V5IHdob3NlIG1hcHBpbmcgaXMgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBtYXBcbiAgICAgKiBAcmV0dXJuIHRoZSBwcmV2aW91cyB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggPHR0PmtleTwvdHQ+LCBvclxuICAgICAqICAgICAgICAgPHR0Pm51bGw8L3R0PiBpZiB0aGVyZSB3YXMgbm8gbWFwcGluZyBmb3IgPHR0PmtleTwvdHQ+LlxuICAgICAqICAgICAgICAgKEEgPHR0Pm51bGw8L3R0PiByZXR1cm4gY2FuIGFsc28gaW5kaWNhdGUgdGhhdCB0aGUgbWFwXG4gICAgICogICAgICAgICBwcmV2aW91c2x5IGFzc29jaWF0ZWQgPHR0Pm51bGw8L3R0PiB3aXRoIDx0dD5rZXk8L3R0Pi4pXG4gICAgICovXG4gICAgcmVtb3ZlKGtleSkge1xuICAgICAgICBsZXQgciA9IHRoaXMuZ2V0KGtleSk7XG4gICAgICAgIHRoaXMubWFwLmRlbGV0ZShrZXkpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgb2YgdGhlIG1hcHBpbmdzIGZyb20gdGhpcyBtYXAuXG4gICAgICogVGhlIG1hcCB3aWxsIGJlIGVtcHR5IGFmdGVyIHRoaXMgY2FsbCByZXR1cm5zLlxuICAgICAqL1xuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLm1hcC5jbGVhcigpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIDx0dD50cnVlPC90dD4gaWYgdGhpcyBtYXAgbWFwcyBvbmUgb3IgbW9yZSBrZXlzIHRvIHRoZVxuICAgICAqIHNwZWNpZmllZCB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB2YWx1ZSB2YWx1ZSB3aG9zZSBwcmVzZW5jZSBpbiB0aGlzIG1hcCBpcyB0byBiZSB0ZXN0ZWRcbiAgICAgKiBAcmV0dXJuIDx0dD50cnVlPC90dD4gaWYgdGhpcyBtYXAgbWFwcyBvbmUgb3IgbW9yZSBrZXlzIHRvIHRoZVxuICAgICAqICAgICAgICAgc3BlY2lmaWVkIHZhbHVlXG4gICAgICovXG4gICAgY29udGFpbnNWYWx1ZSh2YWx1ZSkge1xuICAgICAgICBmb3IgKGxldCB2IG9mIHRoaXMubWFwLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBpZiAodiA9PT0gdmFsdWUpIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBTZXR9IHZpZXcgb2YgdGhlIGtleXMgY29udGFpbmVkIGluIHRoaXMgbWFwLlxuICAgICAqIFRoZSBzZXQgaXMgYmFja2VkIGJ5IHRoZSBtYXAsIHNvIGNoYW5nZXMgdG8gdGhlIG1hcCBhcmVcbiAgICAgKiByZWZsZWN0ZWQgaW4gdGhlIHNldCwgYW5kIHZpY2UtdmVyc2EuICBJZiB0aGUgbWFwIGlzIG1vZGlmaWVkXG4gICAgICogd2hpbGUgYW4gaXRlcmF0aW9uIG92ZXIgdGhlIHNldCBpcyBpbiBwcm9ncmVzcyAoZXhjZXB0IHRocm91Z2hcbiAgICAgKiB0aGUgaXRlcmF0b3IncyBvd24gPHR0PnJlbW92ZTwvdHQ+IG9wZXJhdGlvbiksIHRoZSByZXN1bHRzIG9mXG4gICAgICogdGhlIGl0ZXJhdGlvbiBhcmUgdW5kZWZpbmVkLiAgVGhlIHNldCBzdXBwb3J0cyBlbGVtZW50IHJlbW92YWwsXG4gICAgICogd2hpY2ggcmVtb3ZlcyB0aGUgY29ycmVzcG9uZGluZyBtYXBwaW5nIGZyb20gdGhlIG1hcCwgdmlhIHRoZVxuICAgICAqIDx0dD5JdGVyYXRvci5yZW1vdmU8L3R0PiwgPHR0PlNldC5yZW1vdmU8L3R0PixcbiAgICAgKiA8dHQ+cmVtb3ZlQWxsPC90dD4sIDx0dD5yZXRhaW5BbGw8L3R0PiwgYW5kIDx0dD5jbGVhcjwvdHQ+XG4gICAgICogb3BlcmF0aW9ucy4gIEl0IGRvZXMgbm90IHN1cHBvcnQgdGhlIDx0dD5hZGQ8L3R0PiBvciA8dHQ+YWRkQWxsPC90dD5cbiAgICAgKiBvcGVyYXRpb25zLlxuICAgICAqL1xuICAgIGtleVNldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwLmtleXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBDb2xsZWN0aW9ufSB2aWV3IG9mIHRoZSB2YWx1ZXMgY29udGFpbmVkIGluIHRoaXMgbWFwLlxuICAgICAqIFRoZSBjb2xsZWN0aW9uIGlzIGJhY2tlZCBieSB0aGUgbWFwLCBzbyBjaGFuZ2VzIHRvIHRoZSBtYXAgYXJlXG4gICAgICogcmVmbGVjdGVkIGluIHRoZSBjb2xsZWN0aW9uLCBhbmQgdmljZS12ZXJzYS4gIElmIHRoZSBtYXAgaXNcbiAgICAgKiBtb2RpZmllZCB3aGlsZSBhbiBpdGVyYXRpb24gb3ZlciB0aGUgY29sbGVjdGlvbiBpcyBpbiBwcm9ncmVzc1xuICAgICAqIChleGNlcHQgdGhyb3VnaCB0aGUgaXRlcmF0b3IncyBvd24gPHR0PnJlbW92ZTwvdHQ+IG9wZXJhdGlvbiksXG4gICAgICogdGhlIHJlc3VsdHMgb2YgdGhlIGl0ZXJhdGlvbiBhcmUgdW5kZWZpbmVkLiAgVGhlIGNvbGxlY3Rpb25cbiAgICAgKiBzdXBwb3J0cyBlbGVtZW50IHJlbW92YWwsIHdoaWNoIHJlbW92ZXMgdGhlIGNvcnJlc3BvbmRpbmdcbiAgICAgKiBtYXBwaW5nIGZyb20gdGhlIG1hcCwgdmlhIHRoZSA8dHQ+SXRlcmF0b3IucmVtb3ZlPC90dD4sXG4gICAgICogPHR0PkNvbGxlY3Rpb24ucmVtb3ZlPC90dD4sIDx0dD5yZW1vdmVBbGw8L3R0PixcbiAgICAgKiA8dHQ+cmV0YWluQWxsPC90dD4gYW5kIDx0dD5jbGVhcjwvdHQ+IG9wZXJhdGlvbnMuICBJdCBkb2VzIG5vdFxuICAgICAqIHN1cHBvcnQgdGhlIDx0dD5hZGQ8L3R0PiBvciA8dHQ+YWRkQWxsPC90dD4gb3BlcmF0aW9ucy5cbiAgICAgKi9cbiAgICB2YWx1ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcC52YWx1ZXMoKTtcbiAgICB9XG5cbiAgICBqampEZWNvZGUocmVzT2JqKSB7XG4gICAgICAgIGxldCBrZXlzID0gbnVsbDtcbiAgICAgICAgbGV0IHZhbHVlcyA9IG51bGw7XG5cbiAgICAgICAgbGV0IGNiMSA9IGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICBrZXlzID0gcjtcbiAgICAgICAgICAgIHJlc09iai5kZWNvZGVGaWVsZChcInZhbHVlc1wiLCBjYjIpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBjYjIgPSBmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgdmFsdWVzID0gcjtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMucHV0KGtleXNbaV0sIHZhbHVlc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKTtcblxuICAgICAgICByZXNPYmouZGVjb2RlRmllbGQoXCJrZXlzXCIsIGNiMSk7XG4gICAgfVxuXG4gICAgampqRW5jb2RlKGVuY29kZWRPYmplY3QpIHtcbiAgICAgICAgbGV0IGtleXMgPSBbXTtcbiAgICAgICAgbGV0IHZhbHVlcyA9IFtdO1xuXG4gICAgICAgIHRoaXMubWFwLmZvckVhY2goKHZhbHVlLCBrZXkpPT57XG4gICAgICAgICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZW5jb2RlZE9iamVjdC5zZXRGaWVsZChcImtleXNcIiwga2V5cyk7XG4gICAgICAgIGVuY29kZWRPYmplY3Quc2V0RmllbGQoXCJ2YWx1ZXNcIiwgdmFsdWVzKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhhc2hNYXA7Il19
