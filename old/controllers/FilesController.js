import dbclient from "../utils/db"
import { getUserBySessionId } from "./UsersController"
const path = require('path')
const uuid = require('uuid')
const fs = require('fs')

export const postUpload = async (req, res) => {

	const user = await getUserBySessionId(req, res)

	if (!user) res.status(401).send({ "error": "Unauthorized" })
	console.log(user)

	const acceptedFileTypes = ['folder', 'file', 'image']

	const name = req.body.name
	const type = req.body.type
	const parentId = req.body.parentId || 0
	const isPublic = req.body.isPublic || false
	const data = req.body.data
	const userId = user?._id
	let localPath = undefined

	if (!name) return res.status(400).send({ error: 'Missing name' })

	if (!type || !acceptedFileTypes.includes(type)) return res.status(400).send({ error: "Missing type" })

	if (!data && type != 'folder') return res.status(400).send({ error: "Missing data" })

	if (parentId != 0) {
		const files = await dbclient.findAllWithId('files', 'parentId', parentId)

		if (!files || files.length == 0) return res.status(400).send({ error: "Parent not found" })

		if (files[0].type != 'folder') return res.status(400).send({ error: "Parent is not a folder" })
	}

	let document = { userId, name, type, isPublic, parentId, data }

	if (type == 'folder') {
		const savedFile = await dbclient.save('files', document)
		
		let returnDoc = savedFile.ops[0]
		
		const id = returnDoc._id;
		
		delete returnDoc._id;
		
		returnDoc = { id, ...returnDoc }
		
		return res.status(201).send(returnDoc)
	}

	let resolvedPath = process.env.FOLDER_PATH

	if (!resolvedPath) {
		resolvedPath = '/tmp/files_manager'
	}
	else {
		resolvedPath = path.resolve(__dirname, process.env.FOLDER_PATH)
	}

	const fileData = Buffer.from(data, 'base64');

	fs.mkdirSync(resolvedPath, { recursive: true })

	localPath = path.join(resolvedPath, uuid.v4())

	fs.writeFileSync(localPath, fileData)

	document = { ...document, localPath }

	const addedFile = await dbclient.save('files', document)

	let returnDoc = addedFile.ops[0]
	const id = returnDoc._id

	delete returnDoc._id
	delete returnDoc.localPath
	delete returnDoc.data

	returnDoc = {id, ...returnDoc}

	res.status(201).send(returnDoc)
}
cl
