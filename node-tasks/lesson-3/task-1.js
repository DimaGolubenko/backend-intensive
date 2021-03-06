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
    }

    register({ name, balance }) {
        this._validatePersonName(name);

        if (balance <= 0) {
            this.emit('error', new Error(this.errors.BALANCE_LESS_THEN_ZERO_ERROR));
        }

        const newPerson = {
            id: this.personList.length,
            name,
            balance,
        };
        const personId = newPerson.id;
        this.personList = [ ...this.personList, { ...newPerson }];

        return personId;
    }

    onAdd(...params) {
        const [ personId, money ] = params;

        if (money <= 0) {
            this.emit('error', new Error(this.errors.ADD_NEGATIVE_OR_ZERO_MONEY_ERROR));
        }

        this._validatePersonId(personId);

        this.personList = this.personList.map((person) => {
            if (person.id === personId) {
                return { ...person, balance: person.balance + money };
            }

            return person;
        });
    }

    onGet(...params) {
        const [ personId, callback ] = params;
        const person = this.personList.find((person) => person.id === personId);

        callback(person.balance);
    }

    onWithdraw(...params) {
        const [ personId, money ] = params;

        if (money <= 0) {
            this.emit('error', new Error(this.errors.WITHDRAW_NEGATIVE_OR_ZERO_MONEY_ERROR));
        }

        this.personList = this.personList.map((person) => {
            if (person.id === personId) {
                const newBalance = person.balance - money;

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

    onError({ message: errorType }) {
        switch (errorType) {
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
            default:
                throw new Error('uncaught error');
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
            PERSON_ID_ERROR:                           'PERSON_ID_ERROR',
            UNIQUE_NAME_ERROR:                         'UNIQUE_NAME_ERROR',
            BALANCE_LESS_THEN_ZERO_ERROR:              'BALANCE_LESS_THEN_ZERO_ERROR',
            ADD_NEGATIVE_OR_ZERO_MONEY_ERROR:          'ADD_NEGATIVE_OR_ZERO_MONEY_ERROR',
            WITHDRAW_NEGATIVE_OR_ZERO_MONEY_ERROR:     'WITHDRAW_NEGATIVE_OR_ZERO_MONEY_ERROR',
            WITHDRAW_MONEY_GREATER_THAN_BALANCE_ERROR: 'WITHDRAW_MONEY_GREATER_THAN_BALANCE_ERROR',
        };
    }
}

const init = () => {
    const bank = new Bank();

    const personId = bank.register({
        name:    'Pitter Black',
        balance: 100,
    });

    bank.register({
        name:    'Pitter Black 2',
        balance: 100,
    });

    bank.emit('add', personId, 20);

    bank.emit('get', personId, (balance) => {
        console.log(`I have ${balance}₴`); // I have 120₴
    });

    bank.emit('withdraw', personId, 50);

    bank.emit('get', personId, (balance) => {
        console.log(`I have ${balance}₴`); // I have 70₴
    });
};

try {
    init();
} catch (error) {
    console.error(error.message);
}
