import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { ObjectId } from 'mongodb'

const BOARD_COLLECTION = 'board'

export const boardService = {
    query,
    getById,
    remove,
    add,
    update,
    addBoardMsg,
    removeBoardMsg
}

async function query(filterBy = { txt: '' }) {
    try {
        const criteria = {}

        if (filterBy.txt) {
            criteria.title = { $regex: filterBy.txt, $options: 'i' }
        }

        const collection = await dbService.getCollection(BOARD_COLLECTION)
        var boards = await collection.find(criteria).toArray()

        // If no boards exist, create a demo board
        if (boards.length === 0) {
            const demoBoard = {
                title: 'My First Board',
                isStarred: true,
                createdAt: Date.now(),
                createdBy: null,
                style: { backgroundColor: '#0079bf' },
                labels: [],
                members: [],
                lists: [
                    {
                        id: makeId(),
                        title: 'To Do',
                        tasks: [
                            { id: makeId(), title: 'Welcome to TaskRail!' },
                            { id: makeId(), title: 'Click on a task to edit it' }
                        ]
                    },
                    {
                        id: makeId(),
                        title: 'In Progress',
                        tasks: []
                    },
                    {
                        id: makeId(),
                        title: 'Done',
                        tasks: []
                    }
                ],
                activities: [],
                recentlyViewed: null
            }
            await collection.insertOne(demoBoard)
            boards = [demoBoard]
            logger.info('Created demo board')
        }

        // Convert _id to string for frontend
        boards = boards.map(board => ({
            ...board,
            _id: board._id.toString()
        }))

        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection(BOARD_COLLECTION)
        const board = await collection.findOne({ _id: ObjectId.createFromHexString(boardId) })

        if (!board) throw new Error('Board not found')
        
        // Convert _id to string for frontend
        board._id = board._id.toString()
        
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection(BOARD_COLLECTION)
        const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(boardId) })

        if (deletedCount === 0) throw new Error('Board not found')
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function add(board) {
    try {
        const boardToAdd = {
            title: board.title,
            isStarred: board.isStarred || false,
            createdAt: Date.now(),
            createdBy: board.createdBy,
            style: board.style || { backgroundColor: '#0079bf' },
            labels: board.labels || [],
            members: board.members || [],
            lists: board.lists || [],
            activities: board.activities || [],
            recentlyViewed: null
        }

        const collection = await dbService.getCollection(BOARD_COLLECTION)
        await collection.insertOne(boardToAdd)

        // Convert _id to string for frontend
        boardToAdd._id = boardToAdd._id.toString()

        return boardToAdd
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

async function update(board) {
    try {
        const boardToSave = {
            title: board.title,
            isStarred: board.isStarred,
            style: board.style,
            labels: board.labels,
            members: board.members,
            lists: board.lists,
            activities: board.activities,
            recentlyViewed: board.recentlyViewed
        }

        const collection = await dbService.getCollection(BOARD_COLLECTION)
        const boardId = typeof board._id === 'string' ? ObjectId.createFromHexString(board._id) : board._id
        await collection.updateOne({ _id: boardId }, { $set: boardToSave })

        return board
    } catch (err) {
        logger.error(`cannot update board ${board._id}`, err)
        throw err
    }
}

async function addBoardMsg(boardId, msg) {
    try {
        msg.id = makeId()
        msg.createdAt = Date.now()
        
        const boardObjectId = ObjectId.createFromHexString(boardId)
        const collection = await dbService.getCollection(BOARD_COLLECTION)
        await collection.updateOne({ _id: boardObjectId }, { $push: { msgs: msg } })

        return msg
    } catch (err) {
        logger.error(`cannot add board msg ${boardId}`, err)
        throw err
    }
}

async function removeBoardMsg(boardId, msgId) {
    try {
        const boardObjectId = ObjectId.createFromHexString(boardId)
        const collection = await dbService.getCollection(BOARD_COLLECTION)
        await collection.updateOne({ _id: boardObjectId }, { $pull: { msgs: { id: msgId } } })

        return msgId
    } catch (err) {
        logger.error(`cannot remove board msg ${boardId}`, err)
        throw err
    }
}
