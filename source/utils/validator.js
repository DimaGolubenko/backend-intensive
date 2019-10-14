//Core
import Ajv from 'ajv';

export const validator = (schema) => (req, res, next) => {
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(schema);
    const valid = validate(req.body);

    if (valid) {
        return next();
    }

    console.log(validate.errors);

    const errors = validate.errors.map(({ message }) => message).join(', ');

    res.status(400).json({ message: errors });
};
