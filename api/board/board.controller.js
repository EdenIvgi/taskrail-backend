import { boardService } from './board.service.js'
import { logger } from '../../services/logger.service.js'

export async function getBoards(req, res) {
    try {
        const filterBy = {
            txt: req.query.txt || '',
        }

        const boards = await boardService.query(filterBy)
        res.json(boards)
    } catch (err) {
        logger.error('Failed to get boards', err)
        res.status(500).send({ err: 'Failed to get boards' })
    }
}

export async function getBoardById(req, res) {
    try {
        const boardId = req.params.id
        const board = await boardService.getById(boardId)
        res.json(board)
    } catch (err) {
        logger.error('Failed to get board', err)
        res.status(500).send({ err: 'Failed to get board' })
    }
}

export async function addBoard(req, res) {
    try {
        const board = req.body
        const addedBoard = await boardService.add(board)
        res.json(addedBoard)
    } catch (err) {
        logger.error('Failed to add board', err)
        res.status(500).send({ err: 'Failed to add board' })
    }
}

export async function updateBoard(req, res) {
    try {
        const board = req.body
        const updatedBoard = await boardService.update(board)
        res.json(updatedBoard)
    } catch (err) {
        logger.error('Failed to update board', err)
        res.status(500).send({ err: 'Failed to update board' })
    }
}

export async function removeBoard(req, res) {
    try {
        const boardId = req.params.id
        await boardService.remove(boardId)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to remove board', err)
        res.status(500).send({ err: 'Failed to remove board' })
    }
}

export async function addBoardMsg(req, res) {
    try {
        const boardId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: req.loggedinUser
        }

        const savedMsg = await boardService.addBoardMsg(boardId, msg)
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to add board message', err)
        res.status(500).send({ err: 'Failed to add board message' })
    }
}

export async function removeBoardMsg(req, res) {
    try {
        const boardId = req.params.id
        const { msgId } = req.params
        await boardService.removeBoardMsg(boardId, msgId)
        res.send({ msg: 'Message deleted successfully' })
    } catch (err) {
        logger.error('Failed to remove board message', err)
        res.status(500).send({ err: 'Failed to remove board message' })
    }
}
