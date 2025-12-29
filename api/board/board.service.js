import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

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

        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection(BOARD_COLLECTION)
        const board = await collection.findOne({ _id: boardId })

        if (!board) throw new Error('Board not found')
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection(BOARD_COLLECTION)
        const { deletedCount } = await collection.deleteOne({ _id: boardId })

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
        await collection.updateOne({ _id: board._id }, { $set: boardToSave })

        return board
    } catch (err) {
        logger.error(`cannot update board ${board._id}`, err)
        throw err
    }
}

async function addBoardMsg(boardId, msg) {
    try {
        msg.id = utilService.makeId()
        msg.createdAt = Date.now()

        const collection = await dbService.getCollection(BOARD_COLLECTION)
        await collection.updateOne({ _id: boardId }, { $push: { msgs: msg } })

        return msg
    } catch (err) {
        logger.error(`cannot add board msg ${boardId}`, err)
        throw err
    }
}

async function removeBoardMsg(boardId, msgId) {
    try {
        const collection = await dbService.getCollection(BOARD_COLLECTION)
        await collection.updateOne({ _id: boardId }, { $pull: { msgs: { id: msgId } } })

        return msgId
    } catch (err) {
        logger.error(`cannot remove board msg ${boardId}`, err)
        throw err
    }
}
