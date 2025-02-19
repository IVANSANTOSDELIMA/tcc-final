import express from 'express';
import upload from '../config/uploadConfig.js';
import { listarFuncionariosController, adicionarFuncionarioController, atualizarFuncionarioController, deletarFuncionarioController } from '../controller/funcionariosController.js';

const router = express.Router();

router.get('/', listarFuncionariosController);
router.post('/', upload.single('imagemFuncionario'), adicionarFuncionarioController); // Adicionar novo funcionário com upload de imagem
router.put('/:id', atualizarFuncionarioController);
router.delete('/:id', deletarFuncionarioController);

export default router;