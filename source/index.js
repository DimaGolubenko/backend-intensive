// Instruments
import { app } from './server';
import { getPort } from './helpers';

//Routers
import { users, auth, classes, lessons } from './routers';

const port = getPort();

app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/classes', classes);
app.use('/api/lessons', lessons);

app.listen(port, () => {
    console.log(`Server API is up on port ${port}`);
});
