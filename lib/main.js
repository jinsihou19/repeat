/**
 * 重复运行的任务。
 *
 * Created by Henry on 2018/5/7.
 */
const debug = require('debug')('IntervalTask');
const invariant = require('invariant');
const isPlainObject = require('lodash.isplainobject');

const timer = {};

/**
 * 创建重复任务。可以指定错误重试次数和立即开始，
 *
 * @param taskName  [String]    任务名称
 * @param task      [Function]  任务类型
 * @param options   [Object]    选项
 * @param options.delay             [Number]    间隔时间，单位ms
 * @param [options.args]            [Object]    任务执行参数
 * @param [options.retryTimes]      [Number]    错误重试次数,真正错误次数是n+1，默认为0，不重试
 * @param [options.retryInterval]   [Number]    错误重试间隔，单位ms，默认为1min
 * @param [options.immediate]       [Boolean]   是否立即执行，默认立即执行
 */
const createRepeatTask = (taskName, task, options) => {
    // 默认重试次数为0，即不重试
    let retryTimes = options.retryTimes || 0;
    // 默认重试间隔为1min
    const retryInterval = options.retryInterval || 60000;

    invariant(
        taskName !== undefined && taskName !== null && typeof taskName === 'string',
        '[repeat]: taskName should be a string',
    );

    invariant(
        task && typeof task === 'function',
        '[repeat]: task should be a function',
    );

    invariant(
        options && isPlainObject(options),
        '[repeat]: options should be a plain object',
    );

    invariant(
        !isNaN(options.delay) && options.delay > 0,
        '[repeat]: options.delay should be a positive integer',
    );

    invariant(
        !isNaN(retryTimes) && retryTimes > 0,
        '[repeat]: retryTimes should be a positive integer',
    );

    invariant(
        !isNaN(retryInterval) && retryInterval > 0,
        '[repeat]: retryInterval should be a positive integer',
    );

    const runTimeout = () => setTimeout(() => {
        try {
            task.call(null);
        } catch (e) {
            if (retryTimes < 1) {
                // 重试了errorTimes次数，就将其清除
                debug('任务「%s」异常，重试了 %s 次，该任务已经被中止执行', taskName, options.retryTimes);
                clearInterval(timer[taskName].timeObject);
            } else {
                debug('任务「%s」异常，剩余重试次数 %s', taskName, retryTimes);
                retryTimes -= 1;
                if (retryInterval < options.delay) {
                    runTimeout();
                }
            }
        }
    }, retryInterval, options.args);

    const taskWrapper = () => {
        try {
            task.call(null);
        } catch (e) {
            if (retryTimes < 1) {
                // 重试了errorTimes次数，就将其清除
                debug('任务「%s」异常，重试了 %s 次，关闭该任务', taskName, options.retryTimes);
                clearInterval(timer[taskName].timeObject);
            } else {
                debug('任务「%s」异常，剩余重试次数 %s', taskName, retryTimes);
                retryTimes -= 1;
                if (retryInterval < options.delay) {
                    runTimeout();
                }
            }
        }
    };

    // 延迟非0的时候，立即执行
    if (options.immediate !== false && options.delay > 0) {
        setImmediate(taskWrapper, options.args);
    }

    // 开始定时任务
    const timeObject = setInterval(taskWrapper, options.delay, options.args);

    // 注册到管理器中
    timer[taskName] = {
        timeObject,
    };
};

module.exports = createRepeatTask;
