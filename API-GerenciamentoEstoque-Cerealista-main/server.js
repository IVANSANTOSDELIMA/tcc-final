import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import estoqueRoutes from './src/routes/estoqueRoutes.js';
import funcionariosRoutes from './src/routes/funcionariosRoutes.js';
import categoriaRoutes from './src/routes/categoriaRoutes.js';
import participanteRoutes from './src/routes/participanteRoutes.js';
import pedidosRoutes from './src/routes/pedidosRoutes.js';
import authRoutes from './src/auth/authRoutes.js';
import { verificaToken, verificaNivelAcesso } from './src/auth/authMiddleware.js';

dotenv.config();

const app = express();

// Configura o body-parser para processar JSON
app.use(bodyParser.json());
// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/estoque', verificaToken, estoqueRoutes);
app.use('/api/funcionarios', verificaToken, verificaNivelAcesso(1), funcionariosRoutes);
app.use('/api/categorias', verificaToken, categoriaRoutes);
app.use('/api/participante', verificaToken, participanteRoutes);
app.use('/api/pedidos', verificaToken, pedidosRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});