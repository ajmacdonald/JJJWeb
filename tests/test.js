let jjjtest = require("./jjjrmi.test.js");
let Assert = require("./Assert");
let TestEncode = require("./TestEncode");

let assert = new Assert();
let testEncode = new TestEncode();

//assert.test(testEncode.test_field_assigned, "test_field_assigned");
assert.runtests(testEncode);

console.log(assert.report());