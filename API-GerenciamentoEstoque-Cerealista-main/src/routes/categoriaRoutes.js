import express from 'express';
import { listarCategoriasController, adicionarCategoriaController, atualizarCategoriaController, deletarCategoriaController } from '../controller/categoriaController.js';

const router = express.Router();

router.get('/', listarCategoriasController);
router.post('/', adicionarCategoriaController);
router.put('/:id', atualizarCategoriaController);
router.delete('/:id', deletarCategoriaController);


export default router;
