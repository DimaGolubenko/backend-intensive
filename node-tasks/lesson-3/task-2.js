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

    onSend(...params) {
        const [ personFirstId, personSecondId, money ] = params;

        this._validatePersonId(personFirstId);
        this._validatePersonId(personSecondId);

        if (money <= 0) {
            this.emit('error', new Error(this.errors.SEND_NEGATIVE_OR_ZERO_MONEY_ERROR));
        }

        this.onWithdraw(personFirstId, money);
        this.onAdd(personSecondId, money);
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
            case this.errors.SEND_NEGATIVE_OR_ZERO_MONEY_ERROR:
                throw new Error('send money amount should be greater than 0');
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
            SEND_NEGATIVE_OR_ZERO_MONEY_ERROR:         'SEND_NEGATIVE_OR_ZERO_MONEY_ERROR',
        };
    }
}

const init = () => {
    const bank = new Bank();

    const personFirstId = bank.register({
        name:    'Pitter Black',
        balance: 100,
    });

    const personSecondId = bank.register({
        name:    'Oliver White',
        balance: 700,
    });

    bank.emit('send', personFirstId, personSecondId, 50);

    bank.emit('get', personSecondId, (balance) => {
        console.log(`I have ${balance}₴`); // I have 750₴
    });
};

try {
    init();
} catch (error) {
    console.error(error.message);
}
