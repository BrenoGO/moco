"use strict"
const app = require('./config/express')();
const PORT = app.get('port');

const url = 'mongodb://BrenoGaudereto:1q2w3e@ds253017.mlab.com:53017/money-controller';

require('./config/db')(url);

app.listen(PORT, () => {console.log(`Server listening to port ${PORT}`)});