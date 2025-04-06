document.addEventListener('DOMContentLoaded', async function() {
    const baseUrl = 'http://localhost:3000';
    // integração pra pegarr a imagem do funcionario
    const funcionario = JSON.parse(localStorage.getItem('funcionario'));
    const imgElement = document.querySelector('.imageUser img');
    
    if (funcionario && funcionario.imagem_funcionario) {
        imgElement.src = `${baseUrl}/${funcionario.imagem_funcionario}`;
    } // Se a imagem do funcionário estiver disponível, atualiza o src da imagem
    else {
        imgElement.src = 'https://placecats.com/neo_banana/300/200'; // Define uma imagem padrão caso não haja imagem
    }

    // Integração para os Cards
    try {
        const responseProdutos = await fetch(`${baseUrl}/api/estoque/produtos`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }); // Faz uma requisição para pegar os produtos do estoque
        const produtos = await responseProdutos.json();
        
        // Atualiza o total de produtos (quantidade) no estoque
        const totalEstoque = produtos.reduce((total, produto) => 
            total + produto.qntd_produto, 0
        );
        document.querySelector('#estoque strong').textContent = totalEstoque;

        // Atualiza o total de produtos em falta no estoque
        const produtosBaixoEstoque = produtos.filter(produto => 
            produto.qntd_produto <= 10 && produto.status_produto !== 'Indisponível').length; // Filtra produtos que são -/= que 10 e não estão indisponíveis
        document.querySelector('#B_Estoque strong').textContent = produtosBaixoEstoque;

        // Pra funcionar os dois ultimos cards, precisava puxar uma nova requisição aqui :)
        const dataAtual = new Date();
        // Define o primeiro e o último dia do mês atual 
        const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1); 
        // O último dia do mês é o dia 0 do mês seguinte (ou seja, o último dia do mês atual)
        const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
        
        const responseMovimentacoes = await fetch(`${baseUrl}/api/estoque/movimentacao?dataInicio=${primeiroDiaMes.toISOString().split('T')[0]}&dataFim=${ultimoDiaMes.toISOString().split('T')[0]}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }); // Faz uma requisição para pegar as movimentações do estoque no mês atual
        const movimentacoes = await responseMovimentacoes.json();

        const entradas = movimentacoes.filter(mov => mov.id_tipo_movimentacao === 'E').length; // Filtra as movimentações de entrada
        const saidas = movimentacoes.filter(mov => mov.id_tipo_movimentacao === 'S').length; // Filtra as movimentações de saída

        document.querySelector('#E_Estoque strong').textContent = entradas;
        document.querySelector('#S_Estoque strong').textContent = saidas;

    } catch (error) {
        console.error('Erro ao buscar dados dos cards de produtos:', error);
    }

    // Integração para o grafico de pizza
    try {
        const response = await fetch(`${baseUrl}/api/estoque/produtos`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const produtos = await response.json();

        // Aqui vai agrupar os produtos por categoria
        const produtosPorCategoria = produtos.reduce((acc, produto) => {
            acc[produto.nome_categoria] = (acc[produto.nome_categoria] || 0) + 1; // Conta a quantidade de produtos por categoria
            return acc; 
        }, {}); 
        // Cria o gráfico de pizza com os dados agrupados
        var options = {
            series: Object.values(produtosPorCategoria),
            chart: {
                width: 600,
                type: 'pie',
            },
            labels: Object.keys(produtosPorCategoria),
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        };
        var chart = new ApexCharts(document.querySelector("#chart3"), options);
        chart.render();
    } catch (error) {
        console.error('Erro ao buscar dados do gráfico de pizza:', error);
    }

    const responseMovimentacoes = await fetch(`${baseUrl}/api/estoque/movimentacao`, {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
    }); // req. pra pegar as movimentações do estoque
const movimentacoes = await responseMovimentacoes.json();

    // Agrupamos as entradas em cada mês aqui
    const entradasPorMes = Array(12).fill(0);
    movimentacoes.forEach(mov => {
        if (mov.id_tipo_movimentacao === 'E') {
            const mes = new Date(mov.data).getMonth();
            entradasPorMes[mes]++;
        }
    });
    // Cria o gráfico de linhas com as entradas por mensais
    var options = {
        chart: {
            height: 350,
            type: 'line',
        },
        colors: ['#F44336', '#E91E63', '#9C27B0'],
        series: [{
            name: "Entradas",
            data: entradasPorMes
        }],
        xaxis: {
            categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        }
    };

    var chart = new ApexCharts(document.querySelector("#chart1"), options);
    chart.render();

    // Aqui vai agrupar as saídas em cada mês
    const saidasPorMes = Array(12).fill(0);
    movimentacoes.forEach(mov => {
        if (mov.id_tipo_movimentacao === 'S') {
            const mes = new Date(mov.data).getMonth();
            saidasPorMes[mes]++;
        }
    });
    // Cria o gráfico de linha com as saídas mensais
    var options = {
        chart: {
            height: 350,
            type: 'line',
        },
        series: [{
            name: "Saídas",
            data: saidasPorMes
        }],
        xaxis: {
            categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        }
    };

    var chart = new ApexCharts(document.querySelector("#chart2"), options);
    chart.render();
});