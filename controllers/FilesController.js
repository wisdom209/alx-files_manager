import dbclient from "../utils/db"
import { getUserBySessionId } from "./UsersController"

export const postUpload = async (req, res) => {

    const user = await getUserBySessionId(req, res)

	if (!user) res.status(401).send({"error": "Unauthorized"})

	const acceptedFileTypes = ['folder', 'file', 'image']

	const name = req.body.name
	const type = req.body.type
	const parentId = req.body.parentId || 0
	const isPublic = req.body.isPublic || false
	const data = req.body.data
	const userId = user._id

	if (!name) return res.status(400).send({error: 'Missing name'})

	if (!type || !acceptedFileTypes.includes(type) ) return res.status(400).send({error: "Missing type"})

	if (!data && type != 'folder') return res.status(400).send({error: "Missing data"})

	if (parentId != 0){
		const files = await dbclient.findAllWithId('files', 'parentId', parentId)
		
		if (!files || files.length == 0) return res.status(400).send({error: "Parent not found"})

		if (files[0].type != 'folder') return res.status(400).send({error: "Parent is not a folder"})

	}

	// To be continue


	return null
}
