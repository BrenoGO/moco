require('dotenv').config();
const app = require('./config/express')();

const PORT = app.get('port');

require('./config/db')(process.env.DB_URL);

app.listen(PORT, () => { console.log(`Server listening to port ${PORT}!!!`); });
