let jjjtest = {};
TransientField = class TransientField {
	constructor(i) {
		this.i = i;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.TransientField";
	}
	static __isEnum() {
		return false;
	}
	getI() {
		return this.i;
	}
	setI(i) {
		this.i = i;
	}
};
jjjtest.TransientField = TransientField;
StringWrap = class StringWrap {
	constructor(i) {
		this.i = i;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.StringWrap";
	}
	static __isEnum() {
		return false;
	}
	getI() {
		return this.i;
	}
	toString() {
	return "Simple {i=" + this.i + "}";
	}
};
jjjtest.StringWrap = StringWrap;
ShortWrap = class ShortWrap {
	constructor(i) {
		this.i = i;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.ShortWrap";
	}
	static __isEnum() {
		return false;
	}
	getI() {
		return this.i;
	}
	toString() {
	return "Simple {i=" + this.i + "}";
	}
};
jjjtest.ShortWrap = ShortWrap;
RepeatField = class RepeatField {
	constructor() {
		this.booleanWrap1 = new BooleanWrap(true);
		this.booleanWrap2 = this.booleanWrap1;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.RepeatField";
	}
	static __isEnum() {
		return false;
	}
};
jjjtest.RepeatField = RepeatField;
Phonetic = class Phonetic {
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
		return "ca.fa.jjjrmi.tests.translator.classes.Phonetic";
	}
	static __isEnum() {
		return true;
	}
};
Phonetic.valueArray = [];
Phonetic.valueArray.push(Phonetic.ALPHA = new Phonetic("ALPHA"));
Phonetic.valueArray.push(Phonetic.BETA = new Phonetic("BETA"));
Phonetic.valueArray.push(Phonetic.CHARLIE = new Phonetic("CHARLIE"));
Phonetic.valueArray.push(Phonetic.DELTA = new Phonetic("DELTA"));
Phonetic.valueArray.push(Phonetic.ECHO = new Phonetic("ECHO"));
Phonetic.valueArray.push(Phonetic.FOXTROT = new Phonetic("FOXTROT"));
Phonetic.valueArray.push(Phonetic.HOTEL = new Phonetic("HOTEL"));
Phonetic.valueArray.push(Phonetic.LIMA = new Phonetic("LIMA"));
Phonetic.valueArray.push(Phonetic.MIKE = new Phonetic("MIKE"));
Phonetic.valueArray.push(Phonetic.NOVEMBER = new Phonetic("NOVEMBER"));
Phonetic.valueArray.push(Phonetic.OSCAR = new Phonetic("OSCAR"));
Phonetic.valueArray.push(Phonetic.PAPA = new Phonetic("PAPA"));
Phonetic.valueArray.push(Phonetic.QUEBEC = new Phonetic("QUEBEC"));
Phonetic.valueArray.push(Phonetic.ROMEO = new Phonetic("ROMEO"));
Phonetic.valueArray.push(Phonetic.SIERRA = new Phonetic("SIERRA"));
Phonetic.valueArray.push(Phonetic.TANGO = new Phonetic("TANGO"));
Phonetic.valueArray.push(Phonetic.UNIFORM = new Phonetic("UNIFORM"));
Phonetic.valueArray.push(Phonetic.VICTOR = new Phonetic("VICTOR"));
Phonetic.valueArray.push(Phonetic.WHISKEY = new Phonetic("WHISKEY"));
Phonetic.valueArray.push(Phonetic.XRAY = new Phonetic("XRAY"));
Phonetic.valueArray.push(Phonetic.YANKEE = new Phonetic("YANKEE"));
Phonetic.valueArray.push(Phonetic.ZULU = new Phonetic("ZULU"));
Phonetic.values = function(){return Phonetic.valueArray;};
jjjtest.Phonetic = Phonetic;
ObjectWrap = class ObjectWrap {
	constructor(object) {
		this.object = null;
		this.object = object;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.ObjectWrap";
	}
	static __isEnum() {
		return false;
	}
	getObject() {
		return this.object;
	}
};
jjjtest.ObjectWrap = ObjectWrap;
NoRetainSelfDeep = class NoRetainSelfDeep {
	constructor() {
		this.first = new NoRetainSelf();
		this.second = this.first;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.NoRetainSelfDeep";
	}
	static __isEnum() {
		return false;
	}
};
jjjtest.NoRetainSelfDeep = NoRetainSelfDeep;
NoRetainSelf = class NoRetainSelf {
	constructor() {
		this.me = this;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.NoRetainSelf";
	}
	static __isEnum() {
		return false;
	}
};
jjjtest.NoRetainSelf = NoRetainSelf;
NoRetain = class NoRetain {
	constructor(i) {
		this.i = i;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.NoRetain";
	}
	static __isEnum() {
		return false;
	}
	getI() {
		return this.i;
	}
	toString() {
	return "Simple {i=" + this.i + "}";
	}
};
jjjtest.NoRetain = NoRetain;
NoJJJEnumWrap = class NoJJJEnumWrap {
	constructor() {
		this.i = NoJJJEnum.OSCAR;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.NoJJJEnumWrap";
	}
	static __isEnum() {
		return false;
	}
};
jjjtest.NoJJJEnumWrap = NoJJJEnumWrap;
NestedWrap = class NestedWrap {
	constructor(value) {
		this.booleanWrap = new BooleanWrap(true);
		this.byteWrap = new ByteWrap(1);
		this.charWrap = new CharWrap('a');
		this.doubleWrap = new DoubleWrap(1.1);
		this.floatWrap = new FloatWrap(1.2);
		this.longWrap = new LongWrap(1);
		this.shortWrap = new ShortWrap(1);
		this.stringWrap = new StringWrap("I am Groot!");
		this.booleanWrap = new BooleanWrap(value % 2 === 0);
		this.byteWrap = new ByteWrap(value);
		this.charWrap = new CharWrap(value);
		this.doubleWrap = new DoubleWrap(value + value / 7);
		this.floatWrap = new FloatWrap(1.0 + value / 7);
		this.longWrap = new LongWrap(value);
		this.shortWrap = new ShortWrap(value);
		this.stringWrap = new StringWrap("" + value);
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.NestedWrap";
	}
	static __isEnum() {
		return false;
	}
};
jjjtest.NestedWrap = NestedWrap;
LongWrap = class LongWrap {
	constructor(i) {
		this.i = i;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.LongWrap";
	}
	static __isEnum() {
		return false;
	}
	getI() {
		return this.i;
	}
	toString() {
	return "Simple {i=" + this.i + "}";
	}
};
jjjtest.LongWrap = LongWrap;
IntegerWrapAssigned = class IntegerWrapAssigned {
	constructor() {
		this.i = 5;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.IntegerWrapAssigned";
	}
	static __isEnum() {
		return false;
	}
	getI() {
		return this.i;
	}
};
jjjtest.IntegerWrapAssigned = IntegerWrapAssigned;
IntegerWrap = class IntegerWrap {
	constructor(i) {
		this.i = i;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.IntegerWrap";
	}
	static __isEnum() {
		return false;
	}
	getI() {
		return this.i;
	}
	toString() {
	return "Simple {i=" + this.i + "}";
	}
};
jjjtest.IntegerWrap = IntegerWrap;
HasHandler = class HasHandler {
	constructor(object, string) {
		this.object = object;
		this.string = string;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.HasHandler";
	}
	static __isEnum() {
		return false;
	}
	getObject() {
		return this.object;
	}
	getString() {
		return this.string;
	}
};
jjjtest.HasHandler = HasHandler;
Handles_HasHandler = class Handles_HasHandler {
	constructor() {

	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.Handles_HasHandler";
	}
	static __isEnum() {
		return false;
	}
	decode(handler) {
		/* To change body of generated methods, choose Tools | Templates. */;
		throw new Error("java.lang.UnsupportedOperationException");
	}
	encode(handler, that) {
		handler.setField("objectField", that.object);
		handler.setField("this", that);
		handler.setField("stringField", that.string);
	}
};
jjjtest.Handles_HasHandler = Handles_HasHandler;
HandlesSelf = class HandlesSelf {
	constructor(object, string) {
		this.object = object;
		this.string = string;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.HandlesSelf";
	}
	static __isEnum() {
		return false;
	}
	decode(handler) {
		/* To change body of generated methods, choose Tools | Templates. */;
		throw new Error("java.lang.UnsupportedOperationException");
	}
	encode(handler) {
		handler.setField("objectField", this.object);
		handler.setField("this", this);
		handler.setField("stringField", this.string);
	}
};
jjjtest.HandlesSelf = HandlesSelf;
FloatWrap = class FloatWrap {
	constructor(i) {
		this.i = i;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.FloatWrap";
	}
	static __isEnum() {
		return false;
	}
	getI() {
		return this.i;
	}
	toString() {
	return "Simple {i=" + this.i + "}";
	}
};
jjjtest.FloatWrap = FloatWrap;
EnumWrap = class EnumWrap {
	constructor(i) {
		this.i = Phonetic.OSCAR;
		this.i = i;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.EnumWrap";
	}
	static __isEnum() {
		return false;
	}
	getI() {
		return this.i;
	}
};
jjjtest.EnumWrap = EnumWrap;
DoubleWrap = class DoubleWrap {
	constructor(i) {
		this.i = i;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.DoubleWrap";
	}
	static __isEnum() {
		return false;
	}
	getI() {
		return this.i;
	}
	toString() {
	return "Simple {i=" + this.i + "}";
	}
};
jjjtest.DoubleWrap = DoubleWrap;
CharWrap = class CharWrap {
	constructor(i) {
		this.i = i;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.CharWrap";
	}
	static __isEnum() {
		return false;
	}
	getI() {
		return this.i;
	}
	toString() {
	return "Simple {i=" + this.i + "}";
	}
};
jjjtest.CharWrap = CharWrap;
ByteWrap = class ByteWrap {
	constructor(i) {
		this.i = i;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.ByteWrap";
	}
	static __isEnum() {
		return false;
	}
	getI() {
		return this.i;
	}
	toString() {
	return "Simple {i=" + this.i + "}";
	}
};
jjjtest.ByteWrap = ByteWrap;
BooleanWrap = class BooleanWrap {
	constructor(i) {
		this.i = i;
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.tests.translator.classes.BooleanWrap";
	}
	static __isEnum() {
		return false;
	}
	getI() {
		return this.i;
	}
	toString() {
	return "Simple {i=" + this.i + "}";
	}
};
jjjtest.BooleanWrap = BooleanWrap;

if (typeof module !== "undefined") module.exports = jjjtest;