const logger = require('../../lib/checksCore').logger;
const assert = require('../../lib/checksCore').assert;

var buffer = [];

logger.addCase("debug", function (explanation) {
    buffer.push(explanation);
});

logger.addCase("warning", function (explanation) {
    buffer.push(explanation);
});

logger.alias("warn", "warning");

assert.pass("Expect buffer's length to be 3", function () {
    logger.debug("Test debug");
    logger.warning("Test debug");
    logger.warn("Test debug");

    assert.equal(buffer.length, 3);
});

