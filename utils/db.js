const { MongoClient } = require('mongodb')
const crypto = require('crypto')

class DBClient {

	constructor() {
		this.host = process.env.DB_HOST || 'localhost'
		this.port = process.env.DB_PORT || 27017
		this.database = process.env.DB_DATABASE || 'files_manager'

		const uri = `mongodb://${this.host}:${this.port}`

		this.client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true })

		this.connected = false;

		this.connect()
	}

	connect = async () => {
		await this.client.connect()
		this.connected = true;
	}

	isAlive = () => {
		return this.connected
	}

	nbUsers = async () => {
		try {
			const db = this.client.db(this.database)
			const collections = db.collection('users')
			const count = await collections.countDocuments()
			return count
		} catch (e) {
			console.log(e)
		}
	}

	nbFiles = async () => {
		try {
			const db = this.client.db(this.database)
			const collections = db.collection('files')
			const count = await collections.countDocuments()
			return count
		} catch (e) {
			console.log(e)
		}
	}

	findOne = async (collection, entity) => {
		try {
			const db = this.client.db(this.database)
			const collections = db.collection(collection)
			const value = await collections.findOne(entity)
			return value
		} catch (e) {
			console.log(e)
		}
	}

	save = async (collection, entity) => {
		try {
			const db = this.client.db(this.database)
			const collections = db.collection(collection)
			const value = await collections.insertOne(entity)
			return value
		} catch (e) {
			console.log(e)
		}
	}

	hashPasswword = (password) => {
		const hash = crypto.createHash('sha1')

		hash.update(password)

		const hashedPassword = hash.digest('hex')

		return hashedPassword
	}
}

const dbclient = new DBClient()

module.exports = dbclient
