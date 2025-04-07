import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export default async function conectarAoBanco() {
    try {
        const conexao = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
        console.log('Conectado ao MySQL com sucesso!');
        return conexao;
    } catch (erro) {
        console.error('Falha na conexão com o banco!', erro);
        process.exit();
    }
}