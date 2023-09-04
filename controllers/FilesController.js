const uuid = require('uuid');
const fs = require('fs');
const dbClient = require('../utils/db');
const { getUserBySessionToken } = require('./AuthController');

const postUpload = async (req, res) => {
  const sessionToken = req.header('X-Token');
  const user = await getUserBySessionToken(sessionToken);

  if (!user) return res.status(401).send({ error: 'Unauthorized' });

  const userId = user._id;
  const { name } = req.body;
  const { type } = req.body;
  const parentId = req.body.parentId || 0;
  const isPublic = req.body.isPublic || false;
  const { data } = req.body;
  const acceptedTypes = ['file', 'image', 'folder'];

  if (!name) return res.status(400).send({ error: 'Missing name' });
  if (!type || !acceptedTypes.includes(type)) {
    return res.status(400).send({ error: 'Missing type' });
  }
  if (!data && type !== 'folder') {
    return res.status(400).send({ error: 'Missing data' });
  }

  if (parentId) {
    const file = await dbClient.findById('files', parentId);

    if (!file) return res.status(400).send({ error: 'Parent not found' });

    if (file.type !== 'folder') return res.status(400).send({ error: 'Parent is not a folder' });


  }

  if (type === 'folder') {
    let documentToSave = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };

    const savedFile = await dbClient.save('files', documentToSave);
    documentToSave = { id: savedFile.ops[0]._id, ...documentToSave };
    delete documentToSave._id;
    return res.status(201).send(documentToSave);
  }
  const relativePath = process.env.FOLDER_PATH || '/tmp/files_manager';
  const absoluteFilePath = `${relativePath}/${uuid.v4()}`;
  const fileData = Buffer.from(data, 'base64');
  const fileToSave = {
    userId,
    name,
    type,
    isPublic,
    parentId,
    localPath: absoluteFilePath,
  };

  fs.mkdirSync(relativePath, { recursive: true });

  fs.writeFileSync(absoluteFilePath, fileData, 'utf-8');

  const savedFile = await dbClient.save('files', fileToSave);

  const returnDoc = {
    id: savedFile.ops[0]._id,
    userId,
    name,
    type,
    isPublic,
    parentId,
  };

  return res.status(201).send(returnDoc);
};

module.exports = { postUpload };
