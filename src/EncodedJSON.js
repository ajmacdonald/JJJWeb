class EncodedJSON{
    constructor(json){
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