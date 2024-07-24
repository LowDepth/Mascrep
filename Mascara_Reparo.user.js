// ==UserScript==
// @name        Mascara Reparo
// @namespace   Violentmonkey Scripts
// @description Mascara para perfilamento
// @copyright   2024, lowdepth
// @match       http://siwhw01a/UnificadoProjetos/stavancado/Tratativa/Tratar*
// @match       https://siwhw01a/Unificado/stavancado/Tratativa/Tratar?*
// @match       http://operacao-sisweb/Unificado/stavancado/Tratativa/Tratar*
// @grant       GM.setValue
// @grant       GM.getValue
// @version     1.9.5
// @author      Marcelo B
// @updateURL	https://github.com/LowDepth/Mascrep/blob/3caa2f48f7e5327e9835ae594c6fd6f47e3c74c3/Mascara_Reparo.user.js
// @downloadURL	https://github.com/LowDepth/Mascrep/blob/3caa2f48f7e5327e9835ae594c6fd6f47e3c74c3/Mascara_Reparo.user.js
// ==/UserScript==

//teste 1234
var mailing = document.getElementById("DadosMailing_Descricao").value;
var protocolo = document.getElementById("idProtocolo").innerText;
var numReparo = "";
var nome;
var cpf;
var contato;
var gpon;
var detalhe;
var descricao = "";
var data= "Data de Abertura: ";
var BA = "BA: ";
var endereco = "Endereço: ";
var uf = "UF: ";
var ddd;
var homeNetwork = " - STU xxxxxxx- Acionado equipe de campo via STU.";
var fibraPE = " - Fibra PE - Acionado equipe de campo via planilha de recorrência.";

const DDDs = {
  AC: [68],
  AL: [82],
  AP: [96],
  AM: [92,97],
  BA: [71,73,74,75,77],
  CE: [85,88],
  DF: [61],
  ES: [27,28],
  GO: [62,64],
  MA: [98,99],
  MT: [65,66],
  MS: [67],
  MG: [31,32,33,34,35,37,38],
  PA: [91,93,94],
  PB: [83],
  PR: [41,42,43,44,45,46],
  PE: [81,87],
  PI: [86,89],
  RJ: [21,22,24],
  RN: [84],
  RS: [51,53,54,55],
  RO: [69],
  RR: [95],
  SC: [47,48,49],
  SP: [11,12,13,14,15,16,17,18,19],
  SE: [79],
  TO: [63]
}

function regexes(){
  const idGponRegex = /ID de Acesso: (\S+)/;
  const fallbackIdGponRegex = /ID de acesso: (\S+)/;
  const contactRegex = /Contato\(s\): (\d+)|WhatsApp:\s*\+?(\d+)|N° de Contato \(01\): (\d+)/;
  const repairNumberRegex = /Nº de reparo: (\S+)/;

  const contactMatches = detalhe.match(contactRegex);
  const idGponMatch = detalhe.match(idGponRegex) || detalhe.match(fallbackIdGponRegex);
  const repairNumberMatch = detalhe.match(repairNumberRegex);
  if (repairNumberMatch != null) {
    numReparo = repairNumberMatch[1].trim();
  }

  const idGpon = idGponMatch ? idGponMatch[1].trim() : null;
  let contato1 = "";
  if (contactMatches) {
    contato1 = contactMatches[1] ? contactMatches[1].trim() : (contactMatches[2] ? contactMatches[2].trim() : contactMatches[3].trim());
  };
  if (contato === ""){contato = contato1;}
  if (gpon === ""){gpon = idGpon;}
};

const boolFound = {
  reparoFound: false,
  gponFound: false,
  nomeFound: false,
  numeroFound: false
};

