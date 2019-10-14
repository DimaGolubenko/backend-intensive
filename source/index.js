//Core
import express from 'express';

// Instruments
import { app } from './server';
import { getPort } from './utils';

//Routers
import { users, auth, classes, lessons } from './routers';

const port = getPort();

app.use(express.json({ limit: '10kb' }));

app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/classes', classes);
app.use('/api/lessons', lessons);

app.listen(port, () => {
    console.log(`Server API is up on port ${port}`);
});
