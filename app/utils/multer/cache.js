const { pool } = require("../../config/db.config");
const redis = require('redis');
const client = redis.createClient();

function getFromCache(key, callback) {
  client.get(key, (error, result) => {
    if (error) {
      console.error(error);
      return callback(error, null);
    }
    if (result) {
      return callback(null, JSON.parse(result));
    } else {
      return callback(null, null);
    }
  });
}

function setInCache(key, data, expiryInSeconds) {
  client.setex(key, expiryInSeconds, JSON.stringify(data));
}

module.exports = { getFromCache, setInCache };