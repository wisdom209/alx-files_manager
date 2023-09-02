const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.PORT || 27017;
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
}

const dbClient = new DBClient();

module.exports = dbClient;
