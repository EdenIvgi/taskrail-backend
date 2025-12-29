import express from 'express'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import {
    getBoards,
    getBoardById,
    addBoard,
    updateBoard,
    removeBoard,
    addBoardMsg,
    removeBoardMsg
} from './board.controller.js'

const router = express.Router()

// We can add a middleware for all routes at once
// or per route

router.get('/', log, getBoards)
router.get('/:id', log, getBoardById)
router.post('/', log, requireAuth, addBoard)
router.put('/:id', log, requireAuth, updateBoard)
router.delete('/:id', log, requireAuth, removeBoard)

// Board messages
router.post('/:id/msg', log, requireAuth, addBoardMsg)
router.delete('/:id/msg/:msgId', log, requireAuth, removeBoardMsg)

export const boardRoutes = router
