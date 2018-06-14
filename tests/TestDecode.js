let Translator = require("../src/Translator");
let Assert = require("./Assert");
let testObjects = require("./jjjrmi.test");
let Phonetic = require("./jjjrmi.test").Phonetic;

TestDecode = class TestDecode {
	test_field_boolean() {
        let translator = new Translator();
        translator.registerPackage(testObjects);
		let source = new BooleanWrap(true);
		let encoded = translator.encode(source);
        translator.clear();
		let decoded = translator.decode(encoded);
		Assert.notEquals(source, decoded);
		Assert.equals(source.getI(), decoded.getI());
	}
	test_field_byte() {
        let translator = new Translator();
        translator.registerPackage(testObjects);
		let source = new ByteWrap(33);
		let encoded = translator.encode(source);
        translator.clear();
		let decoded = translator.decode(encoded);
		Assert.notEquals(source, decoded);
		Assert.equals(source.getI(), decoded.getI());
	}
	test_field_char() {
        let translator = new Translator();
        translator.registerPackage(testObjects);
		let source = new CharWrap('a');
		let encoded = translator.encode(source);
        translator.clear();
		let decoded = translator.decode(encoded);
		Assert.notEquals(source, decoded);
		Assert.equals(source.getI(), decoded.getI());
	}
	test_field_deep() {
        let translator = new Translator();
        translator.registerPackage(testObjects);
		let nested = new ObjectWrap(new IntegerWrap(50));
		let source = new ObjectWrap(nested);
		let encoded = translator.encode(source);
        translator.clear();
		let decoded = translator.decode(encoded);
		Assert.equals(source.getObject().getObject().getI(), decoded.getObject().getObject().getI());
		Assert.notEquals(source.object, decoded.object);
	}
	test_field_double() {
        let translator = new Translator();
        translator.registerPackage(testObjects);
		let source = new DoubleWrap(1.009);
		let encoded = translator.encode(source);
        translator.clear();
		let decoded = translator.decode(encoded);
		Assert.notEquals(source, decoded);
		Assert.equals(source.getI(), decoded.getI(), 0);
	}
	test_field_enum() {
        let translator = new Translator();
        translator.registerPackage(testObjects);
		let source = new EnumWrap(Phonetic.SIERRA);
		let encoded = translator.encode(source);
        translator.clear();
		let decoded = translator.decode(encoded);
		Assert.notEquals(source, decoded);
		Assert.equals(source.getI(), decoded.getI());
	}
	test_field_float() {
        let translator = new Translator();
        translator.registerPackage(testObjects);
		let source = new FloatWrap(2.1);
		let encoded = translator.encode(source);
        translator.clear();
		let decoded = translator.decode(encoded);
		Assert.notEquals(source, decoded);
		Assert.equals(source.getI(), decoded.getI(), 0);
	}
	test_field_integer() {
        let translator = new Translator();
        translator.registerPackage(testObjects);
		let source = new IntegerWrap(1);
		let encoded = translator.encode(source);
        translator.clear();
		let decoded = translator.decode(encoded);
		Assert.notEquals(source, decoded);
		Assert.equals(source.getI(), decoded.getI());
	}
	test_field_long() {
        let translator = new Translator();
        translator.registerPackage(testObjects);
		let source = new LongWrap(1);
		let encoded = translator.encode(source);
        translator.clear();
		let decoded = translator.decode(encoded);
		Assert.notEquals(source, decoded);
		Assert.equals(source.getI(), decoded.getI());
	}
	test_field_null() {
        let translator = new Translator();
        translator.registerPackage(testObjects);
		let source = new ObjectWrap(null);
		let encoded = translator.encode(source);
        translator.clear();
		let decoded = translator.decode(encoded);
		Assert.notEquals(source, decoded);
		Assert.equals(null, decoded.object);
	}
	test_field_object() {
        let translator = new Translator();
        translator.registerPackage(testObjects);
		let source = new NestedWrap(100);
		let encoded = translator.encode(source);
        translator.clear();
		let decoded = translator.decode(encoded);
		Assert.notEquals(source, decoded);
		Assert.equals(source.booleanWrap.getI(), decoded.booleanWrap.getI());
		Assert.equals(source.byteWrap.getI(), decoded.byteWrap.getI());
		Assert.equals(source.charWrap.getI(), decoded.charWrap.getI());
		Assert.equals(source.doubleWrap.getI(), decoded.doubleWrap.getI());
		Assert.equals(source.floatWrap.getI(), decoded.floatWrap.getI());
		Assert.equals(source.longWrap.getI(), decoded.longWrap.getI());
		Assert.equals(source.shortWrap.getI(), decoded.shortWrap.getI());
		Assert.equals(source.stringWrap.getI(), decoded.stringWrap.getI());
	}
	test_field_repeat() {
        let translator = new Translator();
        translator.registerPackage(testObjects);
		let source = new RepeatField();
		let encoded = translator.encode(source);

        translator.clear();

		let decoded = translator.decode(encoded);
		Assert.notEquals(source, decoded);
		Assert.equals(decoded.booleanWrap1, decoded.booleanWrap2);
	}
	test_field_short() {
        let translator = new Translator();
        translator.registerPackage(testObjects);
        let source = new ShortWrap(1);
		let encoded = translator.encode(source);
        translator.clear();
		let decoded = translator.decode(encoded);
		Assert.notEquals(source, decoded);
		Assert.equals(source.getI(), decoded.getI());
	}
//	test_field_string() {
//		let source = new StringWrap("I am Groot!");
//		let encoded = translator.encode(source);
//		let decoded = translator.decode(encoded);
//		Assert.notEquals(source, decoded);
//		Assert.equals(source.getI(), decoded.getI());
//	}
//	test_field_transient() {
//		/* test field set in construtor doesn't get overwritten */;
//	}
//	test_has_handler() {
//		let translator = new Translator();
//		translator.setHandler(HasHandler.class, new Handles_HasHandler());
//		let source = new HasHandler(new IntegerWrap(5), "GROOOT!");
//		let encoded = translator.encode(source);
//		translator.clear();
//		let decoded = translator.decode(encoded);
//		Assert.equals("GROOOT!", decoded.getString());
//		Assert.equals(decoded, decoded.getMe());
//		let object = decoded.getObject();
//		Assert.equals(5, object.getI());
//	}
//	test_no_retain() {
//		let source = new NoRetain(5);
//		let encoded = translator.encode(source);
//		let translator = new Translator();
//		let decoded = translator.decode(encoded);
//		Assert.notEquals(source, decoded);
//		Assert.equals(source.getI(), decoded.getI());
//		let decodedAgain = translator.decode(encoded);
//		Assert.notEquals(decodedAgain, decoded);
//		Assert.equals(decodedAgain.getI(), decoded.getI());
//	}
//	test_no_retain_self() {
//
//	}
//	test_no_retain_self_deep() {
//
//	}
//	retain00() {
//		let source = new IntegerWrap(5);
//		let encoded = translator.encode(source);
//		let translator = new Translator();
//		let decoded = translator.decode(encoded);
//		Assert.notEquals(source, decoded);
//		Assert.equals(source.getI(), decoded.getI());
//		let decodedAgain = translator.decode(encoded);
//		Assert.equals(decodedAgain, decoded);
//		Assert.equals(decodedAgain.getI(), decoded.getI());
//	}
//	retain01() {
//		let translator = new Translator();
//		let integerWrap = new IntegerWrap(5);
//		let objectWrap = new ObjectWrap(integerWrap);
//		let encodedIW = translator.encode(integerWrap);
//		let encodedOW = translator.encode(objectWrap);
//		translator.clear();
//		let decodedIW = translator.decode(encodedIW);
//		let decodedOW = translator.decode(encodedOW);
//		Assert.equals(decodedIW, decodedOW.getObject());
//	}
//	test_self_handler() {
//		let translator = new Translator();
//		let source = new HandlesSelf(new IntegerWrap(5), "GROOOT!");
//		let encoded = translator.encode(source);
//		translator.clear();
//		let decoded = translator.decode(encoded);
//		Assert.equals("GROOOT!", decoded.getString());
//		let object = decoded.getObject();
//		Assert.equals(5, object.getI());
//	}
};

module.exports = TestDecode;