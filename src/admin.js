import { supabase } from './supabaseClient.js';

var loginPage = document.getElementById('loginPage');
var dashboardPage = document.getElementById('dashboardPage');
var loginForm = document.getElementById('loginForm');
var loginBtn = document.getElementById('loginBtn');
var loginNotice = document.getElementById('loginNotice');
var logoutBtn = document.getElementById('logoutBtn');
var refreshBtn = document.getElementById('refreshBtn');
var searchInput = document.getElementById('searchInput');
var dataBody = document.getElementById('dataBody');
var loadingRow = document.getElementById('loadingRow');
var emptyRow = document.getElementById('emptyRow');
var statsEl = document.getElementById('stats');

var allRows = [];

function showDashboard() {
  loginPage.classList.add('hidden');
  dashboardPage.classList.remove('hidden');
  loadCadastros();
}

function showLogin() {
  dashboardPage.classList.add('hidden');
  loginPage.classList.remove('hidden');
}

function escapeHtml(v) {
  var div = document.createElement('div');
  div.textContent = v == null ? '' : String(v);
  return div.innerHTML;
}

function formatDate(iso) {
  var d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function renderStats(rows) {
  var total = rows.length;
  var caninos = rows.filter(function (r) { return r.especie === 'Canino'; }).length;
  var felinos = rows.filter(function (r) { return r.especie === 'Felino'; }).length;
  var porDia = {};
  rows.forEach(function (r) {
    porDia[r.data_procedimento] = (porDia[r.data_procedimento] || 0) + 1;
  });
  var diaHtml = Object.keys(porDia).sort().map(function (dia) {
    return '<div class="stat"><div class="k">' + escapeHtml(dia) + '</div><div class="v">' + porDia[dia] + '</div></div>';
  }).join('');

  statsEl.innerHTML =
    '<div class="stat"><div class="k">Total de cadastros</div><div class="v">' + total + '</div></div>' +
    '<div class="stat"><div class="k">Caninos</div><div class="v">' + caninos + '</div></div>' +
    '<div class="stat"><div class="k">Felinos</div><div class="v">' + felinos + '</div></div>' +
    diaHtml;
}

function renderRows(rows) {
  if (rows.length === 0) {
    dataBody.innerHTML = '';
    emptyRow.classList.remove('hidden');
    return;
  }
  emptyRow.classList.add('hidden');
  dataBody.innerHTML = rows.map(function (r) {
    return '<tr>' +
      '<td>' + escapeHtml(formatDate(r.created_at)) + '</td>' +
      '<td>' + escapeHtml(r.nome_tutor) + '</td>' +
      '<td>' + escapeHtml(r.cpf) + '</td>' +
      '<td>' + escapeHtml(r.telefone) + '</td>' +
      '<td>' + escapeHtml(r.regional) + '</td>' +
      '<td>' + escapeHtml(r.animal_nome) + '</td>' +
      '<td>' + escapeHtml(r.especie) + '</td>' +
      '<td>' + escapeHtml(r.raca) + '</td>' +
      '<td>' + escapeHtml(r.quantidade) + '</td>' +
      '<td>' + escapeHtml(r.data_procedimento) + '</td>' +
      '<td>' + escapeHtml(r.como_soube) + '</td>' +
      '</tr>';
  }).join('');
}

function applyFilter() {
  var q = searchInput.value.trim().toLowerCase();
  if (!q) {
    renderRows(allRows);
    return;
  }
  var filtered = allRows.filter(function (r) {
    return (r.nome_tutor + ' ' + r.cpf + ' ' + r.telefone + ' ' + r.animal_nome)
      .toLowerCase().indexOf(q) !== -1;
  });
  renderRows(filtered);
}

function loadCadastros() {
  loadingRow.classList.remove('hidden');
  emptyRow.classList.add('hidden');
  dataBody.innerHTML = '';
  supabase.from('cadastros').select('*').order('created_at', { ascending: false })
    .then(function (result) {
      loadingRow.classList.add('hidden');
      if (result.error) {
        console.error(result.error);
        emptyRow.textContent = 'Erro ao carregar cadastros: ' + result.error.message;
        emptyRow.classList.remove('hidden');
        return;
      }
      allRows = result.data;
      renderStats(allRows);
      applyFilter();
    });
}

searchInput.addEventListener('input', applyFilter);
refreshBtn.addEventListener('click', loadCadastros);

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();
  loginNotice.classList.remove('show');
  loginBtn.disabled = true;
  loginBtn.textContent = 'Entrando…';

  supabase.auth.signInWithPassword({
    email: document.getElementById('loginEmail').value,
    password: document.getElementById('loginPassword').value
  }).then(function (result) {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Entrar';
    if (result.error) {
      loginNotice.classList.add('show');
      return;
    }
    showDashboard();
  });
});

logoutBtn.addEventListener('click', function () {
  supabase.auth.signOut().then(function () { showLogin(); });
});

supabase.auth.getSession().then(function (result) {
  if (result.data.session) {
    showDashboard();
  } else {
    showLogin();
  }
});
