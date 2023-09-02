const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

function getStatus(req, res) {
  const redisAlive = redisClient.isAlive();
  const dbAlive = dbClient.isAlive();
  res.send({ redis: redisAlive, db: dbAlive });
}

async function getStats(req, res) {
  const numUsers = await dbClient.nbUsers();
  const numFiles = await dbClient.nbFiles();
  res.send({ users: numUsers, files: numFiles });
}

module.exports = {
  getStats,
  getStatus,
};
