import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVgpuJ_kN3z5tPQoffvYIw3MQO_dvaTWg",
  authDomain: "love-connect-b2c89.firebaseapp.com",
  databaseURL: "https://love-connect-b2c89-default-rtdb.firebaseio.com",
  projectId: "love-connect-b2c89",
  storageBucket: "love-connect-b2c89.firebasestorage.app",
  messagingSenderId: "662159375496",
  appId: "1:662159375496:web:38e81f61e1cd837868733d"
};

const db = getDatabase(initializeApp(firebaseConfig));
const GROQ_KEY = window.__GROQ_KEY__ || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

let currentRoom = null, currentName = null, selectedMode = 'reflective', currentGame = null, gameIndex = 0;

const affirmations = [
  "You are worthy of the love you give to others.",
  "Your vulnerability is not weakness — it is the beginning of real connection.",
  "You don't need to be complete to be loved. You just need to be honest.",
  "The right person will not ask you to shrink yourself.",
  "Healing is not linear. Be patient with where you are today.",
  "Your presence is a gift. You don't need to earn your place in someone's life.",
  "Confidence is not the absence of doubt — it is showing up anyway."
];

const prompts = [
  "What is one thing you want someone to understand about you that you rarely say out loud?",
  "Describe the version of yourself you are working toward. What does that person look like?",
  "What boundary do you need to set for yourself this week — and why have you avoided it?",
  "What does love look like in action, to you specifically?",
  "What is a pattern you keep repeating in relationships that you want to break?",
  "If you could have one honest conversation with your past self about love, what would you say?",
  "What does a healthy relationship feel like in your body, not just your mind?"
];

const coupleQuestions = [
  "What is one thing I do that makes you feel most loved, even if it seems small?",
  "What is a dream you've been hesitant to share with me, and why?",
  "How do you prefer to be supported when you're stressed or overwhelmed?",
  "What is something from your childhood that still shapes how you love?",
  "What does 'home' mean to you — and do you feel it with me?",
  "Is there something you've wanted to say to me but haven't found the right moment?",
  "What is one thing we could do more of that would make you feel closer to me?",
  "What are you most proud of about how we handle disagreements?",
  "Where do you see us in three years, and does that excite or scare you?"
];

