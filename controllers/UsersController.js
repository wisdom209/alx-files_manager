const dbClient = require('../utils/db');
const sha1Hash = require('../utils/sha1');
const { getUserBySessionToken } = require('./AuthController');

async function postNew(req, res) {
  const { email } = req.body;
  const { password } = req.body;

  if (!email) return res.status(400).send({ error: 'Missing email' });
  if (!password) return res.status(400).send({ error: 'Missing password' });

  const emailExists = await dbClient.findOne('users', { email });
  if (emailExists) return res.status(400).send({ error: 'Already exist' });

  const hashedPasswd = sha1Hash(password);
  const user = await dbClient.save('users', { email, password: hashedPasswd });

  const returnUser = {
    id: user.ops[0]._id,
    email: user.ops[0].email,
  };

  return res.status(201).send(returnUser);
}

const getMe = async (req, res) => {
  const sessionToken = req.header('X-Token');

  const user = await getUserBySessionToken(sessionToken);

  if (!user) return res.status(401).send({ error: 'Unauthorized' });

  return res.status(200).send({ id: user._id, email: user.email });
};

module.exports = { postNew, getMe };
