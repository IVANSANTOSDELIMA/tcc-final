import { criarPedido, listarPedidos } from "../models/pedidosModel.js";

export async function criarPedidoController(req, res) {
    try {
        console.log('Dados recebidos:', req.body);
        const resultado = await criarPedido(req.body);
        res.status(201).json(resultado);
    } catch (erro) {
        console.log('Erro ao criar pedido:', erro);
        res.status(500).json({ 
            message: 'Erro ao criar pedido', 
            erro: erro.message 
        });
    }
}

export async function listarPedidosController(req, res) {
    try {
        console.log('Filtros recebidos:', req.query);
        const pedidos = await listarPedidos(req.query);
        res.status(200).json(pedidos);
    } catch (erro) {
        console.log('Erro ao listar pedidos:', erro);
        res.status(500).json({ 
            message: 'Erro ao listar pedidos', 
            erro: erro.message 
        });
    }
}
