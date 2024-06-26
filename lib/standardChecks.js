/*
    checks are like asserts but are intended to be used in production code to help debugging and signaling wrong behaviours

 */

exports.init = function (sf) {
    sf.exceptions.register('checkFail', function (explanation, err) {
        var stack;
        if (err) {
            stack = err.stack;
        }
        console.log("Check failed ", explanation, stack);
    });

    sf.check.addCheck('equal', function (v1, v2, explanation) {

        if (v1 !== v2) {
            if (!explanation) {
                explanation = " [" + v1 + " != " + v2 + "]";
            }

            sf.exceptions.checkFail(explanation);
        }
    });


    sf.check.addCheck('true', function (b, explanation) {
        if (!b) {
            if (!explanation) {
                explanation = " expression is false but is expected to be true";
            }

            sf.exceptions.checkFail(explanation);
        }
    });


    sf.check.addCheck('false', function (b, explanation) {
        if (b) {
            if (!explanation) {
                explanation = " expression is true but is expected to be false";
            }

            sf.exceptions.checkFail(explanation);
        }
    });

    sf.check.addCheck('notequal', function (v1, v2, explanation) {
        if (v1 == v2) {
            if (!explanation) {
                explanation = " [" + v1 + " == " + v2 + "]";
            }
            sf.exceptions.checkFail(explanation);
        }
    });


    /*
        added mainly for test purposes, better test frameworks like mocha could be much better :)
    */
    sf.check.addCheck('fail', function (testName, func) {
        try {
            func();
            console.log("[Fail] " + testName);
        } catch (err) {
            console.log("[Pass] " + testName);
        }
    });


    sf.check.addCheck('pass', function (testName, func) {
        try {
            func();
            console.log("[Pass] " + testName);
        } catch (err) {
            console.log("[Fail] " + testName, err.stack);
        }
    });


    sf.check.alias('test', 'pass');


    sf.check.addCheck('callback', function (testName, func, timeout) {
        if (!timeout) {
            timeout = 500;
        }
        var passed = false;

        function callback() {
            if (!passed) {
                passed = true;
                console.log("[Pass] " + testName);
                SuccessTest();
            } else {
                console.log("[Fail (multiple calls)] " + testName);
            }
        }

        try {
            func(callback);
        } catch (err) {
            console.log("[Fail] " + testName, err.stack);
        }

        function SuccessTest() {
            if (!passed) {
                console.log("[Fail Timeout] " + testName);
            }
        }

        setTimeout(SuccessTest, timeout);
    });


    sf.check.addCheck('steps', function (testName, arr, timeout) {
        var currentStep = 0;
        var passed = false;
        if (!timeout) {
            timeout = 500;
        }

        function next() {
            if (currentStep === arr.length) {
                passed = true;
                console.log("[Pass] " + testName);
                return;
            }
            var func = arr[currentStep];
            currentStep++;
            try {
                func(next);
            } catch (err) {
                console.log("[Fail] " + testName, "\n\t", err.stack + "\n\t", " [at step ", currentStep + "]");
            }
        }

        function SuccessTest() {
            if (!passed) {
                console.log("[Fail Timeout] " + testName + "\n\t", " [at step ", currentStep + "]");
            }
        }

        setTimeout(SuccessTest, timeout);
        next();
    });

    sf.check.alias('waterfall', 'steps');
    sf.check.alias('notEqual', 'notequal');

    sf.check.addCheck('end', function (timeOut, silence) {
        if (!timeOut) {
            timeOut = 1000;
        }

        setTimeout(function () {
            if (!silence) {
                console.log("Forcing exit after", timeOut, "ms");
            }
            process.exit(0);
        }, timeOut);
    });


    sf.check.addCheck('begin', function (message, timeOut) {
        console.log(message);
        sf.check.end(timeOut, true);
    });


};