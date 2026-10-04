// =====================================================================
//  Date planner: Gulasal picks the plan → it is sent to your Telegram
// =====================================================================
(function () {
    const cfg = typeof CONFIG !== "undefined" ? CONFIG : {};
    const herName = cfg.HER_NAME || "Gulasal";
    const steps = [...document.querySelectorAll(".step")];
    const progress = document.getElementById("progress");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll(".her-name").forEach(el => (el.textContent = herName));

    const state = {
        date: "",
        time: "",
        exactTime: "",
        activities: [],
        food: [],
        vibe: "",
        pickup: "",
        note: "",
    };

    let current = 0;
    const LAST_FORM_STEP = 5; // summary

    // ---------- Progress dots (steps 1..5) ----------
    for (let i = 1; i <= LAST_FORM_STEP; i++) progress.appendChild(document.createElement("span"));

    function renderProgress() {
        progress.style.visibility = current >= 1 && current <= LAST_FORM_STEP ? "visible" : "hidden";
        [...progress.children].forEach((dot, i) => {
            const n = i + 1;
            dot.className = n < current ? "done" : n === current ? "current" : "";
        });
    }

    function goTo(n, isBack = false) {
        steps[current].classList.remove("active", "back");
        current = n;
        const s = steps[current];
        s.classList.toggle("back", isBack);
        s.classList.add("active");
        renderProgress();
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        if (current === 5) renderSummary();
    }

    // ---------- Date ----------
    const dateInput = document.getElementById("dateInput");
    const toISO = d => {
        const off = d.getTimezoneOffset();
        return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
    };
    const today = new Date();
    dateInput.min = toISO(today);
    dateInput.addEventListener("change", () => (state.date = dateInput.value));

    // quick buttons: Tomorrow / This Saturday / This Sunday
    const quick = document.getElementById("quickDays");
    function addQuick(label, d) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = label;
        b.addEventListener("click", () => {
            dateInput.value = toISO(d);
            state.date = dateInput.value;
            clearError(1);
        });
        quick.appendChild(b);
    }
    const plusDays = n => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
    addQuick("Tomorrow", plusDays(1));
    const toSat = (6 - today.getDay() + 7) % 7 || 7;
    addQuick("This Saturday", plusDays(toSat));
    addQuick("This Sunday", plusDays(toSat + 1));

    document.getElementById("exactTime").addEventListener("change", e => (state.exactTime = e.target.value));
    document.getElementById("note").addEventListener("input", e => (state.note = e.target.value.trim()));

    // ---------- Chips ----------
    document.querySelectorAll(".chips").forEach(group => {
        const field = group.dataset.field;
        const multi = group.classList.contains("multi");
        const max = Number(group.dataset.max) || Infinity;

        group.addEventListener("click", e => {
            const chip = e.target.closest(".chip");
            if (!chip) return;
            const value = chip.dataset.value;

            if (multi) {
                const list = state[field];
                const idx = list.indexOf(value);
                if (idx >= 0) {
                    list.splice(idx, 1);
                    chip.classList.remove("selected");
                } else if (list.length < max) {
                    list.push(value);
                    chip.classList.add("selected");
                } else {
                    chip.animate?.([{ transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "none" }], 250);
                }
                chip.setAttribute("aria-pressed", chip.classList.contains("selected"));
            } else {
                group.querySelectorAll(".chip").forEach(c => { c.classList.remove("selected"); c.setAttribute("aria-pressed", "false"); });
                chip.classList.add("selected");
                chip.setAttribute("aria-pressed", "true");
                state[field] = value;
            }
            clearError(current);
        });
    });

    // ---------- Validation ----------
    function showError(step, msg) {
        const el = document.getElementById("err" + step);
        if (el) el.textContent = msg;
    }
    function clearError(step) { showError(step, ""); }

    function validate(step) {
        if (step === 1) {
            if (!state.date) return showError(1, "Pick a day first 📅"), false;
            if (state.date < dateInput.min) return showError(1, "That day already passed 🙈"), false;
            if (!state.time && !state.exactTime) return showError(1, "Choose a time too ⏰"), false;
        }
        if (step === 2 && !state.activities.length) return showError(2, "Pick at least one thing to do 🎯"), false;
        if (step === 3 && !state.food.length) return showError(3, "Pick something yummy 😋"), false;
        clearError(step);
        return true;
    }

    document.querySelectorAll("[data-next]").forEach(b =>
        b.addEventListener("click", () => { if (validate(current)) goTo(current + 1); })
    );
    document.querySelectorAll("[data-back]").forEach(b =>
        b.addEventListener("click", () => goTo(current - 1, true))
    );

    // ---------- Summary ----------
    function prettyDate(iso) {
        const [y, m, d] = iso.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    }
    function timeText() {
        if (state.exactTime && state.time) return `${state.time} — at ${state.exactTime}`;
        return state.exactTime ? `At ${state.exactTime}` : state.time;
    }
    function rows() {
        return [
            ["📅", "Day", prettyDate(state.date)],
            ["⏰", "Time", timeText()],
            ["🎯", "Activities", state.activities.join(", ")],
            ["😋", "Food", state.food.join(", ")],
            ["👗", "Dress vibe", state.vibe || "Any"],
            ["🚗", "Meeting", state.pickup || "Not decided"],
            ...(state.note ? [["📝", "Note", state.note]] : []),
        ];
    }

    function renderSummary() {
        const ul = document.getElementById("summary");
        ul.innerHTML = "";
        rows().forEach(([ico, label, val]) => {
            const li = document.createElement("li");
            const i = document.createElement("span"); i.className = "ico"; i.textContent = ico;
            const div = document.createElement("div");
            const b = document.createElement("b"); b.textContent = label;
            div.append(b, document.createTextNode(val));
            li.append(i, div);
            ul.appendChild(li);
        });
    }

    function planText() {
        const lines = rows().map(([ico, label, val]) => `${ico} ${label}: ${val}`);
        const sent = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
        return `💌 New date plan from ${herName}!\n\n${lines.join("\n")}\n\n🕒 Sent: ${sent}`;
    }

    // ---------- Sending to Telegram ----------
    async function sendToTelegram(text) {
        const token = (cfg.TELEGRAM_BOT_TOKEN || "").trim();
        const chatId = String(cfg.TELEGRAM_CHAT_ID || "").trim();
        if (!token || !chatId) throw new Error("Telegram is not set up in config.js");

        // form-encoded body = "simple" request, so the browser doesn't need a CORS preflight
        const body = new URLSearchParams({ chat_id: chatId, text });
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: "POST", body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.ok === false) throw new Error(data.description || `HTTP ${res.status}`);
    }

    const sendBtn = document.getElementById("sendBtn");
    sendBtn.addEventListener("click", async () => {
        sendBtn.disabled = true;
        sendBtn.textContent = "Sending… 💫";
        clearError(5);
        const text = planText();
        let delivered = false;
        try {
            await sendToTelegram(text);
            delivered = true;
        } catch (err) {
            console.warn("Telegram send failed:", err.message);
        }
        showSent(text, delivered);
        sendBtn.disabled = false;
        sendBtn.textContent = "Send it 💌";
    });

    function showSent(text, delivered) {
        const fallback = document.getElementById("fallback");
        const sentText = document.getElementById("sentText");
        fallback.hidden = delivered;
        sentText.textContent = delivered
            ? "Your plan is already on my phone. I can't wait 🥰"
            : "Almost done! Just send me the plan so I know 🥰";

        if (!delivered) {
            const user = (cfg.MY_TELEGRAM_USERNAME || "").replace(/^@/, "").trim();
            const link = document.getElementById("tgShare");
            // With a username: copy the plan and open his chat. Without: Telegram's share dialog.
            link.href = user
                ? `https://t.me/${encodeURIComponent(user)}`
                : `https://t.me/share/url?url=${encodeURIComponent(location.href.split("#")[0])}&text=${encodeURIComponent(text)}`;
            link.onclick = () => { if (user) copy(text); };
            document.getElementById("copyBtn").onclick = () => copy(text);
        }
        goTo(6);
        burst();
    }

    async function copy(text) {
        const btn = document.getElementById("copyBtn");
        try {
            await navigator.clipboard.writeText(text);
            btn.textContent = "✅ Copied! Paste it in our chat";
        } catch {
            const ta = document.createElement("textarea");
            ta.value = text; document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); btn.textContent = "✅ Copied!"; } catch { /* ignore */ }
            ta.remove();
        }
    }

    // ---------- Plan again ----------
    document.getElementById("againBtn").addEventListener("click", () => {
        Object.assign(state, { date: "", time: "", exactTime: "", activities: [], food: [], vibe: "", pickup: "", note: "" });
        document.querySelectorAll(".chip.selected").forEach(c => c.classList.remove("selected"));
        document.querySelectorAll("input, textarea").forEach(i => (i.value = ""));
        document.getElementById("copyBtn").textContent = "📋 Copy the plan";
        goTo(1, true);
    });

    // ---------- Hearts ----------
    const layer = document.querySelector(".hearts");
    const chars = ["❤️", "💖", "💕", "💗", "🌹", "✨"];
    function drop(fast) {
        const h = document.createElement("span");
        h.className = "heart fall";
        h.textContent = chars[Math.floor(Math.random() * chars.length)];
        h.style.left = Math.random() * 100 + "vw";
        h.style.fontSize = 16 + Math.random() * 22 + "px";
        h.style.animationDuration = (fast ? 2 + Math.random() * 2 : 6 + Math.random() * 6) + "s";
        layer.appendChild(h);
        h.addEventListener("animationend", () => h.remove());
    }
    function burst() {
        if (reduceMotion) return;
        for (let i = 0; i < 40; i++) setTimeout(() => drop(true), i * 40);
    }
    if (!reduceMotion) {
        burst();
        setInterval(() => drop(false), 900);
    }

    renderProgress();
})();
