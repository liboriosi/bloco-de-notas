class PageTitle extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({mode: 'closed'})
        const pageTitle = document.createElement('div')
        const hPageTitle = document.createElement('h1')
        pageTitle.classList.add('align-middle')
        pageTitle.appendChild(hPageTitle);
        hPageTitle.classList.add('h1')
        hPageTitle.textContent = this.textContent

        const style = document.createElement('style')
        style.textContent =
            `
                .h1 {
                  margin-top: 0;
                  margin-bottom: 0.5rem;
                  font-weight: 500;
                  line-height: 1.2;
                }
                
                h1, .h1 {
                  font-size: calc(1.375rem + 1.5vw);
                }
                @media (min-width: 1200px) {
                  h1, .h1 {
                    font-size: 2.5rem;
                  }
                }
                .align-middle {
                  text-align: center;
                  margin-top: 50px;
                }
            `

        shadow.appendChild(style)
        shadow.appendChild(pageTitle)
    }
}

customElements.define('page-title', PageTitle)

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker
            .register("/serviceWorker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))
    })
}

// Tudo referente as anotações
listar();

document.getElementById('abrirModal').addEventListener('click', trocarModal);
document.getElementById('formAnotacao').addEventListener('submit', adicionarOuAlterar);

let modalTitle = document.getElementById('anotacaoModalLabel')

let idAlterar = null;

let myModal = new bootstrap.Modal(document.getElementById('modalAnotacao'));

function trocarModal() {
    document.getElementById('formAnotacao').reset();

    let botaoCompartilhar = document.getElementById("compartilhar");

    if (botaoCompartilhar) {
        botaoCompartilhar.remove();
    }

    if (!idAlterar) {
        modalTitle.innerHTML = "Adicionar Anotação";
    } else {
        modalTitle.innerHTML = "Editar Anotação";
    }
}

function adicionarOuAlterar(evt) {
    evt.preventDefault()

    let title = document.getElementById('floatingTitleInput').value,
        texto = document.getElementById('floatingTextarea').value,
        latitude = document.getElementById('floatingLatitudeInput').value,
        longitude = document.getElementById('floatingLongitudeInput').value,
        ant = {
        titulo : !title ? "Sem Título" : title,
        texto : texto,
        latitude : latitude,
        longitude : longitude
    }

    if (!idAlterar) {
        adicionarAnotacao(ant);
    } else {
        alterar(ant);
    }
}

function adicionarAnotacao(ant) {
    let anotacoes = [];
    let idValido = 1;

    if (localStorage.getItem('anotacoes') !== null) {
        anotacoes = JSON.parse(localStorage.getItem('anotacoes'));
        if (anotacoes.length > 0) {
            idValido = (function obterIdValido() {
                return anotacoes[anotacoes.length - 1].Id + 1;
            })();
        }
    }

    let anotacao = {
        Id: idValido,
        Titulo: ant.titulo,
        Texto: ant.texto,
        Latitude: ant.latitude,
        Longitude: ant.longitude
    };

    anotacoes.push(anotacao);
    localStorage.setItem('anotacoes', JSON.stringify(anotacoes));
    fecharModal();
}

function alterar(ant) {
    let anotacoes = JSON.parse(localStorage.getItem('anotacoes'));

    for (let i = 0; i < anotacoes.length; i++) {
        if (anotacoes[i].Id === idAlterar) {
            anotacoes[i].Titulo = ant.titulo;
            anotacoes[i].Texto = ant.texto;
            anotacoes[i].Latitude = ant.latitude;
            anotacoes[i].Longitude = ant.longitude;

            localStorage.setItem('anotacoes', JSON.stringify(anotacoes));
            fecharModal();

            idAlterar = null;
        }
    }
}

