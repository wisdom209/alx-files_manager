const dbClient = require('../utils/db');
const sha1Hash = require('../utils/sha1');

async function postNew(req, res) {
  const { email } = req.body;
  const { password } = req.body;

  if (!email) return res.status(400).send({ errpr: 'Missing email' });
  if (!password) return res.status(400).send({ error: 'Missing password' });

  const emailExists = await dbClient.findOne('users', { email });
  if (emailExists) return res.status(400).send({ error: 'Already exist' });

  const hashedPasswd = sha1Hash(password);
  const user = await dbClient.save('users', { email, hashedPasswd });

  const returnUser = {
    id: user.ops[0]._id,
    email: user.ops[0].email,
  };

  return res.status(201).send(returnUser);
}

module.exports = { postNew };
