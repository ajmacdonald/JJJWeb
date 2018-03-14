let Encoder = require("./Encoder");
let Decoder = require("./Decoder");
let ArrayList = require("./java-equiv/ArrayList");

class BiMap {
    constructor() {
        this.objectMap = new Map();
        this.reverseMap = new Map();
    }
    clear(){
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
    set(key, value) {
        this.objectMap.set(key, value);
        this.reverseMap.set(value, key);
    }
    getKey(value) {
        return this.reverseMap.get(value);
    }
    has(key) {
        return this.objectMap.has(key);
    }
    hasValue(value) {
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

class Translator {
    constructor(classmap = null, jjjWebsocket = null) {
        this.objectMap = new BiMap();
        this.handlerMap = new Map();
        this.tempReferences = new ArrayList();
        this.next = -1;
        this.jjjWebsocket = jjjWebsocket;
        this.deferred = [];

        if (classmap !== null) this.classmap = classmap;
        else this.classmap = new Map();

        if (typeof classmap === "undefined") throw new Error("undefined classmap");
    }
    clear(){
        this.objectMap.clear();
        this.tempReferences.clear();
    }
    set(key, obj) {
        this.objectMap.set(key, obj);
    }
    setTemp(key, obj) {
        this.objectMap.set(key, obj);
        this.tempReferences.add(key);
    }
    get(key) {
        return this.objectMap.get(key);
    }
    clearTemp() {
        for (let key of this.tempReferences) {
            this.objectMap.removeByKey(key);
        }
        this.tempReferences.clear();
    }
    removeObject(obj) {
        this.objectMap.removeByValue(obj);
    }
    removeKey(key) {
        this.objectMap.removeByKey(key);
    }
    encode(object) {
        let encoded = new Encoder(object, this, this).encode();
        this.clearTemp();
        return encoded;
    }
    decode(jsonObject) {
        console.log("translator.decode");
        let result = undefined;
        new Decoder(jsonObject, this, this.jjjWebsocket, this.deferred, this.classmap).decode((r) => result = r);

        while (this.deferred.length > 0) {
            let defItem = this.deferred.shift();
            defItem.decoder.decode(defItem.callback);
        }

        this.clearTemp();
        return result;
    }
    has(key) {
        return this.objectMap.has(key);
    }
    hasValue(value) {
        return this.objectMap.hasValue(value);
    }
    hasObject(obj) {
        return this.objectMap.hasValue(obj);
    }
    getObject(key) {
        return this.objectMap.get(key);
    }
    getKey(obj) {
        return this.objectMap.getKey(obj);
    }
    allocNextKey() {
        this.next++;
        return "C" + this.next;
    }
    /* remove target form he translator replacing it with source, maintaining the same key */
    swap(source, target) {
        this.objectMap.swap(source, target);
    }

    registerPackage(pkg){
        for (let aClass in pkg) this.registerClass(pkg[aClass]);
    }

    registerClass(aClass) {
        if (typeof aClass !== "function") throw new Error(`paramater 'class' of method 'registerClass' is '${typeof aClass.__getClass}', expected 'function'`);
        if (typeof aClass.__getClass !== "function") throw new Error(`in Class ${aClass.constructor.name} method __getClass of type ${typeof aClass.__getClass}`);
        this.classmap.set(aClass.__getClass(), aClass);
    }

    setHandler(aClass, handler){
        if (typeof aClass !== "function") throw new Error(`paramater 'class' of method 'registerClass' is '${typeof aClass.__getClass}', expected 'function'`);
        if (typeof aClass.__getClass !== "function") throw new Error(`in Class ${aClass.constructor.name} method __getClass of type ${typeof aClass.__getClass}`);
        this.handlerMap.set(aClass.__getClass(), handler);
    }

    hasHandler(object){
        return this.handlerMap.has(object.constructor.__getClass());
    }

    getHandler(object){
        return this.handlerMap.get(object.constructor.__getClass());
    }
}

module.exports = Translator;