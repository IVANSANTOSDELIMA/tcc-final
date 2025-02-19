import express from 'express';
import { criarPedidoController, listarPedidosController } from '../controller/pedidosController.js';

const router = express.Router();

router.post('/', criarPedidoController);
router.get('/', listarPedidosController);

export default router;

