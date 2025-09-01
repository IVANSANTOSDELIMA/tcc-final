# Gerenciamento de estoque

Sistema web de gestão de estoque para cerealista – Projeto de TCC

## Descrição

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) com o objetivo de fornecer uma solução web para controle de estoque. O sistema facilita o gerenciamento de produtos, movimentações de entradas e saídas, além de oferecer painéis visuais e relatórios detalhados para acompanhamento do estoque.

## Funcionalidades

- Autenticação de usuários e controle de acesso por nível.
- Dashboard inicial com indicadores do estoque.
- Listagem, busca e filtro de produtos.
- Geração de relatórios por período (dia, semana, mês, ano).
- Visualização gráfica dos dados do estoque.
- Recuperação de senha.
- Interface responsiva e amigável.

## Tecnologias Utilizadas

- HTML5, CSS3 (com fontes customizadas e layout responsivo)
- JavaScript (ES6+)
- Integração via Fetch API com backend (API REST)
- Chart.js (ou similar) para gráficos

## Imagens do Projeto

### Tela de Login
![Tela de Login](https://media.licdn.com/dms/image/v2/D4D22AQG71K4hf0me3g/feedshare-shrink_800/B4DZgaqPXKGkAk-/0/1752793947453?e=1759363200&v=beta&t=UfrKhaW7nbwVB7lBE2ILalN6vZRgguFKfXPOuuHqLlk)

### Dashboard Inicial
![Dashboard](https://media.licdn.com/dms/image/v2/D4D22AQHugQiLk8O9rw/feedshare-shrink_800/B4DZgaqPWcGQAk-/0/1752793939809?e=1759363200&v=beta&t=vKJEnoDlumpthANI30J89LkRV2f-dP-jROlEJCXrlR8)

### Página de Produtos
![Produtos](https://media.licdn.com/dms/image/v2/D4D22AQEDIi_m8NzTAg/feedshare-shrink_800/B4DZgaqPWnGsAg-/0/1752793939438?e=1759363200&v=beta&t=mv_poqmIXihn8cVTGq0O_3M_64zXEwoT_S7b-HGOpcM)

### Movimentação
![Movimentação](https://media.licdn.com/dms/image/v2/D4D22AQEaZWWIoe9cag/feedshare-shrink_800/B4DZgaqPWpHsAg-/0/1752793940370?e=1759363200&v=beta&t=ePSBfKzHK6ChEjq1SHsXlc5UgB6uLdJjGN0RGbrYZZo)

### Pedidos
![Pedidos](https://media.licdn.com/dms/image/v2/D4D22AQHd7-2-w2XJ5Q/feedshare-shrink_800/B4DZgaqPWcHAAo-/0/1752793939184?e=1759363200&v=beta&t=unuySUMEE5Q_yxVG2aNYaI9uuw7kTmy9syRzDrIp57o)


## Como rodar o frontend

1. Clone este repositório:
   ```bash
   git clone https://github.com/IVANSANTOSDELIMA/tcc-final.git

2. Configure o backend (veja seção Integração).
3. Abra o arquivo ```index.html``` ou equivalente em seu navegador.

## Integração

O frontend depende de uma API backend, disponível no repositório [API-GerenciamentoEstoque](https://github.com/justino1806/API-GerenciamentoEstoque-Cerealista), rodando localmente em ```http://localhost:3000```.

> **Importante:** O sistema não funcionará corretamente sem o backend configurado e em execução.

## Estrutura de Pastas

- ```/css```: estilos das telas (login, início, relatório)
- ```/integracoes```: scripts JS de integração com a API
- ```/graficos```: scripts para gráficos e dashboards
- ```/web```: fontes customizadas
- ```/imagens```: imagens do sistema e telas

## 🤝 Colaboradores

Projeto realizado por:

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/GABRIELLILAIS">
        <img src="https://avatars.githubusercontent.com/u/169855181?v=4" width="100" alt="Gabrielli">
        <br>
        <sub><b>Babrielli Lais</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/justino1806">
        <img src="https://avatars.githubusercontent.com/u/54010279?v=4" width="100" alt="Justino Reis">
        <br>
        <sub><b>Justino Reis</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/IVANSANTOSDELIMA">
        <img src="https://avatars.githubusercontent.com/u/168492460?v=4" width="100" alt="Ivan Santos">
        <br>
        <sub><b>Ivan Santos</b></sub>
      </a>
    </td>
  </tr>
  <tr>
   <td align="center">
    <sub><p> Banco de dados,roteiro,QA</sub>
   </td>
   <td align="center">
    <sub><p> Backend, QA, Integração</sub>
   </td>
   <td align="center">
    <sub><p> Frontend, QA</sub>
   </td>
</table>

