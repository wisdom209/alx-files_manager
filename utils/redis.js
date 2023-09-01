const redis = require('redis')
const { promisify } = require('util')

class RedisClient {

	constructor() {
		this.client = redis.createClient()
		this.redisAsyncGetClient = promisify(this.client.get).bind(this.client)
		this.redisAsyncSetClient = promisify(this.client.set).bind(this.client)
		this.redisAsyncDelClient = promisify(this.client.del).bind(this.client)
		this.redisClientAlive = false

		this.client.on('error', (error) => {
			console.log(error)
		})
		this.client.on('connect', () => {
			this.redisClientAlive = true
		})
	}

	isAlive = () => {
		return this.redisClientAlive
	}

	get = async (key) => {
		const result = await this.redisAsyncGetClient(key)
		return result
	}

	set = async (key, value, duration) => {
		await this.redisAsyncSetClient(key, value, 'EX', duration)
	}

	del = async (key) => {
		await this.redisAsyncDelClient(key)
	}
}

const redisClient = new RedisClient()

module.exports = redisClient
