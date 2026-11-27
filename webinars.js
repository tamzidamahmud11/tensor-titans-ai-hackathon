// Webinars management for Dengue Protirodh (Bilingual EN/BN)
(function() {
  const isBn = () => (window.DG_I18N ? window.DG_I18N.isBn() : localStorage.getItem("dg_lang") === "bn");
  const T = (en, bn) => (isBn() ? bn : en);
  const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const toBnD = s => isBn() ? String(s).replace(/[0-9]/g, d => BN_DIGITS[+d]) : String(s);

  const DEFAULT_WEBINARS = [
    {
      id: "web-01",
      title: "Anticipating Monsoon Peaks: Predictive Weather Lag Modeling for Public Health",
      status: "upcoming",
      date: "2026-12-08",
      time: "07:00 PM – 08:30 PM BST (Online Zoom)",
      speakers: "Dr. K. Rahman (Epidemiologist, IEDCR) & Dengue Guard Data Team",
      desc: "An in-depth technical walkthrough of how 2-8 week cumulative rainfall and humidity lags provide early indicators of Aedes mosquito population explosions across Bangladesh wards.",
      registeredCount: 240,
      zoomLink: "https://zoom.us/j/dengueguard-monsoon-forecast",
      recordingUrl: null
    },
    {
      id: "web-02",
      title: "Clinical Fluid Management & Dengue Shock Syndrome Prevention in Primary Clinics",
      status: "upcoming",
      date: "2026-12-14",
      time: "08:00 PM – 09:30 PM BST (Online)",
      speakers: "Prof. Dr. Farhana Begum (Internal Medicine, Dhaka Medical College Hospital)",
      desc: "Guidance for ward health center doctors and nurses on early detection of plasma leakage, timely IV saline administration, and monitoring platelet counts to avoid critical hospitalization delays.",
      registeredCount: 310,
      zoomLink: "https://zoom.us/j/dengueguard-clinical-triage",
      recordingUrl: null
    },
    {
      id: "web-03",
      title: "Community Larvae Control: Modern Wolbachia, Bio-Larvicides, and B-L-O-C-K Protocol",
      status: "recorded",
      date: "2026-11-18",
      time: "Recorded Session (1 hr 15 mins)",
      speakers: "Dr. S. Ahsan (Vector Control Specialist, WHO Collaborating Centre)",
      desc: "Comparative analysis of biological mosquito control interventions in Southeast Asia and practical steps for city corporations to deploy targeted larvicide before hospital admissions surge.",
      registeredCount: 520,
      zoomLink: null,
      recordingUrl: "https://www.youtube.com/watch?v=TbMCxl8YXTk"
    },
    {
      id: "web-04",
      title: "Citizen Science & Ward-Level Crowdsourcing for Urban Health Resiliency",
      status: "recorded",
      date: "2026-11-04",
      time: "Recorded Session (55 mins)",
      speakers: "Tariqul Islam (Urban Planner, BUET) & Local Ward Ambassadors",
      desc: "How neighborhood groups, schools, and volunteer inspectors can crowdsource standing-water reports and utilize predictive dashboards to guide municipal spraying teams.",
      registeredCount: 415,
      zoomLink: null,
      recordingUrl: "https://www.youtube.com/watch?v=Fixp7OAYFfA"
    }
  ];

  const BN_WEBINARS = {
    "web-01": {
      title: "বর্ষার চূড়া পূর্বাভাস: জনস্বাস্থ্যের জন্য আবহাওয়া বিলম্ব মডেলিং",
      time: "সন্ধ্যা ০৭:০০ – রাত ০৮:৩০ BST (অনলাইন জুম)",
      speakers: "ডা. কে. রহমান (মহামারী বিশেষজ্ঞ, IEDCR) এবং ডেঙ্গু প্রতিরোধ ডেটা দল",
      desc: "বাংলাদেশের ওয়ার্ডগুলোতে এডিস মশার সংখ্যা বিস্ফোরণের আগাম সংকেত হিসেবে ২–৮ সপ্তাহের সঞ্চিত বৃষ্টিপাত ও আর্দ্রতার বিলম্ব কীভাবে কাজ করে তার বিস্তারিত কারিগরি আলোচনা।"
    },
    "web-02": {
      title: "প্রাথমিক ক্লিনিকে ক্লিনিক্যাল ফ্লুইড ব্যবস্থাপনা ও ডেঙ্গু শক সিনড্রোম প্রতিরোধ",
      time: "রাত ০৮:০০ – রাত ০৯:৩০ BST (অনলাইন)",
      speakers: "অধ্যাপক ডা. ফারহানা বেগম (মেডিসিন, ঢাকা মেডিকেল কলেজ হাসপাতাল)",
      desc: "প্লাজমা লিকেজ দ্রুত শনাক্তকরণ, সময়মতো আইভি স্যালাইন প্রয়োগ এবং প্লেটলেট পর্যবেক্ষণে ওয়ার্ড স্বাস্থ্যকেন্দ্রের চিকিৎসক ও নার্সদের জন্য দিকনির্দেশনা।"
    },
    "web-03": {
      title: "কমিউনিটি লার্ভা নিয়ন্ত্রণ: ওলবাচিয়া, জৈব-লার্ভিসাইড এবং B-L-O-C-K পদ্ধতি",
      time: "রেকর্ডকৃত সেশন (১ ঘণ্টা ১৫ মিনিট)",
      speakers: "ডা. এস. আহসান (ভেক্টর কন্ট্রোল বিশেষজ্ঞ, WHO সহযোগী কেন্দ্র)",
      desc: "দক্ষিণ-পূর্ব এশিয়ায় জৈবিক মশা নিয়ন্ত্রণ পদ্ধতির তুলনামূলক বিশ্লেষণ এবং হাসপাতাল ভর্তি বাড়ার আগেই সিটি কর্পোরেশনের জন্য লক্ষ্যভিত্তিক লার্ভিসাইড প্রয়োগের ধাপ।"
    },
    "web-04": {
      title: "নগর স্বাস্থ্য সহনশীলতার জন্য নাগরিক বিজ্ঞান ও ওয়ার্ড-স্তরের ক্রাউডসোর্সিং",
      time: "রেকর্ডকৃত সেশন (৫৫ মিনিট)",
      speakers: "তারিকুল ইসলাম (নগর পরিকল্পনাবিদ, বুয়েট) ও স্থানীয় ওয়ার্ড প্রতিনিধি",
      desc: "পাড়ার দল, স্কুল ও স্বেচ্ছাসেবক পরিদর্শকরা কীভাবে জমা পানির প্রতিবেদন সংগ্রহ করতে এবং পৌর স্প্রে দলকে দিকনির্দেশনা দিতে পূর্বাভাস ড্যাশবোর্ড ব্যবহার করতে পারেন।"
    }
  };

  let webinars = [];
  try {
    const saved = localStorage.getItem("dg_webinars");
    webinars = saved ? JSON.parse(saved) : DEFAULT_WEBINARS;
  } catch (e) { webinars = DEFAULT_WEBINARS; }

  let userRegistrations = [];
  try {
    const regSaved = localStorage.getItem("dg_webinar_regs");
    userRegistrations = regSaved ? JSON.parse(regSaved) : [];
  } catch (e) { userRegistrations = []; }

  let currentFilter = "all";

  function saveWebinars() { try { localStorage.setItem("dg_webinars", JSON.stringify(webinars)); } catch (e) {} }
  function saveRegs() { try { localStorage.setItem("dg_webinar_regs", JSON.stringify(userRegistrations)); } catch (e) {} }

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2500);
  }

  function renderWebinars(filter = currentFilter) {
    currentFilter = filter;
    const grid = document.getElementById("webinarGrid");
    if (!grid) return;
    const filtered = webinars.filter(w => filter === "all" || w.status === filter);
    const bn = isBn();

    grid.innerHTML = filtered.map(w => {
      const isReg = userRegistrations.includes(w.id);
      const isUpcoming = w.status === "upcoming";
      const loc = bn && BN_WEBINARS[w.id] ? BN_WEBINARS[w.id] : w;

      return `
        <article class="webinar-card">
          <div class="webinar-badge-bar ${isUpcoming ? 'badge-upcoming' : 'badge-recorded'}">
            <span>${isUpcoming ? T('📅 Live Webinar', '📅 লাইভ ওয়েবিনার') : T('📼 Recorded Video', '📼 রেকর্ডকৃত ভিডিও')}</span>
            <span>${bn ? toBnD(w.date) : w.date}</span>
          </div>
          <div class="webinar-body">
            <h3 class="webinar-title">${loc.title}</h3>
            <div class="webinar-speakers">
              <span><b>${T('Presenter(s):', 'বক্তা:')}</b> ${loc.speakers}</span>
              <span><b>${T('Time / Duration:', 'সময় / ব্যাপ্তি:')}</b> ${loc.time}</span>
            </div>
            <p class="webinar-desc">${loc.desc}</p>
            <div class="webinar-footer">
              <span style="font-size:0.85rem;color:var(--mu)">👥 ${bn ? toBnD(w.registeredCount) + ' জন অংশগ্রহণকারী' : w.registeredCount + ' participants'}</span>
              ${isUpcoming ? `
                ${isReg ? `
                  <button type="button" class="btn-event btn-event-secondary btn-unreg-web" data-id="${w.id}">
                    ${T('✓ Registered (Join Link Saved)', '✓ নিবন্ধিত (জয়েন লিংক সংরক্ষিত)')}
                  </button>
                ` : `
                  <button type="button" class="btn-event btn-event-primary btn-reg-web" data-id="${w.id}">
                    ${T('Register Free →', 'বিনামূল্যে নিবন্ধন →')}
                  </button>
                `}
              ` : `
                <a href="${w.recordingUrl}" target="_blank" rel="noopener noreferrer" class="btn-event btn-event-primary" style="text-decoration:none">
                  ${T('▶ Watch Replay', '▶ রিপ্লে দেখুন')}
                </a>
              `}
            </div>
          </div>
        </article>
      `;
    }).join("");

    grid.querySelectorAll(".btn-reg-web").forEach(btn => {
      btn.addEventListener("click", () => openWebinarModal(btn.dataset.id));
    });

    grid.querySelectorAll(".btn-unreg-web").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        userRegistrations = userRegistrations.filter(x => x !== id);
        const target = webinars.find(x => x.id === id);
        if (target) target.registeredCount = Math.max(0, target.registeredCount - 1);
        saveRegs(); saveWebinars(); renderWebinars(filter);
        toast(T("Webinar registration cancelled.", "ওয়েবিনার নিবন্ধন বাতিল করা হয়েছে।"));
      });
    });
  }

  function openWebinarModal(id) {
    const w = webinars.find(x => x.id === id);
    if (!w) return;
    const bn = isBn();
    const loc = bn && BN_WEBINARS[w.id] ? BN_WEBINARS[w.id] : w;

    let overlay = document.getElementById("webinarModalOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "webinarModalOverlay";
      overlay.className = "event-modal-overlay";
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="event-modal" role="dialog" aria-modal="true">
        <button class="event-modal-close" aria-label="${T('Close dialog', 'ডায়ালগ বন্ধ করুন')}">&times;</button>
        <span class="chip" style="margin-left:0;margin-bottom:8px">${T('Webinar Registration', 'ওয়েবিনার নিবন্ধন')}</span>
        <h3>${loc.title}</h3>
        <p><b>${T('Date & Time:', 'তারিখ ও সময়:')}</b> ${bn ? toBnD(w.date) : w.date} · ${loc.time}<br><b>${T('Platform:', 'প্ল্যাটফর্ম:')}</b> ${T('Zoom Live / Google Meet', 'জুম লাইভ / গুগল মিট')}</p>
        <form id="webinarRegForm">
          <label>${T('Your Name', 'আপনার নাম')}
            <input name="name" type="text" required placeholder="${T('e.g. Dr. Sabrina Akhter', 'যেমন: ডা. সাবরিনা আখতার')}">
          </label>
          <label>${T('Email Address (to receive webinar link)', 'ইমেইল ঠিকানা (ওয়েবিনার লিংক পেতে)')}
            <input name="email" type="email" required placeholder="sabrina@example.com">
          </label>
          <label>${T('Organization / Hospital / Affiliation', 'প্রতিষ্ঠান / হাসপাতাল / পরিচয়')}
            <input name="org" type="text" placeholder="${T('e.g. Dhaka Medical College / Resident', 'যেমন: ঢাকা মেডিকেল কলেজ / বাসিন্দা')}">
          </label>
          <button type="submit" class="btn" style="margin-top:8px">${T('Confirm Free Registration', 'বিনামূল্যে নিবন্ধন নিশ্চিত করুন')}</button>
        </form>
        <div id="webModalMsg" hidden></div>
      </div>
    `;

    overlay.style.display = "flex";
    overlay.querySelector(".event-modal-close").addEventListener("click", () => { overlay.style.display = "none"; });
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.style.display = "none"; });

    const form = overlay.querySelector("#webinarRegForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = fd.get("name");
      w.registeredCount += 1;
      userRegistrations.push(w.id);
      saveWebinars(); saveRegs(); renderWebinars();

      const msg = overlay.querySelector("#webModalMsg");
      msg.className = "event-feedback-msg success";
      msg.textContent = isBn()
        ? `অভিনন্দন, ${name}! আপনার আসন নিশ্চিত হয়েছে। সেশনের লিংক সংরক্ষিত হয়েছে।`
        : `Success, ${name}! Your seat is confirmed. The session access link has been reserved.`;
      msg.hidden = false;
      form.remove();

      setTimeout(() => {
        overlay.style.display = "none";
        toast(T("Webinar registration complete!", "ওয়েবিনার নিবন্ধন সম্পন্ন হয়েছে!"));
      }, 2000);
    });
  }

  function init() {
    document.querySelectorAll(".webinar-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".webinar-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderWebinars(btn.dataset.filter);
      });
    });
    renderWebinars();
    window.addEventListener("dg:langchange", () => renderWebinars());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
