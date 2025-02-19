import bcrypt from 'bcrypt';
import conectarAoBanco from '../config/dbconfig.js';

const conexao = await conectarAoBanco();

async function atualizarSenhasExistentes() {
    try {
        const [funcionarios] = await conexao.execute('SELECT id_funcionario, senha FROM funcionarios');
        
        for(let funcionario of funcionarios) {
            const senhaHash = await bcrypt.hash(funcionario.senha, 10);
            await conexao.execute(
                'UPDATE funcionarios SET senha = ? WHERE id_funcionario = ?',
                [senhaHash, funcionario.id_funcionario]
            );
            console.log(`Senha atualizada para funcionário ${funcionario.id_funcionario}`);
        }
        
        console.log('Todas as senhas foram atualizadas!');
        process.exit(0);
    } catch (erro) {
        console.error('Erro:', erro);
        process.exit(1);
    }
}

atualizarSenhasExistentes();
