const { MongoClient, ObjectId } = require('mongodb');

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';

    this.mongouri = `mongodb://${this.host}:${this.port}`;

    this.client = new MongoClient(this.mongouri,
      { useNewUrlParser: true, useUnifiedTopology: true });

    this.connected = false;

    this.connect();
  }

  async connect() {
    await this.client.connect();
    this.connected = true;
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    const db = this.client.db(this.database);
    const collection = db.collection('users');
    const userDocumentCount = await collection.countDocuments();

    return userDocumentCount;
  }

  async nbFiles() {
    const db = this.client.db(this.database);
    const collection = db.collection('files');
    const filesDocumentCount = await collection.countDocuments();

    return filesDocumentCount;
  }

  async save(collectionName, document) {
    const db = this.client.db(this.database);
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(document);
    return result;
  }

  async findOne(collectionName, documentDetail) {
    const db = this.client.db(this.database);
    const collection = db.collection(collectionName);
    const result = await collection.findOne(documentDetail);
    console.log(result);
    return result;
  }

  async findById(collectionName, docId, key = '_id') {
    try {
      const db = this.client.db(this.database);
      const collection = db.collection(collectionName);
      let result = '';
      if (key === '_id') {
        result = await collection.findOne({ _id: ObjectId(docId) });
      } else {
        result = await collection.find({ [key]: ObjectId(docId) }).toArray();
      }
      return result;
    } catch (e) {
      console.log(e.message);
    }
    return null;
  }

  async find(collectionName, documentDetail) {
    const db = this.client.db(this.database);
    const collection = db.collection(collectionName);
    const result = await collection.find(documentDetail).toArray();
    return result;
  }

  async updateOne(collectionName, docFilter, documentDetail) {
    const db = this.client.db(this.database);
    const collection = db.collection(collectionName);

    const update = { $set: documentDetail };
    const result = await collection.updateOne(docFilter, update);
    console.log(result);
    return result;
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
