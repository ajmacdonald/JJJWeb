/* global Constants */
let Constants = require("./Constants");

class Encoder {
    constructor(object, translator, keys) {
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
        /* is Enum */
        else if (this.object.constructor.__isEnum()) {
            return new EncodedEnum(this.object, this.translator, this.keys).toJSON();
        }
        /* handler has been registered */
        else if (this.translator.hasHandler(this.object.constructor)){
            let handler = this.translator.getHandler(this.object.constructor);
            let encodedObject = new EncodedObject(this.object, this.translator, this.keys);
            handler.encode(encodedObject, this.object);
            return encodedObject.toJSON();
        }
        /* object handles it's self */
        else if (typeof this.object["encode"] === "function"){
            let encodedObject = new EncodedObject(this.object, this.translator, this.keys);
            this.object.encode(encodedObject);
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
            parent.push(new Encoder(element, this.translator, this.keys).encode());
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

    encode(){
        for (let field in this.object) {
            this.setField(field, this.object[field]);
        }
        return this.json;
    }

    setField(name, value) {
        this.json[Constants.FieldsParam][name] = new Encoder(value, this.translator, this.keys).encode();
    }

    toJSON() {
        return this.json;
    }
}

module.exports = Encoder;