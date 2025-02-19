import conectarAoBanco from "../config/dbconfig.js";

const conexao = await conectarAoBanco();
/* console.log('Conexão com o banco de dados estabelecida com sucesso!'); */

export async function criarPedido(dados) {
    const {
        id_tipo_movimentacao,
        id_participante,
        id_funcionario,
        itens
    } = dados;

    try {
        // Validação para saídas
        if (id_tipo_movimentacao === 'S') {
            for (const item of itens) {
                const [estoqueAtual] = await conexao.execute(
                    'SELECT qntd_produto, status_produto FROM estoque WHERE id_produto = ?',
                    [item.id_produto]
                );

                if (estoqueAtual[0].status_produto === 'Indisponível') {
                    throw new Error(`Produto ${item.id_produto} indisponível para saída`);
                }

                if (estoqueAtual[0].qntd_produto < item.quantidade) {
                    throw new Error(`Quantidade insuficiente para o produto ${item.id_produto}. Disponível: ${estoqueAtual[0].qntd_produto}`);
                }
            }
        }

        // Calcula o valor total do pedido
        const valor_pedido = itens.reduce((total, item) => {
            return total + (item.quantidade * item.valor_unitario);
        }, 0);

        // Insere o pedido
        const queryPedido = `
            INSERT INTO pedidos (
                id_tipo_movimentacao,
                data_pedido,
                id_participante,
                id_funcionario,
                valor_pedido
            ) VALUES (?, CURDATE(), ?, ?, ?)
        `;

        const [resultPedido] = await conexao.execute(queryPedido, [
            id_tipo_movimentacao,
            id_participante,
            id_funcionario,
            valor_pedido
        ]);

        const id_pedido = resultPedido.insertId;

        // Insere os itens do pedido e registra movimentações
        for (const item of itens) {
            // Insere item do pedido
            const queryItem = `
                INSERT INTO pedido_item (
                    id_pedido,
                    item,
                    id_produto,
                    quantidade,
                    valor_unitario,
                    valor_total,
                    data_validade
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const valor_total = item.quantidade * item.valor_unitario;

            const [resultItem] = await conexao.execute(queryItem, [
                id_pedido,
                item.item,
                item.id_produto,
                item.quantidade,
                item.valor_unitario,
                valor_total,
                item.data_validade || null
            ]);

            // Registra movimentação no estoque
            const [estoque] = await conexao.execute(
                'SELECT id_estoque FROM estoque WHERE id_produto = ?',
                [item.id_produto]
            );

            const queryMovimentacao = `
                INSERT INTO movimentacao_estoque (
                    id_produto,
                    id_estoque,
                    preco_total,
                    id_tipo_movimentacao,
                    id_pedido,
                    id_pedido_item,
                    quantidade,
                    data
                ) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())
            `;

            await conexao.execute(queryMovimentacao, [
                item.id_produto,
                estoque[0].id_estoque,
                valor_total,
                id_tipo_movimentacao,
                id_pedido,
                resultItem.insertId,
                item.quantidade
            ]);
              // Atualiza quantidade no estoque
              const [estoqueAtual] = await conexao.execute(
                  'SELECT id_estoque, qntd_produto, status_produto FROM estoque WHERE id_produto = ?',
                  [item.id_produto]
              );

              const novaQuantidade = id_tipo_movimentacao === 'E' 
                  ? estoqueAtual[0].qntd_produto + item.quantidade
                  : estoqueAtual[0].qntd_produto - item.quantidade;

              const novoStatus = novaQuantidade > 0 ? 'Disponível' : 'Indisponível';

              await conexao.execute(
                  `UPDATE estoque 
                 SET qntd_produto = ?, status_produto = ?
                 WHERE id_estoque = ?`,
                  [novaQuantidade, novoStatus, estoqueAtual[0].id_estoque]
              );
          }

        return {
            message: 'Pedido criado com sucesso!',
            id_pedido,
            valor_pedido
        };
    } catch (erro) {
        throw new Error('Erro ao criar pedido: ' + erro.message);
    }
}
export async function listarPedidos(filtros = {}) {
    try {
        let query = `
            SELECT 
                p.id_pedido,
                p.data_pedido,
                p.valor_pedido,
                p.id_tipo_movimentacao,
                t.descricao as tipo_movimentacao,
                part.nome_participante,
                f.nome_funcionario
            FROM pedidos p
            INNER JOIN tipo_movimentacao t ON p.id_tipo_movimentacao = t.id_tipo_movimentacao
            INNER JOIN participante part ON p.id_participante = part.id_participante
            INNER JOIN funcionarios f ON p.id_funcionario = f.id_funcionario
            WHERE 1=1
        `;

        const params = [];

        if (filtros.dataInicio) {
            query += ` AND p.data_pedido >= ?`;
            params.push(filtros.dataInicio);
        }

        if (filtros.dataFim) {
            query += ` AND p.data_pedido <= ?`;
            params.push(filtros.dataFim);
        }

        if (filtros.tipoMovimentacao) {
            query += ` AND p.id_tipo_movimentacao = ?`;
            params.push(filtros.tipoMovimentacao);
        }

        if (filtros.participante) {
            query += ` AND part.nome_participante LIKE ?`;
            params.push(`%${filtros.participante}%`);
        }

        if (filtros.funcionario) {
            query += ` AND f.nome_funcionario LIKE ?`;
            params.push(`%${filtros.funcionario}%`);
        }

        if (filtros.valorMin) {
            query += ` AND p.valor_pedido >= ?`;
            params.push(filtros.valorMin);
        }

        if (filtros.valorMax) {
            query += ` AND p.valor_pedido <= ?`;
            params.push(filtros.valorMax);
        }

        query += ` ORDER BY p.data_pedido DESC`;

        const [pedidos] = await conexao.execute(query, params);
        return pedidos;
    } catch (erro) {
        throw new Error('Erro ao listar pedidos: ' + erro.message);
    }
}
