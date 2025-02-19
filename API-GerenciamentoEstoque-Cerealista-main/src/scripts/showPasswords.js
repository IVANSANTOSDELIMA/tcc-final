import conectarAoBanco from '../config/dbconfig.js';

const conexao = await conectarAoBanco();

async function mostrarSenhas() {
    try {
        const [funcionarios] = await conexao.execute('SELECT id_funcionario, nome_funcionario, email, senha FROM funcionarios');
        
        console.log('Lista de funcionários e senhas:');
        console.log('--------------------------------');
        
        funcionarios.forEach(funcionario => {
            console.log(`ID: ${funcionario.id_funcionario}`);
            console.log(`Nome: ${funcionario.nome_funcionario}`);
            console.log(`Email: ${funcionario.email}`);
            console.log(`Senha: ${funcionario.senha}`);
            console.log('--------------------------------');
        });
        
        process.exit(0);
    } catch (erro) {
        console.error('Erro:', erro);
        process.exit(1);
    }
}

mostrarSenhas();
