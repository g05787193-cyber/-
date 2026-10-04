/* ==========================================================
   НАСТРОЙКА TELEGRAM-УВЕДОМЛЕНИЙ
   1. Напиши @BotFather в Telegram -> /newbot -> получи токен
   2. Напиши своему новому боту любое сообщение (например "привет")
   3. Открой в браузере:
      https://api.telegram.org/bot<ТВОЙ_ТОКЕН>/getUpdates
      и найди "chat":{"id":XXXXXXXXX} — это твой CHAT_ID
   4. Впиши оба значения ниже
   ========================================================== */
const TG_BOT_TOKEN = '8928238318:AAHMwvgYFy1p2Ermg8bCeaKF_T_oljyeMNU';
const TG_CHAT_ID   = '8865617269';

function sendTelegram(text) {
    if (TG_BOT_TOKEN.startsWith('ВСТАВЬ') || TG_CHAT_ID.startsWith('ВСТАВЬ')) {
        console.warn('Telegram не настроен: впиши TG_BOT_TOKEN и TG_CHAT_ID в script.js');
        return;
    }
    fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text })
    }).catch(err => console.log('Telegram error:', err));
}

// ---------- Подсказка ----------
function showHint() {
    document.getElementById('hint-text').classList.remove('hidden');
}

// ---------- Фото-загадка (блюр) ----------
document.getElementById('lock-photo-wrap')?.addEventListener('click', function () {
    this.classList.toggle('revealed');
});

// ---------- Проверка пароля ----------
function checkPassword() {
    const input = document.getElementById('pass-input').value.trim().toLowerCase();
    const errorMsg = document.getElementById('error-msg');

    if (input === 'мими' || input === 'mimi') {
        document.getElementById('lock-screen').classList.add('hidden');
        const main = document.getElementById('main-content');
        main.classList.remove('hidden');
        main.classList.add('reveal');

        fireConfetti();
        startMusic();
        startFloatingHearts();

        new Swiper('.mySwiper', {
            loop: true,
            pagination: { el: '.swiper-pagination', clickable: true },
            autoplay: { delay: 2500, disableOnInteraction: false },
        });
    } else {
        errorMsg.innerText = 'Неа, думай лучше 😜';
    }
}

document.getElementById('pass-input')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') checkPassword();
});

// ---------- Конфетти ----------
function fireConfetti() {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
}

// ---------- Музыка ----------
const audio = document.getElementById('bday-audio');
const musicBtn = document.getElementById('music-toggle');

function startMusic() {
    if (!audio) return;
    audio.volume = 0.55;
    audio.play().then(() => {
        musicBtn.textContent = '🔊';
        musicBtn.classList.add('playing');
    }).catch(() => {
        // автоплей заблокирован браузером — покажем как "нажми, чтобы включить"
        musicBtn.textContent = '🔈';
        musicBtn.classList.remove('playing');
    });
}

musicBtn?.addEventListener('click', () => {
    if (!audio) return;
    if (audio.paused) {
        audio.play();
        musicBtn.textContent = '🔊';
        musicBtn.classList.add('playing');
    } else {
        audio.pause();
        musicBtn.textContent = '🔈';
        musicBtn.classList.remove('playing');
    }
});

// ---------- Плавающие сердечки ----------
const HEART_EMOJIS = ['💗', '💖', '💕', '✨'];

function startFloatingHearts() {
    const layer = document.getElementById('hearts-layer');
    if (!layer) return;

    function spawnHeart() {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
        heart.style.fontSize = (0.9 + Math.random() * 1.1) + 'rem';
        const duration = 7 + Math.random() * 5;
        heart.style.animationDuration = duration + 's';
        layer.appendChild(heart);
        setTimeout(() => heart.remove(), duration * 1000);
    }

    spawnHeart();
    setInterval(spawnHeart, 1400);
}

// ---------- Модалка даты ----------
function openDateModal() {
    document.getElementById('date-modal').classList.remove('hidden');
    updateDatePreview();
}

function closeDateModal() {
    document.getElementById('date-modal').classList.add('hidden');
}

const MONTHS_RU = ['января','февраля','марта','апреля','мая','июня',
                    'июля','августа','сентября','октября','ноября','декабря'];

function formatDateRu(isoDate) {
    const [y, m, d] = isoDate.split('-').map(Number);
    return `${d} ${MONTHS_RU[m - 1]} ${y}`;
}

function updateDatePreview() {
    const val = document.getElementById('meeting-date').value;
    const preview = document.getElementById('date-preview');
    preview.innerText = val ? formatDateRu(val) : '';
}

const dateInput = document.getElementById('meeting-date');

// Уведомление на черновик — если она просто выбрала дату, не нажимая кнопку
let draftTimer = null;
dateInput?.addEventListener('change', function () {
    updateDatePreview();
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
        sendTelegram(`👀 Выбирает дату встречи (пока не подтвердила): ${formatDateRu(dateInput.value)}`);
    }, 1200);
});

// Подтверждение даты
document.getElementById('date-form')?.addEventListener('submit', function (e) {
    e.preventDefault();
    clearTimeout(draftTimer);
    const selectedDate = dateInput.value;
    const status = document.getElementById('date-status');

    status.innerText = `Зафиксировано на: ${formatDateRu(selectedDate)}! 🎉`;
    fireConfetti();

    sendTelegram(`✅ Дата встречи подтверждена: ${formatDateRu(selectedDate)}`);
});

// ---------- Сообщение с сайта ----------
document.getElementById('message-form')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const input = document.getElementById('message-input');
    const status = document.getElementById('message-status');
    const text = input.value.trim();
    if (!text) return;

    sendTelegram(`💌 Сообщение с сайта:\n${text}`);

    status.innerText = 'Отправлено, я уже прочитаю 💖';
    input.value = '';
    fireConfetti();
});
