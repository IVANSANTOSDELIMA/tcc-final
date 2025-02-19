import conectarAoBanco from "../config/dbconfig.js";

const conexao = await conectarAoBanco();
/* console.log('Conexão com o banco de dados estabelecida com sucesso!'); */


  // Função para listar todos os funcionários
  export async function listarFuncionarios(filtros = {}) {
      try {
          let query = `
              SELECT 
                  id_funcionario,
                  nome_funcionario,
                  cargo,
                  data_admissao,
                  nivel_acesso,
                  telefone_funcionario,
                  cidade,
                  estado
              FROM funcionarios
              WHERE 1=1
          `;

          const params = [];

          if (filtros.nome) {
              query += ` AND nome_funcionario LIKE ?`;
              params.push(`%${filtros.nome}%`);
          }

          if (filtros.cargo) {
              query += ` AND cargo LIKE ?`;
              params.push(`%${filtros.cargo}%`);
          }

          if (filtros.dataAdmissaoInicio) {
              query += ` AND data_admissao >= ?`;
              params.push(filtros.dataAdmissaoInicio);
          }

          if (filtros.dataAdmissaoFim) {
              query += ` AND data_admissao <= ?`;
              params.push(filtros.dataAdmissaoFim);
          }

          if (filtros.nivelAcesso) {
              query += ` AND nivel_acesso = ?`;
              params.push(filtros.nivelAcesso);
          }

          if (filtros.cidade) {
              query += ` AND cidade LIKE ?`;
              params.push(`%${filtros.cidade}%`);
          }

          if (filtros.estado) {
              query += ` AND estado = ?`;
              params.push(filtros.estado);
          }

          query += ` ORDER BY nome_funcionario`;

          const [funcionarios] = await conexao.execute(query, params);
          return funcionarios;
      } catch (erro) {
          throw new Error('Erro ao listar funcionários: ' + erro.message);
        }
  }
    // Função para adicionar um novo funcionário
  export async function adicionarFuncionario(cpf, data_admissao, rua, numero, complemento, bairro, cidade, estado, cep, senha, telefone_funcionario, nome_funcionario, nivel_acesso, cargo, imagem_funcionario, email) {
      const query = `
          INSERT INTO funcionarios (cpf, data_admissao, rua, numero, complemento, bairro, cidade, estado, cep, senha, telefone_funcionario, nome_funcionario, nivel_acesso, cargo, imagem_funcionario, email)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [resultado] = await conexao.execute(query, [cpf, data_admissao, rua, numero, complemento, bairro, cidade, estado, cep, senha, telefone_funcionario, nome_funcionario, nivel_acesso, cargo, imagem_funcionario, email]);
      return resultado;
  }

export async function atualizarFuncionario(id_funcionario, dados) {
    try {
        let query = 'UPDATE funcionarios SET';
        const valores = [];
        const campos = [];

        if (dados.nome_funcionario) {
            campos.push(' nome_funcionario = ?');
            valores.push(dados.nome_funcionario);
        }
        if (dados.cidade) {
            campos.push(' cidade = ?');
            valores.push(dados.cidade);
        }
        if (dados.estado) {
            campos.push(' estado = ?');
            valores.push(dados.estado);
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
        if (dados.cep) {
            campos.push(' cep = ?');
            valores.push(dados.cep);
        }
        if (dados.senha) {
            campos.push(' senha = ?');
            valores.push(dados.senha);
        } // vai que né
        if (dados.data_admissao) {
            campos.push(' data_admissao = ?');
            valores.push(dados.data_admissao);
        }
        if (dados.telefone_funcionario) {
            campos.push(' telefone_funcionario = ?');
            valores.push(dados.telefone_funcionario);
        }
        if (dados.cargo) {
            campos.push(' cargo = ?');
            valores.push(dados.cargo);
        }
        if (dados.nivel_acesso) {
            campos.push(' nivel_acesso = ?');
            valores.push(dados.nivel_acesso);
        }
        if (dados.imagem_funcionario) {
            campos.push(' imagem_funcionario = ?');
            valores.push(dados.imagem_funcionario);
        }

        query += campos.join(',') + ' WHERE id_funcionario = ?';
        valores.push(id_funcionario);

        const [resultado] = await conexao.execute(query, valores);
        return resultado;
    } catch (erro) {
        throw new Error('Erro ao atualizar funcionário: ' + erro.message);
    }
}

export async function deletarFuncionario(id_funcionario) {
    try {
        // Busca as movimentações associadas ao funcionário
        await conexao.execute('DELETE FROM movimentacao_estoque WHERE id_pedido IN (SELECT id_pedido FROM pedidos WHERE id_funcionario = ?)', [id_funcionario]);

        // Deleta os itens dos pedidos
        await conexao.execute('DELETE FROM pedido_item WHERE id_pedido IN (SELECT id_pedido FROM pedidos WHERE id_funcionario = ?)', [id_funcionario]);

        // Deleta os pedidos
        await conexao.execute('DELETE FROM pedidos WHERE id_funcionario = ?', [id_funcionario]);

        // Deleta o funcionário
        const [resultado] = await conexao.execute('DELETE FROM funcionarios WHERE id_funcionario = ?', [id_funcionario]);
        
        return resultado;
    } catch (erro) {
        throw new Error('Erro ao deletar funcionário: ' + erro.message);
    }
}
