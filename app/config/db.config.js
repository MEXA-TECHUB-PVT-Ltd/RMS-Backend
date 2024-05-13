const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: process.env.DB_MAX_CLIENTS,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
    process.exit(-1);
  }
  client.query('SELECT NOW()', (err, res) => {
    release();
    if (err) {
      console.error('Error executing query', err.stack);
    } else {
      console.log('Connected to database successfully');
    }
  })
});

const initSql = fs.readFileSync("app/models/init.sql").toString();

pool.query(initSql, (err, result) => {
  if (!err) {
    console.log("All Database tables initialized successfully")
  }
  else {
    console.error("Error occurred while initializing database tables", err);
  }
})

module.exports = { pool };