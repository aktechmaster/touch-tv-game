// Variabel Game
let currentTopic = "";
let currentQuestions = [];
let questionIndex = 0;
let scoreA = 0;
let scoreB = 0;
const MAX_QUESTIONS = 10;
let isLockedA = false;
let isLockedB = false;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const spinnerScreen = document.getElementById('spinner-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');

// Tombol
document.getElementById('btn-start').addEventListener('click', startSpinner);
document.getElementById('btn-restart').addEventListener('click', resetGame);

// Fungsi Ganti Layar
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// 1. Fase Spinner
function startSpinner() {
    showScreen('spinner-screen');
    const topics = Object.keys(questionBank);
    const spinnerText = document.getElementById('spinner-text');
    
    let spinCount = 0;
    const spinInterval = setInterval(() => {
        // Efek putar teks acak
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        spinnerText.textContent = randomTopic;
        spinCount++;

        // Berhenti setelah 20 putaran (sekitar 2 detik)
        if (spinCount > 20) {
            clearInterval(spinInterval);
            currentTopic = spinnerText.textContent; // Topik final
            prepareGame();
        }
    }, 100);
}

// 2. Persiapan Game
function prepareGame() {
    // Ambil soal berdasarkan topik dan acak urutannya
    currentQuestions = [...questionBank[currentTopic]].sort(() => 0.5 - Math.random());
    
    // Potong jadi maksimal 10 soal (Jika soal kurang dari 10, ambil berapapun sisanya)
    if(currentQuestions.length > MAX_QUESTIONS) {
        currentQuestions = currentQuestions.slice(0, MAX_QUESTIONS);
    }
    
    // Reset Data
    questionIndex = 0;
    scoreA = 0;
    scoreB = 0;
    updateScoreUI();
    document.getElementById('topic-display').textContent = `Topik: ${currentTopic}`;
    
    setTimeout(() => {
        showScreen('game-screen');
        loadNextQuestion();
    }, 1000);
}

// 3. Menampilkan Soal ke Layar Terbelah
function loadNextQuestion() {
    if (questionIndex >= currentQuestions.length || questionIndex >= MAX_QUESTIONS) {
        return endGame();
    }

    // Reset Lock di kedua tim
    isLockedA = false;
    isLockedB = false;
    document.getElementById('team-a-side').classList.remove('locked');
    document.getElementById('team-b-side').classList.remove('locked');
    
    const qData = currentQuestions[questionIndex];
    document.getElementById('question-counter').textContent = `Soal: ${questionIndex + 1}/${currentQuestions.length}`;

    // Render untuk Tim A
    renderSide('a', qData);
    // Render untuk Tim B
    renderSide('b', qData);
}

// Fungsi render UI per sisi (Kiri/Kanan)
function renderSide(team, qData) {
    document.getElementById(`question-${team}`).textContent = qData.question;
    const optionsContainer = document.getElementById(`options-${team}`);
    optionsContainer.innerHTML = ""; // Bersihkan opsi sebelumnya

    // Render tombol pilihan ganda
    qData.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        
        // Event Listener Touch/Click
        btn.onclick = () => handleAnswer(team, opt, qData.answer);
        optionsContainer.appendChild(btn);
    });
}

// 4. Logika Penilaian dan Adu Cepat
function handleAnswer(team, selected, correct) {
    // Cegah jika tim sedang dikunci (sudah salah jawab)
    if (team === 'a' && isLockedA) return;
    if (team === 'b' && isLockedB) return;

    if (selected === correct) {
        // JAWABAN BENAR!
        if (team === 'a') scoreA += 1;
        if (team === 'b') scoreB += 1;
        
        updateScoreUI();
        
        // Pindah soal karena ada yang jawab benar
        questionIndex++;
        loadNextQuestion();

    } else {
        // JAWABAN SALAH (Kena Penalti)
        if (team === 'a') {
            scoreA -= 1;
            isLockedA = true;
            document.getElementById('team-a-side').classList.add('locked');
        }
        if (team === 'b') {
            scoreB -= 1;
            isLockedB = true;
            document.getElementById('team-b-side').classList.add('locked');
        }
        
        updateScoreUI();

        // Jika KEDUA tim salah, baru ganti soal
        if (isLockedA && isLockedB) {
            setTimeout(() => {
                questionIndex++;
                loadNextQuestion();
            }, 1000); // Jeda 1 detik biar sadar dua-duanya salah
        }
    }
}

// Update UI Teks Skor
function updateScoreUI() {
    document.getElementById('score-a').textContent = scoreA;
    document.getElementById('score-b').textContent = scoreB;
}

// 5. Akhir Permainan
function endGame() {
    showScreen('result-screen');
    document.getElementById('final-score-a').textContent = scoreA;
    document.getElementById('final-score-b').textContent = scoreB;

    const winnerText = document.getElementById('winner-text');
    if (scoreA > scoreB) {
        winnerText.textContent = "🏆 TIM A MENANG! 🏆";
        winnerText.style.color = "#ff4757";
    } else if (scoreB > scoreA) {
        winnerText.textContent = "🏆 TIM B MENANG! 🏆";
        winnerText.style.color = "#1e90ff";
    } else {
        winnerText.textContent = "🤝 SERI! 🤝";
        winnerText.style.color = "white";
    }
}

// 6. Reset Game
function resetGame() {
    showScreen('start-screen');
}
