/**
 * Created by Henry on 2018/5/8.
 */
const assert = require('assert');
const sinon = require('sinon');
const { main } = require('../package.json');

const createRepeatTask = require(`../${main}`);

describe('#repeat', () => {
    let clock;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    describe('#retry', () => {
        it('should be 4 times', (done) => {
            let count = 0;
            createRepeatTask('task1', () => {
                count += 1;
                throw new Error('abc');
            }, {
                delay: 1000,
                retryTimes: 3,
            });
            setTimeout(() => {
                assert.equal(count, 4, '错了');
                done();
            }, 4000);
            clock.tick(4000);
        });
    });
});