function facsCheck(nome, cpf, contato, gpon, reparo){ //função para verificar o que falta ser preenchido na mascara
  descricao = descricao + "Data de abertura: \n";
  descricao = descricao + "BA: \n";
  if (reparo.trim() == "") {descricao = descricao + "Reparo: \n"; boolFound.reparoFound = true;};
  if (gpon == null) {descricao = descricao + "ID de acesso: \n"; boolFound.gponFound = true};
  if (nome.trim() == "") {descricao = descricao + "Nome: \n"; boolFound.nomeFound = true};
  if (contato.trim() == "") {descricao = descricao + "Número de Contato: "; boolFound.numeroFound = true};
  document.getElementById("Observacao").value = descricao;
  descricaoSplited = descricao.split("\n");
};

function checkNum(numero){//funcao para fazer checagem de numeros/UF
  if (numero.length === 13 || numero.length === 12) {
    if (numero.startsWith("55")) {
      const numeroCortado = numero.slice(2)
      return numeroCortado;
    };
  }else return numero;
};

function zezin123() { //funcao que preenche o que falta ser preenchido
  desc = document.getElementById("Observacao").value;
  descSplited = desc.split("\n");
  console.log(descSplited);
  data = descSplited.filter(descSplited => descSplited.startsWith("Data"))[0];
  BA = descSplited.filter(descSplited => descSplited.startsWith("BA:"))[0];
  if (boolFound.reparoFound) {numReparo = descSplited.filter(descSplited => descSplited.startsWith("Reparo"))[0].substring(8);};
  if (boolFound.gponFound) {gpon = descSplited.filter(descSplited => descSplited.startsWith("ID de acesso"))[0].substring(14);}
  if (boolFound.nomeFound) {nome = descSplited.filter(descSplited => descSplited.startsWith("Nome"))[0].substring(6);}
  if (boolFound.numeroFound){contato = descSplited.filter(descSplited => descSplited.startsWith("Número"))[0].substring(19);};
  contato = checkNum(contato.replace(/\s/g, ""));
  ddd = contato.substring(0, 2);
  uf = uf + Object.keys(DDDs).find((state) => DDDs[state].includes(+ddd));
};


