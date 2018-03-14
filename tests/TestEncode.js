require('rootpath')();
let Constants = require("src/Constants");
let Translator = require("src/Translator");
let Assert = require("tests/Assert");
let HasHandler = require("tests/jjjrmi.test").HasHandler;
let Handles_HasHandler = require("tests/jjjrmi.test").Handles_HasHandler;
let Phonetic = require("tests/jjjrmi.test").Phonetic;

TestEncode = class TestEncode {
	test_field_array(assert) {
		let translator = new Translator();

		let array = [];
		for(let i = 0; i < 10; i++)array[i] = 2 * i;

        let source = new ObjectWrap(array);
		let encoded = translator.encode(source);
		Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.ObjectWrap", encoded[Constants.TypeParam]);

		let fields = encoded[Constants.FieldsParam];
		let field_object = fields["object"];
		Assert.true(typeof field_object[Constants.ElementsParam] !== "undefined");
		Assert.equals(10, field_object[Constants.ElementsParam].length);
		let jsonArray = field_object[Constants.ElementsParam];
		for(let i = 0; i < 10; i++)Assert.equals(i * 2, jsonArray[i][Constants.ValueParam]);
	}

	test_field_assigned(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new IntegerWrapAssigned());
		Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.IntegerWrapAssigned", encoded[Constants.TypeParam]);
		let fields = encoded[Constants.FieldsParam];
		let field_i = fields["i"];
		Assert.equals(Constants.PrimativeTypeNumber, field_i[Constants.PrimitiveParam]);
		Assert.equals(5, field_i[Constants.ValueParam]);
	}
	test_field_boolean(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new BooleanWrap(true));
		Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.BooleanWrap", encoded[Constants.TypeParam]);
        let fields = encoded[Constants.FieldsParam];
		let field_i = fields["i"];

        let c = 0;
        for (let f in fields) c++;
		Assert.equals(1, c);

		Assert.equals(Constants.PrimativeTypeBoolean, field_i[Constants.PrimitiveParam]);
		Assert.equals(true, field_i[Constants.ValueParam]);
	}
	test_field_byte(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new ByteWrap((33)));
		Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.ByteWrap", encoded[Constants.TypeParam]);
		let fields = encoded[Constants.FieldsParam];

        let c = 0;
        for (let f in fields) c++;
		Assert.equals(1, c);

		let field_i = fields["i"];
		Assert.equals(Constants.PrimativeTypeNumber, field_i[Constants.PrimitiveParam]);
		Assert.equals((33), field_i[Constants.ValueParam]);
	}
	test_field_char(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new CharWrap('a'));
		Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.CharWrap", encoded[Constants.TypeParam]);
		let fields = encoded[Constants.FieldsParam];

        let c = 0;
        for (let f in fields) c++;
		Assert.equals(1, c);

		let field_i = fields["i"];
		Assert.equals(Constants.PrimativeTypeString, field_i[Constants.PrimitiveParam]);
		Assert.equals('a', field_i[Constants.ValueParam]);
	}
	test_field_double(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new DoubleWrap(1.009));
		Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.DoubleWrap", encoded[Constants.TypeParam]);
		let fields = encoded[Constants.FieldsParam];

        let c = 0;
        for (let f in fields) c++;
		Assert.equals(1, c);

		let field_i = fields["i"];
		Assert.equals(Constants.PrimativeTypeNumber, field_i[Constants.PrimitiveParam]);
		Assert.equals(1.009, field_i[Constants.ValueParam]);
	}
	test_field_enum(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new EnumWrap(Phonetic.OSCAR));
		Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.EnumWrap", encoded[Constants.TypeParam]);
		let fields = encoded[Constants.FieldsParam];

        let c = 0;
        for (let f in fields) c++;
		Assert.equals(1, c);

		let field_i = fields["i"];
		Assert.true(typeof field_i[Constants.ValueParam] !== "undefined");
		Assert.true(typeof field_i[Constants.EnumParam] !== "undefined");
		Assert.equals(Phonetic.OSCAR.toString(), field_i[Constants.ValueParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.Phonetic", field_i[Constants.EnumParam]);
	}
	test_field_float(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new FloatWrap(2.1));
		Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.FloatWrap", encoded[Constants.TypeParam]);
		let fields = encoded[Constants.FieldsParam];

        let c = 0;
        for (let f in fields) c++;
		Assert.equals(1, c);

		let field_i = fields["i"];
		Assert.equals(Constants.PrimativeTypeNumber, field_i[Constants.PrimitiveParam]);
		Assert.equals(2.1, field_i[Constants.ValueParam], 0.001);
	}
	test_field_integer(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new IntegerWrap(1));
		Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.IntegerWrap", encoded[Constants.TypeParam]);
		let fields = encoded[Constants.FieldsParam];

        let c = 0;
        for (let f in fields) c++;
		Assert.equals(1, c);

		let field_i = fields["i"];
		Assert.equals(Constants.PrimativeTypeNumber, field_i[Constants.PrimitiveParam]);
		Assert.equals(1, field_i[Constants.ValueParam]);
	}
	test_field_long(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new LongWrap((1)));
		Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.LongWrap", encoded[Constants.TypeParam]);
		let fields = encoded[Constants.FieldsParam];

        let c = 0;
        for (let f in fields) c++;
		Assert.equals(1, c);

		let field_i = fields["i"];
		Assert.equals(Constants.PrimativeTypeNumber, field_i[Constants.PrimitiveParam]);
		Assert.equals((1), field_i[Constants.ValueParam]);
	}
	test_field_null(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new ObjectWrap(null));
		Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.ObjectWrap", encoded[Constants.TypeParam]);
		let fields = encoded[Constants.FieldsParam];
		let field_object = fields["object"];
		Assert.equals(Constants.NullValue, field_object[Constants.TypeParam]);
	}
	test_field_object(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new NestedWrap());

        Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.NestedWrap", encoded[Constants.TypeParam]);
		let fields = encoded[Constants.FieldsParam];

        let c = 0;
        for (let f in fields) c++;
		Assert.equals(8, c);
	}
	test_field_repeat(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new RepeatField());

		let fields = encoded[Constants.FieldsParam];
		let field_1 = fields["booleanWrap1"];
		let field_2 = fields["booleanWrap2"];
		Assert.equals("C1", field_1[Constants.KeyParam]);
		Assert.equals("C1", field_2[Constants.PointerParam]);
	}
	test_field_short(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new ShortWrap((1)));
		Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.ShortWrap", encoded[Constants.TypeParam]);
		let fields = encoded[Constants.FieldsParam];

        let c = 0;
        for (let f in fields) c++;
		Assert.equals(1, c);

		let field_i = fields["i"];
		Assert.equals(Constants.PrimativeTypeNumber, field_i[Constants.PrimitiveParam]);
		Assert.equals((1), field_i[Constants.ValueParam]);
	}
	test_field_string(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new StringWrap("I am Groot!"));
		Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.StringWrap", encoded[Constants.TypeParam]);
		let fields = encoded[Constants.FieldsParam];

        let c = 0;
        for (let f in fields) c++;
		Assert.equals(1, c);

		let field_i = fields["i"];
		Assert.equals(Constants.PrimativeTypeString, field_i[Constants.PrimitiveParam]);
		Assert.equals("I am Groot!", field_i[Constants.ValueParam]);
	}

	test_has_handler(assert) {
		let translator = new Translator();
		translator.setHandler(HasHandler, new Handles_HasHandler());

		let object = new HasHandler(new IntegerWrap(5), "I am Groot!");
		let encoded = translator.encode(object);
		let fields = encoded[Constants.FieldsParam];

        let c = 0;
        for (let f in fields) c++;
		Assert.equals(3, c);

        Assert.true(typeof fields["objectField"] !== "undefined");
		Assert.true(typeof fields["stringField"] !== "undefined");
		Assert.true(typeof fields["this"] !== "undefined");
		Assert.equals("C0", fields["this"][Constants.PointerParam]);
	}

    test_no_retain(assert) {
		let translator = new Translator();
		let integerWrap = new NoRetain(5);
		let encoded1 = translator.encode(integerWrap);
		let encoded2 = translator.encode(integerWrap);

		Assert.true(typeof encoded2[Constants.PointerParam] === "undefined");

		/* Assert.equals("C0", encoded2.getString(Constants.KeyParam)); */;
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.NoRetain", encoded2[Constants.TypeParam]);

		let fields = encoded2[Constants.FieldsParam];

        let c = 0;
        for (let f in fields) c++;
		Assert.equals(1, c);

		let field_i = fields["i"];
		Assert.equals(Constants.PrimativeTypeNumber, field_i[Constants.PrimitiveParam]);
		Assert.equals(5, field_i[Constants.ValueParam]);
	}


	test_no_retain_self(assert) {
		let translator = new Translator();
		let integerWrap = new NoRetainSelf();

		let encoded1 = translator.encode(integerWrap);
		let encoded2 = translator.encode(integerWrap);

		Assert.true(typeof encoded1[Constants.PointerParam] === "undefined");
		Assert.true(typeof encoded1[Constants.KeyParam] !== "undefined");
		Assert.true(typeof encoded2[Constants.PointerParam] === "undefined");
		Assert.true(typeof encoded2[Constants.KeyParam] !== "undefined");

		let fields = encoded2[Constants.FieldsParam];
		let key = encoded2[Constants.KeyParam];
		let ptr = fields["me"][Constants.PointerParam];
		Assert.equals(key, ptr);
	}

	test_no_retain_self_deep(assert) {
		let translator = new Translator();
		let object = new NoRetainSelfDeep();
		let encoded1 = translator.encode(object);
		let encoded2 = translator.encode(object);

		let first = encoded2[Constants.FieldsParam]["first"];
		let second = encoded2[Constants.FieldsParam]["second"];

		Assert.false(typeof first[Constants.PointerParam] !== "undefined");
		Assert.true(typeof first[Constants.KeyParam] !== "undefined");

		let fields = first[Constants.FieldsParam];
		let key = first[Constants.KeyParam];
		let ptr = fields["me"][Constants.PointerParam];

		Assert.equals(key, ptr);
		Assert.equals(key, second[Constants.PointerParam]);
	}

	test_retain(assert) {
		let translator = new Translator();
		let integerWrap = new IntegerWrap(5);
		let encoded1 = translator.encode(integerWrap);
		let encoded2 = translator.encode(integerWrap);
		Assert.true(typeof encoded2[Constants.PointerParam] !== null);
		Assert.equals("C0", encoded2[Constants.PointerParam]);
	}

    test_self_handler(assert) {
		let translator = new Translator();
		let object = new HandlesSelf(new IntegerWrap(5), "I am Groot!");
		let encoded = translator.encode(object);
		let fields = encoded[Constants.FieldsParam];

        let c = 0;
        for (let f in fields) c++;
		Assert.equals(3, c);

		Assert.true(typeof fields["stringField"] !== "undefined");
		Assert.true(typeof fields["objectField"] !== "undefined");
		Assert.true(typeof fields["this"] !== "undefined");
		Assert.equals("C0", fields["this"][Constants.PointerParam]);
	}

	test_setFieldNull(assert) {
		let translator = new Translator();
		let encoded = translator.encode(new HandlesSelf(null, "I am Groot!"));
		Assert.equals("C0", encoded[Constants.KeyParam]);
		Assert.equals("ca.fa.jjjrmi.tests.translator.classes.HandlesSelf", encoded[Constants.TypeParam]);
	}
};
module.exports = TestEncode;