let jjjrmi = {};
Translator = class Translator {
	constructor() {
		this.handlers = new HashMap();
		this.encodeListeners = new ArrayList();
		this.decodeListeners = new ArrayList();
		this.objectMap = new BiMap();
		this.tempReferences = new ArrayList();
		this.nextKey = 0;
		this.setHandler(ArrayList.class, new ArrayListHandler());
		this.setHandler(HashMap.class, new HashMapHandler());
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.Translator";
	}
	static __isEnum() {
		return false;
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
		return "S" + this.nextKey++;
	}
	clear() {
		let values = this.objectMap.values().toArray();
		this.objectMap.clear();
		return values;
	}
	clearHandler(aClass) {
		this.handlers.remove(aClass.getCanonicalName());
	}
	clearHandler(canonicalName) {
		this.handlers.remove(canonicalName);
	}
	clearTempReferences() {
		for(let ref of this.tempReferences){
			this.removeByKey(ref);
		}
		this.tempReferences.clear();
	}
	decode(json) {
		let jsonObject = new EncodedJSON(this, json);
		return this.decode(jsonObject);
	}
	decode(json) {
		let toObject = new Decoder(json, this).toObject();
		this.clearTempReferences();
		return toObject;
	}
	encode(object) {
		let toJSON = new Encoder(object, this).toJSON();
		this.clearTempReferences();
		return toJSON;
	}
	getAllReferredObjects() {
		let values = this.objectMap.values();
		return new ArrayList(values);
	}
	getHandler(aClass) {
		return this.handlers.get(aClass.getCanonicalName());
	}
	getHandler(canonicalName) {
		return this.handlers.get(canonicalName);
	}
	getReference(object) {
		return this.objectMap.getKey(object);
	}
	getReferredObject(reference) {
		return this.objectMap.get(reference);
	}
	hasHandler(aClass) {
		return this.handlers.containsKey(aClass.getCanonicalName());
	}
	hasHandler(canonicalName) {
		return this.handlers.containsKey(canonicalName);
	}
	hasReference(reference) {
		return this.objectMap.containsKey(reference);
	}
	hasReferredObject(object) {
		return this.objectMap.containsValue(object);
	}
	notifyDecode(object) {
		for(let decodeListener of this.decodeListeners){
			decodeListener.accept(object);
		}
	}
	notifyEncode(object) {
		for(let encodeListener of this.encodeListeners){
			encodeListener.accept(object);
		}
	}
	removeByKey(key) {
		if (!this.objectMap.containsKey(key))return false;
		
		this.objectMap.remove(key);
		return true;
	}
	removeByValue(obj) {
		if (!this.objectMap.containsValue(obj))return false;
		
		this.objectMap.remove(this.objectMap.getKey(obj));
		return true;
	}
	setHandler(aClass, handler) {
		this.handlers.put(aClass.getCanonicalName(), handler);
	}
	setHandler(canonicalName, handler) {
		this.handlers.put(canonicalName, handler);
	}
};
jjjrmi.Translator = Translator;
RestoredObject = class RestoredObject {
	constructor(json, translator) {
		this.json = json;
		this.listener = translator;
		this.translator = translator;
		this.fields = json.getJSONObject(Constants.FieldsParam);
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.RestoredObject";
	}
	static __isEnum() {
		return false;
	}
	decodeField(name) {
		return this.translator.decode(this.fields.getJSONObject(name));
	}
	getField(name) {
		return this.fields.getJSONObject(name);
	}
	getJavaField(aClass, name) {
		while(aClass !== Object.class){
			for(let field of aClass.getDeclaredFields()){
				if (field.getName() === name)return field;
				
			}
			aClass = aClass.getSuperclass();
		}
		return null;
	}
	getType() {
		return this.json.getString(Constants.TypeParam);
	}
	toObject() {
		let aClass = Class.forName(this.json.getString(Constants.TypeParam));
		let newInstance;
		if (this.json.has(Constants.KeyParam) && this.translator.hasReference(this.json.getString(Constants.KeyParam)))newInstance = this.translator.getReferredObject(this.json.getString(Constants.KeyParam));
		else {
			let constructor = aClass.getDeclaredConstructor();
			constructor.setAccessible(true);
			newInstance = constructor.newInstance();
			let jjjOptions = new JJJOptionsHandler(aClass);
			if (jjjOptions.retain())this.translator.addReference(this.json.get(Constants.KeyParam).toString(), newInstance);
			else this.translator.addTempReference(this.json.get(Constants.KeyParam).toString(), newInstance);
			
			for(let name of this.fields.keySet()){
				let jsonField = new EncodedJSON(this.translator, this.fields.getJSONObject(name).toString());
				let field = this.getJavaField(aClass, name);
				if (field === null)throw new Error("java.lang.RuntimeException");
				
				let fieldValue = new Decoder(jsonField, this.translator).toObject(field.getType());
				field.setAccessible(true);
				field.set(newInstance, fieldValue);
			}
		}
		this.listener.notifyDecode(newInstance);
		return newInstance;
	}
	toString() {
		return this.json.toString();
	}
	toString(indent) {
		return this.json.toString(indent);
	}
};
jjjrmi.RestoredObject = RestoredObject;
RestoredArray = class RestoredArray {
	constructor(json, translator) {
		this.json = json;
		this.tListn = translator;
		this.translator = translator;
		this.elements = json.getJSONArray(Constants.ElementsParam);
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.RestoredArray";
	}
	static __isEnum() {
		return false;
	}
	decodeObjectElement(i) {
		let get = this.elements.getJSONObject(i);
		return new Decoder(get, this.translator).toObject(this.componentClass);
	}
	getArrayElement(i) {
		return new RestoredArray(this.elements.getJSONObject(i), this.translator);
	}
	getObjectElement(i) {
		return new RestoredObject(this.elements.getJSONObject(i), this.translator);
	}
	instantiateArray(aClass, size) {
		let depth = 0;
		let current = aClass;
		while(current.isArray()){
			depth++;
			current = current.getComponentType();
		}
		if (depth === 0)depth = 1;
		
		let dims = new Array(depth);
		dims[0] = size;
		switch (current.getCanonicalName()){
			case "boolean": {
				this.componentClass = Boolean.TYPE;
				break;
			}
			case "byte": {
				this.componentClass = Byte.TYPE;
				break;
			}
			case "char": {
				this.componentClass = Character.TYPE;
				break;
			}
			case "short": {
				this.componentClass = Short.TYPE;
				break;
			}
			case "long": {
				this.componentClass = Long.TYPE;
				break;
			}
			case "float": {
				this.componentClass = Float.TYPE;
				break;
			}
			case "double": {
				this.componentClass = Double.TYPE;
				break;
			}
			case "int": {
				this.componentClass = Integer.TYPE;
				break;
			}
			default: {
				this.componentClass = current;
				break;
			}
		}
		return Array.newInstance(this.componentClass, dims);
	}
	length() {
		return this.elements.length();
	}
	restore(arrayInstance) {
		for(let i = 0; i < this.elements.length(); i++){
			let element = this.elements.get(i);
			let decodedElement = new Decoder(element, this.translator).toObject(this.componentClass);
			Array.set(arrayInstance, i, decodedElement);
		}
	}
	toObject() {
		let newInstance = this.instantiateArray(Object.class, this.json.getJSONArray(Constants.ElementsParam).length());
		this.restore(newInstance);
		return newInstance;
	}
	toObject(aClass) {
		let newInstance = this.instantiateArray(aClass, this.json.getJSONArray(Constants.ElementsParam).length());
		this.restore(newInstance);
		return newInstance;
	}
};
jjjrmi.RestoredArray = RestoredArray;
MethodOverloadException = class MethodOverloadException {
	constructor(aClass, methodName) {
		this.aClass = aClass;
		this.methodName = methodName;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.MethodOverloadException";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.MethodOverloadException = MethodOverloadException;
EncoderException = class EncoderException {
	constructor(message, object) {
		this.object = object;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.EncoderException";
	}
	static __isEnum() {
		return false;
	}
	getObject() {
		return this.object;
	}
};
jjjrmi.EncoderException = EncoderException;
Encoder = class Encoder {
	constructor(object, translator) {
		this.object = object;
		this.translator = translator;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.Encoder";
	}
	static __isEnum() {
		return false;
	}
	toJSON() {
		if (this.object === null)return new EncodedNull();
		else if (ClassUtils.isPrimitiveWrapper(this.object.getClass()) | this.object.getClass().isPrimitive() || this.object.getClass() === String.class)return new EncodedPrimitive(this.object);
		else if (this.translator.hasReferredObject(this.object))return new EncodedReference(this.translator.getReference(this.object));
		else if (this.object.getClass().isArray())return new EncodedArray(this.object, this.translator);
		else if (this.object.getClass().isEnum())return new EncodedEnum(this.object);
		else if (this.object instanceof SelfHandler){
			let encodedObject = new EncodedObject(this.object, this.translator);
			let handler = this.object;
			handler.encode(encodedObject);
			return encodedObject;
		}else if (this.translator.hasHandler(this.object.getClass())){
			let encodedObject = new EncodedObject(this.object, this.translator);
			let handler = this.translator.getHandler(this.object.getClass());
			handler.encode(encodedObject, this.object);
			return encodedObject;
		}else {
			let encodedObject = new EncodedObject(this.object, this.translator);
			encodedObject.encode();
			return encodedObject;
		}
	}
};
jjjrmi.Encoder = Encoder;
EncodedReference = class EncodedReference {
	constructor(ref) {
		this.put(Constants.PointerParam, ref);
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.EncodedReference";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.EncodedReference = EncodedReference;
EncodedPrimitive = class EncodedPrimitive {
	constructor(value) {
		this.put(Constants.ValueParam, value);
		switch (value.getClass().getCanonicalName()){
			case "java.lang.String": {
				this.put(Constants.PrimitiveParam, Constants.PrimativeTypeString);
				break;
			}
			case "java.lang.Boolean": {
				this.put(Constants.PrimitiveParam, Constants.PrimativeTypeBoolean);
				break;
			}
			case "java.lang.Byte": {
				this.put(Constants.PrimitiveParam, Constants.PrimativeTypeNumber);
				break;
			}
			case "java.lang.Character": {
				this.put(Constants.PrimitiveParam, Constants.PrimativeTypeString);
				break;
			}
			case "java.lang.Short": {
				this.put(Constants.PrimitiveParam, Constants.PrimativeTypeNumber);
				break;
			}
			case "java.lang.Long": {
				this.put(Constants.PrimitiveParam, Constants.PrimativeTypeNumber);
				break;
			}
			case "java.lang.Float": {
				this.put(Constants.PrimitiveParam, Constants.PrimativeTypeNumber);
				break;
			}
			case "java.lang.Double": {
				this.put(Constants.PrimitiveParam, Constants.PrimativeTypeNumber);
				break;
			}
			case "java.lang.Integer": {
				this.put(Constants.PrimitiveParam, Constants.PrimativeTypeNumber);
				break;
			}
		}
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.EncodedPrimitive";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.EncodedPrimitive = EncodedPrimitive;
EncodedObject = class EncodedObject {
	constructor(object, translator) {
		this.object = object;
		this.fields = new JSONObject();
		this.tListn = translator;
		this.keys = translator;
		let jjjOptions = new JJJOptionsHandler(object);
		this.put(Constants.KeyParam, this.keys.allocNextKey());
		if (jjjOptions.retain())translator.addReference(this.get(Constants.KeyParam).toString(), object);
		else translator.addTempReference(this.get(Constants.KeyParam).toString(), object);
		
		this.put(Constants.TypeParam, object.getClass().getName());
		this.put(Constants.FieldsParam, this.fields);
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.EncodedObject";
	}
	static __isEnum() {
		return false;
	}
	encode() {
		let aClass = this.object.getClass();
		let jjjOptions = new JJJOptionsHandler(aClass);
		if (!jjjOptions.hasJJJ()){
			let message = String.format("Attempt to encode base class '%s' without @JJJ annotation", aClass.getSimpleName());
			throw new Error("ca.fa.jjjrmi.translator.EncoderException");
		}
		while(new JJJOptionsHandler(aClass).hasJJJ()){
			let declaredFields = aClass.getDeclaredFields();
			for(let field of declaredFields){
				field.setAccessible(true);
				if (field.getAnnotation(Transient.class) !== null)continue;
				
				if (Modifier.isStatic(field.getModifiers()))continue;
				
				this.setField(field.getName(), field.get(this.object));
			}
			aClass = aClass.getSuperclass();
		}
		this.tListn.notifyEncode(this.object);
	}
	setField(name, value) {
		let toJSON = new Encoder(value, this.translator).toJSON();
		this.fields.put(name, toJSON);
	}
	setField(name, json) {
		this.fields.put(name, json);
	}
};
jjjrmi.EncodedObject = EncodedObject;
EncodedNull = class EncodedNull {
	constructor() {
		this.put(Constants.TypeParam, Constants.NullValue);
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.EncodedNull";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.EncodedNull = EncodedNull;
EncodedJSON = class EncodedJSON {
	constructor(translator, jsonString) {
		this.translator = translator;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.EncodedJSON";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.EncodedJSON = EncodedJSON;
EncodedEnum = class EncodedEnum {
	constructor(value) {
		let jjjOptions = new JJJOptionsHandler(value);
		if (!jjjOptions.hasJJJ()){
			let message = String.format("Attempt to encode enum '%s' without @JJJ annotation", value.getClass().getSimpleName());
			throw new Error("ca.fa.jjjrmi.translator.EncoderException");
		}
		this.put(Constants.EnumParam, value.getClass().getName());
		this.put(Constants.ValueParam, value.toString());
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.EncodedEnum";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.EncodedEnum = EncodedEnum;
EncodedArray = class EncodedArray {
	constructor(object, translator) {
		this.object = null;
		this.object = object;
		this.elements = new JSONArray();
		this.put(Constants.ElementsParam, this.elements);
		this.encode();
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.EncodedArray";
	}
	static __isEnum() {
		return false;
	}
	encode() {
		for(let i = 0; i < Array.getLength(this.object); i++){
			let element = Array.get(this.object, i);
			this.elements.put(new Encoder(element, this.translator).toJSON());
		}
	}
};
jjjrmi.EncodedArray = EncodedArray;
Decoder = class Decoder {
	constructor(json, translator) {
		if (json.keySet().isEmpty())throw new Error("java.lang.RuntimeException");
		
		this.json = json;
		this.translator = translator;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.Decoder";
	}
	static __isEnum() {
		return false;
	}
	toObject() {
		return this.toObject(null);
	}
	toObject(expectedType) {
		/* the value is a primative, check expected type */;
		/* expected type not found, refer to primitive type */;
		if (this.json.has(Constants.TypeParam) && this.json.getString(Constants.TypeParam) === Constants.NullValue)return null;
		else if (this.json.has(Constants.PointerParam))return this.translator.getReferredObject(this.json.get(Constants.PointerParam).toString());
		else if (this.json.has(Constants.EnumParam)){
			let aClass = this.getClass().getClassLoader().loadClass(this.json.get(Constants.EnumParam));
			let value = this.json.get(Constants.ValueParam).toString();
			return Enum.valueOf(aClass, value);
		}else if (this.json.has(Constants.ValueParam)){
			if (expectedType !== null)switch (expectedType.getCanonicalName()){
				case "java.lang.String": return this.json.get(Constants.ValueParam).toString();
				
				case "boolean": ;
				case "java.lang.Boolean": return this.json.getBoolean(Constants.ValueParam);
				
				case "byte": ;
				case "java.lang.Byte": {
					let bite = this.json.getInt(Constants.ValueParam);
					return bite.byteValue();
				}
				case "char": ;
				case "java.lang.Character": return this.json.get(Constants.ValueParam).toString().charAt(0);
				
				case "short": ;
				case "java.lang.Short": {
					let shirt = this.json.getInt(Constants.ValueParam);
					return shirt.shortValue();
				}
				case "long": ;
				case "java.lang.Long": return this.json.getLong(Constants.ValueParam);
				
				case "float": ;
				case "java.lang.Float": {
					let d = this.json.getDouble(Constants.ValueParam);
					return d.floatValue();
				}
				case "double": ;
				case "java.lang.Double": return this.json.getDouble(Constants.ValueParam);
				
				case "int": ;
				case "java.lang.Integer": return this.json.getInt(Constants.ValueParam);
				
			}
			
			let primitive = this.json.get(Constants.PrimitiveParam).toString();
			let value = this.json.get(Constants.ValueParam).toString();
			let scanner = new Scanner(value);
			switch (primitive){
				case "number": {
					if (scanner.hasNextInt())return scanner.nextInt();
					
					if (scanner.hasNextDouble())return scanner.nextDouble();
					
					break;
				}
				case "string": return value;
				
				case "boolean": {
					if (scanner.hasNextBoolean())return scanner.nextBoolean();
					
					break;
				}
			}
		}else if (this.json.has(Constants.ElementsParam)){
			if (expectedType === null)expectedType = Object.class;
			
			return new RestoredArray(this.json, this.translator).toObject(expectedType);
		}else if (this.json.has(Constants.FieldsParam)){
			let restoredObject = new RestoredObject(this.json, this.translator);
			if (this.translator.hasHandler(restoredObject.getType())){
				let handler = this.translator.getHandler(restoredObject.getType());
				return handler.decode(restoredObject);
			}else return restoredObject.toObject();
			
		}
		
		
		
		
		
		Console.warn(this.json);
		throw new Error("java.lang.RuntimeException");
	}
};
jjjrmi.Decoder = Decoder;
Constants = class Constants {
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
jjjrmi.Constants = Constants;
ServerSideExceptionMessage = class ServerSideExceptionMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.ServerSideExceptionMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.ServerSideExceptionMessage = ServerSideExceptionMessage;
ServerResponseMessage = class ServerResponseMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.ServerResponseMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.ServerResponseMessage = ServerResponseMessage;
RejectedConnectionMessage = class RejectedConnectionMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.RejectedConnectionMessage";
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
		return "ca.fa.jjjrmi.socket.message.ReadyMessage";
	}
	static __isEnum() {
		return false;
	}
	getRoot() {
		return this.root;
	}
};
jjjrmi.ReadyMessage = ReadyMessage;
RMIMessageType = class RMIMessageType {
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
		return "ca.fa.jjjrmi.socket.message.RMIMessageType";
	}
	static __isEnum() {
		return true;
	}
};
RMIMessageType.valueArray = [];
RMIMessageType.valueArray.push(RMIMessageType.LOCAL = new RMIMessageType("LOCAL"));
RMIMessageType.valueArray.push(RMIMessageType.REMOTE = new RMIMessageType("REMOTE"));
RMIMessageType.valueArray.push(RMIMessageType.READY = new RMIMessageType("READY"));
RMIMessageType.valueArray.push(RMIMessageType.LOAD = new RMIMessageType("LOAD"));
RMIMessageType.valueArray.push(RMIMessageType.EXCEPTION = new RMIMessageType("EXCEPTION"));
RMIMessageType.valueArray.push(RMIMessageType.FORGET = new RMIMessageType("FORGET"));
RMIMessageType.valueArray.push(RMIMessageType.REJECTED_CONNECTION = new RMIMessageType("REJECTED_CONNECTION"));
RMIMessageType.values = function(){return RMIMessageType.valueArray;};
jjjrmi.RMIMessageType = RMIMessageType;
RMIMessage = class RMIMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.RMIMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.RMIMessage = RMIMessage;
MethodResponse = class MethodResponse {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.MethodResponse";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.MethodResponse = MethodResponse;
MethodRequest = class MethodRequest {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.MethodRequest";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.MethodRequest = MethodRequest;
InvocationResponseCode = class InvocationResponseCode {
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
		return "ca.fa.jjjrmi.socket.message.InvocationResponseCode";
	}
	static __isEnum() {
		return true;
	}
};
InvocationResponseCode.valueArray = [];
InvocationResponseCode.valueArray.push(InvocationResponseCode.FAILED = new InvocationResponseCode("FAILED"));
InvocationResponseCode.valueArray.push(InvocationResponseCode.SUCCESS = new InvocationResponseCode("SUCCESS"));
InvocationResponseCode.values = function(){return InvocationResponseCode.valueArray;};
jjjrmi.InvocationResponseCode = InvocationResponseCode;
InvocationResponse = class InvocationResponse {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.InvocationResponse";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.InvocationResponse = InvocationResponse;
ForgetMessage = class ForgetMessage {
	constructor() {
		
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.ForgetMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.ForgetMessage = ForgetMessage;
ClientRequestMessage = class ClientRequestMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.ClientRequestMessage";
	}
	static __isEnum() {
		return false;
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
		return "ca.fa.jjjrmi.socket.message.ClientMessageType";
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
		return "ca.fa.jjjrmi.socket.message.ClientMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.ClientMessage = ClientMessage;

if (typeof module !== "undefined") module.exports = jjjrmi;