const uuid = require('uuid');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const mimetype = require('mime-types');
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

// files/:id
const getShow = async (req, res) => {
  const userToken = req.header('X-Token');
  const user = await getUserBySessionToken(userToken);

  if (!user) return res.status(401).send({ error: 'Unauthorized' });

  const files = await dbClient.findById('files', user._id, 'userId');
  const { id } = req.params;

  let matchFound = false;

  files.forEach((file) => {
    if (String(file._id) === String(id)) {
      matchFound = true;
      const returnDoc = { id: file._id, ...file };
      delete returnDoc._id;
      delete returnDoc.localPath;
      res.status(200).send(returnDoc);
    }
  });

  if (!matchFound) {
    return res.status(404).send({ error: 'Not found' });
  }
  return null;
};

// /files
const getIndex = async (req, res) => {
  const userToken = req.header('X-Token');
  const user = await getUserBySessionToken(userToken);
  const parentId = req.query.parentId || 0;
  const page = req.query.page || 1;
  const startIndex = (page - 1) * 20;
  const endIndex = startIndex + 20;

  if (!user) return res.status(401).send({ error: 'Unauthorized' });

  let files = null;
  if (parentId === 0) {
    files = await dbClient.find('files', { parentId, userId: ObjectId(user._id) });
  } else {
    files = await dbClient.find('files', { parentId: ObjectId(parentId), userId: ObjectId(user._id) });
  }

  if (files.length === 0) {
    return res.status(200).send([]);
  }
  let documents = files.slice(startIndex, endIndex);

  documents = documents.map((value) => {
    const newDoc = { id: value._id, ...value };
    delete newDoc._id;
    delete newDoc.localPath;
    return newDoc;
  });
  return res.status(200).send(documents);
};

const putPublish = async (req, res) => {
  const sessionToken = req.header('X-Token');
  const user = await getUserBySessionToken(sessionToken);
  const fileId = req.params.id;

  if (!user) return res.status(401).send({ error: 'Unauthorized' });

  const file = await dbClient.findOne('files', { _id: ObjectId(fileId), userId: ObjectId(user._id) });

  if (!file) return res.status(404).send({ error: 'Not found' });

  let updatedFile = { ...file, isPublic: true };

  await dbClient.updateOne('files', file, updatedFile);

  const updatedId = updatedFile._id;
  delete updatedFile._id;
  delete updatedFile.localPath;
  updatedFile = { id: updatedId, ...updatedFile };
  return res.status(200).send(updatedFile);
};

const putUnpublish = async (req, res) => {
  const sessionToken = req.header('X-Token');
  const user = await getUserBySessionToken(sessionToken);
  const fileId = req.params.id;

  if (!user) return res.status(401).send({ error: 'Unauthorized' });

  const file = await dbClient.findOne('files', { _id: ObjectId(fileId), userId: ObjectId(user._id) });

  if (!file) return res.status(404).send({ error: 'Not found' });

  let updatedFile = { ...file, isPublic: false };

  await dbClient.updateOne('files', file, updatedFile);

  const updatedId = updatedFile._id;
  delete updatedFile._id;
  delete updatedFile.localPath;
  updatedFile = { id: updatedId, ...updatedFile };
  return res.status(200).send(updatedFile);
};

// /files/:id/data
const getFile = async (req, res) => {
  const fileId = req.params.id;

  const file = await dbClient.findOne('files', { _id: ObjectId(fileId) });

  if (!file) return res.status(404).send({ error: 'Not found' });

  const sessionToken = req.header('X-Token');

  const user = await getUserBySessionToken(sessionToken);

  if (!user) return res.status(404).send({ error: 'Not found' });

  if (!file.isPublic && String(file.userId) !== String(user._id)) {
    return res.status(404).send({ error: 'Not found' });
  }
  if (file.type === 'folder') return res.status(400).send({ error: 'A folder doesn\'t have content' });
  if (!file.localPath) {
    return res.status(400).send({ error: 'Not found' });
  }

  const fileMimeType = mimetype.contentType(file.localPath);

  const fileContent = fs.readFileSync(fileMimeType, { encoding: 'utf8' });

  return res.status(200).send(fileContent);
};

module.exports = {
  postUpload, getShow, getIndex, putPublish, putUnpublish, getFile,
};
