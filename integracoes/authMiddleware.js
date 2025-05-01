export class Auth { // Classe pra lidar com autenticação
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.publicRoutes = ['/telalogin.html'];
    }

    isPublicRoute() { // Checa se a página atual tá na lista de páginas públicas
        return this.publicRoutes.includes(window.location.pathname);
    }
    // Valida se o token guardado ainda presta
    async verificarToken() { 
        const token = localStorage.getItem('token');
        console.log('Token antes da verificação:', token);
        if (!token) return false;

        try {
            const response = await fetch(`${this.baseUrl}/api/auth/verificar-token`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Resposta da verificação:', response);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async init() { //Inicia a verificação de autenticação 
        if (this.isPublicRoute()) return;// Se a página é pública, ignora o resto

        const tokenValido = await this.verificarToken();// Verifica se o token é válido
        if (!tokenValido) {
            localStorage.clear();
            window.location.href = '/telalogin.html';
        } // Se o token não for bom ele limpa o localStorage e redireciona pra página de login
    }
}

document.querySelector('#sairLogin').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('funcionario');
    window.location.href = 'telalogin.html';
});

// Roda a autenticação assim que o código carrega
const auth = new Auth();
auth.init();

/* Adicionar esse script em todas as páginas, menos de login ou outras publicas, 
            que deverâo ser adicionadas na lista de publicRoutes 
    <script type="module" src="integracoes\authMiddleware.js"></script> 
*/
