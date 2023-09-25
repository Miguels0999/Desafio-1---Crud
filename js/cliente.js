const URL = 'http://localhost:3400/clientes';
let modoEdicao = false;
let listacliente = [];
let btnadicionar = document.getElementById('btn-adicionar');
let tabelacliente = document.querySelector('table>tbody');
let modalcliente = new bootstrap.Modal(document.getElementById("myModal"), {});
let titulomodal = document.querySelector('h4.modal-title');
let btnsalvar = document.getElementById('btn-salvar');
let btncandelar = document.getElementById('btn-cancelar');

let formModal = {
  id: document.getElementById('id'),
  nome: document.getElementById('nome'),
  cpf: document.getElementById('cpf'),
  email: document.getElementById('email'),
  telefone: document.getElementById('telefone'),
  dataCadastro: document.getElementById('dataCadastro'),
};

btnadicionar.addEventListener('click', () => {
  modoEdicao = false;
  titulomodal.textContent = "Adicionar cliente";
  limparFormulario();
  modalcliente.show();
});

btnsalvar.addEventListener('click', () => {
  console.log("Botão salvar clicado");
  let cliente = obterClienteDoModal();

  if (!cliente || !cliente.email || !cliente.cpfOuCnpj) {
    alert("E-mail e CPF são obrigatórios.");
    return;
  }

  if (modoEdicao) {
    atualizarClienteBackEnd(cliente);
  } else {
    adicionarClienteBackEnd(cliente);
  }
});

btncandelar.addEventListener('click', () => {
  modalcliente.hide();
});

function obterClienteDoModal() {
  return {
    id: formModal.id.value,
    nome: formModal.nome.value,
    cpfOuCnpj: formModal.cpf.value,
    email: formModal.email.value,
    telefone: formModal.telefone.value,
    dataCadastro: formModal.dataCadastro.value
      ? new Date(formModal.dataCadastro.value).toISOString()
      : new Date().toISOString(),
  };
}

function obterClientes() {
  fetch(URL, {
    method: 'GET'
  })
    .then(response => response.json())
    .then(clientes => {
      listacliente = clientes;
      popularTabela(clientes);
    })
    .catch(error => {
      console.error("Erro ao obter clientes: ", error);
    });
}

function editarCliente(id) {
  modoEdicao = true;
  titulomodal.textContent = "Editar cliente";

  let cliente = listacliente.find(cliente => cliente.id == id);

  atualizarmodalclientes(cliente);

  modalcliente.show();
}

function atualizarmodalclientes(cliente) {
  formModal.id.value = cliente.id;
  formModal.nome.value = cliente.nome;
  formModal.cpf.value = cliente.cpfOuCnpj;
  formModal.email.value = cliente.email;
  formModal.telefone.value = cliente.telefone;
  formModal.dataCadastro.value = cliente.dataCadastro;
}

function limparFormulario() {
  formModal.id.value = '';
  formModal.nome.value = '';
  formModal.cpf.value = '';
  formModal.email.value = '';
  formModal.telefone.value = '';
  formModal.dataCadastro.value = '';
}

function popularTabela(clientes) {
  tabelacliente.innerHTML = ''; // Use innerHTML para limpar o conteúdo

  clientes.forEach(cliente => {
    CriarLinhaNaTela(cliente);
  });
}

function excluirCliente(id){
  let cliente = listacliente.find(c => c.id == id);
  if (confirm('Deseja realmente excluir o cliente ' + cliente.nome)){
    excluirClienteBackEnd(cliente)
  }
}

function CriarLinhaNaTela(cliente) {
  let tr = document.createElement('tr');
  let thid = document.createElement('th');
  let tdnome = document.createElement('td');
  let tdCPF = document.createElement('td');
  let tdemail = document.createElement('td');
  let tdtelefone = document.createElement('td');
  let tddataCadastro = document.createElement('td');
  let tdacoes = document.createElement('td');

  thid.textContent = cliente.id;
  tdnome.textContent = cliente.nome;
  tdCPF.textContent = cliente.cpfOuCnpj;
  tdemail.textContent = cliente.email;
  tdtelefone.textContent = cliente.telefone;

  if (cliente.dataCadastro) {
    const data = new Date(cliente.dataCadastro);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    tddataCadastro.textContent = `${dia}/${mes}/${ano}`;
  } else {
    tddataCadastro.textContent = '';
  }

  tdacoes.innerHTML = `<button onclick="editarCliente(${cliente.id})" class="btn btn-outline-light btn-sm mr-2">Alterar</button>&nbsp;<button onclick="excluirCliente(${cliente.id})" class="btn btn-outline-light btn-sm">Excluir</button>`;

  tr.appendChild(thid);
  tr.appendChild(tdnome);
  tr.appendChild(tdCPF);
  tr.appendChild(tdemail);
  tr.appendChild(tdtelefone);
  tr.appendChild(tddataCadastro);
  tr.appendChild(tdacoes);

  tabelacliente.appendChild(tr);
}

function adicionarClienteBackEnd(cliente) {
  fetch(URL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': "token"
    },
    body: JSON.stringify(cliente)
  })
    .then(response => response.json())
    .then(response => {
      listacliente.push(response); // Use a resposta diretamente
      popularTabela(listacliente);
      modalcliente.hide();
    })
    .catch(error => {
      console.log(error);
    });
}

function atualizarClienteBackEnd(cliente) {
  fetch(`${URL}/${cliente.id}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': "token"
    },
    body: JSON.stringify(cliente)
  })
    .then(response => response.json())
    .then(() => {
      // Atualize a lista de clientes após a ediçã o
      obterClientes();
      modalcliente.hide();
    })
    .catch(error => {
      console.log(error);
    });
}


function excluirClienteBackEnd(cliente) {
  fetch(`${URL}/${cliente.id}`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': "token"
    },
  })
    .then(response => {
      if (response.ok) {
        listacliente = listacliente.filter(c => c.id !== cliente.id);
        popularTabela(listacliente);
        modalcliente.hide();
      } else {
        console.error("Falha ao excluir o cliente.");
      }
    })
    .catch(error => {
      console.log(error);
    });
}

function atualizarclientenalista(cliente){
  let indice = listacliente.findIndex(c => c.id == cliente.id);
  listacliente.splice(indice, 1, cliente);
  popularTabela(listacliente);
}

obterClientes();
