const ar = n => String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
const $ = id => document.getElementById(id);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- التبويبات ---------- */
const tabs = document.querySelectorAll(".tabs button");
function openTab(name){
  tabs.forEach(t => t.setAttribute("aria-selected", t.dataset.tab === name));
  document.querySelectorAll(".panel-tab").forEach(p => p.hidden = p.id !== name);
  window.scrollTo({top: 0});
}
tabs.forEach(t => t.addEventListener("click", () => openTab(t.dataset.tab)));
document.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => openTab(b.dataset.go)));

/* ---------- الملخص: عداد القراءة وفتح الكل ---------- */
const secs = document.querySelectorAll("details.sec");
const seen = new Set();
secs.forEach(d => d.addEventListener("toggle", () => {
  if (d.open) seen.add(d.id);
  $("readCount").textContent = `قرأت ${ar(seen.size)} من ${ar(secs.length)} أقسام`;
}));
$("toggleAll").addEventListener("click", e => {
  const open = e.target.textContent === "افتح الكل";
  document.querySelectorAll("details").forEach(d => d.open = open);
  e.target.textContent = open ? "أغلق الكل" : "افتح الكل";
});

/* ---------- بطاقات المراجعة ---------- */
let cards = window.FLASHCARDS.slice(), ci = 0;
function showCard(){
  $("flip").classList.remove("on");
  $("cardFront").textContent = cards[ci].front;
  $("cardBack").textContent = cards[ci].back;
  $("cardCount").textContent = `${ar(ci + 1)} / ${ar(cards.length)}`;
}
$("flip").addEventListener("click", () => $("flip").classList.toggle("on"));
$("nextCard").addEventListener("click", () => { ci = (ci + 1) % cards.length; showCard(); });
$("prevCard").addEventListener("click", () => { ci = (ci - 1 + cards.length) % cards.length; showCard(); });
$("shuffleCards").addEventListener("click", () => { cards = shuffle(cards); ci = 0; showCard(); });
showCard();

/* ---------- الاختبار: سؤال واحد في كل مرة ---------- */
let qs, qi, score, mistakes;
function startQuiz(){
  qs = shuffle(window.QUESTIONS); qi = 0; score = 0; mistakes = [];
  $("result").hidden = true; $("qcard").hidden = false;
  showQ();
}
function showQ(){
  const q = qs[qi];
  $("qnum").textContent = `السؤال ${ar(qi + 1)} من ${ar(qs.length)}`;
  $("qtext").textContent = q.q;
  $("fb").textContent = ""; $("fb").className = "fb";
  $("nextQ").hidden = true;
  $("bar").style.width = (qi / qs.length * 100) + "%";
  const box = $("opts"); box.innerHTML = "";
  q.o.forEach((t, j) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = t;
    b.addEventListener("click", () => answer(j));
    box.appendChild(b);
  });
}
function answer(j){
  const q = qs[qi], btns = $("opts").querySelectorAll("button");
  btns.forEach(b => b.disabled = true);
  btns[q.a].classList.add("right");
  if (j === q.a){ score++; $("fb").className = "fb good"; $("fb").innerHTML = `<b>صحيح!</b> ${q.e}`; }
  else {
    btns[j].classList.add("wrong");
    mistakes.push(q);
    $("fb").className = "fb no"; $("fb").innerHTML = `<b>الإجابة الصحيحة: ${q.o[q.a]}.</b> ${q.e}`;
  }
  $("nextQ").textContent = qi === qs.length - 1 ? "اعرض النتيجة" : "السؤال التالي";
  $("nextQ").hidden = false; $("nextQ").focus();
}
$("nextQ").addEventListener("click", () => { qi++; qi < qs.length ? showQ() : finish(); });
function finish(){
  $("bar").style.width = "100%";
  $("qcard").hidden = true; $("result").hidden = false;
  const pct = Math.round(score / qs.length * 100);
  $("ring").style.setProperty("--p", pct);
  $("pct").textContent = ar(pct) + "٪";
  $("resTitle").textContent = `${ar(score)} إجابة صحيحة من ${ar(qs.length)}`;
  $("resMsg").textContent = pct >= 90 ? "ممتاز، فهمك للوحدة متمكّن 🌟"
    : pct >= 70 ? "جيد جدًا، راجع الأسئلة التي أخطأت فيها بالأسفل."
    : "ارجع إلى الملخص وراجع الأقسام، ثم أعد المحاولة.";
  $("review").innerHTML = mistakes.length
    ? "<h3 style='font-size:1rem;margin-bottom:.3rem'>راجع أخطاءك</h3>" +
      mistakes.map(m => `<div class="rv">${m.q}<br><b>الصحيح: ${m.o[m.a]}</b></div>`).join("")
    : "";
}
$("retry").addEventListener("click", startQuiz);
startQuiz();
