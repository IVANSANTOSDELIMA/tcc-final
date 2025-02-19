import conectarAoBanco from '../config/dbconfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { /* registrarMovimentacao, */ listarProdutos, adicionarProduto, listarMovimentacoes, deletarProduto, atualizarProduto } from "../models/estoqueModel.js";

let conexao;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Controlador desnecessário - função não utilizada
/* export async function registrarMovimentacaoController(req, res) {
    try {
        console.log('Dados recebidos na requisição:', req.body);
        const resultado = await registrarMovimentacao(req.body);
        res.status(201).json(resultado);
    } catch (erro) {
        console.log('Erro na movimentação:', erro);
        res.status(500).json({ 
            message: 'Erro ao registrar movimentação', 
            erro: erro.message,
            stack: erro.stack 
        });
    }
} */

export async function listarMovimentacoesController(req, res) {
    try {
        console.log('Filtros recebidos:', req.query);
        const movimentacoes = await listarMovimentacoes(req.query);
        res.status(200).json(movimentacoes);
    } catch (erro) {
        console.log('Erro ao listar movimentações:', erro);
        res.status(500).json({ 
            message: 'Erro ao listar movimentações', 
            erro: erro.message 
        });
    }
}

export async function listarProdutosController(req, res) {
    try {
        /* console.log('Filtros recebidos:', req.query); */
        const produtos = await listarProdutos(req.query);
        res.status(200).json(produtos);
    } catch (erro) {
        console.log('Erro ao listar produtos:', erro);
        res.status(500).json({ 
            message: 'Erro ao listar produtos', 
            erro: erro.message 
        });
    }
}

export async function adicionarProdutoController(req, res) {
    const { nome, preco_produto, descricao, /* imagem_produto, */ id_categoria, id_participante } = req.body;
    const imagem_produto = req.file ? req.file.path : null; // Obtém o caminho da imagem se enviada
    try {
        const resultado = await adicionarProduto(nome, preco_produto, descricao, imagem_produto, id_categoria, id_participante);
        res.status(201).json({ message: 'Produto adicionado com sucesso!', resultado });
    } catch (erro) {
        res.status(500).json({ message: 'Erro ao adicionar produto', erro: erro.message });
    }
}

export async function atualizarProdutoController(req, res) {
    try {
        const id = req.params.id.replace('produtos:', ''); // Remove o prefixo se existir
        console.log('ID limpo:', id);
        const resultado = await atualizarProduto(id, req.body);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log('Erro ao atualizar produto:', erro);
        res.status(500).json({ 
            message: 'Erro ao atualizar produto', 
            erro: erro.message 
        });
    }
}


export async function deletarProdutoController(req, res) {
    try {
        if (!conexao){
            conexao = await conectarAoBanco();
        }

        const id = req.params.id.replace('produtos:', '');
        console.log('ID para deletar:', id);

        // Busca o produto para obter o caminho da imagem
        const [produto] = await conexao.execute('SELECT imagem_produto FROM produto WHERE id_produto = ?', [id]);
        
        if (produto.length > 0) {
            const caminhoImagem = produto[0].imagem_produto;
            
            // Remove a imagem do sistema de arquivos
            if (caminhoImagem) {
                const caminhoCompleto = path.join(__dirname, '../../', caminhoImagem);
                console.log('Tentando deletar imagem em:', caminhoImagem);
                if (fs.existsSync(caminhoCompleto)){
                    
                    fs.unlink(caminhoCompleto, (erro) => {
                        if (erro) {
                            console.error('Erro ao deletar a imagem:', erro);
                        }
                    });
                } else{
                    console.log('Arquivo não encontrado:', caminhoCompleto);
                }
            }
            
        }

        const resultado = await deletarProduto(id);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log('Erro ao deletar produto:', erro);
        res.status(500).json({ 
            message: 'Erro ao deletar produto', 
            erro: erro.message 
        });
    }
}

