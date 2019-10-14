class TimersManager {
    constructor() {
        this.timers = [];
        this.started = false;
    }

    add(timer, ...params) {
        if (this.started) {
            throw new Error('method add should be invoke before method start');
        }

        this._validateTimer(timer);
        const newTimer = { ...timer, params };

        this.timers = [ ...this.timers, newTimer ];

        return this;
    }

    remove(timerName) {
        this._validateTimerName(timerName);
        this.pause(timerName);

        this.timers = this.timers.filter((timer) => timer.name !== timerName);
    }

    start() {
        this.timers = this.timers.map((timer) => {
            const timerId = this._createTimer(timer);

            return { ...timer, timerId };
        });
        this.started = true;
    }

    stop() {
        this.timers = this.timers.map((timer) => {
            this._clearTimer(timer);

            return { ...timer, timerId: null };
        });

        this.started = false;
    }

    pause(timerName) {
        this._validateTimerName(timerName);
        const timer = this._getTimer(timerName);
        this._clearTimer(timer);

        timer.timerId = null;
    }

    resume(timerName) {
        this._validateTimerName(timerName);
        const timer = this._getTimer(timerName);
        const timerId = this._createTimer(timer);

        timer.timerId = timerId;
    }

    _clearTimer(timer) {
        const { timerId, interval } = timer;

        if (interval) {
            clearInterval(timerId);
        } else {
            clearTimeout(timerId);
        }
    }

    _getTimer(timerName) {
        return this.timers.find((timer) => timer.name === timerName);
    }

    _createTimer(timer) {
        const { delay, interval, job, params } = timer;
        let timerId = null;

        if (interval) {
            timerId = setInterval(job, delay, ...params);
        } else {
            timerId = setTimeout(job, delay, ...params);
        }

        return timerId;
    }

    _validateTimer(timer) {
        const { name, delay, interval, job } = timer;

        this._validateTimerName(name);
        this._validateUniqueTimerName(name);

        if (typeof delay !== 'number') {
            throw new Error('delay does not exist or contains not a valid data type');
        }

        if (delay < 0 || delay > 5000) {
            throw new Error('delay should be number from 0 to 5000');
        }

        if (typeof interval !== 'boolean') {
            throw new Error('interval does not exist or contains not a valid data type');
        }

        if (typeof job !== 'function') {
            throw new Error('job does not exist or contains not a valid data type');
        }
    }

    _validateTimerName(timerName) {
        const type = typeof timerName;

        if (!timerName || type !== 'string' || timerName === '') {
            throw new Error('name does not exist or contains not a valid data type');
        }
    }

    _validateUniqueTimerName(timerName) {
        this.timers.forEach((timer) => {
            if (timer.name === timerName) {
                throw new Error('name should be unique');
            }
        });
    }
}

const manager = new TimersManager();

const t1 = {
    name:     't1',
    delay:    1000,
    interval: false,
    job:      () => {
        console.log('t1');
    },
};

const t2 = {
    name:     't2',
    delay:    2000,
    interval: false,
    job:      (a, b) => console.log(a + b),
};

// manager.add(t1).add(t2, 1, 2);
manager.add(t1);
manager.add(t2, 1, 2);
manager.start();

//manager.remove('t1');
//manager.pause('t1');
//manager.resume('t1');

setTimeout(() => {
    manager.stop();
}, 3000);
