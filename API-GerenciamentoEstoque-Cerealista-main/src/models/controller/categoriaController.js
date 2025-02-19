import { listarCategorias, adicionarCategoria, atualizarCategoria, deletarCategoria } from "../models/categoriaModel.js";

export async function listarCategoriasController(req, res) {
    try {
        const categorias = await listarCategorias();
        res.status(200).json(categorias);
    } catch (erro) {
        res.status(500).json({ message: 'Erro ao listar categorias', erro: erro.message });
    }
}

export async function adicionarCategoriaController(req, res) {
    const { nome_categoria } = req.body;
    try {
        const resultado = await adicionarCategoria(nome_categoria);
        res.status(201).json({ message: 'Categoria adicionada com sucesso!', resultado });
    } catch (erro) {
        res.status(500).json({ message: 'Erro ao adicionar categoria', erro: erro.message });
    }
}

export async function atualizarCategoriaController(req, res) {
    try {
        const id = req.params.id;
        console.log('ID:', id);
        const resultado = await atualizarCategoria(id, req.body);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log('Erro ao atualizar categoria:', erro);
        res.status(500).json({ 
            message: 'Erro ao atualizar categoria', 
            erro: erro.message 
        });
    }
}

export async function deletarCategoriaController(req, res) {
    try {
        const id = req.params.id;
        console.log('ID para deletar:', id);
        const resultado = await deletarCategoria(id);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log('Erro ao deletar categoria:', erro);
        res.status(500).json({ 
            message: 'Erro ao deletar categoria', 
            erro: erro.message 
        });
    }
}
