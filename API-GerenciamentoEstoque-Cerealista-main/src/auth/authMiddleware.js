
import jwt from 'jsonwebtoken';
import conectarAoBanco from '../config/dbconfig.js';

const conexao = await conectarAoBanco();

export async function verificaToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
        // Verifica se o token é válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verifica se o token existe no banco
        const [funcionarios] = await conexao.execute(
            'SELECT id_funcionario, nivel_acesso FROM funcionarios WHERE token = ?',
            [token]
        );

        if (funcionarios.length === 0) {
            return res.status(401).json({ message: 'Token inválido' });
        }

        // Adiciona dados do funcionário na requisição
        req.funcionario = {
            id: decoded.id,
            nivel_acesso: decoded.nivel_acesso
        };

        next();
    } catch (erro) {
        return res.status(401).json({ message: 'Token inválido' });
    }
}

export function verificaNivelAcesso(nivelMinimo) {
    return (req, res, next) => {
        if (req.funcionario.nivel_acesso <= nivelMinimo) {
            next();
        } else {
            res.status(403).json({ message: 'Acesso negado' });
        }
    };
}
