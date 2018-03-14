let jjjtest = require("./jjjrmi.test.js");
let Assert = require("./Assert");
let TestEncode = require("./TestEncode");
let TestDecode = require("./TestDecode");

let assert = new Assert();
let testDecode = new TestDecode();
let testEncode = new TestEncode();

//assert.test(testEncode.test_field_repeat, "test_field_repeat");

assert.test(testDecode.test_field_repeat, "test_field_repeat");
//assert.runtests(testDecode);

console.log(assert.report());