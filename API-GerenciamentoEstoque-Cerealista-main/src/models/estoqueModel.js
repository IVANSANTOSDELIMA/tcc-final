import conectarAoBanco from "../config/dbconfig.js";

const conexao = await conectarAoBanco();
// Função desneceessária - migrada para o criarPedido
/* export async function registrarMovimentacao(dados) {
    const { id_produto, preco_total, id_tipo_movimentacao, id_pedido, id_pedido_item, quantidade } = dados;

    try {
        // Busca situação atual do estoque
        const [estoqueAtual] = await conexao.execute(
            'SELECT id_estoque, qntd_produto, status_produto FROM estoque WHERE id_produto = ?',
            [id_produto]
        );

        // Validações
        if (id_tipo_movimentacao === 'S') {
            if (estoqueAtual[0].status_produto === 'Indisponível') {
                throw new Error('Produto indisponível para saída');
            }
            if (estoqueAtual[0].qntd_produto < quantidade) {
                throw new Error('Quantidade insuficiente em estoque');
            }
        }

        // Registra movimentação
        const queryMovimentacao = `
            INSERT INTO movimentacao_estoque 
            (id_produto, id_estoque, preco_total, id_tipo_movimentacao, id_pedido, id_pedido_item, quantidade, data)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())
        `;
        
        await conexao.execute(queryMovimentacao, [
            id_produto,
            estoqueAtual[0].id_estoque,
            preco_total,
            id_tipo_movimentacao,
            id_pedido,
            id_pedido_item,
            quantidade
        ]);

        // Atualiza quantidade e status
        const novaQuantidade = id_tipo_movimentacao === 'E' 
            ? estoqueAtual[0].qntd_produto + quantidade
            : estoqueAtual[0].qntd_produto - quantidade;

        const novoStatus = novaQuantidade > 0 ? 'Disponível' : 'Indisponível';

        const queryAtualizaEstoque = `
            UPDATE estoque 
            SET qntd_produto = ?, status_produto = ?
            WHERE id_produto = ?
        `;
        
        await conexao.execute(queryAtualizaEstoque, [novaQuantidade, novoStatus, id_produto]);

        return { 
            message: 'Movimentação registrada com sucesso!',
            novaQuantidade,
            status: novoStatus
        };
    } catch (erro) {
        throw new Error('Erro ao registrar movimentação: ' + erro.message);
    }
} */

    export async function listarMovimentacoes(filtros = {}) {
    try {
        let query = `
            SELECT 
                m.id_movimentacao,
                m.data,
                m.quantidade,
                m.preco_total,
                m.id_tipo_movimentacao,
                p.nome as nome_produto,
                t.descricao as tipo_movimentacao,
                part.nome_participante
            FROM movimentacao_estoque m
            INNER JOIN produto p ON m.id_produto = p.id_produto
            INNER JOIN tipo_movimentacao t ON m.id_tipo_movimentacao = t.id_tipo_movimentacao
            INNER JOIN pedidos ped ON m.id_pedido = ped.id_pedido
            INNER JOIN participante part ON ped.id_participante = part.id_participante
            WHERE 1=1
        `;

        const params = [];

        if (filtros.dataInicio) {
            query += ` AND m.data >= ?`;
            params.push(filtros.dataInicio);
        }

        if (filtros.dataFim) {
            query += ` AND m.data <= ?`;
            params.push(filtros.dataFim);
        }

        if (filtros.tipoMovimentacao) {
            query += ` AND m.id_tipo_movimentacao = ?`;
            params.push(filtros.tipoMovimentacao);
        }

        if (filtros.nomeProduto) {
            query += ` AND p.nome LIKE ?`;
            params.push(`%${filtros.nomeProduto}%`);
        }

        if (filtros.nomeParticipante) {
            query += ` AND part.nome_participante LIKE ?`;
            params.push(`%${filtros.nomeParticipante}%`);
        }

        if (filtros.valorMin) {
            query += ` AND m.preco_total >= ?`;
            params.push(filtros.valorMin);
        }

        if (filtros.valorMax) {
            query += ` AND m.preco_total <= ?`;
            params.push(filtros.valorMax);
        }

        query += ` ORDER BY m.data DESC`;

        const [movimentacoes] = await conexao.execute(query, params);
        return movimentacoes;
    } catch (erro) {
        throw new Error('Erro ao listar movimentações: ' + erro.message);
    }

    //não usado mais - usar o método de listagem acima - LISTAGEM ABAIXO MOSTRA APENAS DADOS DE MOVIMENTAÇÃO
    /* const [movimentacoes] = await conexao.execute('SELECT * FROM movimentacao_estoque');
    return movimentacoes;  */
}
export async function listarProdutos(filtros = {}) {
    try {
        let query = `
            SELECT 
                p.id_produto,
                p.nome,
                p.preco_produto,
                p.descricao,
                p.imagem_produto,
                c.nome_categoria,
                e.qntd_produto,
                e.status_produto
            FROM produto p
            INNER JOIN categoria c ON p.id_categoria = c.id_categoria
            INNER JOIN estoque e ON p.id_produto = e.id_produto
            WHERE 1=1
        `;

        const params = [];

        if (filtros.nome) {
            query += ` AND p.nome LIKE ?`;
            params.push(`%${filtros.nome}%`);
        }

        if (filtros.categoria) {
            query += ` AND c.id_categoria = ?`;
            params.push(filtros.categoria);
        }

        if (filtros.precoMin) {
            query += ` AND p.preco_produto >= ?`;
            params.push(filtros.precoMin);
        }

        if (filtros.precoMax) {
            query += ` AND p.preco_produto <= ?`;
            params.push(filtros.precoMax);
        }

        if (filtros.status) {
            query += ` AND e.status_produto = ?`;
            params.push(filtros.status);
        }

        query += ` ORDER BY p.nome`;

        const [produtos] = await conexao.execute(query, params);
        return produtos;
    } catch (erro) {
        throw new Error('Erro ao listar produtos: ' + erro.message);
    }
}

