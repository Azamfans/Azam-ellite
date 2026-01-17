const config = {
    leagues: {
        EPL: ["Man City", "Arsenal", "Liverpool", "Man Utd", "Chelsea", "Spurs", "Aston Villa", "Newcastle", "Brighton", "West Ham", "Wolves", "Everton", "Fulham", "Bournemouth", "Crystal Palace", "Brentford", "Nottingham", "Leicester", "Ipswich", "Southampton"],
        LALIGA: ["Real Madrid", "Barcelona", "Atleti", "Girona", "Sociedad", "Villarreal", "Betis", "Bilbao", "Valencia", "Sevilla", "Osasuna", "Getafe", "Celta Vigo", "Mallorca", "Rayo", "Las Palmas", "Alaves", "Leganes", "Valladolid", "Espanyol"],
        BUNDESLIGA: ["Leverkusen", "Bayern", "Dortmund", "Leipzig", "Stuttgart", "Frankfurt", "Hoffenheim", "Heidenheim", "Werder", "Freiburg", "Augsburg", "Wolfsburg", "Mainz", "Gladbach", "Union", "Bochum", "St Pauli", "Kiel", "Schalke", "Hertha"],
        SERIEA: ["Inter", "Milan", "Juve", "Atalanta", "Bologna", "Roma", "Lazio", "Fiorentina", "Torino", "Napoli", "Genoa", "Monza", "Verona", "Udinese", "Cagliari", "Lecce", "Empoli", "Parma", "Como", "Venezia"]
    },
    names: ["Zidan", "Alex", "Grealish", "Foden", "Muller", "Davies", "Silva", "Mount", "Rice", "Azam", "Pedri", "Gavi", "Endrick", "Yamal", "Musiala", "Arda"],
    lastNames: ["Sterling", "Smith", "Junior", "Santos", "Walker", "Kimmich", "Sancho", "Pulisic", "Guler", "Mainoo"]
};

let game = {
    mName: "", mAge: 0, budget: 150, team: "", league: [],
    squad: [], market: [], academy: [], standings: [], currentYear: 2026, isGameOver: false
};

function initMusic() {
    const audio = document.getElementById('bgMusic');
    if(audio.paused) { audio.volume = 0.15; audio.play(); }
}

function loadTeams() {
    game.mName = document.getElementById('mName').value;
    game.mAge = parseInt(document.getElementById('mAge').value);
    const lKey = document.getElementById('mLeague').value;

    if(!game.mName || game.mAge < 37 || game.mAge > 55) return alert("Cek kembali Nama & Usia (37-55)!");

    const grid = document.getElementById('team-grid');
    grid.innerHTML = "";
    config.leagues[lKey].forEach(t => {
        grid.innerHTML += `<button class="btn-primary" onclick="startApp('${t}', '${lKey}')">${t}</button>`;
    });
    showScreen('team-screen');
}

function startApp(team, lKey) {
    game.team = team;
    game.league = config.leagues[lKey];
    resetStandings();

    // Gen Squad (23 Players)
    game.squad = [];
    for(let i=0; i<23; i++) {
        game.squad.push({ id: Date.now()+i, name: generateAIName(), ovr: Math.floor(Math.random()*15)+70 });
    }

    // Gen Market & Academy
    generateMarket();
    generateAcademy();

    document.getElementById('header-team-name').innerText = game.team;
    document.getElementById('nav-mName').innerText = game.mName.toUpperCase();
    
    updateUI();
    showScreen('main-screen');
}

function generateAIName() {
    return config.names[Math.floor(Math.random()*config.names.length)] + " " + config.lastNames[Math.floor(Math.random()*config.lastNames.length)];
}

function resetStandings() {
    game.standings = game.league.map(t => ({ name: t, pts: 0, w:0, d:0, l:0 }));
}

function generateAcademy() {
    game.academy = [];
    for(let i=0; i<4; i++) {
        game.academy.push({ id: Date.now()+i+100, name: generateAIName(), pot: Math.floor(Math.random()*15)+80, ovr: 65 });
    }
}

function generateMarket() {
    game.market = [
        {name: "K. Mbappe", price: 180, ovr: 96}, {name: "E. Haaland", price: 175, ovr: 95},
        {name: "Bellingham", price: 150, ovr: 94}, {name: "Yamal", price: 90, ovr: 89}
    ];
}

