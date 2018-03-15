///* global Constants, JJJRMISocket */
//let Constants = require("./Constants");
//
//class Decoder {
//    constructor(json, translator) {
//        if (typeof json === "undefined") throw new Error("undefined json");
//        if (typeof translator === "undefined") throw new Error("undefined translator");
//
//        if (typeof json === "string") this.json = JSON.parse(json);
//        else this.json = json;
//        this.translator = translator;
//    }
//
//    resume(){
//        this.decode(this.callback);
//    }
//
//    decode(callback) {
//        this.callback = callback;
//
//        if (typeof this.json[Constants.TypeParam] !== "undefined" && this.json[Constants.TypeParam] === Constants.NullValue) {
//            callback(null);
//        } else if (typeof this.json[Constants.PointerParam] !== "undefined") {
//            result = this.translator.get(this.json[Constants.PointerParam]);
//            if (this.translator.has
//        } else if (typeof this.json[Constants.EnumParam] !== "undefined") {
//            let className = this.json[Constants.EnumParam];
//            let fieldName = this.json[Constants.ValueParam];
//            let aClass = this.translator.getClass(className);
//
//            if (typeof aClass === "undefined") {
//                throw new Error("classname '" + className + "' not found");
//            }
//            result = aClass[fieldName];
//        } else if (typeof this.json[Constants.ValueParam] !== "undefined") {
//            result = this.json[Constants.ValueParam];
//        } else if (typeof this.json[Constants.ElementsParam] !== "undefined") {
//            result = new RestoredArray(this.json, this.translator, this.webSocket, this.deferred, this.classmap).toObject();
//        } else if (typeof this.json[Constants.FieldsParam] !== "undefined") {
//            result = new RestoredObject(this.json, this.translator, this.jjjWebsocket, this.deferred, this.classmap).toObject();
//        } else {
//            console.log("Unknown object type during decoding");
//            console.log(this.json);
//            console.log("+---------------------------------+");
//            window.jjjdebug = this.json;
//            throw new Error("Unknown object type during decoding; see window.jjjdebug");
//        }
//
//        if (typeof result !== "undefined") callback(result);
//        else {
//            this.deferred.push({
//                decoder: this,
//                callback: callback
//            });
//        }
//    }
//}
//
//class RestoredArray {
//    constructor(json, translator, webSocket, deferred, classmap) {
//        this.json = json;
//        this.translator = translator;
//        this.webSocket = webSocket;
//        this.elements = this.json[Constants.ElementsParam];
//        this.deferred = deferred;
//
//        this.restoreCount = 0;
//        this.retArray = [];
//        this.classmap = classmap;
//
//        if (typeof deferred === "undefined") throw new Error("undefined deferred");
//        if (typeof classmap === "undefined") throw new Error("undefined classmap");
//    }
//    toObject() {
//        this.decodeArray();
//        if (this.restoreCount === this.elements.length) return this.retArray;
//        return undefined;
//    }
//    decodeArray() {
//        for (let i = 0; i < this.elements.length; i++) {
//            let decoder = new Decoder(this.elements[i], this.translator, this.webSocket, this.deferred, this.classmap);
//            decoder.decode(function (result){
//                this.retArray[i] = result;
//                this.restoreCount++;
//            }.bind(this));
//        }
//    }
//    length() {
//        return this.elements.length;
//    }
//}
//
//class RestoredObject {
//    constructor(json, translator, jjjWebsocket, deferred, classmap) {
//        this.json = json;
//        this.translator = translator;
//        this.jjjWebsocket = jjjWebsocket;
//        this.deferred = deferred;
//        this.classmap = classmap;
//
//        if (typeof deferred === "undefined") throw new Error("undefined deferred");
//        if (typeof classmap === "undefined") throw new Error("undefined classmap");
//    }
//    decodeField(field, callback) {
//        let decoder = new Decoder(this.json[Constants.FieldsParam][field], this.translator, this.jjjWebsocket, this.deferred, this.classmap);
//        decoder.decode(callback);
//    }
//    toObject(object = null) {
//        let className = this.json[Constants.TypeParam];
//        let aClass = this.classmap.get(className);
//
//        if (typeof aClass === "undefined") throw new Error(`Class ${className} not found`);
//        if (object === null) object = new aClass();
//
//        if (typeof object.constructor.__isTransient !== "function") {
//            window.err = {
//                className : className,
//                aClass : aClass,
//                object : object
//            }
//            throw new Error(`Field '__isTransient' of class '${object.constructor.name}' is not of type function, found type '${typeof object.constructor.__isTransient}'. (see window.err)`);
//        }
//
//        if (this.jjjWebsocket !== null && !object.constructor.__isTransient() && typeof this.json[Constants.KeyParam] !== "undefined") {
//            this.translator.set(this.json[Constants.KeyParam], object);
//
//            /* set websocket so object can call sever methods and vice versa - not applicable to transient objects */
//            object.__jjjWebsocket = this.jjjWebsocket;
//        }
//
//        if (typeof object.__decode === "function") {
//            object.__decode(this, this.translator, this.jjjWebsocket);
//        } else {
//            for (let field in this.json[Constants.FieldsParam]) {
//                this.decodeField(field, (result) => object[field] = result);
//            }
//        }
//
//        return object;
//    }
//}
//
//module.exports = Decoder;