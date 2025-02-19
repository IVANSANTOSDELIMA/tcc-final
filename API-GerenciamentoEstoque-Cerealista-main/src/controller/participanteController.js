import { listarParticipantes, adicionarParticipante, atualizarParticipante, deletarParticipante } from "../models/participanteModel.js";

export async function listarParticipantesController(req, res) {
    try {
        console.log('Filtros recebidos:', req.query);
        const participantes = await listarParticipantes(req.query);
        res.status(200).json(participantes);
    } catch (erro) {
        console.log('Erro ao listar participantes:', erro);
        res.status(500).json({ 
            message: 'Erro ao listar participantes', 
            erro: erro.message 
        });
    }
}

export async function adicionarParticipanteController(req, res) {
    const { nome_participante, telefone_participante, rua, numero, complemento, bairro, cidade, estado, cep, cnpj, cpf } = req.body;
    try {
        const resultado = await adicionarParticipante(nome_participante, telefone_participante, rua, numero, complemento, bairro, cidade, estado, cep, cnpj, cpf);
        res.status(201).json({ message: 'Participante adicionado com sucesso!', resultado });
    } catch (erro) {
        res.status(500).json({ message: 'Erro ao adicionar participante', erro: erro.message });
    }
}

export async function atualizarParticipanteController(req, res) {
    try {
        const id = req.params.id;
        console.log('ID:', id);
        const resultado = await atualizarParticipante(id, req.body);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log('Erro ao atualizar participante:', erro);
        res.status(500).json({ 
            message: 'Erro ao atualizar participante', 
            erro: erro.message 
        });
    }
}

export async function deletarParticipanteController(req, res) {
    try {
        const id = req.params.id;
        console.log('ID para deletar:', id);
        const resultado = await deletarParticipante(id);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log('Erro ao deletar participante:', erro);
        res.status(500).json({ 
            message: 'Erro ao deletar participante', 
            erro: erro.message 
        });
    }
}