export async function adicionarProduto(nome, preco_produto, descricao, imagem_produto, id_categoria, id_participante) {
    try {
        // Insere o produto primeiro
        const queryProduto = `
            INSERT INTO produto (nome, preco_produto, descricao, imagem_produto, id_categoria, id_participante)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [resultadoProduto] = await conexao.execute(queryProduto, [nome, preco_produto, descricao, imagem_produto, id_categoria, id_participante]);
        
        // Cria registro inicial no estoque
        
        const queryEstoque = `
            INSERT INTO estoque (id_produto, qntd_produto, data_entrada, preco_medio, status_produto)
            VALUES (?, 0, CURDATE(), ?, 'Indisponível')
        `;
        await conexao.execute(queryEstoque, [resultadoProduto.insertId, preco_produto]);


        //segunda opcao para caso queira criar o estoque com a quantidade inicial - CASO USAR TROCAR PELO DE CIMA
        /* const status = quantidade_inicial > 0 ? 'Disponível' : 'Indisponível';
        const queryEstoque = `
            INSERT INTO estoque (id_produto, qntd_produto, data_entrada, preco_medio, status_produto)
            VALUES (?, ?, CURDATE(), ?, ?)
        `;
        await conexao.execute(queryEstoque, [resultadoProduto.insertId, quantidade_inicial, preco_produto, status]); */

        return resultadoProduto;
    } catch (erro) {
        throw new Error('Erro ao adicionar produto e criar registro de estoque: ' + erro.message);
    }
}

export async function atualizarProduto(id_produto, dados) {
    try {
        let query = 'UPDATE produto SET';
        const valores = [];
        const campos = [];

        console.log('Dados recebidos:', dados);
        console.log('Id do produto:', id_produto);
        if (dados.nome) {
            campos.push(' nome = ?');
            valores.push(dados.nome);
        }
        if (dados.preco_produto) {
            campos.push(' preco_produto = ?');
            valores.push(dados.preco_produto);
        }
        if (dados.descricao) {
            campos.push(' descricao = ?');
            valores.push(dados.descricao);
        }
        if (dados.imagem_produto) {
            campos.push(' imagem_produto = ?');
            valores.push(dados.imagem_produto);
        }
        if (dados.id_categoria) {
            campos.push(' id_categoria = ?');
            valores.push(dados.id_categoria);
        }
        if (dados.id_participante) {
            campos.push(' id_participante = ?');
            valores.push(dados.id_participante);
        }

        query += campos.join(',') + ' WHERE id_produto = ?';
        valores.push(id_produto);

        console.log('Query completa:', query);
        console.log('Valores:', valores);
        const [resultado] = await conexao.execute(query, valores);
        return resultado;
    } catch (erro) {
        throw new Error('Erro ao atualizar produto: ' + erro.message);
    }
}


export async function deletarProduto(id_produto) {
    try {
        // Primeiro deleta o relacionamento com produto_item
        const queryProdutoItem = `DELETE FROM pedido_item WHERE id_produto = ?`;
        await conexao.execute(queryProdutoItem, [id_produto]);
        
        // Depois deleta o relacionamento com movimentacao_estoque
        const queryMovimentacao = `DELETE FROM movimentacao_estoque WHERE id_produto = ?`;
        await conexao.execute(queryMovimentacao, [id_produto]);
        
        // Depois deleta o registro do estoque
        const queryEstoque = `DELETE FROM estoque WHERE id_produto = ?`;
        await conexao.execute(queryEstoque, [id_produto]);

        // Por último deleta o produto
        const queryProduto = `DELETE FROM produto WHERE id_produto = ?`;
        const [resultado] = await conexao.execute(queryProduto, [id_produto]);
        
        return resultado;
    } catch (erro) {
        throw new Error('Erro ao deletar produto: ' + erro.message);
    }
}


