let jjjtest = require("./jjjrmi.test.js");
let Assert = require("./Assert");
let TestEncode = require("./TestEncode");
let TestDecode = require("./TestDecode");

let assert = new Assert();
let testDecode = new TestDecode();
let testEncode = new TestEncode();

assert.runtests(testEncode);
assert.runtests(testDecode);

//assert.test(testEncode.test_field_repeat, "test_field_repeat");

//try{
//    assert.test(testDecode.test_field_repeat, "test_field_repeat");
//} catch (err){
//    console.log("\n" + err);
//}
//assert.runtests(testDecode);

console.log(assert.report());