const uuid = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const getUserBySessionToken = async (sessionToken) => {
  if (!sessionToken) return null;

  const userId = await redisClient.get(`auth_${sessionToken}`);

  if (!userId) return null;

  const user = await dbClient.findById('users', userId);

  if (!user) return null;

  return user;
};

const getConnect = async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  const authToken = authorizationHeader.split(' ')[1];
  const decodedToken = Buffer.from(authToken, 'base64').toString('utf8');

  const email = decodedToken.split(':')[0];

  const user = await dbClient.findOne('users', { email });

  if (!user) return res.status(401).send({ error: 'Unauthorized' });

  const sessionToken = uuid.v4();

  const sessionKey = `auth_${sessionToken}`;

  const expirationTime = 86400;

  await redisClient.set(sessionKey, user._id.toString(), expirationTime);

  return res.status(200).send({ token: sessionToken });
};

const getDisconnect = async (req, res) => {
  const sessionToken = req.header('X-Token');

  const user = await getUserBySessionToken(sessionToken);

  if (!user) return res.status(401).send({ error: 'Unauthorized' });

  await redisClient.del(`auth_${sessionToken}`);

  return res.status(204).send();
};

module.exports = { getConnect, getDisconnect, getUserBySessionToken };
