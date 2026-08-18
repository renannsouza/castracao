import { supabase } from './supabaseClient.js';

var form = document.getElementById('regForm');
var submitBtn = document.getElementById('submitBtn');
var formNotice = document.getElementById('formNotice');
var lgpdNotice = document.getElementById('lgpdNotice');
var cpfInput = document.getElementById('cpf');
var cpfNotice = document.getElementById('cpfNotice');
var cepInput = document.getElementById('cep');
var telInput = document.getElementById('telefone');
var nascimentoInput = document.getElementById('nascimento');

function onlyDigits(v) { return v.replace(/\D/g, ''); }

function maskCPF(v) {
  return onlyDigits(v).slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskCEP(v) {
  return onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}

function maskPhone(v) {
  v = onlyDigits(v).slice(0, 11);
  if (v.length <= 2) return v.replace(/^(\d*)/, '($1');
  if (v.length <= 6) return v.replace(/^(\d{2})(\d*)/, '($1) $2');
  if (v.length <= 10) return v.replace(/^(\d{2})(\d{4})(\d*)/, '($1) $2-$3');
  return v.replace(/^(\d{2})(\d{5})(\d*)/, '($1) $2-$3');
}

function isValidCPF(cpfRaw) {
  var cpf = onlyDigits(cpfRaw);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  var sum = 0, i, rev;
  for (i = 0; i < 9; i++) sum += parseInt(cpf[i], 10) * (10 - i);
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(cpf[9], 10)) return false;
  sum = 0;
  for (i = 0; i < 10; i++) sum += parseInt(cpf[i], 10) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  return rev === parseInt(cpf[10], 10);
}

cpfInput.addEventListener('input', function () {
  this.value = maskCPF(this.value);
  cpfNotice.classList.remove('show');
  this.setCustomValidity('');
});

cepInput.addEventListener('input', function () { this.value = maskCEP(this.value); });
telInput.addEventListener('input', function () { this.value = maskPhone(this.value); });

document.querySelectorAll('#regForm input, #regForm select, #regForm textarea').forEach(function (el) {
  el.addEventListener('blur', function () { this.classList.add('touched'); });
});

document.querySelectorAll('input[name="lgpd"]').forEach(function (r) {
  r.addEventListener('change', function () { lgpdNotice.classList.remove('show'); });
});

function resetForm() {
  form.reset();
  document.querySelectorAll('.notice').forEach(function (n) { n.classList.remove('show'); });
  document.querySelectorAll('#regForm input, #regForm select, #regForm textarea').forEach(function (el) {
    el.classList.remove('touched');
  });
  document.getElementById('successPanel').classList.remove('show');
  form.style.display = '';
  document.querySelector('.info-card').style.display = '';
  submitBtn.disabled = false;
  submitBtn.textContent = 'Enviar cadastro';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('newRegBtn').addEventListener('click', resetForm);

form.addEventListener('submit', function (e) {
  e.preventDefault();
  document.querySelectorAll('.notice').forEach(function (n) { n.classList.remove('show'); });

  var lgpdChecked = document.querySelector('input[name="lgpd"]:checked');
  if (!lgpdChecked || lgpdChecked.value === 'Não') {
    lgpdNotice.classList.add('show');
    document.getElementById('lgpdGroup').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if (!isValidCPF(cpfInput.value)) {
    cpfInput.setCustomValidity('CPF inválido');
    cpfNotice.classList.add('show');
  } else {
    cpfInput.setCustomValidity('');
  }

  if (!form.checkValidity() || !nascimentoInput.checkValidity()) {
    document.querySelectorAll('#regForm input, #regForm select, #regForm textarea').forEach(function (el) {
      el.classList.add('touched');
    });
    formNotice.classList.add('show');
    form.reportValidity();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando…';

  var payload = {
    autoriza_lgpd: true,
    nome_tutor: document.getElementById('nome').value,
    cpf: cpfInput.value,
    data_nascimento: nascimentoInput.value,
    rg_cnh: document.getElementById('rg').value,
    regional: document.getElementById('regional').value,
    cep: cepInput.value,
    telefone: telInput.value,
    endereco: document.getElementById('endereco').value,
    email: document.getElementById('email').value || null,
    data_procedimento: document.querySelector('input[name="dataProcedimento"]:checked').value,
    animal_nome: document.getElementById('animalNome').value,
    especie: document.querySelector('input[name="especie"]:checked').value,
    raca: document.getElementById('raca').value,
    cor: document.getElementById('cor').value,
    idade_animal: document.getElementById('idade').value,
    quantidade: parseInt(document.getElementById('qtd').value, 10),
    como_soube: document.getElementById('comoSoube').value,
    duvida: document.getElementById('duvida').value || null
  };

  supabase.from('cadastros').insert([payload]).then(function (result) {
    if (result.error) {
      console.error(result.error);
      document.getElementById('submitErrorNotice').classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar cadastro';
      return;
    }
    form.style.display = 'none';
    document.querySelector('.info-card').style.display = 'none';
    document.getElementById('successPanel').classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
