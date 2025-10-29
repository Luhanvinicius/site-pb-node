// Tactical Site - Main JavaScript
const API_BASE = '/api';

// Check authentication status
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/user`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const user = await response.json();
            showUserPanel(user);
            return user;
        } else {
            showLoginPanel();
            return null;
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showLoginPanel();
        return null;
    }
}

// Show login panel
function showLoginPanel() {
    document.getElementById('loginPanel').style.display = 'block';
    document.getElementById('userPanel').style.display = 'none';
    document.getElementById('userMenu').style.display = 'none';
    document.getElementById('adminMenu').style.display = 'none';
}

// Show user panel
function showUserPanel(user) {
    document.getElementById('loginPanel').style.display = 'none';
    document.getElementById('userPanel').style.display = 'block';
    
    document.getElementById('userLogin').textContent = user.login || 'Usuário';
    document.getElementById('userName').textContent = user.name || user.login;
    // Mostrar patente com imagem
    const rankImg = `<img src="/imagens/patentes/${user.rank || 0}.png" width="20" onerror="this.src='/images/patentes/0.png';" />`;
    document.getElementById('userRank').innerHTML = rankImg + ' ' + (user.rank || '0');
    document.getElementById('userExp').textContent = formatNumber(user.exp || 0);
    document.getElementById('userGP').textContent = formatNumber(user.gp || 0);
    document.getElementById('userMoney').textContent = formatNumber(user.money || 0);
    document.getElementById('userStatus').innerHTML = user.ban_obj_id == 0 
        ? '<span class="badge badge-success">Ativo</span>' 
        : '<span class="badge badge-danger">Banido</span>';

    // Show menu items
    document.getElementById('userMenu').style.display = 'block';
    
    // Admin para access_level >= 3 (como no PHP original)
    if (user.access_level >= 3) {
        document.getElementById('adminMenu').style.display = 'block';
    }
}

// Format numbers
function formatNumber(num) {
    return new Intl.NumberFormat('pt-BR').format(num);
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const data = await response.json();
        
        document.getElementById('onlinePlayers').textContent = data.online || 0;
        document.getElementById('totalPlayers').textContent = data.total || 0;
    } catch (error) {
        console.error('Stats error:', error);
    }
}

// Load news
async function loadNews() {
    try {
        const response = await fetch(`${API_BASE}/news?page=0`);
        const data = await response.json();
        
        const newsList = document.getElementById('newsList');
        if (data.news && data.news.length > 0) {
            newsList.innerHTML = data.news.map((news, index) => `
                <div class="news-item">
                    <h5>${news.titulo || 'Sem título'}</h5>
                    <p class="text-muted">${news.tipo || ''} - ${formatDate(news.data || new Date())}</p>
                    <p>${news.noticia ? news.noticia.substring(0, 150) + '...' : ''}</p>
                </div>
            `).join('');
        } else {
            newsList.innerHTML = '<p class="text-muted">Nenhuma notícia encontrada.</p>';
        }
    } catch (error) {
        console.error('News error:', error);
        document.getElementById('newsList').innerHTML = '<p class="text-danger">Erro ao carregar notícias.</p>';
    }
}

// Load ranking
async function loadRanking() {
    try {
        const response = await fetch(`${API_BASE}/ranking?page=0`);
        const data = await response.json();
        
        const rankingList = document.getElementById('rankingList');
        if (data.players && data.players.length > 0) {
            rankingList.innerHTML = data.players.map((player, index) => `
                <div class="ranking-item">
                    <div>
                        <span class="ranking-position">#${index + 1}</span>
                        <strong>${player.player_name || player.login}</strong>
                        <span class="text-muted ml-2">${formatNumber(player.exp || 0)} EXP</span>
                    </div>
                    <div>
                        <span class="badge badge-primary">Rank ${player.rank || 0}</span>
                    </div>
                </div>
            `).join('');
        } else {
            rankingList.innerHTML = '<p class="text-muted">Nenhum jogador encontrado.</p>';
        }
    } catch (error) {
        console.error('Ranking error:', error);
        document.getElementById('rankingList').innerHTML = '<p class="text-danger">Erro ao carregar ranking.</p>';
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Login form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: formData.get('username'),
                password: formData.get('password')
            }),
            credentials: 'include'
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Login realizado com sucesso!');
            location.reload();
        } else {
            alert(data.error || 'Erro ao fazer login');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Erro ao processar login');
    }
});

// Register form
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (formData.get('password') !== formData.get('confirmPassword')) {
        alert('As senhas não correspondem!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: formData.get('username'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword'),
                email: formData.get('email'),
                birthDate: formData.get('birthDate')
            }),
            credentials: 'include'
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Conta criada com sucesso!');
            location.reload();
        } else {
            alert(data.error || 'Erro ao criar conta');
        }
    } catch (error) {
        console.error('Register error:', error);
        alert('Erro ao processar cadastro');
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch(`${API_BASE}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        location.reload();
    } catch (error) {
        console.error('Logout error:', error);
        location.reload();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadStats();
    loadNews();
    loadRanking();
    
    // Refresh stats every 30 seconds
    setInterval(loadStats, 30000);
});