///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////Funcao NOVA FIBRA////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
function novaFibra() {
    var protC;
    var texto = document.getElementById('Observacao').value;
    var textoSplit = texto.split("\n");

    var reparoIndex = textoSplit.indexOf("Número do solicitação");
    var reparo = "N° do reparo: " + textoSplit[reparoIndex+1]

    var dataAberturaIndex = textoSplit.indexOf("Data/Hora de abertura");
    var dataAbertura = "Data de abertura: " + textoSplit[dataAberturaIndex+1]

    var baIndex = textoSplit.indexOf("Número BA");
    var ba = "BA: " + textoSplit[baIndex+1];

    var nomeIndex = textoSplit.indexOf("Nome da conta");
    var nome = "Nome: " + textoSplit[nomeIndex+1].split(" ")[0]

    var cpfIndex = textoSplit.indexOf("CPF");
    if (cpfIndex !== -1 && cpfIndex < textoSplit.length - 1) {
        var cpf = "CPF: " + textoSplit[cpfIndex+1]
    } else {
        cpf = "CPF: ";
    };

    var celularIndex = textoSplit.indexOf("Celular");
    var celular = "Número de Telefone: " + textoSplit[celularIndex+1];
    var ddd = textoSplit[celularIndex+1].substring(0, 2);
    var uf = Object.keys(DDDs).find((state) => DDDs[state].includes(+ddd));

    var gponIndex = textoSplit.indexOf("ID de Acesso");
    var gpon = "ID de Acesso: " + textoSplit[gponIndex+1];

    var grupoAtendimentoIndex = textoSplit.indexOf("Grupo de atendimento");
    var grupoAtendimento = "Grupo de atendimento: " + textoSplit[grupoAtendimentoIndex+1];

    var areaAtendimentoIndex = textoSplit.indexOf("Área de atendimento");
    var areaAtendimento = "Área de atendimento: " + textoSplit[areaAtendimentoIndex+1];

	var acionamento;
	if (textoSplit[baIndex+1].startsWith("SA") === false) {
		acionamento = "Acionamento:\n() Tel: \n() E-mail: \n() STU: \n(x) Outros: Planilha recorrência \nREQ: ( )Sim - Nº DA REQ: ";
		areaAtendimento = "Área de atendimento: Fibra PE"
        protC = _matriculaUsuario + " - ST OFF " + protocolo + " - Solicitado prioridade - Reparo " + textoSplit[reparoIndex+1] + fibraPE;
	} else {

		acionamento = "Acionamento:\n() Tel: \n() E-mail: \n(x) STU: \n() Outros: Planilha recorrência \nREQ: ( )Sim - Nº DA REQ: ";
		protC = _matriculaUsuario + " - ST OFF " + protocolo + " - Solicitado prioridade - Reparo " + textoSplit[reparoIndex+1] + homeNetwork;
	};


    document.getElementById('Observacao').value = protC + "\n\n" + "UF: " + uf + "\n" + reparo + "\n" + dataAbertura + "\n" + ba + "\n" + nome + "\n" + celular + '\n' + gpon + '\n' + "Status NetQ: Desalinhado \nDevice conectado: ( )Sim ( x )Não \nPrioridade: Propenso cancelamento \n" + grupoAtendimento + "\n" + areaAtendimento + "\n" + acionamento + "\nDescrição: Desalinhado - Cliente critico na operação.";

};
//////////////////FIM DA FUNCAO NOVA FIBRA/////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
////////////////ADICIONAR NOVO MAILINGS AQUI//////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
if (mailing === "Tela Unica") {
  nome_Comp = document.getElementById("CamposProtocolo_2__Descricao").value;
  nome = nome_Comp.split(" ")[0];
  cpf =  document.getElementById("CamposProtocolo_3__Descricao").value;
  contato = document.getElementById("CamposProtocolo_4__Descricao").value.replace(/\D/g, "");
  gpon = document.getElementById("CamposProtocolo_5__Descricao").value;
  detalhe = document.getElementById("CamposProtocolo_14__Descricao").value;
  regexes();
  facsCheck(nome, cpf, contato, gpon, numReparo);
} if (mailing === "Atendimento Técnico Fibra") {
  nome_Comp = document.getElementById("CamposProtocolo_4__Descricao").value;
  nome = nome_Comp.split(" ")[0];
  cpf =  document.getElementById("CamposProtocolo_3__Descricao").value;
  contato = document.getElementById("CamposProtocolo_7__Descricao").value.replace(/\D/g, "");
  gpon = document.getElementById("CamposProtocolo_6__Descricao").value;
  detalhe = "";
  regexes();
  facsCheck(nome, cpf, contato, gpon, numReparo);
}if (mailing === "Piloto Ofensor") {
  nome_Comp = document.getElementById("CamposProtocolo_6__Descricao").value;
  nome = nome_Comp.split(" ")[0];
  cpf =  document.getElementById("CamposProtocolo_5__Descricao").value;
  contato = document.getElementById("CamposProtocolo_7__Descricao").value.replace(/\D/g, "");
  gpon = document.getElementById("CamposProtocolo_1__Descricao").value;
  detalhe = "";
  regexes();
  facsCheck(nome, cpf, contato, gpon, numReparo);
}if (mailing === "Sala GPON") {
  nome_Comp = document.getElementById("CamposProtocolo_4__Descricao").value;
  nome = nome_Comp.split(" ")[0];
  cpf =  document.getElementById("CamposProtocolo_5__Descricao").value;
  contato = document.getElementById("CamposProtocolo_7__Descricao").value.replace(/\D/g, "");
  gpon = document.getElementById("CamposProtocolo_1__Descricao").value;
  detalhe = "";
  regexes();
  facsCheck(nome, cpf, contato, gpon, numReparo);
}if (mailing === "Atendimento Digital ST") {
  nome_Comp = document.getElementById("CamposProtocolo_0__Descricao").value;
  nome = nome_Comp.split(" ")[0];
  cpf =  document.getElementById("CamposProtocolo_1__Descricao").value;
  contato = document.getElementById("CamposProtocolo_2__Descricao").value.replace(/\D/g, "");
  gpon = "";
  detalhe = "";
  regexes();
  facsCheck(nome, cpf, contato, gpon, numReparo);
}if (mailing === "Sala COC") {
  nome_Comp = document.getElementById("CamposProtocolo_6__Descricao").value;
  nome = nome_Comp.split(" ")[0];
  cpf =  document.getElementById("CamposProtocolo_5__Descricao").value;
  contato = document.getElementById("CamposProtocolo_7__Descricao").value.replace(/\D/g, "");
  gpon = document.getElementById("CamposProtocolo_1__Descricao").value;
  detalhe = "";
  regexes();
  facsCheck(nome, cpf, contato, gpon, numReparo);
};

