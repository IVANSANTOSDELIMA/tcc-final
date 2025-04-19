var confirmar = document.querySelector('#modalDialog')
var table = document.querySelector('#table')

 function submit(){
    var name = document.querySelector('#nome').value
    var nivelacesso = document.querySelector('#nivelAcesso').value
    var cpf = document.querySelector('#cpf').value
    var cargo = document.querySelector('#cargo').value
    var dataAdmissao = document.querySelector('#dataAdmissao').value
    var tel = document.querySelector('#telefone').value
    var email = document.querySelector('#email').value

var data = createList(name,nivelacesso,cpf,cargo,dataAdmissao,tel,email)
table.appendChild(data)

// console.log(name);
}
// funçao para criar a lista onde vai ficar as informações do funcionario
function createList(name,nivelacesso,cpf,cargo,dataAdmissao,tel,email){
    var row = document.createElement('div')
    row.setAttribute('id', 'rowfuncionarios')

    var nametd = document.createElement('div')
    nametd.textContent = name

    var nivelacessotd = document.createElement('div')
    nivelacessotd.textContent = nivelacesso

    var cpftd = document.createElement('div')
    cpftd.textContent = cpf

    var cargotd = document.createElement('div')
    cargotd.textContent = cargo

    var dataAdmissaotd = document.createElement('div')
    dataAdmissaotd.textContent = dataAdmissao

    var teltd = document.createElement('div')
    teltd.textContent = tel

    var emailtd = document.createElement('div')
    emailtd.textContent = email


    var visualizar = document.createElement('div')
    visualizar.setAttribute('id', 'visualizarButton')
    visualizar.textContent = 'Visualizar'
    visualizar.addEventListener('click',function(){
        // fazer a parte de visualizar o modal com os atributos
    })
    
    var editbutton = document.createElement('div')
    editbutton.setAttribute('id', 'editbutton')
    editbutton.textContent = 'Editar'
    editbutton.addEventListener('click',function(){
        // fazer a parte de editar o modal com os atributos
    })

    var iconExcluir = document.createElement('div')
    iconExcluir.setAttribute('id', 'iconExcluir')
    iconExcluir.textContent = ''
    iconExcluir.addEventListener('click',function(){
        // fazer a parte de excluir o funcionario
    })

    row.appendChild(nametd)
    row.appendChild(nivelacessotd)
    row.appendChild(cpftd)
    row.appendChild(cargotd)
    row.appendChild(dataAdmissaotd)
    row.appendChild(teltd)
    row.appendChild(emailtd)
    row.appendChild(visualizar)
    row.appendChild(editbutton)
    row.appendChild(iconExcluir)
    return row
}