const games = {
  truth: [
    "What is something about me that surprised you when you first found out?",
    "When do you feel most distant from me, and what causes it?",
    "What is a fear you have about our relationship that you haven't fully voiced?",
    "What is something I said once that stayed with you — positive or negative?",
    "Do you feel like I truly see you? What would help you feel more seen?",
    "What is one thing you wish I understood about how you receive love?",
    "Have you ever held back from telling me something important? What was it?",
    "What does trust mean to you, and do you feel fully trusted by me?",
    "Is there a version of yourself you hide from me? Why?",
    "What is the hardest thing you've forgiven me for?",
    "What is something you've never told anyone that you feel safe enough to tell me now?",
    "When did you first realize your feelings for me were serious?",
    "What is one habit of mine that quietly bothers you but you've never mentioned?",
    "Do you feel like we communicate well? What would make it better?",
    "What is something you're still healing from that affects how you love?",
    "Have you ever felt embarrassed by me? What happened?",
    "What is the biggest lie you've ever told me, even a small one?",
    "What do you need from me that you've been too afraid to ask for?",
    "Is there something you've apologized for that you don't think I've truly forgiven?",
    "What is one thing about yourself you hope never changes?"
  ],
  scenario: [
    "We have 48 hours and unlimited money. Where do we go and what do we do?",
    "One of us gets a dream job offer in another country. How do we handle it together?",
    "We disagree on a major life decision. What's our process for reaching a conclusion?",
    "Five years from now — describe a normal Tuesday in our life.",
    "We hit a rough patch and things feel distant. What is the first move either of us makes?",
    "We lose everything financially. How do we rebuild — and does it bring us closer or pull us apart?",
    "One of us becomes seriously ill. How does the other show up?",
    "We have the chance to live off-grid for a year. Do we do it? What does that look like?",
    "A close friend of mine does something that hurts you. How do we navigate that together?",
    "We're offered a chance to start a business together. Do we take it? Why or why not?",
    "We find out we're expecting a child unexpectedly. What's our first conversation?",
    "One of us wants to go back to school full-time. How do we make it work?",
    "We're stuck in a foreign country with no money or phones. What do we do?",
    "A family member disapproves of our relationship. How do we handle it as a team?",
    "We have the option to adopt a child. Do we? What does that conversation look like?",
    "One of us gets a once-in-a-lifetime opportunity that requires 6 months apart. Do we do it?",
    "We win the lottery tomorrow. What's the first decision we make together?",
    "We disagree on where to raise our family. How do we decide?",
    "One of us wants to completely change careers at 40. How do we support that?",
    "We're given a year with no obligations. How do we spend it?"
  ],
  appreciation: [
    "Name one specific thing your partner did this week that you appreciated but didn't say.",
    "What is a quality your partner has that you wish you had more of?",
    "Describe a moment with your partner that you keep coming back to in your memory.",
    "What is something your partner does for you that you would genuinely miss?",
    "Tell your partner one way they have made you a better person.",
    "What is something small your partner does that makes you feel safe?",
    "What is a sacrifice your partner has made for you that you've never fully acknowledged?",
    "Describe your partner using only three words — then explain each one.",
    "What is something your partner is proud of that you think they don't celebrate enough?",
    "When do you feel most proud to be with your partner?",
    "What is a strength your partner has that they probably don't see in themselves?",
    "What is the most thoughtful thing your partner has ever done for you?",
    "How has your partner changed your life in a way you didn't expect?",
    "What is something your partner does effortlessly that you find deeply attractive?",
    "Name a moment when your partner showed up for you exactly when you needed it.",
    "What is something your partner taught you about love?",
    "What do you love most about how your partner treats other people?",
    "What is a part of your partner's personality that you fell in love with slowly over time?",
    "What is something your partner does that always makes you smile, no matter your mood?",
    "If you had to write one sentence about your partner for the world to read, what would it say?"
  ],
  future: [
    "What does financial stability look like for us — and are we aligned on how to get there?",
    "How do you picture us handling major family decisions in the future?",
    "What is one shared goal you want us to commit to in the next year?",
    "What does your ideal home environment feel like, and does it match what I picture?",
    "Is there something about our future you're excited about but haven't told me yet?",
    "How do you want us to handle conflict differently in the next chapter of our relationship?",
    "What does growing old together look like to you?",
    "Are there any dreams you've put on hold because of our relationship? Should we revisit them?",
    "What kind of parents do you think we'd be — and is that something you want?",
    "What is one thing you want us to build together that we haven't started yet?",
    "What traditions do you want us to create as a couple?",
    "How do you want us to keep the romance alive 10 years from now?",
    "What does retirement look like for us — and are we planning for it the same way?",
    "Is there a place in the world you want us to live, even temporarily?",
    "What is one thing you want to accomplish individually that you need my support for?",
    "How do you want us to show up for each other's families in the future?",
    "What does a healthy work-life balance look like for us as a unit?",
    "What is one fear about the future that you haven't shared with me yet?",
    "How do you want us to handle it if our paths start to feel misaligned?",
    "What is the legacy you want us to leave — as a couple, a family, or in the world?"
  ],
  opinions: [
    "What is a relationship rule most couples follow that you think is unnecessary?",
    "Do you think jealousy is ever healthy in a relationship? Where's the line?",
    "Is it possible to truly be 'just friends' with an ex? What do you think?",
    "Should couples share all passwords and accounts? Why or why not?",
    "Do you think love is a feeling or a choice — or both?",
    "Is it okay to keep some things completely private from your partner?",
    "Do you think couples should go to bed angry sometimes, or always resolve things first?",
    "Should both partners always split finances 50/50? What's your view?",
    "Do you think social media is good or bad for relationships overall?",
    "Is it possible to love someone and still not be right for them?",
    "Do you think people can truly change for a relationship, or do they revert eventually?",
    "Should couples always prioritize each other over friends and family?",
    "Do you think long-distance relationships can work long-term?",
    "Is it okay to have a 'type' — or does that limit who you can love?",
    "Do you think therapy should be a normal part of every relationship?",
    "Should couples always agree on religion and politics to work?",
    "Do you think it's possible to fall out of love and back in again?",
    "Is it ever okay to snoop through your partner's phone?",
    "Do you think marriage changes a relationship — for better or worse?",
    "Should couples always present a united front publicly, even if they disagree privately?"
  ],
  lovelanguages: [
    "When do you feel most loved by me — what am I usually doing in that moment?",
    "What is something I could do more of that would make you feel deeply appreciated?",
    "Do you feel more loved through words, actions, time, touch, or gifts — and has that changed?",
    "When you're upset, what kind of support do you actually want from me?",
    "Is there a way I show love that doesn't land the way I intend it to?",
    "What does quality time mean to you — what does it look like in practice?",
    "Do you feel like I notice and acknowledge the small things you do for me?",
    "What is something I used to do early in our relationship that you miss?",
    "How do you prefer to be comforted when you're going through something hard?",
    "What is a gesture — big or small — that would mean the world to you right now?",
    "Do you feel like your love language is understood and respected by me?",
    "When do you feel least loved, even if I don't intend it that way?",
    "What is something you do for me that you wish I recognized more?",
    "How important is physical affection to you day-to-day — and are you getting enough?",
    "Is there a love language you've developed over time that I might not know about?",
    "What does feeling truly cherished look like to you?",
    "Do you feel like we make enough intentional time for each other?",
    "What is one way I could make you feel more seen on a regular day?",
    "How do you show love when you don't have words for it?",
    "What would your ideal 'I love you without saying it' moment look like?"
  ]
};

