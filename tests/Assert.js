/* global Function */
console.log("include Assert.js");

repeat = function (string, count) {
    let s = "";
    while (count-- > 0) s += string;
    return s;
};

pad = function (string, count) {
    while (string.length < count) string += " ";
    return string;
};

class AssertFail extends Error {
    constructor(expected, found) {
        super();
        this.expected = expected;
        this.found = found;
    }
}

class Assert {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.count = 0;
        this.results = [];
        this.expectedException = "";
    }
    runtests(testset, prefix = "test_") {
        if (typeof testset === "object") {
            var methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(testset));
            for (let method of methodNames) {
                if (method.startsWith(prefix)) {
                    this.test(testset[method], method);
                }
            }
        }
    }
    test(hnd, testName) {
        let result = {name: testName};
        this.results.push(result);
        this.count++;

        try {
            hnd(this);
            result.result = "PASSED";
            this.passed++;
        } catch (ex) {
            if (ex instanceof AssertFail) {
                result.result = "FAILED";
                result.exception = ex;
                this.failed++;
            }
            else if (ex instanceof ServerSideExceptionMessage && this.expectedException.toLowerCase() === ex.exception.toLowerCase()) {
                result.result = "PASSED";
                this.expectedException = "";
                this.passed++;
            }
            else if (this.expectedException !== "") {
                result.result = "FAILED_EXCEPTION";
                result.exname = this.expectedException;
                this.failed++;
                this.expectedException = "";
            }
            else {
                result.result = "ERROR";
                result.exception = ex;
                this.failed++;
                throw(ex);
            }
        }
    }
    report() {
        let builder = [];
        builder.push("Client Side: " + this.passed + " tests passed out of " + this.count);
        builder.push(`+${repeat("-", 118)}+`);
        for (let i = 0; i < this.results.length; i++) {
            let result = this.results[i];
            let string = "";
            if (result.result === "FAILED") {
                string = `| X ${result.name} FAILED expected '${result.exception.expected}' found '${result.exception.found}'`;
            } else if (result.result === "FAILED_EXCEPTION") {
                string = `| X ${result.name} FAILED expected exception '${result.exname}'`;
            } else if (result.result === "PASSED") {
                string = `|   ${result.name} PASSED`;
            } else if (result.result === "ERROR") {
                string = `| E ${result.name} ERROR ${result.exception.constructor.name}`;
            } else if (result.result === "LOG") {
                string = `|   ${result.message}`;
            }
            builder.push(`${pad(string, 119)}|`);
        }
        builder.push(`+${repeat("-", 118)}+`);
        return builder.join("\n");
    }
    getFailed() {
        return this.failed;
    }
    getPassed() {
        return this.passed;
    }
    getCount() {
        return this.count;
    }
    clear() {
        this.passed = 0;
        this.failed = 0;
        this.count = 0;
    }
    log(string) {
        this.results.push({
            result: "LOG",
            message: string
        });
    }
    expect(name) {
        this.expectedException = name;
    }
    static notEquals(expected, found) {
        if (typeof found === "function" && typeof found.equals === "function") {
            if (!found.equals(expected)) {
                throw new AssertFail("results are equal", found);
            }
        }
        if (found === expected) {
            throw new AssertFail("results are equal", found);
        }
    }
    static equals(expected, found) {
        if (typeof found === "function" && typeof found.equals === "function") {
            if (!found.equals(expected)) {
                throw new AssertFail(expected, found);
            }
        }
        if (found !== expected) {
            throw new AssertFail(expected, found);
        }
    }
    static false(found) {
        if (found) {
            throw new AssertFail("false", found);
        }
    }
    static true(found) {
        if (!found) {
            throw new AssertFail("true", found);
        }
    }
}

module.exports = Assert;