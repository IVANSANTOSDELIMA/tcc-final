import conectarAoBanco from "../config/dbconfig.js";

const conexao = await conectarAoBanco();
/* console.log('Conexão com o banco de dados estabelecida com sucesso!'); */


export async function listarParticipantes(filtros = {}) {
    try {
        let query = `
            SELECT 
                id_participante,
                nome_participante,
                telefone_participante,
                rua,
                bairro,
                numero,
                complemento,
                cidade,
                estado,
                cep,
                cnpj,
                cpf
            FROM participante
            WHERE 1=1
        `;

        const params = [];

        if (filtros.nome) {
            query += ` AND nome_participante LIKE ?`;
            params.push(`%${filtros.nome}%`);
        }

        if (filtros.cidade) {
            query += ` AND cidade LIKE ?`;
            params.push(`%${filtros.cidade}%`);
        }

        if (filtros.estado) {
            query += ` AND estado = ?`;
            params.push(filtros.estado);
        }

        if (filtros.cnpj) {
            query += ` AND cnpj LIKE ?`;
            params.push(`%${filtros.cnpj}%`);
        }

        if (filtros.cpf) {
            query += ` AND cpf LIKE ?`;
            params.push(`%${filtros.cpf}%`);
        }

        query += ` ORDER BY nome_participante`;

        const [participantes] = await conexao.execute(query, params);
        return participantes;
    } catch (erro) {
        throw new Error('Erro ao listar participantes: ' + erro.message);
    }
}


export async function adicionarParticipante(nome_participante, telefone_participante, rua, numero, complemento, bairro, cidade, estado, cep, cnpj, cpf) {
    const query = `
        INSERT INTO participante (nome_participante, telefone_participante, rua, numero, complemento, bairro, cidade, estado, cep, cnpj, cpf)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [resultado] = await conexao.execute(query, [nome_participante, telefone_participante, rua, numero, complemento, bairro, cidade, estado, cep, cnpj, cpf]);
    return resultado;
}

export async function atualizarParticipante(id_participante, dados) {
    try {
        let query = 'UPDATE participante SET';
        const valores = [];
        const campos = [];

        if (dados.nome_participante) {
            campos.push(' nome_participante = ?');
            valores.push(dados.nome_participante);
        }
        if (dados.telefone_participante) {
            campos.push(' telefone_participante = ?');
            valores.push(dados.telefone_participante);
        }
        if (dados.rua) {
            campos.push(' rua = ?');
            valores.push(dados.rua);
        }
        if (dados.numero) {
            campos.push(' numero = ?');
            valores.push(dados.numero);
        }
        if (dados.complemento) {
            campos.push(' complemento = ?');
            valores.push(dados.complemento);
        }
        if (dados.bairro) {
            campos.push(' bairro = ?');
            valores.push(dados.bairro);
        }
        if (dados.cidade) {
            campos.push(' cidade = ?');
            valores.push(dados.cidade);
        }
        if (dados.estado) {
            campos.push(' estado = ?');
            valores.push(dados.estado);
        }
        if (dados.cep) {
            campos.push(' cep = ?');
            valores.push(dados.cep);
        }
        if (dados.cnpj) {
            campos.push(' cnpj = ?');
            valores.push(dados.cnpj);
        }
        if (dados.cpf) {
            campos.push(' cpf = ?');
            valores.push(dados.cpf);
        }

        query += campos.join(',') + ' WHERE id_participante = ?';
        valores.push(id_participante);

        const [resultado] = await conexao.execute(query, valores);
        return resultado;
    } catch (erro) {
        throw new Error('Erro ao atualizar participante: ' + erro.message);
    }
}

export async function deletarParticipante(id_participante) {
    try {
        // Primeiro deleta os pedidos relacionados
        const queryPedidos = `DELETE FROM pedidos WHERE id_participante = ?`;
        await conexao.execute(queryPedidos, [id_participante]);

        // Depois deleta o participante
        const queryParticipante = `DELETE FROM participante WHERE id_participante = ?`;
        const [resultado] = await conexao.execute(queryParticipante, [id_participante]);
        
        return resultado;
    } catch (erro) {
        throw new Error('Erro ao deletar participante: ' + erro.message);
    }
}