function prepararAlterar(id) {
    modalTitle.innerHTML = "Editar Anotação";

    myModal.show();

    let botaoCompartilhar = document.getElementById("compartilhar");

    if (botaoCompartilhar) {
        botaoCompartilhar.remove();
    }

    let campoTitulo = document.getElementById('floatingTitleInput'),
        campoTexto = document.getElementById('floatingTextarea'),
        campolatitude = document.getElementById('floatingLatitudeInput'),
        campolongitude = document.getElementById('floatingLongitudeInput');

    let anotacoes = JSON.parse(localStorage.getItem('anotacoes'));

    for (let i = 0; i < anotacoes.length; i++) {
        if (anotacoes[i].Id === id) {
            campoTitulo.value = anotacoes[i].Titulo;
            campoTexto.value = anotacoes[i].Texto;
            campolatitude.value = anotacoes[i].Latitude;
            campolongitude.value = anotacoes[i].Longitude;

            idAlterar = anotacoes[i].Id;
            break;
        }
    }

    // Coisas referente a geolocalização
    let verLocalizacao = document.getElementById('verLocalizacao');
    verLocalizacao.href = '';

    let latitude = document.getElementById('floatingLatitudeInput').value,
        longitude = document.getElementById('floatingLongitudeInput').value;

    verLocalizacao.href = `https://www.google.com/maps/search/${latitude},${longitude}`;


    // Coisas referente ao compartilhamento
    let botoesAcoesModal = document.getElementById("botoesAcoesModal");
    botoesAcoesModal.insertAdjacentHTML('afterbegin', '<button type="button" class="btn btn-warning" id="compartilhar">Compartilhar</button>')

    let compartilharAnotacao = {
        title: campoTitulo.value,
        text: campoTexto.value,
        url: verLocalizacao.href,
    }

    let btnCompartilhar = document.getElementById('compartilhar')
    btnCompartilhar.addEventListener('click', async () => {
        try {
            await navigator.share(compartilharAnotacao);
        } catch (e) {
            alert('Ops... Parece que não foi possível compartilhar a sua anotação!')
        }
    })
}

function fecharModal() {
    document.getElementById('formAnotacao').reset();
    myModal.hide()

    listar();
}

function excluir(id) {
    let anotacoes = JSON.parse(localStorage.getItem('anotacoes'));

    for (let i = 0; i < anotacoes.length; i++) {
        if (anotacoes[i].Id === id) {
            anotacoes.splice(i, 1);
        }
    }

    localStorage.setItem('anotacoes', JSON.stringify(anotacoes));
    listar();
}

function listar() {
    if (localStorage.getItem('anotacoes') === null) return;

    let anotacoes = JSON.parse(localStorage.getItem('anotacoes'));
    let tbody = document.getElementById("listaAnotacoes");

    tbody.innerHTML = '';

    for (let i = 0; i < anotacoes.length; i++) {
        let id = anotacoes[i].Id,
            titulo = anotacoes[i].Titulo;

        let content =
            '<tr id="rowTable'+i+'">'+
                '<th scope="row" style="width: 50px">'+id+'</th>'+
                '<td>'+titulo+'</td>'+
                '<td style="width: 200px">'+
                '<div class="btn-group" role="group">'+
                    '<button type="button" class="btn btn-primary" onclick="prepararAlterar('+id+')">Visualizar</button>'+
                    '<button type="button" class="btn btn-danger" onclick="excluir('+id+')">Excluir</button>'+
                '</div>'+
                '</td>'+
            '</tr>';

        tbody.insertAdjacentHTML('afterbegin', content);
    }
}

// Tudo referente a geolocalização
document.getElementById('pegarLocalizacao').addEventListener('click', pegarLocalizacao);
document.getElementById('floatingLatitudeInput').addEventListener('change', verLocalizacao);
document.getElementById('floatingLongitudeInput').addEventListener('change', verLocalizacao);

function verLocalizacao() {

    let verLocalizacao = document.getElementById('verLocalizacao');
    verLocalizacao.href = '';

    let latitude = document.getElementById('floatingLatitudeInput').value,
        longitude = document.getElementById('floatingLongitudeInput').value;

    verLocalizacao.href = `https://www.google.com/maps/search/${latitude},${longitude}`;
}

function pegarLocalizacao() {
    let verLocalizacao = document.getElementById('verLocalizacao');

    verLocalizacao.href = '';

    function success(position) {
        let latitude = position.coords.latitude,
            longitude = position.coords.longitude;

        let campoLatitude = document.getElementById('floatingLatitudeInput'),
            campoLongitude = document.getElementById('floatingLongitudeInput');

        campoLatitude.value = latitude;
        campoLongitude.value = longitude;

        verLocalizacao.href = `https://www.google.com/maps/search/${latitude},${longitude}`;
    }

    function error() {
        alert('Não foi possível pegar a sua localização!')
    }

    if (!navigator.geolocation) {
        alert('Não foi possível pegar a sua localização, o seu navegador não suporta Geolocalização!')
    } else {
        navigator.geolocation.getCurrentPosition(success, error);
    }
}