import conectarAoBanco from "../config/dbconfig.js";

const conexao = await conectarAoBanco();
/* console.log('Conexão com o banco de dados estabelecida com sucesso!'); */

export async function listarCategorias() {
    try {
        const [categorias] = await conexao.execute('SELECT * FROM categoria');
        return categorias;
    } catch (erro) {
        throw new Error('Erro ao listar categorias: ' + erro.message);
    }
}
export async function adicionarCategoria(nome_categoria) {
    const query = `
        INSERT INTO categoria (nome_categoria)
        VALUES (?)
    `;
    const [resultado] = await conexao.execute(query, [nome_categoria]);
    return resultado;
}

export async function atualizarCategoria(id_categoria, dados) {
    try {
        let query = 'UPDATE categoria SET';
        const valores = [];
        const campos = [];

        if (dados.nome_categoria) {
            campos.push(' nome_categoria = ?');
            valores.push(dados.nome_categoria);
        }

        query += campos.join(',') + ' WHERE id_categoria = ?';
        valores.push(id_categoria);

        const [resultado] = await conexao.execute(query, valores);
        return resultado;
    } catch (erro) {
        throw new Error('Erro ao atualizar categoria: ' + erro.message);
    }
}

export async function deletarCategoria(id_categoria) {
    try {
        // Primeiro verifica se existem produtos usando esta categoria
        const [produtos] = await conexao.execute(
            'SELECT COUNT(*) as total FROM produto WHERE id_categoria = ?',
            [id_categoria]
        );

        if (produtos[0].total > 0) {
            throw new Error('Não é possível deletar categoria em uso por produtos');
        }

        const query = `DELETE FROM categoria WHERE id_categoria = ?`;
        const [resultado] = await conexao.execute(query, [id_categoria]);
        return resultado;
    } catch (erro) {
        throw new Error('Erro ao deletar categoria: ' + erro.message);
    }
}
