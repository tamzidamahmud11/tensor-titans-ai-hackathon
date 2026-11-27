// Events management for Dengue Protirodh (Bilingual EN/BN)
(function() {
  const isBn = () => (window.DG_I18N ? window.DG_I18N.isBn() : localStorage.getItem("dg_lang") === "bn");
  const T = (en, bn) => (isBn() ? bn : en);
  const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const toBnD = s => isBn() ? String(s).replace(/[0-9]/g, d => BN_DIGITS[+d]) : String(s);

  const DEFAULT_EVENTS = [
    {
      id: "ev-01",
      title: "Ward 11 & Mirpur Community Source Reduction Drive",
      type: "cleanup",
      typeName: "Cleanup Drive",
      city: "DNCC",
      location: "Mirpur Section 10 Community Center & Ward 11 alleys, Dhaka",
      date: "2026-12-05",
      time: "08:30 AM – 12:30 PM BST",
      organizer: "DNCC Health Wing & Mirpur Resident Action Committee",
      spots: 50,
      registered: 34,
      desc: "Volunteer-led door-to-door inspection and standing water removal in rooftop flowerpots, construction materials, and clogged alley drains following the late November rain spell.",
      contact: "mirpur.clean@dengueguard.example",
      status: "upcoming"
    },
    {
      id: "ev-02",
      title: "Free Platelet & NS1 Antigen Screening Clinic",
      type: "clinic",
      typeName: "Health Screening",
      city: "DSCC",
      location: "Lalbagh Thana Health Complex, Old Dhaka",
      date: "2026-12-07",
      time: "09:00 AM – 04:00 PM BST",
      organizer: "Directorate General of Health Services (DGHS) & DSCC",
      spots: 150,
      registered: 112,
      desc: "Free on-the-spot CBC, platelet count checks, and NS1 antigen tests for residents showing fever symptoms in high-density wards of Old Dhaka. Medical officers on-site for immediate triage.",
      contact: "clinic.dscc@dengueguard.example",
      status: "upcoming"
    },
    {
      id: "ev-03",
      title: "School Dengue Awareness & 'Junior Inspectors' Training",
      type: "workshop",
      typeName: "Workshop",
      city: "DNCC",
      location: "Uttara Model School & College Auditorium, Sector 4, Dhaka",
      date: "2026-12-10",
      time: "10:30 AM – 01:00 PM BST",
      organizer: "Bangladesh Red Crescent Society & Dengue Protirodh Youth",
      spots: 80,
      registered: 65,
      desc: "Interactive educational workshop for students, parents, and teachers on identifying Aedes larvae (B-L-O-C-K method), safe repellent application, and organising student-led home checkups.",
      contact: "youth@dengueguard.example",
      status: "upcoming"
    },
    {
      id: "ev-04",
      title: "Chattogram Port & Agrabad Canal Drain Clearing Campaign",
      type: "cleanup",
      typeName: "Cleanup Drive",
      city: "CCC",
      location: "Agrabad Commercial Area & Ward 27, Chattogram",
      date: "2026-12-12",
      time: "08:00 AM – 01:00 PM BST",
      organizer: "Chattogram City Corporation (CCC) Conservancy Wing",
      spots: 60,
      registered: 42,
      desc: "Joint municipal worker and community cleanup targeting slow-draining culverts, discarded tires, and container accumulation in industrial and commercial corridors of Agrabad.",
      contact: "ccc.conservancy@dengueguard.example",
      status: "upcoming"
    },
    {
      id: "ev-05",
      title: "Khulna Division Dengue Surveillance & Clinical Triage Seminar",
      type: "workshop",
      typeName: "Medical Seminar",
      city: "KCC",
      location: "Khulna Medical College Conference Hall, Khulna",
      date: "2026-12-15",
      time: "02:30 PM – 05:30 PM BST",
      organizer: "Khulna Medical College Hospital & DGHS Surveillance Unit",
      spots: 100,
      registered: 88,
      desc: "Special clinical briefing for primary care physicians and clinic directors on managing secondary infections, Dengue Shock Syndrome fluid protocols, and utilizing early-warning data.",
      contact: "kmch.events@dengueguard.example",
      status: "upcoming"
    },
    {
      id: "ev-06",
      title: "Gazipur Industrial Zone Larvicide & Bio-Control Inspection",
      type: "inspection",
      typeName: "Larvae Inspection",
      city: "GCC",
      location: "Tongi Industrial Area & Ward 53, Gazipur",
      date: "2026-12-18",
      time: "09:00 AM – 02:00 PM BST",
      organizer: "Gazipur City Corporation Health Department & Local Garment Association",
      spots: 40,
      registered: 29,
      desc: "Biological larvicide application and factory water-storage auditing across major textile manufacturing clusters in Tongi to eliminate massive unmonitored roof reservoirs.",
      contact: "gazipur.health@dengueguard.example",
      status: "upcoming"
    },
    {
      id: "ev-07",
      title: "Rajshahi University Campus Green Zone Dengue Sweep",
      type: "cleanup",
      typeName: "Cleanup Drive",
      city: "RCC",
      location: "Rajshahi University Paris Road & Student Dormitories",
      date: "2026-12-20",
      time: "09:00 AM – 12:00 PM BST",
      organizer: "RU Volunteer Corps & Rajshahi City Corporation",
      spots: 75,
      registered: 58,
      desc: "Student-led campus sweep focusing on water accumulation in garden trays, canteen drainage sumps, and perimeter ditches around university residential halls.",
      contact: "ru.volunteers@dengueguard.example",
      status: "upcoming"
    },
    {
      id: "ev-08",
      title: "Rooftop Gardeners Mosquito Prevention Clinic & Seed Exchange",
      type: "campaign",
      typeName: "Community Campaign",
      city: "DNCC",
      location: "Dhanmondi Lake Amphitheater / Ravindra Sarobar, Dhaka",
      date: "2026-12-22",
      time: "03:00 PM – 06:00 PM BST",
      organizer: "Dhaka Urban Green Forum & Dengue Protirodh",
      spots: 120,
      registered: 94,
      desc: "Hands-on session for rooftop and balcony gardening enthusiasts on using sand and biological deterrents in planters, proper saucer drainage, and swapping insect-repellent herbs like Citronella and Basil.",
      contact: "greendhaka@dengueguard.example",
      status: "upcoming"
    }
  ];

  const BN_EVENTS = {
    "ev-01": {
      title: "ওয়ার্ড ১১ ও মিরপুর কমিউনিটি উৎস হ্রাস অভিযান",
      location: "মিরপুর সেকশন ১০ কমিউনিটি সেন্টার ও ওয়ার্ড ১১-এর গলি, ঢাকা",
      time: "সকাল ০৮:৩০ – দুপুর ১২:৩০",
      organizer: "ডিএনসিসি স্বাস্থ্য বিভাগ ও মিরপুর আবাসিক অ্যাকশন কমিটি",
      desc: "নভেম্বরের শেষের বৃষ্টির পর ছাদের ফুলের টব, নির্মাণ সামগ্রী এবং বন্ধ গলির ড্রেনে স্বেচ্ছাসেবকদের নেতৃত্বে বাড়ি বাড়ি পরিদর্শন ও জমে থাকা পানি অপসারণ।"
    },
    "ev-02": {
      title: "বিনামূল্যে প্লেটলেট ও NS1 অ্যান্টিজেন স্ক্রিনিং ক্লিনিক",
      location: "লালবাগ থানা স্বাস্থ্য কমপ্লেক্স, পুরান ঢাকা",
      time: "সকাল ০৯:০০ – বিকাল ০৪:০০",
      organizer: "স্বাস্থ্য অধিদপ্তর (DGHS) ও ডিএসসিসি",
      desc: "পুরান ঢাকার ঘনবসতিপূর্ণ ওয়ার্ডের জ্বরাক্রান্ত বাসিন্দাদের জন্য তাৎক্ষণিক বিনামূল্যে সিবিসি, প্লেটলেট গণনা এবং NS1 অ্যান্টিজেন পরীক্ষা। তাৎক্ষণিক ট্রাইয়াজের জন্য চিকিৎসক উপস্থিত থাকবেন।"
    },
    "ev-03": {
      title: "স্কুল ডেঙ্গু সচেতনতা ও ‘জুনিয়র পরিদর্শক’ প্রশিক্ষণ",
      location: "উত্তরা মডেল স্কুল অ্যান্ড কলেজ অডিটোরিয়াম, সেক্টর ৪, ঢাকা",
      time: "সকাল ১০:৩০ – দুপুর ০১:০০",
      organizer: "বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি ও ডেঙ্গু প্রতিরোধ যুব দল",
      desc: "এডিস লার্ভা শনাক্তকরণ (B-L-O-C-K পদ্ধতি), নিরাপদ রিপেলেন্ট ব্যবহার এবং শিক্ষার্থীদের নেতৃত্বে বাড়ি পরিদর্শন নিয়ে শিক্ষার্থী, অভিভাবক ও শিক্ষকদের জন্য ইন্টারেক্টিভ কর্মশালা।"
    },
    "ev-04": {
      title: "চট্টগ্রাম বন্দর ও আগ্রাবাদ খাল-ড্রেন পরিষ্কার অভিযান",
      location: "আগ্রাবাদ বাণিজ্যিক এলাকা ও ওয়ার্ড ২৭, চট্টগ্রাম",
      time: "সকাল ০৮:০০ – দুপুর ০১:০০",
      organizer: "চট্টগ্রাম সিটি কর্পোরেশন (চসিক) কনজারভেন্সি বিভাগ",
      desc: "আগ্রাবাদের শিল্প ও বাণিজ্যিক এলাকায় ধীরগতির কালভার্ট, পরিত্যক্ত টায়ার ও জমে থাকা পাত্র অপসারণে পৌর কর্মী ও কমিউনিটির যৌথ পরিচ্ছন্নতা অভিযান।"
    },
    "ev-05": {
      title: "খুলনা বিভাগ ডেঙ্গু নজরদারি ও ক্লিনিক্যাল ট্রাইয়াজ সেমিনার",
      location: "খুলনা মেডিকেল কলেজ কনফারেন্স হল, খুলনা",
      time: "দুপুর ০২:৩০ – সন্ধ্যা ০৫:৩০",
      organizer: "খুলনা মেডিকেল কলেজ হাসপাতাল ও ডিজিএইচএস নজরদারি ইউনিট",
      desc: "সেকেন্ডারি সংক্রমণ ব্যবস্থাপনা, ডেঙ্গু শক সিনড্রোম ফ্লুইড প্রোটোকল এবং আগাম সতর্কবার্তার ডেটা ব্যবহারের ওপর প্রাথমিক স্বাস্থ্যসেবা চিকিৎসকদের বিশেষ ক্লিনিক্যাল ব্রিফিং।"
    },
    "ev-06": {
      title: "গাজীপুর শিল্পাঞ্চলে লার্ভিসাইড ও জৈব-নিয়ন্ত্রণ পরিদর্শন",
      location: "টঙ্গী শিল্প এলাকা ও ওয়ার্ড ৫৩, গাজীপুর",
      time: "সকাল ০৯:০০ – দুপুর ০২:০০",
      organizer: "গাজীপুর সিটি কর্পোরেশন স্বাস্থ্য বিভাগ ও স্থানীয় গার্মেন্টস সমিতি",
      desc: "টঙ্গীর প্রধান তৈরি পোশাক কারখানাগুলোতে জৈবিক লার্ভিসাইড প্রয়োগ এবং ছাদের বড় জলাধারগুলো পরিদর্শন করে মশার প্রজনন ধ্বংস করা।"
    },
    "ev-07": {
      title: "রাজশাহী বিশ্ববিদ্যালয় ক্যাম্পাস গ্রিন জোন ডেঙ্গু অভিযান",
      location: "রাজশাহী বিশ্ববিদ্যালয় প্যারিস রোড ও আবাসিক হলসমূহ",
      time: "সকাল ০৯:০০ – দুপুর ১২:০০",
      organizer: "রাবি স্বেচ্ছাসেবক দল ও রাজশাহী সিটি কর্পোরেশন",
      desc: "বিশ্ববিদ্যালয়ের আবাসিক হলের বাগানের ট্রে, ক্যান্টিনের ড্রেন ও নালায় জমে থাকা পানি অপসারণে শিক্ষার্থীদের নেতৃত্বে ক্যাম্পাস পরিচ্ছন্নতা অভিযান।"
    },
    "ev-08": {
      title: "ছাদ-বাগানিদের মশা প্রতিরোধ ক্লিনিক ও বীজ বিনিময়",
      location: "ধানমন্ডি লেক অ্যাম্ফিথিয়েটার / রবীন্দ্র সরোবর, ঢাকা",
      time: "বিকাল ০৩:০০ – সন্ধ্যা ০৬:০০",
      organizer: "ঢাকা আরবান গ্রিন ফোরাম ও ডেঙ্গু প্রতিরোধ",
      desc: "ছাদ ও ব্যালকনি বাগানিদের জন্য টবে বালু ও জৈব প্রতিরোধক ব্যবহার, সঠিক পানি নিষ্কাশন এবং সিট্রোনেলা ও তুলসির মতো মশা-প্রতিরোধী চারা বিনিময়ের ব্যবহারিক সেশন।"
    }
  };

  const BN_TYPES = {
    cleanup: "পরিচ্ছন্নতা অভিযান",
    clinic: "স্বাস্থ্য স্ক্রিনিং",
    workshop: "কর্মশালা",
    "Medical Seminar": "চিকিৎসা সেমিনার",
    inspection: "লার্ভা পরিদর্শন",
    campaign: "কমিউনিটি ক্যাম্পেইন"
  };

  const BN_CITIES = {
    DNCC: "ঢাকা উত্তর (DNCC)",
    DSCC: "ঢাকা দক্ষিণ (DSCC)",
    CCC: "চট্টগ্রাম (CCC)",
    KCC: "খুলনা (KCC)",
    GCC: "গাজীপুর (GCC)",
    RCC: "রাজশাহী (RCC)"
  };

  let events = [];
  try {
    const saved = localStorage.getItem("dg_events");
    events = saved ? JSON.parse(saved) : DEFAULT_EVENTS;
  } catch (e) { events = DEFAULT_EVENTS; }

  let myRegistrations = [];
  try {
    const savedRegs = localStorage.getItem("dg_my_registrations");
    myRegistrations = savedRegs ? JSON.parse(savedRegs) : [];
  } catch (e) { myRegistrations = []; }

  let activeType = "all";
  let activeCity = "all";
  let searchQuery = "";

  function saveEvents() { try { localStorage.setItem("dg_events", JSON.stringify(events)); } catch (e) {} }
  function saveRegistrations() { try { localStorage.setItem("dg_my_registrations", JSON.stringify(myRegistrations)); } catch (e) {} }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2500);
  }

  function formatDate(dStr) {
    const opts = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    try {
      const d = new Date(dStr + "T00:00:00");
      return d.toLocaleDateString(isBn() ? 'bn-BD' : 'en-US', opts);
    } catch (e) {
      return isBn() ? toBnD(dStr) : dStr;
    }
  }

  function locEv(ev) {
    const bn = isBn();
    const m = bn && BN_EVENTS[ev.id] ? BN_EVENTS[ev.id] : null;
    return {
      title: m ? m.title : ev.title,
      location: m ? m.location : ev.location,
      time: m ? m.time : ev.time,
      organizer: m ? m.organizer : ev.organizer,
      desc: m ? m.desc : ev.desc,
      typeName: bn ? (ev.typeName === "Medical Seminar" ? BN_TYPES["Medical Seminar"] : (BN_TYPES[ev.type] || ev.typeName)) : ev.typeName,
      cityLabel: bn ? (BN_CITIES[ev.city] || ev.city) : ev.city
    };
  }

  function downloadCalendarFile(ev) {
    const dateFormatted = ev.date.replace(/-/g, "");
    const icsContent = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Dengue Protirodh//Community Events//EN",
      "BEGIN:VEVENT", `UID:${ev.id}@dengueguard.org`, `DTSTAMP:${dateFormatted}T000000Z`,
      `DTSTART;VALUE=DATE:${dateFormatted}`, `SUMMARY:${ev.title}`,
      `DESCRIPTION:${ev.desc.replace(/\n/g, " ")} | Organized by: ${ev.organizer}`,
      `LOCATION:${ev.location}`, "STATUS:CONFIRMED", "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${ev.id}-dengueguard-event.ics`;
    document.body.appendChild(link); link.click(); link.remove();
    toast(T("Calendar event (.ics) downloaded!", "ক্যালেন্ডার ইভেন্ট (.ics) ডাউনলোড হয়েছে!"));
  }

  function getFiltered() {
    return events.filter(ev => {
      if (activeType !== "all" && ev.type !== activeType) return false;
      if (activeCity !== "all" && ev.city !== activeCity) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const le = locEv(ev);
        const fields = [ev.title, ev.location, ev.desc, ev.organizer, ev.city, le.title, le.location, le.desc, le.organizer];
        if (!fields.some(f => (f || "").toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }

  function renderEvents() {
    const grid = document.getElementById("eventsGrid");
    const countEl = document.getElementById("eventsCount");
    if (!grid) return;

    const filtered = getFiltered();
    const bn = isBn();

    if (countEl) {
      countEl.textContent = bn
        ? `${toBnD(events.length)}টি ডেঙ্গু প্রতিরোধ ইভেন্টের মধ্যে ${toBnD(filtered.length)}টি দেখাচ্ছে`
        : `Showing ${filtered.length} of ${events.length} dengue prevention events`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="card" style="grid-column: 1/-1; text-align: center; padding: 48px 20px;">
          <h3 style="margin-bottom:8px">${T('No matching events found', 'কোনো মিল থাকা ইভেন্ট পাওয়া যায়নি')}</h3>
          <p style="color:var(--mu);margin-bottom:16px">${T('Try adjusting your filters, searching for a different area or city corporation, or organize your own community event below!', 'ফিল্টার পরিবর্তন করে দেখুন, অন্য এলাকা বা সিটি কর্পোরেশন খুঁজুন অথবা নিচে আপনার নিজের ইভেন্ট আয়োজন করুন!')}</p>
          <button class="btn" id="resetFiltersBtn" style="padding: 7px 18px; font-size: 0.9rem;">${T('Reset all filters', 'সব ফিল্টার রিসেট করুন')}</button>
        </div>
      `;
      const resetBtn = document.getElementById("resetFiltersBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          activeType = "all"; activeCity = "all"; searchQuery = "";
          const sInput = document.getElementById("eventSearchInput");
          if (sInput) sInput.value = "";
          const cSelect = document.getElementById("cityFilterSelect");
          if (cSelect) cSelect.value = "all";
          document.querySelectorAll(".events-filters .filter-btn").forEach(b => b.classList.toggle("active", b.dataset.type === "all"));
          renderEvents();
        });
      }
      return;
    }

    grid.innerHTML = filtered.map(ev => {
      const isRegistered = myRegistrations.includes(ev.id);
      const remaining = Math.max(0, ev.spots - ev.registered);
      const isFull = remaining === 0;
      const le = locEv(ev);

      return `
        <article class="event-card" data-id="${ev.id}">
          <div class="event-header-banner type-${ev.type}">
            <span>${escapeHtml(le.typeName)}</span>
            <span>${escapeHtml(le.cityLabel)}</span>
          </div>
          <div class="event-body">
            <div class="event-date-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>${formatDate(ev.date)} · ${escapeHtml(le.time)}</span>
            </div>
            <h3 class="event-title">${escapeHtml(le.title)}</h3>
            <p class="event-desc">${escapeHtml(le.desc)}</p>
            <div class="event-meta-list">
              <div class="event-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span><b>${T('Location:', 'স্থান:')}</b> ${escapeHtml(le.location)}</span>
              </div>
              <div class="event-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span><b>${T('Organizer:', 'আয়োজক:')}</b> ${escapeHtml(le.organizer)}</span>
              </div>
              <div class="event-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span><b>${T('Capacity:', 'ধারণক্ষমতা:')}</b> ${bn ? `${toBnD(ev.registered)} জন নিবন্ধিত (${toBnD(remaining)}টি আসন বাকি)` : `${ev.registered} registered (${remaining} spots open)`}</span>
              </div>
            </div>
            <div class="event-actions">
              ${isRegistered ? `
                <button type="button" class="btn-event btn-event-secondary btn-cancel-rsvp" data-id="${ev.id}">
                  ${T("✓ You're Registered (Cancel)", "✓ আপনি নিবন্ধিত (বাতিল করুন)")}
                </button>
              ` : `
                <button type="button" class="btn-event btn-event-primary btn-rsvp" data-id="${ev.id}" ${isFull ? 'disabled' : ''}>
                  ${isFull ? T('Waitlist / Full', 'আসন পূর্ণ') : T('Volunteer / Attend →', 'স্বেচ্ছাসেবক / অংশ নিন →')}
                </button>
              `}
              <button type="button" class="btn-event btn-event-secondary btn-cal" data-id="${ev.id}" title="${T('Add to your calendar', 'ক্যালেন্ডারে যোগ করুন')}">
                ${T('📅 Add to Calendar', '📅 ক্যালেন্ডারে যোগ করুন')}
              </button>
              <button type="button" class="btn-event btn-event-secondary btn-share-event" data-id="${ev.id}" title="${T('Share this event', 'ইভেন্ট শেয়ার করুন')}">
                ${T('🔗 Share', '🔗 শেয়ার')}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    grid.querySelectorAll(".btn-rsvp").forEach(btn => btn.addEventListener("click", () => openRsvpModal(btn.dataset.id)));
    grid.querySelectorAll(".btn-cancel-rsvp").forEach(btn => btn.addEventListener("click", () => cancelRsvp(btn.dataset.id)));
    grid.querySelectorAll(".btn-cal").forEach(btn => btn.addEventListener("click", () => {
      const ev = events.find(x => x.id === btn.dataset.id); if (ev) downloadCalendarFile(ev);
    }));
    grid.querySelectorAll(".btn-share-event").forEach(btn => btn.addEventListener("click", () => {
      const ev = events.find(x => x.id === btn.dataset.id); if (!ev) return;
      const le = locEv(ev);
      const text = T(`Join "${le.title}" on ${ev.date} in ${le.location} - via Dengue Protirodh Events`, `${ev.date} তারিখে ${le.location}-এ "${le.title}" ইভেন্টে যোগ দিন - ডেঙ্গু প্রতিরোধ`);
      if (navigator.share) navigator.share({ title: le.title, text, url: window.location.href }).catch(() => {});
      else navigator.clipboard.writeText(text + " " + window.location.href).then(() => {
        toast(T("Event details & link copied to clipboard!", "ইভেন্টের তথ্য ও লিংক কপি হয়েছে!"));
      }).catch(() => prompt(T("Copy event link:", "ইভেন্ট লিংক কপি করুন:"), window.location.href));
    }));
  }

  function openRsvpModal(eventId) {
    const ev = events.find(x => x.id === eventId);
    if (!ev) return;
    const le = locEv(ev);

    let overlay = document.getElementById("rsvpModalOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "rsvpModalOverlay"; overlay.className = "event-modal-overlay";
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="event-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <button class="event-modal-close" aria-label="${T('Close dialog', 'ডায়ালগ বন্ধ করুন')}">&times;</button>
        <span class="chip" style="margin-left:0;margin-bottom:8px">${escapeHtml(le.typeName)} · ${escapeHtml(le.cityLabel)}</span>
        <h3 id="modalTitle">${escapeHtml(le.title)}</h3>
        <p><b>${T('Date:', 'তারিখ:')}</b> ${formatDate(ev.date)} (${escapeHtml(le.time)})<br><b>${T('Meeting Spot:', 'সাক্ষাতের স্থান:')}</b> ${escapeHtml(le.location)}</p>
        <form id="rsvpForm">
          <label>${T('Full Name', 'পূর্ণ নাম')}
            <input name="name" type="text" required placeholder="${T('e.g. Tanvir Ahmed', 'যেমন: তানভীর আহমেদ')}">
          </label>
          <label>${T('Email Address', 'ইমেইল ঠিকানা')}
            <input name="email" type="email" required placeholder="name@example.com">
          </label>
          <label>${T('Phone / WhatsApp Number', 'ফোন / হোয়াটসঅ্যাপ নম্বর')}
            <input name="phone" type="tel" required placeholder="${T('e.g. 017xxxxxxxx', 'যেমন: ০১৭xxxxxxxx')}">
          </label>
          <label>${T('Your Role / Interest', 'আপনার ভূমিকা / আগ্রহ')}
            <select name="role">
              <option value="volunteer">${T('Volunteer (Cleanup & Larvae Sweep)', 'স্বেচ্ছাসেবক (পরিচ্ছন্নতা ও লার্ভা নিধন)')}</option>
              <option value="resident">${T('Resident Attendee', 'এলাকার বাসিন্দা')}</option>
              <option value="health-pro">${T('Medical / Health Professional', 'চিকিৎসা / স্বাস্থ্য পেশাজীবী')}</option>
              <option value="student">${T('Student / Youth Ambassador', 'শিক্ষার্থী / যুব প্রতিনিধি')}</option>
            </select>
          </label>
          <button type="submit" class="btn" style="margin-top:8px">${T('Confirm Registration', 'নিবন্ধন নিশ্চিত করুন')}</button>
        </form>
        <div id="rsvpModalMsg" hidden></div>
      </div>
    `;

    overlay.style.display = "flex";
    overlay.querySelector(".event-modal-close").addEventListener("click", () => { overlay.style.display = "none"; });
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.style.display = "none"; });

    const form = overlay.querySelector("#rsvpForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = fd.get("name");
      ev.registered += 1;
      myRegistrations.push(ev.id);
      saveEvents(); saveRegistrations(); renderEvents();

      const msgBox = overlay.querySelector("#rsvpModalMsg");
      msgBox.className = "event-feedback-msg success";
      msgBox.textContent = isBn()
        ? `ধন্যবাদ, ${name}! এই ইভেন্টে আপনার নিবন্ধন নিশ্চিত হয়েছে।`
        : `Thank you, ${name}! You are confirmed for this event. A confirmation reminder has been logged.`;
      msgBox.hidden = false;
      form.remove();

      setTimeout(() => {
        overlay.style.display = "none";
        toast(T("Registration confirmed!", "নিবন্ধন নিশ্চিত হয়েছে!"));
      }, 2000);
    });
  }

  function cancelRsvp(eventId) {
    const ev = events.find(x => x.id === eventId);
    if (ev) {
      ev.registered = Math.max(0, ev.registered - 1);
      myRegistrations = myRegistrations.filter(id => id !== eventId);
      saveEvents(); saveRegistrations(); renderEvents();
      toast(T("Your registration was cancelled.", "আপনার নিবন্ধন বাতিল করা হয়েছে।"));
    }
  }

  function setupProposeForm() {
    const form = document.getElementById("proposeEventForm");
    const msg = document.getElementById("proposeMsg");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const title = fd.get("title").trim();
      const type = fd.get("type");
      const city = fd.get("city");
      const date = fd.get("date");
      const time = fd.get("time").trim();
      const location = fd.get("location").trim();
      const organizer = fd.get("organizer").trim();
      const desc = fd.get("desc").trim();
      const contact = fd.get("contact").trim();

      if (!title || !date || !location || !desc) {
        if (msg) {
          msg.className = "event-feedback-msg";
          msg.style.background = "#fee2e2"; msg.style.color = "#991b1b";
          msg.textContent = T("Please fill in all required fields.", "অনুগ্রহ করে প্রয়োজনীয় সব ঘর পূরণ করুন।");
          msg.hidden = false;
        }
        return;
      }

      const typeMap = { cleanup: "Cleanup Drive", clinic: "Health Screening", workshop: "Workshop", campaign: "Community Campaign", inspection: "Larvae Inspection" };
      const newEv = {
        id: "ev-user-" + Date.now().toString(36),
        title, type, typeName: typeMap[type] || "Community Event", city, location, date,
        time: time || "09:00 AM – 12:00 PM BST",
        organizer: organizer || "Local Ward Action Group",
        spots: 50, registered: 1, desc, contact: contact || "organizer@dengueguard.example", status: "upcoming"
      };

      events.unshift(newEv); saveEvents(); form.reset();
      if (msg) {
        msg.className = "event-feedback-msg success";
        msg.textContent = T("Your community event has been published to Dengue Protirodh and is now live for volunteers to join!", "আপনার কমিউনিটি ইভেন্টটি ডেঙ্গু প্রতিরোধে প্রকাশিত হয়েছে এবং স্বেচ্ছাসেবকদের যোগদানের জন্য উন্মুক্ত!");
        msg.hidden = false;
      }
      renderEvents();
      toast(T("Event created successfully!", "ইভেন্ট সফলভাবে তৈরি হয়েছে!"));
      const gridSection = document.getElementById("eventsSection");
      if (gridSection) gridSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  function initEventsApp() {
    document.querySelectorAll(".events-filters .filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".events-filters .filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeType = btn.dataset.type;
        renderEvents();
      });
    });

    const citySelect = document.getElementById("cityFilterSelect");
    if (citySelect) citySelect.addEventListener("change", (e) => { activeCity = e.target.value; renderEvents(); });

    const getSearchDropdown = () => document.getElementById("eventSearchDropdown");
    const updateSearchDropdown = (query) => {
      const sDropdown = getSearchDropdown();
      if (!sDropdown) return;
      const q = (query || "").trim().toLowerCase();
      if (!q) { sDropdown.hidden = true; sDropdown.style.display = "none"; sDropdown.innerHTML = ""; return; }
      const matches = events.filter(ev => {
        const le = locEv(ev);
        return [ev.title, ev.location, ev.city, ev.description || ev.desc, ev.organizer, le.title, le.location, le.organizer]
          .some(v => (v || "").toLowerCase().includes(q));
      }).slice(0, 8);

      if (matches.length === 0) {
        sDropdown.innerHTML = `<div class="events-search-empty">${T('No matching events found', 'কোনো মিল থাকা ইভেন্ট পাওয়া যায়নি')}</div>`;
      } else {
        sDropdown.innerHTML = matches.map(ev => {
          const le = locEv(ev);
          return `<button type="button" class="events-search-option" role="option" data-value="${escapeHtml(le.title)}">
            <span class="events-search-option-title">${escapeHtml(le.title)}</span>
            <span class="events-search-option-meta">${escapeHtml(le.location)} · ${escapeHtml(le.cityLabel)}</span>
          </button>`;
        }).join("");
      }
      sDropdown.hidden = false; sDropdown.removeAttribute("hidden"); sDropdown.style.display = "block";
    };

    document.addEventListener("input", (e) => {
      if (e.target && e.target.id === "eventSearchInput") {
        searchQuery = e.target.value.trim();
        updateSearchDropdown(e.target.value);
        renderEvents();
      }
    });
    document.addEventListener("focusin", (e) => {
      if (e.target && e.target.id === "eventSearchInput" && e.target.value.trim()) updateSearchDropdown(e.target.value);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && e.target && e.target.id === "eventSearchInput") {
        const sDropdown = getSearchDropdown();
        if (sDropdown) { sDropdown.hidden = true; sDropdown.style.display = "none"; }
      }
    });
    document.addEventListener("click", (e) => {
      const opt = e.target.closest(".events-search-option");
      const sDropdown = getSearchDropdown();
      if (opt && sDropdown && sDropdown.contains(opt)) {
        const sInput = document.getElementById("eventSearchInput");
        const val = opt.dataset.value || "";
        if (sInput) sInput.value = val;
        searchQuery = val.trim();
        sDropdown.hidden = true; sDropdown.style.display = "none";
        renderEvents(); return;
      }
      if (sDropdown && !e.target.closest(".events-search-box")) {
        sDropdown.hidden = true; sDropdown.style.display = "none";
      }
    });

    setupProposeForm();
    renderEvents();
    window.addEventListener("dg:langchange", () => renderEvents());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initEventsApp);
  else initEventsApp();
})();
