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
                //alert('Login realizado com sucesso!');
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

    const modal = document.getElementById('recuperarSenhaModal');
    const btnRecuperar = document.getElementById('recuperarSenha'); // Adicione id="recuperarSenha" ao link de recuperar senha
    const span = document.getElementsByClassName('close')[0];
    const form = document.getElementById('recuperarSenhaForm');
    const mensagem = document.getElementById('mensagemRecuperacao');
    
    // Abrir modal quando clicar em "Recuperar a senha"
    btnRecuperar.onclick = function(e) {
        e.preventDefault();
        modal.style.display = "block";
    }
    
    // Fechar modal quando clicar no X
    span.onclick = function() {
        modal.style.display = "none";
        form.reset();
        mensagem.style.display = "none";
        mensagem.className = "";
    }
    
    // Fechar modal quando clicar fora dele
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            form.reset();
            mensagem.style.display = "none";
            mensagem.className = "";
        }
    }
    
    // Enviar formulário
    form.onsubmit = async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('emailRecuperacao').value;
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            mensagem.style.display = "block";
            
            if (response.ok) {
                mensagem.className = "sucesso";
                mensagem.textContent = "Email de recuperação enviado! Verifique sua caixa de entrada.";
                form.reset();
                
                // Fechar o modal após 3 segundos
                setTimeout(() => {
                    modal.style.display = "none";
                    mensagem.style.display = "none";
                }, 3000);
            } else {
                mensagem.className = "erro";
                mensagem.textContent = data.message || "Erro ao enviar email de recuperação.";
            }
        } catch (error) {
            console.error('Erro:', error);
            mensagem.style.display = "block";
            mensagem.className = "erro";
            mensagem.textContent = "Erro de conexão. Tente novamente mais tarde.";
        }
    }
});