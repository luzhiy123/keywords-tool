const { Pool, Client } = require('pg')
let config = require('./config.json');

const pool = new Pool(config.sql)


module.exports = pool;