let countcheck = 0;
let countcheck2 = 0;
document.getElementById("Observacao").setAttribute("style","width: 1409px; height: 496px;");
(function() {
    'use strict';

    window.HomeNetwork = () => {
        if (countcheck == 0) {
          zezin123();
          countcheck += 1;
        };
        document.getElementById("Observacao").value = _matriculaUsuario +" - ST OFF " + protocolo + " - Solicitado prioridade - Reparo " + numReparo + " - STU xxxxxxx- Acionado equipe de campo via STU.\n\n" + uf + "\n" + "Nº de reparo: "+ numReparo + "\n" + data + "\n" + BA +  "\nNome: " + nome + "\n" + "Número de Contato: " + contato + "\n" + "ID de acesso: " + gpon + '\n' + "Status NetQ: Desalinhado \nDevice conectado: ( )Sim ( x )Não \nPrioridade: Propenso cancelamento \nGrupo de atendimento: Planta Externa Campo \nÁrea de atendimento: Home Network" + "\n" + "Acionamento:\n() Tel: \n() E-mail: \n(x) STU: \n() Outros: Planilha recorrência \nREQ: ( )Sim - Nº DA REQ: \nDescrição: Desalinhado - Cliente critico na operação.";
    }
    window.FibraPE = () => {
        if (countcheck == 0) {
          zezin123();
          countcheck += 1;
        };
        document.getElementById("Observacao").value = _matriculaUsuario +" - ST OFF " + protocolo + " - Solicitado prioridade - Reparo " + numReparo + " - Fibra PE - Acionado equipe de campo via planilha de recorrência.\n\n" + uf + "\n" + "Nº de reparo: "+ numReparo + "\n" + data + "\n" + BA +  "\nNome: " + nome + "\n" + "Número de Contato: " + contato + "\n" + "ID de acesso: " + gpon + '\n' + "Status NetQ: Desalinhado \nDevice conectado: ( )Sim ( x )Não \nPrioridade: Propenso cancelamento \nGrupo de atendimento: Planta Externa Fibra \nÁrea de atendimento: Fibra PE" + "\n" + "Acionamento:\n() Tel: \n() E-mail: \n() STU: \n(x) Outros: Planilha recorrência \nREQ: ( )Sim - Nº DA REQ: \nDescrição: Desalinhado - Cliente critico na operação.";
    }

    document.querySelector('body').addEventListener("keydown", (event) => {
        if (event.key === "[") {  //Coloca aqui atalho para Home Newtork
            if (mailing === "Atendimento Nova Fibra") {
              if (countcheck2 == 0) {
                novaFibra();
                countcheck2 += 1;
              };
            }else {window.HomeNetwork();};

        }
        if (event.key === "]") {  //Coloca aqui atalho para Fibra PE
            if (mailing === "Atendimento Nova Fibra") {
              if (countcheck2 == 0) {
                novaFibra();
                countcheck2 += 1;
              };
            }else{window.FibraPE();};

        }
    });
})();


if (mailing === "Tela Unica") {document.getElementById("CamposProtocolo_14__Descricao").style = "resize: vertical";};


