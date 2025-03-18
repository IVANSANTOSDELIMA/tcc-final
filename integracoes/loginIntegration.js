document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const baseUrl = 'http://localhost:3000';

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