const gameLabels = {
  truth: '🎯 Truth Cards',
  scenario: '🌍 Scenario Roles',
  appreciation: '💛 Appreciation Round',
  future: '🔭 Future Vision',
  opinions: '🔥 Unpopular Opinions',
  lovelanguages: '💬 Love Languages'
};

// --- UI helpers ---
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function setLoading(btn, loading, label) {
  btn.disabled = loading;
  btn.innerHTML = loading ? '<span class="dots"><span></span><span></span><span></span></span>' : label;
}

// --- AI ---
async function callGroq(system, user) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: 1000 })
  });
  const data = await res.json();
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  throw new Error('No response');
}

// --- Singles ---
function loadSinglesContent() {
  const d = new Date().getDate();
  document.getElementById('daily-affirmation').textContent = affirmations[d % affirmations.length];
  document.getElementById('daily-prompt').textContent = prompts[(d + 1) % prompts.length];
}

function refreshPrompt() {
  const cur = document.getElementById('daily-prompt').textContent;
  let next;
  do { next = prompts[Math.floor(Math.random() * prompts.length)]; } while (next === cur);
  document.getElementById('daily-prompt').textContent = next;
}

function selectMode(el) {
  document.querySelectorAll('.mode-opt').forEach(m => m.classList.remove('selected'));
  el.classList.add('selected');
  selectedMode = el.dataset.mode;
}

