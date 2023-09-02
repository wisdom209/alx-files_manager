const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (err) => {
      console.log(err);
    });

    this.redisGet = promisify(this.client.get).bind(this.client);
    this.redisSet = promisify(this.client.set).bind(this.client);
    this.redisDel = promisify(this.client.del).bind(this.client);
    this.redisClientAlive = false;
    this.client.on('connect', () => {
      this.redisClientAlive = true;
    });
  }

  isAlive() {
    return this.redisClientAlive;
  }

  async get(key) {
    const result = await this.redisGet(key);
    return result;
  }

  async set(key, val, duration) {
    await this.redisSet(key, val, 'EX', duration);
  }

  async del(key) {
    await this.redisDel(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
