document.addEventListener("DOMContentLoaded", async function () {
    const loginForm = document.getElementById("loginForm");
    const baseUrl = 'http://localhost:3000';

    // Trecho responsavel para ver se o token é válido, e caso seja, levar para o dashboard
    const token = localStorage.getItem('token');
    if (token) {
        const response = await fetch(`${baseUrl}/api/auth/verificar-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }); console.log(token);
        if (response.ok) {
            console.log('Token valido');
            window.location.href = '/telainicio.html';
        }
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        
        try {
            const response = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, senha }),
            });

            console.log('Dados enviados:', { email, senha });
            
            const data = await response.json();

            if (response.ok) {
                alert('Login realizado com sucesso!');
                localStorage.setItem('token', data.token);
                localStorage.setItem('funcionario', JSON.stringify(data.funcionario));
                window.location.href = '/telainicio.html';
            } else {
                alert(data.message || 'Erro ao realizar login');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            alert('Erro na comunicação com o servidor');
        }
    });
});