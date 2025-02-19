import express from 'express';
import { listarParticipantesController, adicionarParticipanteController, atualizarParticipanteController, deletarParticipanteController } from '../controller/participanteController.js';

const router = express.Router();

router.get('/', listarParticipantesController);
router.post('/', adicionarParticipanteController);
router.put('/:id', atualizarParticipanteController);
router.delete('/:id', deletarParticipanteController);


export default router;
