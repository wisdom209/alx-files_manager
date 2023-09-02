const dbclient = require('../utils/db')
const redisClient = require('../utils/redis')
const uuid = require('uuid')

export const getConnect = async (req, res) => {
	const authorizationHeader = req.headers.authorization

	const basicToken = authorizationHeader.split(' ')[1]

	const decodedToken = Buffer.from(basicToken, 'base64').toString('utf8')

	const email = decodedToken.split(":")[0]

	const user = await dbclient.findOne('users', { email})

	if (!user) return res.status(401).send({ error: "Unauthorized" })

	const sessionToken = uuid.v4()	
	const key = `auth_${sessionToken}`

	await redisClient.set(key, user._id.toString(), 24 * 60 * 60)

	res.setHeader('x-token', key)

	res.send({token: `${sessionToken}`})
}

export const getDisconnect = async (req, res) => {
	const sessionKey = req.headers['x-token']

	const userId = await redisClient.get(`auth_${sessionKey}`)

	const user = await dbclient.findById('users', userId)

	if (!user) return res.status(401).send({error: "Unauthorized"})

	await redisClient.del(`auth_${sessionKey}`)

	res.status(204).send()
}
