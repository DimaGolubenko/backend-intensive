export const createUser = {
    type:       'object',
    properties: {
        name: {
            type:      'string',
            minLength: 3,
        },
        email: {
            type:   'string',
            format: 'email',
        },
    },
    required: [ 'name' ],

    additionalProperties: false,
};