function updateUI() {
    document.getElementById('budget-val').innerText = `$${game.budget}M`;
    document.getElementById('welcome-year').innerText = game.currentYear;
    
    // Squad
    const sq = document.getElementById('squad-grid');
    sq.innerHTML = game.squad.map(p => `<div class="card"><h3>${p.name}</h3><span class="green">OVR: ${p.ovr}</span></div>`).join('');

    // Academy
    const ac = document.getElementById('academy-grid');
    ac.innerHTML = game.academy.map(p => `
        <div class="card" style="border-color:gold">
            <h3>${p.name}</h3><span>POT: ${p.pot}</span><br>
            <button class="btn-primary" style="padding:5px; margin-top:10px" onclick="promoteAcademy(${p.id})">PROMOTE</button>
        </div>
    `).join('');

    // Market
    const mk = document.getElementById('market-grid');
    mk.innerHTML = game.market.map(p => `
        <div class="card">
            <h3>${p.name}</h3><b class="green">$${p.price}M</b><br>
            <button class="btn-primary" style="padding:5px" onclick="buyPlayer('${p.name}', ${p.price}, ${p.ovr})">SIGN</button>
        </div>
    `).join('');

    renderTable();
}

function promoteAcademy(id) {
    const p = game.academy.find(x => x.id === id);
    game.squad.push({name: p.name, ovr: p.ovr});
    game.academy = game.academy.filter(x => x.id !== id);
    updateUI();
}

function buyPlayer(name, price, ovr) {
    if(game.budget < price) return alert("Budget tidak cukup!");
    game.budget -= price;
    game.squad.push({name, ovr});
    game.market = game.market.filter(p => p.name !== name);
    updateUI();
}

function runSimulation() {
    if(game.isGameOver) return;
    game.standings.forEach(t => {
        t.pts = 0; t.w = 0; t.d = 0; t.l = 0;
        for(let i=0; i<38; i++) {
            let luck = Math.random();
            let avgOvr = game.squad.reduce((a, b) => a + b.ovr, 0) / game.squad.length;
            if(t.name === game.team) luck += (avgOvr - 75) * 0.03;
            if(luck > 0.55) { t.pts += 3; t.w++; }
            else if(luck > 0.25) { t.pts += 1; t.d++; }
            else { t.l++; }
        }
    });
    game.standings.sort((a,b) => b.pts - a.pts);
    renderTable();
    checkSeason();
}

function checkSeason() {
    const pos = game.standings.findIndex(t => t.name === game.team) + 1;
    if(pos >= 18) {
        triggerGameOver(`RELEGATED! Anda terdegradasi di posisi ${pos}.`);
        return;
    }
    if(game.currentYear >= 2070) {
        triggerGameOver(`RETIRED! Selamat menikmati masa pensiun di tahun 2070.`);
        return;
    }
    alert(`Musim ${game.currentYear} selesai! Anda Finish di Posisi ${pos}.`);
    game.currentYear++;
    game.budget += 60;
    generateAcademy();
    resetStandings();
    updateUI();
}

function renderTable() {
    let html = `<table><tr><th>POS</th><th>CLUB</th><th>W</th><th>D</th><th>L</th><th>PTS</th><th>INFO</th></tr>`;
    game.standings.forEach((t, i) => {
        let p = i+1;
        let info = "", cls = "";
        if(p <= 4) { info = "UCL"; cls = "ucl"; }
        else if(p === 5) { info = "UEL"; cls = "uel"; }
        else if(p >= 18) { info = "REL"; cls = "rel"; }
        if(t.name === game.team) cls += " my-team-row";
        html += `<tr class="${cls}"><td>${p}</td><td>${t.name}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td><td>${t.pts}</td><td>${info}</td></tr>`;
    });
    document.getElementById('league-res').innerHTML = html + "</table>";
}

function toggleProfileModal() {
    const m = document.getElementById('profile-modal');
    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
    document.getElementById('input-mName').value = game.mName;
}

function saveProfile() {
    game.mName = document.getElementById('input-mName').value;
    const photo = document.getElementById('input-photo-url').value;
    if(photo) {
        document.getElementById('nav-mPhoto').src = photo;
        document.getElementById('edit-preview').src = photo;
    }
    document.getElementById('nav-mName').innerText = game.mName.toUpperCase();
    toggleProfileModal();
}

function triggerGameOver(msg) {
    game.isGameOver = true;
    document.body.innerHTML = `<div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#000; color:red; font-family:'Oswald'"><h1>GAME OVER</h1><p style="color:#fff">${msg}</p><button onclick="location.reload()" class="btn-primary">RESTART</button></div>`;
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id + '-tab').classList.add('active');
    event.currentTarget.classList.add('active');
}