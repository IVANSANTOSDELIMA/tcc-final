
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import conectarAoBanco from '../config/dbconfig.js';

const conexao = await conectarAoBanco();

export async function login(req, res) {
    try {
        const { email, senha } = req.body;

        // Busca funcionário pelo email
        const [funcionarios] = await conexao.execute(
            'SELECT * FROM funcionarios WHERE email = ?',
            [email]
        );

        if (funcionarios.length === 0) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        const funcionario = funcionarios[0];

        // Verifica senha
        const senhaValida = await bcrypt.compare(senha, funcionario.senha);
        if (!senhaValida) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        // Gera token
        const token = jwt.sign(
            { 
                id: funcionario.id_funcionario,
                nivel_acesso: funcionario.nivel_acesso 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Atualiza token no banco
        await conexao.execute(
            'UPDATE funcionarios SET token = ? WHERE id_funcionario = ?',
            [token, funcionario.id_funcionario]
        );

        res.json({
            token,
            funcionario: {
                id: funcionario.id_funcionario,
                nome: funcionario.nome_funcionario,
                nivel_acesso: funcionario.nivel_acesso
            }
        });
    } catch (erro) {
        console.error('Erro no login:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
}

export async function logout(req, res) {
    try {
        const funcionarioId = req.funcionario.id;
        
        // Remove o token do banco
        await conexao.execute(
            'UPDATE funcionarios SET token = NULL WHERE id_funcionario = ?',
            [funcionarioId]
        );
        
        res.json({ message: 'Logout realizado com sucesso' });
    } catch (erro) {
        res.status(500).json({ message: 'Erro ao realizar logout' });
    }
}
