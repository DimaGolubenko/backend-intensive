const EventEmitter = require('events');

class Bank extends EventEmitter {
    constructor() {
        super();

        this._initErrors();
        this.personList = [];
        this.on('error', this.onError);
        this.on('add', this.onAdd);
        this.on('get', this.onGet);
        this.on('withdraw', this.onWithdraw);
        this.on('send', this.onSend);
        this.on('changeLimit', this.onchangeLimit);
    }

    register({ name, balance, limit = () => {} }) {
        this._validatePersonName(name);

        if (balance <= 0) {
            this.emit('error', new Error(this.errors.BALANCE_LESS_THEN_ZERO_ERROR));
        }

        const newPerson = {
            id: this.personList.length,
            name,
            balance,
            limit,
        };
        const personId = newPerson.id;
        this.personList = [ ...this.personList, { ...newPerson }];

        return personId;
    }

    onAdd(...params) {
        const [ personId, amount ] = params;

        if (amount <= 0) {
            this.emit('error', new Error(this.errors.ADD_NEGATIVE_OR_ZERO_MONEY_ERROR));
        }

        this._validatePersonId(personId);
        this._add(personId, amount);
    }

    onGet(...params) {
        const [ personId, callback ] = params;
        const person = this.personList.find((person) => person.id === personId);

        callback(person.balance);
    }

    onWithdraw(...params) {
        const [ personId, amount ] = params;

        if (amount <= 0) {
            this.emit('error', new Error(this.errors.WITHDRAW_NEGATIVE_OR_ZERO_MONEY_ERROR));
        }

        this._validateLimit(personId, amount, 'withdraw');

        this._withdraw(personId, amount);
    }

    onSend(...params) {
        const [ personFirstId, personSecondId, amount ] = params;

        this._validatePersonId(personFirstId);
        this._validatePersonId(personSecondId);

        if (amount <= 0) {
            this.emit('error', new Error(this.errors.SEND_NEGATIVE_OR_ZERO_MONEY_ERROR));
        }

        this._validateLimit(personSecondId, amount, 'send');

        this._withdraw(personFirstId, amount);
        this._add(personSecondId, amount);
    }

    onchangeLimit(...params) {
        const [ personId, callback ] = params;
        this._validatePersonId(personId);

        this.personList = this.personList.map((person) => {
            if (person.id === personId) {
                return { ...person, limit: callback };
            }

            return person;
        });
    }

    onError({ message: errorType }) {
        switch (errorType) {
            case this.errors.LIMIT_ERROR:
                throw new Error('limit should be valid');
            case this.errors.PERSON_ID_ERROR:
                throw new Error('error person id');
            case this.errors.UNIQUE_NAME_ERROR:
                throw new Error('name should be unique');
            case this.errors.BALANCE_LESS_THEN_ZERO_ERROR:
                throw new Error('balance should be greater than 0');
            case this.errors.ADD_NEGATIVE_OR_ZERO_MONEY_ERROR:
                throw new Error('add money count should be greater than 0');
            case this.errors.WITHDRAW_NEGATIVE_OR_ZERO_MONEY_ERROR:
                throw new Error('withdraw money count should be greater than 0');
            case this.errors.WITHDRAW_MONEY_GREATER_THAN_BALANCE_ERROR:
                throw new Error('withdraw money should be less than balance money');
            case this.errors.SEND_NEGATIVE_OR_ZERO_MONEY_ERROR:
                throw new Error('send money amount should be greater than 0');
            default:
                throw new Error('uncaught error');
        }
    }

    _add(personId, amount) {
        this.personList = this.personList.map((person) => {
            if (person.id === personId) {
                return { ...person, balance: person.balance + amount };
            }

            return person;
        });
    }

    _withdraw(personId, amount) {
        this.personList = this.personList.map((person) => {
            if (person.id === personId) {
                const newBalance = person.balance - amount;

                if (newBalance < 0) {
                    this.emit(
                        'error',
                        new Error(this.errors.WITHDRAW_MONEY_GREATER_THAN_BALANCE_ERROR),
                    );
                }

                return { ...person, balance: newBalance };
            }

            return person;
        });
    }

    _getPerson(personId) {
        this._validatePersonId(personId);
        const person = this.personList.find(({ id }) => id === personId);

        return person;
    }

    _validateLimit(personId, amount, event) {
        const { limit, balance: currentBalance } = this._getPerson(personId);
        const updatedBalance = event === 'send' ? currentBalance + amount : currentBalance - amount;

        if (!limit(amount, currentBalance, updatedBalance)) {
            this.emit('error', new Error(this.errors.LIMIT_ERROR));
        }
    }

    _validatePersonName(personName) {
        this.personList.forEach((person) => {
            if (person.name === personName) {
                this.emit('error', new Error(this.errors.UNIQUE_NAME_ERROR));
            }
        });
    }

    _validatePersonId(personId) {
        const isPersonIdValid = this.personList.find(({ id }) => id === personId);

        if (!isPersonIdValid) {
            this.emit('error', new Error(this.errors.PERSON_ID_ERROR));
        }
    }

    _initErrors() {
        this.errors = {
            LIMIT_ERROR:                               'LIMIT_ERROR',
            PERSON_ID_ERROR:                           'PERSON_ID_ERROR',
            UNIQUE_NAME_ERROR:                         'UNIQUE_NAME_ERROR',
            BALANCE_LESS_THEN_ZERO_ERROR:              'BALANCE_LESS_THEN_ZERO_ERROR',
            ADD_NEGATIVE_OR_ZERO_MONEY_ERROR:          'ADD_NEGATIVE_OR_ZERO_MONEY_ERROR',
            WITHDRAW_NEGATIVE_OR_ZERO_MONEY_ERROR:     'WITHDRAW_NEGATIVE_OR_ZERO_MONEY_ERROR',
            WITHDRAW_MONEY_GREATER_THAN_BALANCE_ERROR: 'WITHDRAW_MONEY_GREATER_THAN_BALANCE_ERROR',
            SEND_NEGATIVE_OR_ZERO_MONEY_ERROR:         'SEND_NEGATIVE_OR_ZERO_MONEY_ERROR',
        };
    }
}

const init = () => {
    const bank = new Bank();


    const personId = bank.register({
        name:    'Oliver White',
        balance: 700,
        limit:   (amount) => amount < 10,
    });

    bank.emit('withdraw', personId, 5);

    bank.emit('get', personId, (balance) => {
        console.log(`1. I have ${balance}₴`); // I have 695₴
    });

    // Вариант 1
    bank.emit('changeLimit', personId, (amount, currentBalance, updatedBalance) => {
        return amount < 100 && updatedBalance > 700;
    });

    bank.emit('withdraw', personId, 5); // Error

    // Вариант 2
    // bank.emit('changeLimit', personId, (amount, currentBalance, updatedBalance) => {
    //     return amount < 100 && updatedBalance > 700 && currentBalance > 800;
    // });

    // Вариант 3
    // bank.emit('changeLimit', personId, (amount, currentBalance) => {
    //     return currentBalance > 800;
    // });

    // Вариант 4
    // bank.emit('changeLimit', personId, (amount, currentBalance, updatedBalance) => {
    //     return updatedBalance > 900;
    // });
};

try {
    init();
} catch (error) {
    console.error(error.message);
}
