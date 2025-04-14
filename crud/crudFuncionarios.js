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
    var row = document.createElement('tr')

    var nametd = document.createElement('td')
    nametd.textContent = name

    var nivelacessotd = document.createElement('td')
    nivelacessotd.textContent = nivelacesso

    var cpftd = document.createElement('td')
    cpftd.textContent = cpf

    var cargotd = document.createElement('td')
    cargotd.textContent = cargo

    var dataAdmissaotd = document.createElement('td')
    dataAdmissaotd.textContent = dataAdmissao

    var teltd = document.createElement('td')
    teltd.textContent = tel

    var emailtd = document.createElement('td')
    emailtd.textContent = email

    var actionColumn =document.createElement('td')

    var visualizar = document.createElement('button')
    visualizar.textContent = 'Visualizar'
    visualizar.addEventListener('click',function(){
        // fazer a parte de visualizar o modal com os atributos
    })
    
    var editbutton = document.createElement('button')
    editbutton.textContent = 'Editar'
    editbutton.addEventListener('click',function(){
        // fazer a parte de editar o modal com os atributos
    })

    var checkbox = document.createElement('button')
    checkbox.textContent = ''

    actionColumn.appendChild(visualizar)
    actionColumn.appendChild(editbutton)
    actionColumn.appendChild(checkbox)

    row.appendChild(nametd)
    row.appendChild(nivelacessotd)
    row.appendChild(cpftd)
    row.appendChild(cargotd)
    row.appendChild(dataAdmissaotd)
    row.appendChild(teltd)
    row.appendChild(emailtd)
    row.appendChild(visualizar)
    row.appendChild(editbutton)

    return row
}