async function askAdvisor() {
  const situation = document.getElementById('situation-input').value.trim();
  if (!situation) { showToast("Share what's on your mind first"); return; }
  const btn = document.getElementById('singles-ask-btn');
  setLoading(btn, true);

  const modeInstructions = {
    reflective: "Use Socratic questioning to help the user understand their own feelings. Ask one or two thoughtful follow-up questions. Be warm but don't project emotions onto them.",
    strategy: "Give the user a clear, actionable communication script or strategy. Be practical and specific. Format as steps or a script if appropriate.",
    game: "Suggest a specific self-reflection exercise or journaling activity that directly addresses their situation. Explain it clearly and why it will help."
  };

  const system = `You are Umoja, a warm and emotionally intelligent relationship advisor. You help young people navigate love, confidence, and connection with empathy and wisdom. You never judge. Mode: ${selectedMode}. ${modeInstructions[selectedMode]} Keep response under 200 words. Be genuine, not generic.`;

  try {
    const response = await callGroq(system, situation);
    document.getElementById('singles-response-text').textContent = response;
    document.getElementById('singles-response').classList.add('visible');
    document.getElementById('singles-response').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch { showToast('Could not reach Umoja. Check your connection.'); }

  setLoading(btn, false, 'Ask Umoja');
}

function askAgain() {
  document.getElementById('singles-response').classList.remove('visible');
  document.getElementById('situation-input').focus();
}

// --- Couples setup ---
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  document.getElementById('room-code-input').value = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function joinRoom() {
  const name = document.getElementById('partner-name').value.trim();
  const code = document.getElementById('room-code-input').value.trim().toUpperCase();
  if (!name) { showToast('Enter your name first'); return; }
  if (!code || code.length < 3) { showToast('Enter a valid room code'); return; }
  currentName = name;
  currentRoom = code;
  set(ref(db, `rooms/${code}/partners/${name}`), { joined: Date.now() });
  loadRoom();
  showScreen('room');
}

function loadRoom() {
  document.getElementById('room-code-display').textContent = currentRoom;

  onValue(ref(db, `rooms/${currentRoom}/partners`), snap => {
    const partners = snap.val() || {};
    document.getElementById('partners-row').innerHTML = Object.keys(partners)
      .map(p => `<div class="partner-chip"><div class="partner-dot"></div>${p}</div>`).join('');
  });

  onValue(ref(db, `rooms/${currentRoom}/question`), snap => {
    const q = snap.val();
    if (q) {
      document.getElementById('couple-question').textContent = q;
    } else {
      set(ref(db, `rooms/${currentRoom}/question`), coupleQuestions[Math.floor(Math.random() * coupleQuestions.length)]);
    }
  });

  onValue(ref(db, `rooms/${currentRoom}/game/state`), snap => {
    const state = snap.val();
    if (state) applyGameState(state.type, state.index);
  });

  onValue(ref(db, `rooms/${currentRoom}/answers`), snap => {
    const answers = snap.val() || {};
    const items = Object.values(answers).sort((a, b) => a.time - b.time);
    document.getElementById('answers-list').innerHTML = items.length
      ? items.map(a => `<div class="saved-answer"><div class="answer-author">${a.name}</div><div>${a.text}</div></div>`).join('')
      : '<span style="color:var(--muted);font-size:0.85rem">No answers yet. Be the first to share.</span>';
  });
}

function newQuestion() {
  const cur = document.getElementById('couple-question').textContent;
  let q;
  do { q = coupleQuestions[Math.floor(Math.random() * coupleQuestions.length)]; } while (q === cur);
  set(ref(db, `rooms/${currentRoom}/question`), q);
  set(ref(db, `rooms/${currentRoom}/answers`), null);
}

function saveAnswer() {
  const text = document.getElementById('answer-input').value.trim();
  if (!text) { showToast('Write your answer first'); return; }
  push(ref(db, `rooms/${currentRoom}/answers`), { name: currentName, text, time: Date.now() });
  document.getElementById('answer-input').value = '';
  showToast('Answer shared ✓');
}

function copyRoomCode() {
  navigator.clipboard.writeText(currentRoom).then(() => showToast('Room code copied: ' + currentRoom));
}

function leaveRoom() {
  currentRoom = null;
  currentName = null;
  showScreen('couples');
}

function switchTab(name, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

// --- Games ---
let gameRepliesListener = null, gameChatListener = null;

function renderGameReplies(snap) {
  const replies = snap.val() || {};
  const items = Object.values(replies).sort((a, b) => a.time - b.time);
  document.getElementById('game-replies-list').innerHTML = items.length
    ? items.map(r => `<div class="saved-answer"><div class="answer-author">${r.name}</div><div>${r.text}</div></div>`).join('')
    : '<span style="color:var(--muted);font-size:0.85rem">No replies yet.</span>';
}

function subscribeGameReplies() {
  if (gameRepliesListener) gameRepliesListener();
  const repliesRef = ref(db, `rooms/${currentRoom}/game/replies/${gameIndex}`);
  gameRepliesListener = onValue(repliesRef, renderGameReplies);
}

function subscribeGameChat() {
  if (gameChatListener) gameChatListener();
  const chatRef = ref(db, `rooms/${currentRoom}/game/chat`);
  gameChatListener = onValue(chatRef, snap => {
    const msgs = snap.val() || {};
    const items = Object.values(msgs).sort((a, b) => a.time - b.time);
    const list = document.getElementById('game-chat-list');
    list.innerHTML = items.map(m => {
      const mine = m.name === currentName;
      return `<div class="chat-bubble ${mine ? 'mine' : 'theirs'}">
        ${!mine ? `<div class="chat-name">${m.name}</div>` : ''}
        ${m.text}
      </div>`;
    }).join('');
    list.scrollTop = list.scrollHeight;
  });
}

function sendGameChat() {
  const input = document.getElementById('game-chat-input');
  const text = input.value.trim();
  if (!text) return;
  push(ref(db, `rooms/${currentRoom}/game/chat`), { name: currentName, text, time: Date.now() });
  input.value = '';
}

function applyGameState(type, index) {
  currentGame = type;
  gameIndex = index;
  document.getElementById('game-label').textContent = gameLabels[type];
  document.getElementById('game-prompt').textContent = games[type][index];
  document.getElementById('games-list').style.display = 'none';
  document.getElementById('game-active-area').style.display = 'block';
  subscribeGameReplies();
  subscribeGameChat();
}

function startGame(type) {
  set(ref(db, `rooms/${currentRoom}/game/state`), { type, index: 0 });
}

function nextGamePrompt() {
  const next = (gameIndex + 1) % games[currentGame].length;
  set(ref(db, `rooms/${currentRoom}/game/state`), { type: currentGame, index: next });
}

function sendGameReply() {
  const text = document.getElementById('game-reply-input').value.trim();
  if (!text) { showToast('Write a reply first'); return; }
  push(ref(db, `rooms/${currentRoom}/game/replies/${gameIndex}`), { name: currentName, text, time: Date.now() });
  document.getElementById('game-reply-input').value = '';
}

function endGame() {
  if (gameRepliesListener) { gameRepliesListener(); gameRepliesListener = null; }
  if (gameChatListener) { gameChatListener(); gameChatListener = null; }
  set(ref(db, `rooms/${currentRoom}/game/state`), null);
  set(ref(db, `rooms/${currentRoom}/game/chat`), null);
  document.getElementById('games-list').style.display = 'block';
  document.getElementById('game-active-area').style.display = 'none';
}

// --- Couple advisor ---
async function askCoupleAdvisor() {
  const situation = document.getElementById('couple-situation').value.trim();
  if (!situation) { showToast('Describe your situation first'); return; }
  const btn = document.getElementById('couple-ask-btn');
  setLoading(btn, true);

  const system = `You are Umoja, a compassionate relationship advisor speaking to a couple together. You never take sides. You speak to both partners equally. Use Socratic questioning to help them understand each other better. Be warm but honest. Keep responses under 250 words. Never be preachy.`;

  try {
    const response = await callGroq(system, `We are a couple sharing this together: ${situation}`);
    document.getElementById('couple-response-text').textContent = response;
    document.getElementById('couple-response').classList.add('visible');
    document.getElementById('couple-response').scrollIntoView({ behavior: 'smooth' });
  } catch { showToast('Could not reach Umoja. Check your connection.'); }

  setLoading(btn, false, 'Ask Umoja');
}

// --- Init & expose globals ---
loadSinglesContent();

Object.assign(window, {
  goHome: () => showScreen('landing'),
  goSingles: () => { showScreen('singles'); loadSinglesContent(); },
  goCouples: () => showScreen('couples'),
  refreshPrompt, selectMode, askAdvisor, askAgain,
  generateCode, joinRoom, leaveRoom, newQuestion, saveAnswer, copyRoomCode, switchTab,
  startGame, nextGamePrompt, sendGameReply, sendGameChat, endGame, askCoupleAdvisor, showToast
});
