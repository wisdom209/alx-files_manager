import dbclient from '../utils/db'
import redisClient from '../utils/redis'

const dbClient = require('../utils/db')

export const createUser = async (req, res) => {
	const email = req.body?.email
	let password = req.body?.password

	if (!email) return res.status(400).send({ error: "Missing email" })

	if (!password) return res.status(400).send({ error: "Missing password" })

	const emailExists = await dbClient.findOne('users', { email })

	if (emailExists) return res.status(400).send({ error: "Already exist" })

	password = dbClient.hashPasswword(password)

	const user = await dbClient.save('users', { email, password })

	res.status(201).send({ id: user.ops[0]._id, email: user.ops[0].email })
}


export const getMe = async (req, res) => {

	const user = await getUserBySessionId(req, res)

	if (!user) return res.status(401).send({error: "Unauthorized"})
	
	res.status(201).send({ id: user._id, email: user.email })
}


export const getUserBySessionId = async (req, res) => {
	const sessionToken = req.headers['x-token']

	if (!sessionToken) return null

	const userId = await redisClient.get(`auth_${sessionToken}`)

	const user = await dbclient.findById('users', userId)

	if (!user) return null

	return user
}
