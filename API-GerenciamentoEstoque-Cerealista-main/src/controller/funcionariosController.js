import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import conectarAoBanco from "../config/dbconfig.js"; // Certifique-se de que esta linha está presente
import { listarFuncionarios, adicionarFuncionario, atualizarFuncionario, deletarFuncionario } from "../models/funcionariosModel.js";
import { fileURLToPath } from 'url';

let conexao;
// Obtem o diretório atual
const __fillename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fillename);

export async function listarFuncionariosController(req, res) {
    try {
        console.log('Filtros recebidos:', req.query);
        const funcionarios = await listarFuncionarios(req.query);
        res.status(200).json(funcionarios);
    } catch (erro) {
        console.log('Erro ao listar funcionários:', erro);
        res.status(500).json({ 
            message: 'Erro ao listar funcionários', 
            erro: erro.message 
        });
    }
}

export async function adicionarFuncionarioController(req, res) {
    const { cpf, data_admissao, rua, numero, complemento, bairro, cidade, estado, cep, senha, telefone_funcionario, nome_funcionario, nivel_acesso, cargo, email /* , imagem_funcionario */ } = req.body;
    const imagem_funcionario = req.file ? req.file.path : null; // Obtém o caminho da imagem se enviada
    const senhaHash = bcrypt.hashSync(senha, 10);
    try {
        const resultado = await adicionarFuncionario(cpf, data_admissao, rua, numero, complemento, bairro, cidade, estado, cep, senhaHash, telefone_funcionario, nome_funcionario, nivel_acesso, cargo, imagem_funcionario, email);
        res.status(201).json({ message: 'Funcionário adicionado com sucesso!', resultado });
    } catch (erro) {
        res.status(500).json({ message: 'Erro ao adicionar funcionário', erro: erro.message });
    }
}

export async function atualizarFuncionarioController(req, res) {
    try {
        const id = req.params.id.replace('funcionarios:', '');
        console.log('ID limpo:', id);
        const resultado = await atualizarFuncionario(id, req.body);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log('Erro ao atualizar funcionário:', erro);
        res.status(500).json({ 
            message: 'Erro ao atualizar funcionário', 
            erro: erro.message 
        });
    }
}

export async function deletarFuncionarioController(req, res) {
    try {
        if (!conexao) {
            conexao = await conectarAoBanco(); // Conecta ao banco se ainda não estiver conectado
        }
        const id = req.params.id.replace('funcionarios:', '');
        console.log('ID para deletar:', id);
        
        // Busca o funcionário para obter o caminho da imagem
        const [funcionario] = await conexao.execute('SELECT imagem_funcionario FROM funcionarios WHERE id_funcionario = ?', [id]);
        
        if (funcionario.length > 0 && funcionario[0].imagem_funcionario) {
            const caminhoImagem = funcionario[0].imagem_funcionario;

            // Remove a imagem do sistema de arquivos
            if (caminhoImagem) {
                const caminhoCompleto = path.join(__dirname, '../../', caminhoImagem);
                console.log('Tentando deletar a imagem em:', caminhoCompleto); // Log do caminho

                // Verifica se o arquivo existe antes de tentar deletá-lo
                if (fs.existsSync(caminhoCompleto)) {
                    fs.unlink(caminhoCompleto, (erro) => {
                        if (erro) {
                            console.error('Erro ao deletar a imagem:', erro);
                        }
                    });
                } else {
                    console.log('Arquivo não encontrado:', caminhoCompleto);
                }
            }
        }
        const resultado = await deletarFuncionario(id);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log('Erro ao deletar funcionário:', erro);
        res.status(500).json({ 
            message: 'Erro ao deletar funcionário', 
            erro: erro.message 
        });
    }
}
