(function () {
  const isBn = () => (window.DG_I18N ? window.DG_I18N.isBn() : localStorage.getItem("dg_lang") === "bn");
  const T = (en, bn) => (isBn() ? bn : en);
  const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const toBnD = s => isBn() ? String(s).replace(/[0-9]/g, d => BN_DIGITS[+d]) : String(s);

  const FAQ = [
    { k: ["tier", "low", "medium", "high", "critical", "risk level", "colour", "color", "স্তর", "ঝুঁকি", "নিম্ন", "মাঝারি", "উচ্চ", "সংকটজনক", "রং"],
      a: () => T(
        "Risk tiers (Low, Medium, High, Critical) come from the expected weekly cases per ward. The cut-offs were calibrated on 2023 data and are shown under the heatmap on the Risk board. High and Critical wards need action first.",
        "ঝুঁকির স্তরগুলো (নিম্ন, মাঝারি, উচ্চ, সংকটজনক) প্রতি ওয়ার্ডে সাপ্তাহিক সম্ভাব্য রোগীর সংখ্যা থেকে নির্ধারিত হয়। ২০২৩ সালের ডেটার ভিত্তিতে সীমা নির্ধারণ করা হয়েছে এবং ঝুঁকি বোর্ডের হিটম্যাপের নিচে দেখানো হয়েছে। উচ্চ ও সংকটজনক ওয়ার্ডগুলোতে আগে ব্যবস্থা নেওয়া প্রয়োজন।"
      ) },
    { k: ["start", "begin", "how do i use", "how to use", "get started", "help me use", "শুরু", "কীভাবে", "ব্যবহার"],
      a: () => T(
        "Start in the sidebar: pick a city corporation, the week the warning is issued, and the window (+2, +3 or +4 weeks). Then read the Risk board: tier counts at the top, ranked wards in the table, and the Response planner to see where teams should go first.",
        "বাম পাশের সাইডবার থেকে শুরু করুন: সিটি কর্পোরেশন, সতর্কতার সপ্তাহ এবং সময়সীমা (+২, +৩ বা +৪ সপ্তাহ) বেছে নিন। এরপর ঝুঁকি বোর্ডে স্তর অনুযায়ী ওয়ার্ডের সংখ্যা, র‍্যাংক করা তালিকা এবং প্রতিক্রিয়া পরিকল্পনাকারী দেখুন।"
      ) },
    { k: ["planner", "team", "spray", "teams", "দল", "স্প্রে", "পরিকল্পনা"],
      a: () => T(
        "The Response planner (Risk board) lets you enter how many spraying teams you have. It sends them to the wards with the most expected cases and shows what share of expected cases that covers.",
        "প্রতিক্রিয়া পরিকল্পনাকারীতে (ঝুঁকি বোর্ড) আপনার কয়টি স্প্রে দল আছে তা লিখতে পারেন। এটি সবচেয়ে বেশি সম্ভাব্য রোগীর ওয়ার্ডগুলোতে দল পাঠানোর পরামর্শ দেয় এবং কত শতাংশ ঝুঁকি কভার হয় তা দেখায়।"
      ) },
    { k: ["lag", "why rain", "rain", "delay", "week ago", "বৃষ্টি", "বিলম্ব", "গুরুত্বপূর্ণ"],
      a: () => T(
        "Rain does not cause cases the next day. Eggs take 7-14 days to become adult mosquitoes, then the virus incubates, so rain 2-6 weeks back drives today's warning. The model uses rainfall from the past 0-7 weeks for each ward.",
        "বৃষ্টি হলেই পরদিন ডেঙ্গু হয় না। ডিম থেকে পূর্ণবয়স্ক মশা হতে ৭–১৪ দিন লাগে, এরপর ভাইরাসের সুপ্তিকাল চলে। তাই ২–৬ সপ্তাহ আগের বৃষ্টি আজকের সতর্কবার্তাকে প্রভাবিত করে। মডেলটি প্রতিটি ওয়ার্ডের গত ০–৭ সপ্তাহের বৃষ্টিপাত বিশ্লেষণ করে।"
      ) },
    { k: ["driver", "main driver", "why is this ward", "why high", "চালক", "কারণ"],
      a: () => T(
        "The Main driver column shows which group of inputs (rainfall, temperature, humidity, recent case trend, ward vulnerability or season) changes the forecast most. Open the Ward deep-dive tab for the charts behind it.",
        "প্রধান কারণ কলামটি দেখায় কোন উপাদানটি (বৃষ্টিপাত, তাপমাত্রা, আর্দ্রতা, সাম্প্রতিক রোগীর প্রবণতা, ওয়ার্ডের ঝুঁকি বা মৌসুম) পূর্বাভাসকে সবচেয়ে বেশি প্রভাবিত করছে। বিস্তারিত চার্টের জন্য 'ওয়ার্ড বিশ্লেষণ' ট্যাব দেখুন।"
      ) },
    { k: ["what if", "what-if", "scenario", "slider", "সম্ভাব্য পরিস্থিতি", "স্লাইডার"],
      a: () => T(
        "On the What-if scenarios tab, pick a ward and change rainfall, temperature or humidity. The forecast updates instantly in your browser so you can stress-test a ward.",
        "'সম্ভাব্য পরিস্থিতি' ট্যাবে একটি ওয়ার্ড নির্বাচন করে বৃষ্টিপাত, তাপমাত্রা বা আর্দ্রতা পরিবর্তন করুন। আপনার ব্রাউজারে তাৎক্ষণিকভাবে পূর্বাভাস আপডেট হবে।"
      ) },
    { k: ["accurate", "accuracy", "error", "mae", "rmse", "validation", "trust", "reliable", "নির্ভুল", "সঠিক", "যাচাই", "ত্রুটি"],
      a: () => T(
        "On held-out 2024-2025 data, the 3-week forecast is off by about 1 case per ward per week on average, and the 80% range contains the real value about 94% of the time. See the Model validation tab for details. It supports decisions; it is not a diagnosis.",
        "২০২৪–২০২৫ সালের অদেখা ডেটায় ৩-সপ্তাহের পূর্বাভাস প্রতি ওয়ার্ডে সপ্তাহে গড়ে প্রায় ১ জন রোগী ব্যবধান দেখিয়েছে এবং ৮০% পূর্বাভাস সীমা প্রায় ৯৪% ক্ষেত্রে প্রকৃত মানকে ধারণ করেছে। বিস্তারিত দেখতে 'মডেল যাচাইকরণ' ট্যাব দেখুন। এটি সিদ্ধান্ত সহায়তার জন্য, রোগ নির্ণয় নয়।"
      ) },
    { k: ["download", "export", "csv", "ডাউনলোড", "এক্সপোর্ট"],
      a: () => T(
        "Use the 'Download this forecast (CSV)' button under the ranked table on the Risk board. To use your own data, upload a CSV in the sidebar with the required columns listed in the README.",
        "ঝুঁকি বোর্ডের তালিকার নিচে 'এই পূর্বাভাস ডাউনলোড করুন (CSV)' বাটনে ক্লিক করুন। নিজের ডেটা ব্যবহার করতে সাইডবারে প্রয়োজনীয় কলামসহ একটি CSV ফাইল আপলোড করুন।"
      ) },
    { k: ["upload", "my own data", "own data", "আপলোড", "নিজের ডেটা"],
      a: () => T(
        "Upload a weekly CSV in the sidebar with: date, city, ward_id, population_density_sqkm, water_logging_risk_index, sanitation_score, avg_temp_c, rainfall_mm, relative_humidity_pct, dengue_cases. Each ward needs at least 8 weeks of data.",
        "সাইডবারে সাপ্তাহিক CSV আপলোড করুন যেখানে date, city, ward_id, population_density_sqkm, water_logging_risk_index, sanitation_score, avg_temp_c, rainfall_mm, relative_humidity_pct, dengue_cases কলাম থাকবে। প্রতিটি ওয়ার্ডের জন্য কমপক্ষে ৮ সপ্তাহের ডেটা প্রয়োজন।"
      ) },
    { k: ["symptom", "fever", "treatment", "medicine", "sick", "doctor", "লক্ষণ", "জ্বর", "চিকিৎসা", "ওষুধ", "ডাক্তার"],
      a: () => T(
        "This tool predicts area-level outbreak risk only. It cannot diagnose or advise on treatment. If someone has high fever, severe pain or bleeding, they should go to a doctor or hospital right away.",
        "এই টুলটি কেবল এলাকা-ভিত্তিক প্রাদুর্ভাবের ঝুঁকি পূর্বাভাস দেয়। এটি রোগ নির্ণয় বা চিকিৎসা পরামর্শ দেয় না। কারও তীব্র জ্বর, প্রচণ্ড ব্যথা বা রক্তপাত হলে অবিলম্বে ডাক্তার বা হাসপাতালে যান।"
      ) }
  ];

  const TOUR = [
    { tab: "t1",
      text: () => T(
        "1/6 Risk board: start here. The coloured boxes count wards by risk tier, the table ranks wards by expected weekly cases, and the Response planner shows where limited spraying teams should go first.",
        "১/৬ ঝুঁকি বোর্ড: এখান থেকে শুরু করুন। রঙিন বক্সগুলোতে স্তর অনুযায়ী ওয়ার্ড সংখ্যা, সারণিতে সম্ভাব্য রোগীর ক্রম এবং প্রতিক্রিয়া পরিকল্পনাকারীতে স্প্রে দল প্রথমে কোথায় যাবে তা দেখা যায়।"
      ) },
    { tab: "t2",
      text: () => T(
        "2/6 Ward deep-dive: pick one ward from the dropdown to see its forecast, the 80% range and the rainfall, temperature and humidity behind it.",
        "২/৬ ওয়ার্ড বিশ্লেষণ: ড্রপডাউন থেকে যেকোনো একটি ওয়ার্ড বেছে নিয়ে এর পূর্বাভাস, ৮০% সীমা এবং এর পেছনের বৃষ্টিপাত, তাপমাত্রা ও আর্দ্রতা দেখুন।"
      ) },
    { tab: "t3",
      text: () => T(
        "3/6 What-if scenarios: change rainfall, temperature or humidity for a ward and watch the forecast move instantly.",
        "৩/৬ সম্ভাব্য পরিস্থিতি: কোনো ওয়ার্ডের বৃষ্টিপাত, তাপমাত্রা বা আর্দ্রতা পরিবর্তন করে তাৎক্ষণিক পূর্বাভাসের পরিবর্তন দেখুন।"
      ) },
    { tab: "t4",
      text: () => T(
        "4/6 Model validation: how accurate the model was on 2024-2025 data it never saw during training.",
        "৪/৬ মডেল যাচাইকরণ: প্রশিক্ষণের সময় কখনো দেখেনি এমন ২০২৪–২০২৫ সালের ডেটায় মডেলটি কতটা নির্ভুল ছিল তা দেখুন।"
      ) },
    { tab: "t5",
      text: () => T(
        "5/6 How it works: a plain-language explanation of the rain-to-cases delay and the model.",
        "৫/৬ কীভাবে কাজ করে: বৃষ্টি থেকে রোগীর সংখ্যা বৃদ্ধির সময়ের ব্যবধান ও মডেলের সহজ ব্যাখ্যা।"
      ) },
    { tab: "t6",
      text: () => T(
        "6/6 Architecture: the data flow and design choices. That is the whole dashboard. Use the sidebar on the left to change city, week and warning window at any time.",
        "৬/৬ আর্কিটেকচার: ডেটা প্রবাহ এবং নকশার বিবরণ। এটিই সম্পূর্ণ ড্যাশবোর্ড। যেকোনো সময় বাম সাইডবার থেকে শহর, সপ্তাহ ও সময়সীমা পরিবর্তন করতে পারবেন।"
      ) }
  ];

  const TOUR_LP = [
    { sec: "why",
      text: () => T(
        "1/6 Why it matters: dengue cases rise 2-4 weeks after the rain, so waiting for hospital admissions means acting late.",
        "১/৬ কেন এটি জরুরি: বৃষ্টির ২–৪ সপ্তাহ পর ডেঙ্গু রোগী বাড়ে, তাই হাসপাতালে ভর্তি বাড়া পর্যন্ত অপেক্ষা করা মানে দেরি হয়ে যাওয়া।"
      ) },
    { sec: "features",
      text: () => T(
        "2/6 Features: a risk board and map, a ward deep-dive, what-if scenarios, model validation, your own data upload, and everything private in your browser.",
        "২/৬ বৈশিষ্ট্যসমূহ: ঝুঁকি বোর্ড ও মানচিত্র, ওয়ার্ড বিশ্লেষণ, সম্ভাব্য পরিস্থিতি, মডেল যাচাইকরণ, নিজস্ব ডেটা আপলোড এবং আপনার ব্রাউজারে সম্পূর্ণ গোপনীয়তা।"
      ) },
    { sec: "how",
      text: () => T(
        "3/6 How it works: weather history and ward vulnerability go into gradient-boosted trees, and every ward ends up in a Low, Medium, High or Critical tier.",
        "৩/৬ কীভাবে কাজ করে: আবহাওয়ার ইতিহাস ও ওয়ার্ডের ঝুঁকি গ্র্যাডিয়েন্ট-বুস্টেড ট্রিতে যায় এবং প্রতিটি ওয়ার্ড নিম্ন, মাঝারি, উচ্চ বা সংকটজনক স্তরে স্থান পায়।"
      ) },
    { sec: "proof",
      text: () => T(
        "4/6 Validation: the model was tested on 2024-2025 data it never saw, and it beats simple baselines at every horizon.",
        "৪/৬ যাচাইকরণ: মডেলটি অদেখা ২০২৪–২০২৫ সালের ডেটায় পরীক্ষিত হয়েছে এবং প্রতিটি সময়সীমায় সাধারণ বেসলাইনকে ছাড়িয়ে গেছে।"
      ) },
    { sec: "about",
      text: () => T(
        "5/6 About us: who Dengue Protirodh is for and how it was built. The FAQ just below answers the common questions.",
        "৫/৬ আমাদের সম্পর্কে: ডেঙ্গু প্রতিরোধ কাদের জন্য ও কীভাবে নির্মিত হয়েছে। নিচের প্রশ্নোত্তর বিভাগে সাধারণ প্রশ্নের উত্তর রয়েছে।"
      ) },
    { sec: "contact",
      text: () => T(
        "6/6 Contact: send us questions or feedback. Ready to see the forecast? Open the dashboard.",
        "৬/৬ যোগাযোগ: আমাদের প্রশ্ন বা মতামত পাঠান। পূর্বাভাস দেখতে প্রস্তুত? ড্যাশবোর্ড খুলুন।"
      ) }
  ];

  const NAV = [
    { k: ["heatmap", "treemap", "ranked", "table", "risk board", "planner", "ঝুঁকি বোর্ড", "হিটম্যাপ"], tab: "t1", label: () => T("Open Risk board", "ঝুঁকি বোর্ড খুলুন") },
    { k: ["deep-dive", "deep dive", "one ward", "single ward", "ward chart", "ওয়ার্ড বিশ্লেষণ"], tab: "t2", label: () => T("Open Ward deep-dive", "ওয়ার্ড বিশ্লেষণ খুলুন") },
    { k: ["what if", "what-if", "scenario", "slider", "সম্ভাব্য পরিস্থিতি"], tab: "t3", label: () => T("Open What-if scenarios", "সম্ভাব্য পরিস্থিতি খুলুন") },
    { k: ["validation", "accuracy", "accurate", "mae", "rmse", "trust", "যাচাই", "নির্ভুল"], tab: "t4", label: () => T("Open Model validation", "মডেল যাচাইকরণ খুলুন") },
    { k: ["how it works", "explain the model", "lag", "why rain", "delay", "কীভাবে কাজ করে"], tab: "t5", label: () => T("Open How it works", "কীভাবে কাজ করে খুলুন") },
    { k: ["architecture", "data flow", "আর্কিটেকচার"], tab: "t6", label: () => T("Open Architecture", "আর্কিটেকচার খুলুন") }
  ];

  const ON_APP = !!document.getElementById("tabs");
  const goTab = id => {
    const b = document.querySelector(`#tabs button[data-t="${id}"]`);
    if (b) b.click(); else location.href = "app.html#" + id;
  };
  const goSec = id => { const e = document.getElementById(id); if (e) e.scrollIntoView({ behavior: "smooth", block: "start" }); };
  if (ON_APP) {
    const h = (location.hash || "").slice(1);
    if (/^t([1-9]|10)$/.test(h)) { let n = 0; const iv = setInterval(() => { const ready = !document.getElementById("app").hidden; if (ready || ++n > 100) { clearInterval(iv); if (ready) goTab(h); } }, 100); }
  }

  const LP_NAV = [
    { k: ["why it matters", "why early warning", "hospital", "কেন এটি জরুরি"], sec: "why",
      a: () => T("Dengue cases rise 2-4 weeks after heavy rain, but teams usually move only once hospital admissions climb. Early warning closes that gap.", "ভারী বৃষ্টির ২–৪ সপ্তাহ পর ডেঙ্গু রোগী বাড়ে, কিন্তু দলগুলো সাধারণত হাসপাতালে ভর্তি বাড়ার পর সক্রিয় হয়। আগাম সতর্কবার্তা এই ব্যবধান পূরণ করে।"),
      label: () => T("Go to Why it matters", "কেন এটি জরুরি বিভাগে যান") },
    { k: ["feature", "what can it do", "what does it do", "বৈশিষ্ট্য"], sec: "features",
      a: () => T("Six views: risk board and map, ward deep-dive, what-if scenarios, model validation, upload your own data, and private offline use.", "ছয়টি ভিউ: ঝুঁকি বোর্ড ও মানচিত্র, ওয়ার্ড বিশ্লেষণ, সম্ভাব্য পরিস্থিতি, মডেল যাচাইকরণ, নিজের ডেটা আপলোড এবং ব্যক্তিগত অফলাইন ব্যবহার।"),
      label: () => T("Go to Features", "বৈশিষ্ট্যসমূহে যান") },
    { k: ["how it works", "explain the model", "lag", "why rain", "delay", "কীভাবে কাজ করে"], sec: "how",
      a: () => T("Weather history and ward vulnerability feed gradient-boosted trees, which rank every ward into Low, Medium, High or Critical tiers.", "আবহাওয়ার ইতিহাস ও ওয়ার্ডের ঝুঁকি গ্র্যাডিয়েন্ট-বুস্টেড ট্রিতে প্রবেশ করে, যা প্রতিটি ওয়ার্ডকে নিম্ন, মাঝারি, উচ্চ বা সংকটজনক স্তরে ভাগ করে।"),
      label: () => T("Go to How it works", "কীভাবে কাজ করে বিভাগে যান") },
    { k: ["validation", "accuracy", "accurate", "mae", "rmse", "trust", "tested", "যাচাই"], sec: "proof",
      a: () => T("Tested on 2024-2025 data the model never saw: it beats simple baselines at every horizon, with 91% risk-tier accuracy at +3 weeks.", "অদেখা ২০২৪–২০২৫ সালের ডেটায় পরীক্ষিত: মডেলটি প্রতিটি সময়সীমায় সাধারণ বেসলাইনকে হারায় এবং +৩ সপ্তাহে ৯১% ঝুঁকি-স্তর নির্ভুলতা দেয়।"),
      label: () => T("Go to Validation", "যাচাইকরণে যান") },
    { k: ["about", "who built", "who made", "team behind", "সম্পর্কে"], sec: "about",
      a: () => T("Dengue Protirodh is a ward-level early-warning tool for Bangladesh city corporations, built for decision support, not diagnosis.", "ডেঙ্গু প্রতিরোধ বাংলাদেশ সিটি কর্পোরেশনের জন্য একটি ওয়ার্ড-ভিত্তিক আগাম সতর্কবার্তা টুল, যা রোগ নির্ণয়ের জন্য নয় বরং সিদ্ধান্ত সহায়তার জন্য তৈরি।"),
      label: () => T("Go to About us", "আমাদের সম্পর্কে বিভাগে যান") },
    { k: ["faq", "questions", "প্রশ্ন"], sec: "faq",
      a: () => T("The FAQ covers what the forecast tells you, which data it uses, privacy and accuracy.", "প্রশ্নোত্তর বিভাগে পূর্বাভাস কী বলে, কোন ডেটা ব্যবহৃত হয়, গোপনীয়তা ও নির্ভুলতা সম্পর্কে উত্তর রয়েছে।"),
      label: () => T("Go to FAQ", "প্রশ্নোত্তরে যান") },
    { k: ["contact", "email", "get in touch", "feedback", "যোগাযোগ"], sec: "contact",
      a: () => T("You can email team@dengueguard.example or use the Contact page. Please do not send patient details.", "আপনি team@dengueguard.example ঠিকানায় ইমেইল করতে বা যোগাযোগ পাতা ব্যবহার করতে পারেন। অনুগ্রহ করে রোগীর ব্যক্তিগত তথ্য পাঠাবেন না।"),
      label: () => T("Go to Contact", "যোগাযোগ বিভাগে যান") }
  ];

  const navFor = q => {
    const t = q.toLowerCase();
    if (!ON_APP) { const s = LP_NAV.find(n => n.k.some(k => t.includes(k))); if (s) return { label: s.label(), a: s.a(), go: () => goSec(s.sec) }; }
    const n = NAV.find(n => n.k.some(k => hasKw(t, k))); return n ? { label: n.label(), go: () => goTab(n.tab) } : null;
  };
  const LOST = ["lost", "confus", "don't understand", "dont understand", "tour", "walk me", "guide me", "show me around", "overview", "whole site", "everything", "where do i", "ট্যুর", "বুঝতে পারছি না", "গাইড"];
  let step = 0;
  function tourStep() {
    const T_LIST = ON_APP ? TOUR : TOUR_LP, s = T_LIST[step];
    if (ON_APP) goTab(s.tab); else if (s.sec) goSec(s.sec);
    const last = step === T_LIST.length - 1;
    say(s.text(), "bot", {
      label: last ? (ON_APP ? T("Finish tour", "ট্যুর শেষ করুন") : T("Open the dashboard", "ড্যাশবোর্ড খুলুন")) : T("Next", "পরবর্তী"),
      fn: () => {
        if (last) {
          if (ON_APP) say(T("Tour finished. Ask me anything else, or tap a suggestion.", "ট্যুর শেষ হয়েছে। আরও কিছু জানতে প্রশ্ন করুন অথবা পরামর্শে ক্লিক করুন।"), "bot");
          else location.href = "app.html";
        } else { step++; tourStep(); }
      }
    });
  }
  function startTour() { step = 0; say(T("Let's take a quick tour. I will switch tabs for you.", "চলুন একটি দ্রুত ট্যুর নিই। আমি আপনার জন্য ট্যাব/বিভাগ পরিবর্তন করে দেখাচ্ছি।"), "bot"); tourStep(); }

  const norm = s => s.toLowerCase();
  const hasKw = (t, k) => /^[a-z]/.test(k) ? new RegExp("(^|[^a-z])" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(t) : t.includes(k);
  const FAQ_LP = {
    k: ["start", "begin", "how do i use", "how to use", "get started", "help me use", "শুরু", "কীভাবে", "ব্যবহার"],
    a: () => T(
      "Click \u201cOpen the dashboard\u201d. Pick a city corporation, the week the warning is issued and the window (+2, +3 or +4 weeks), then read the Risk board: tier counts, ranked wards and the Response planner.",
      "“ড্যাশবোর্ড খুলুন”-এ ক্লিক করুন। সিটি কর্পোরেশন, সতর্কবার্তা জারির সপ্তাহ এবং সময়সীমা (+২, +৩ বা +৪ সপ্তাহ) বেছে নিন, তারপর ঝুঁকি বোর্ডে স্তর অনুযায়ী সংখ্যা, র‍্যাংক করা ওয়ার্ড এবং প্রতিক্রিয়া পরিকল্পনাকারী দেখুন।"
    )
  };
  function faq(q) {
    const t = norm(q); let best = null, bs = 0;
    (ON_APP ? FAQ : [FAQ_LP, ...FAQ]).forEach(f => { const s = f.k.filter(k => hasKw(t, k)).length; if (s > bs) { bs = s; best = f; } });
    return best ? best.a() : null;
  }

  const $ = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x) e.textContent = x; return e; };
  const box = $("div", "dgc"), btn = $("button", "dgc-fab"), panel = $("div", "dgc-panel");
  const fabAv = $("img", "dgc-av"); fabAv.src = "chatbot-avatar.png"; fabAv.alt = ""; fabAv.width = 52; fabAv.height = 52; fabAv.decoding = "async";
  const fabLabel = $("span", "dgc-fab-t", "");
  btn.append(fabAv, fabLabel); btn.type = "button";
  panel.hidden = true;

  const head = $("div", "dgc-head");
  head.innerHTML = `<div class="dgc-head-info"><div class="dgc-head-av-wrap"><img class="dgc-head-av" src="chatbot-avatar.png" alt=""><span class="dgc-online-dot" aria-hidden="true"></span></div><div class="dgc-head-text"><span class="dgc-head-title"></span><span class="dgc-head-sub"></span></div></div>`;
  const close = $("button", "dgc-x", "×");
  close.type = "button";
  head.appendChild(close);

  const log = $("div", "dgc-log"), form = $("form", "dgc-form"), inp = $("input");
  const mic = $("button", "dgc-mic");
  mic.type = "button";
  mic.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="11" rx="3" fill="#000000"/><path d="M5 10v2a7 7 0 0 0 14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>`;
  const go = $("button", "dgc-send");
  go.type = "submit";
  go.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M22 2L11 13" stroke="#fde047" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" fill="#38bdf8" stroke="#fde047" stroke-width="1.6" stroke-linejoin="round"/></svg><span class="dgc-send-t"></span>`;
  inp.maxLength = 300;
  form.append(inp, mic, go);

  const count = $("div", "dgc-count");
  count.hidden = true;
  count.setAttribute("aria-live", "polite");
  const updateCount = () => {
    const len = inp.value.length;
    if (len > 0) {
      count.textContent = isBn() ? `${toBnD(len)} অক্ষর` : `${len} ${len === 1 ? "char" : "chars"}`;
      count.classList.toggle("warn", len >= 270);
      count.hidden = false;
    } else {
      count.hidden = true;
      count.textContent = "";
      count.classList.remove("warn");
    }
  };
  inp.addEventListener("input", updateCount);

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRec) {
    let rec = null;
    mic.addEventListener("click", () => {
      if (rec) { rec.stop(); return; }
      rec = new SpeechRec();
      rec.lang = isBn() ? "bn-BD" : "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      mic.classList.add("listening");
      rec.onresult = e => {
        const txt = e.results[0][0].transcript;
        inp.value = (inp.value ? inp.value + " " : "") + txt;
        updateCount();
        inp.focus();
      };
      rec.onerror = () => { mic.classList.remove("listening"); rec = null; };
      rec.onend = () => { mic.classList.remove("listening"); rec = null; };
      rec.start();
    });
  } else {
    mic.addEventListener("click", () => {
      say(T("Voice dictation is not supported in this browser. Please type your question.", "এই ব্রাউজারে ভয়েস টাইপিং সমর্থিত নয়। অনুগ্রহ করে প্রশ্নটি টাইপ করুন।"), "bot");
    });
  }

  const chips = $("div", "dgc-chips");
  const chipSpecs = [
    { en: "Take a tour", bn: "ট্যুর নিন", fn: () => startTour() },
    { en: "How do I start?", bn: "কীভাবে শুরু করব?" },
    { en: "What do the risk tiers mean?", bn: "ঝুঁকির স্তরগুলোর অর্থ কী?" },
    { en: "Why does rain matter?", bn: "বৃষ্টিপাত কেন গুরুত্বপূর্ণ?" },
    { en: "How accurate is it?", bn: "এটি কতটা নির্ভুল?" }
  ];

  panel.append(head, log, chips, form, count);
  box.append(panel, btn);
  document.body.appendChild(box);

  const say = (t, who, action) => {
    const m = $("div", "dgc-m " + who, t);
    if (action) { const b = $("button", "dgc-act", action.label); b.type = "button"; b.onclick = () => { b.disabled = true; action.fn(); }; m.appendChild(b); }
    log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
  };

  let welcomeMsgEl = null;
  function getWelcomeText() {
    return ON_APP
      ? T("Hi! 👋 I can help you use this dashboard, understand the forecasts and plan supplies, beds and crews. Just say hello or ask a question. (I can't give medical advice.)", "হ্যালো! এই ড্যাশবোর্ড ব্যবহার করতে ও পূর্বাভাস বুঝতে আমি সাহায্য করতে পারি। আমি চিকিৎসা পরামর্শ দিতে পারি না।")
      : T("Hi! I can tell you what Dengue Protirodh does, how it works and how to open the dashboard. I cannot give medical advice.", "হ্যালো! ডেঙ্গু প্রতিরোধ কী করে, কীভাবে কাজ করে এবং কীভাবে ড্যাশবোর্ড খুলবেন তা আমি বলতে পারি। আমি চিকিৎসা পরামর্শ দিতে পারি না।");
  }

  function applyChatLang() {
    const helpTxt = T("Ask for help", "সাহায্য নিন");
    fabLabel.textContent = helpTxt;
    btn.setAttribute("aria-label", helpTxt);
    head.querySelector(".dgc-head-title").textContent = T("Dengue Protirodh AI", "ডেঙ্গু প্রতিরোধ এআই");
    head.querySelector(".dgc-head-sub").textContent = T("● Online · AI Assistant", "● অনলাইন · এআই সহকারী");
    close.setAttribute("aria-label", T("Close chat", "চ্যাট বন্ধ করুন"));
    mic.title = T("Dictate", "ভয়েস ইনপুট");
    mic.setAttribute("aria-label", T("Dictate message", "ভয়েস বার্তা বলুন"));
    go.querySelector(".dgc-send-t").textContent = T("Send", "পাঠান");
    inp.placeholder = ON_APP
      ? T("Ask how to use the dashboard...", "ড্যাশবোর্ড ব্যবহার সম্পর্কে জিজ্ঞাসা করুন...")
      : T("Ask about Dengue Protirodh...", "ডেঙ্গু প্রতিরোধ সম্পর্কে জিজ্ঞাসা করুন...");
    updateCount();

    chips.innerHTML = "";
    chipSpecs.forEach(sp => {
      const label = T(sp.en, sp.bn);
      const b = $("button", "", label);
      b.type = "button";
      b.onclick = sp.fn || (() => ask(label));
      chips.appendChild(b);
    });

    if (welcomeMsgEl && log.children.length === 1) {
      welcomeMsgEl.textContent = getWelcomeText();
    }
  }

  welcomeMsgEl = say(getWelcomeText(), "bot");
  applyChatLang();
  window.addEventListener("dg:langchange", applyChatLang);

  btn.onclick = () => { panel.hidden = !panel.hidden; if (!panel.hidden) inp.focus(); };
  close.onclick = () => { panel.hidden = true; };


  // ---- Friendly small talk + scope guard (works fully offline, no API call) ----
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const SMALL = [
    { re: /how are (you|u)|how('?s| is) it going|how do you do|what'?s up|wassup|sup\b|কেমন আছ/i,
      a: () => T("I'm doing great, thanks for asking! 😊 Ready to help. Want a quick tour of the dashboard, or do you have a question?", "আমি ভালো আছি, জিজ্ঞাসা করার জন্য ধন্যবাদ! 😊 সাহায্য করতে প্রস্তুত। ড্যাশবোর্ডের একটি দ্রুত ট্যুর নেবেন, নাকি কোনো প্রশ্ন আছে?") },
    { re: /^(hi+|hello+|hey+|hiya|yo|hola|salam|salaam|assalam\w*|as-?salamu\w*|namaskar|nomoshkar|greetings|good (morning|afternoon|evening|day))\b|^(হাই|হ্যালো|হেলো|সালাম|আসসালামু|নমস্কার|শুভ সকাল|শুভ সন্ধ্যা)/i,
      a: () => pick([
        T("Hello! 👋 I'm the Dengue Protirodh assistant. I can show you around the dashboard, explain the forecasts, or share dengue prevention tips. What would you like to do?", "হ্যালো! 👋 আমি ডেঙ্গু প্রতিরোধ সহকারী। আমি ড্যাশবোর্ড ঘুরিয়ে দেখাতে, পূর্বাভাস বুঝিয়ে দিতে বা ডেঙ্গু প্রতিরোধের পরামর্শ দিতে পারি। আপনি কী জানতে চান?"),
        T("Hi there! 😊 Ask me how to use the dashboard, what a risk tier means, or how to keep mosquitoes away. You can also say \"take a tour\".", "হাই! 😊 ড্যাশবোর্ড কীভাবে ব্যবহার করবেন, ঝুঁকির স্তর মানে কী, বা মশা কীভাবে দূরে রাখবেন — জিজ্ঞাসা করুন। \"ট্যুর\" লিখলে আমি ঘুরিয়ে দেখাব।")
      ]) },
    { re: /\b(thanks|thank you|thank u|thx|ty|tysm|appreciate|great job|awesome|nice|cool|perfect|helpful)\b|ধন্যবাদ|শুকরিয়া/i,
      a: () => pick([
        T("You're welcome! 😊 Anything else I can help with?", "আপনাকে স্বাগতম! 😊 আর কিছুতে সাহায্য করতে পারি?"),
        T("Happy to help! Stay safe and keep those water containers empty. 🦟", "সাহায্য করতে পেরে খুশি! নিরাপদে থাকুন এবং পানির পাত্র খালি রাখুন। 🦟")
      ]) },
    { re: /^(bye|goodbye|see (you|ya)|good night|later|cya|take care)\b|বিদায়|আল্লাহ হাফেজ|শুভ রাত্রি/i,
      a: () => T("Goodbye! 👋 Stay safe, and come back any time you need help with the forecasts.", "বিদায়! 👋 নিরাপদে থাকুন, পূর্বাভাস নিয়ে সাহায্য লাগলে যেকোনো সময় ফিরে আসুন।") },
    { re: /^(ok|okay|k|alright|got it|sure|fine|yes|yeah|yep|no|nope|hmm+|ঠিক আছে|আচ্ছা|হ্যাঁ|না)[.!?\s]*$/i,
      a: () => T("Alright! Just ask whenever you're ready, or tap one of the suggestions above.", "ঠিক আছে! যখন প্রস্তুত তখন জিজ্ঞাসা করুন, অথবা উপরের পরামর্শগুলোর একটিতে ট্যাপ করুন।") },
    { re: /who are you|what are you|your name|are you (a )?(bot|robot|human|ai)|who (made|built|created) you|তুমি কে|আপনি কে|তোমার নাম/i,
      a: () => T("I'm the Dengue Protirodh help assistant 🤖. I'm here to help health officers and visitors use this dengue early-warning dashboard. I can explain the forecasts, guide you through the tabs and share prevention tips, but I can't give medical advice.", "আমি ডেঙ্গু প্রতিরোধ সহায়তা সহকারী 🤖। এই ডেঙ্গু আগাম সতর্কবার্তা ড্যাশবোর্ড ব্যবহারে স্বাস্থ্যকর্মী ও দর্শনার্থীদের সাহায্য করি। পূর্বাভাস ব্যাখ্যা, ট্যাব দেখানো ও প্রতিরোধ পরামর্শ দিতে পারি, তবে চিকিৎসা পরামর্শ দিতে পারি না।") },
    { re: /what can you do|what do you do|how can you help|can you help|help me|^help\b|i need help|তুমি কী করতে পার|সাহায্য/i,
      a: () => T("Here's what I can help with:\n• Using the dashboard (pick a city, week and forecast window)\n• What the risk tiers and charts mean\n• Supplies, hospital beds, spraying crews and alerts (Phase 2 tabs)\n• How the forecast model works and how accurate it is\n• Dengue prevention tips\nSay \"take a tour\" and I'll walk you through it.", "আমি যেসব বিষয়ে সাহায্য করতে পারি:\n• ড্যাশবোর্ড ব্যবহার (শহর, সপ্তাহ ও সময়সীমা বাছাই)\n• ঝুঁকির স্তর ও চার্টের অর্থ\n• সরবরাহ, হাসপাতাল শয্যা, স্প্রে দল ও সতর্কবার্তা\n• মডেল কীভাবে কাজ করে ও কতটা নির্ভুল\n• ডেঙ্গু প্রতিরোধের পরামর্শ\n\"ট্যুর\" লিখলে আমি ঘুরিয়ে দেখাব।") },
    { re: /which wards?|most at risk|highest risk|top (\d+ )?wards?|riskiest|worst wards?|critical wards?|hotspot|danger(ous)? wards?|কোন ওয়ার্ড|সবচেয়ে ঝুঁকি/i, tab: "t1",
      a: () => {
        const st = window.DG_STATE;
        if (!st || !st.rows || !st.rows.length) return T("Open the dashboard and the Risk board will rank every ward from highest to lowest risk.", "ড্যাশবোর্ড খুলুন, ঝুঁকি বোর্ডে সব ওয়ার্ড সর্বোচ্চ থেকে সর্বনিম্ন ঝুঁকি অনুযায়ী সাজানো থাকবে।");
        const top = st.rows.slice().sort((a, b) => b.pred - a.pred).slice(0, 3);
        const crit = st.rows.filter(r => r.tier === "Critical").length;
        const list = top.map((r, i) => `${i + 1}. ${r.ward_id} (${r.city}): ~${Math.round(r.pred)} cases/week, ${r.tier}`).join("\n");
        return T(`For the week of ${top[0].target} (+${st.h} weeks, ${st.city}), the highest-risk wards are:\n${list}\n${crit} ward(s) are Critical. The Risk board shows the full ranking.`,
                 `${toBnD(top[0].target)} সপ্তাহের (+${toBnD(st.h)} সপ্তাহ) সর্বোচ্চ ঝুঁকির ওয়ার্ড:\n${toBnD(list)}\n${toBnD(crit)}টি ওয়ার্ড সংকটজনক। পূর্ণ তালিকা ঝুঁকি বোর্ডে দেখুন।`);
      },
      label: () => T("Open Risk board", "ঝুঁকি বোর্ড খুলুন") },
    { re: /what is dengue|what'?s dengue|about dengue|dengue (is|virus)|ডেঙ্গু কী(?!ভাবে)/i,
      a: () => T("Dengue is a viral illness spread by Aedes mosquitoes, which breed in clean, stagnant water (buckets, tyres, flower pots, roof tanks). Cases in Bangladesh usually peak in the monsoon. This dashboard predicts which city wards are likely to see more cases 2-4 weeks ahead so teams can act early.", "ডেঙ্গু একটি ভাইরাসজনিত রোগ যা এডিস মশার মাধ্যমে ছড়ায়। এই মশা জমে থাকা পরিষ্কার পানিতে (বালতি, টায়ার, ফুলের টব, ছাদের ট্যাংক) ডিম পাড়ে। বাংলাদেশে বর্ষাকালে রোগী সবচেয়ে বেশি হয়। এই ড্যাশবোর্ড ২–৪ সপ্তাহ আগেই কোন ওয়ার্ডে রোগী বাড়তে পারে তা পূর্বাভাস দেয়।") },
    { re: /prevent|protect|avoid|stop (dengue|mosquito)|keep .*mosquito|mosquito bite|repellent|breeding|stagnant|প্রতিরোধ|মশা থেকে|বাঁচ/i,
      a: () => T("Simple ways to cut dengue risk 🦟:\n• Empty, scrub or cover anything that holds water at least once a week (buckets, pots, tyres, AC trays)\n• Keep drains clear and roof tanks covered\n• Use mosquito nets, screens and repellent, especially early morning and late afternoon\n• Wear long sleeves\n• Join community clean-ups\nIf someone has a high fever, please see a doctor.", "ডেঙ্গু ঝুঁকি কমানোর সহজ উপায় 🦟:\n• সপ্তাহে অন্তত একবার পানি জমে এমন সব পাত্র খালি, পরিষ্কার বা ঢেকে রাখুন\n• ড্রেন পরিষ্কার ও ছাদের ট্যাংক ঢেকে রাখুন\n• মশারি, নেট ও রিপেলেন্ট ব্যবহার করুন, বিশেষ করে ভোরে ও বিকেলে\n• লম্বা হাতার কাপড় পরুন\n• এলাকার পরিচ্ছন্নতা অভিযানে যোগ দিন\nতীব্র জ্বর হলে ডাক্তার দেখান।") },
    { re: /supply|supplies|saline|kit|stock|allocat|shortage|deficit|সরবরাহ|স্যালাইন|ঘাটতি/i, tab: "t7",
      a: () => T("The Supply allocation tab turns forecast cases into saline bags, test kits and beds needed per ward. Move the 'Available regional stock' slider to see how scarce stock is shared (riskier, denser wards first). Wards that can't be fully supplied are flagged DEFICIT or CRITICAL DEFICIT.", "সরবরাহ বণ্টন ট্যাব পূর্বাভাসিত রোগী থেকে প্রতিটি ওয়ার্ডে প্রয়োজনীয় স্যালাইন, টেস্ট কিট ও শয্যা হিসাব করে। 'উপলব্ধ আঞ্চলিক মজুত' স্লাইডার সরিয়ে দেখুন সীমিত মজুত কীভাবে ভাগ হয়। পুরোপুরি সরবরাহ না পাওয়া ওয়ার্ডগুলো DEFICIT বা CRITICAL DEFICIT হিসেবে চিহ্নিত হয়।"),
      label: () => T("Open Supply allocation", "সরবরাহ বণ্টন খুলুন") },
    { re: /bed|overflow|hospital|transfer|surge|শয্যা|হাসপাতাল|বেড/i, tab: "t8",
      a: () => T("The Bed overflow tab checks whether each ward's hospitals have enough dengue beds. Wards that are full send patients to less-busy wards in the same city, shown as transfer orders and a flow chart. Any patients that can't be placed are shown as a city deficit.", "শয্যা ওভারফ্লো ট্যাব দেখায় প্রতিটি ওয়ার্ডের হাসপাতালে পর্যাপ্ত ডেঙ্গু শয্যা আছে কি না। পূর্ণ ওয়ার্ড থেকে একই শহরের কম চাপের ওয়ার্ডে রোগী পাঠানোর নির্দেশ ও ফ্লো চার্ট দেখানো হয়।"),
      label: () => T("Open Bed overflow", "শয্যা ওভারফ্লো খুলুন") },
    { re: /crew|vector|larvicid|fogg|simulat|roi|ক্রু|লার্ভা|ফগিং/i, tab: "t9",
      a: () => T("The Vector simulator tab lets you send larvicide/fogging crews to wards and re-runs the forecast model to show cases prevented, beds freed and saline saved. Wards are ranked by ROI (cases prevented per crew), and you can also set crews by hand.", "ভেক্টর সিমুলেটর ট্যাবে ওয়ার্ডে লার্ভিসাইড/ফগিং দল পাঠিয়ে দেখা যায় কত রোগী প্রতিরোধ হয়, কত শয্যা ও স্যালাইন বাঁচে। প্রতি দলে প্রতিরোধিত রোগী অনুযায়ী ওয়ার্ডগুলো সাজানো থাকে।"),
      label: () => T("Open Vector simulator", "ভেক্টর সিমুলেটর খুলুন") },
    { re: /sms|whatsapp|dispatch|notice|brief|print|pdf|message|alert|বার্তা|নোটিশ/i, tab: "t10",
      a: () => T("The Dispatch tab writes ready-to-send notices for every ward: a short SMS (160 characters), a WhatsApp message and a printable commissioner brief (use Print / Save as PDF). You can also download the plan as CSV or JSON.", "ডিসপ্যাচ ট্যাব প্রতিটি ওয়ার্ডের জন্য পাঠানোর উপযোগী নোটিশ তৈরি করে: ছোট SMS, WhatsApp বার্তা ও প্রিন্টযোগ্য কমিশনার ব্রিফ। CSV বা JSON হিসেবেও ডাউনলোড করা যায়।"),
      label: () => T("Open Dispatch", "ডিসপ্যাচ খুলুন") },
    { re: /offline|internet|no network|wi-?fi|অফলাইন|ইন্টারনেট/i,
      a: () => T("Yes, the dashboard works offline. The forecast model, data and all operations tools run inside your browser. Only my extra AI answers need internet; without it I still answer from my built-in knowledge.", "হ্যাঁ, ড্যাশবোর্ড অফলাইনে কাজ করে। পূর্বাভাস মডেল, ডেটা ও সব টুল আপনার ব্রাউজারেই চলে। শুধু অতিরিক্ত এআই উত্তরের জন্য ইন্টারনেট লাগে।") },
    { re: /dashboard|where (is|are|do i|can i)|how (do|can) i (open|find|get to|see|access)|open (it|the app|the tool)|take me|go to|navigate|find the|main page|home ?page|ড্যাশবোর্ড|কোথায়|খুলব/i, dashOpen: true,
      a: () => ON_APP
        ? T("You're already in the dashboard! 🙂\n• Left sidebar: choose the city, the warning week and +2/+3/+4 weeks ahead\n• Tabs along the top: Risk board, Ward deep-dive, What-if, Validation, How it works, Architecture, Supply allocation, Bed overflow, Vector simulator, Dispatch\nTell me what you're looking for (e.g. \"where is the heatmap\") or say \"take a tour\".",
            "আপনি এখন ড্যাশবোর্ডেই আছেন! 🙂\n• বাম সাইডবার: শহর, সতর্কতার সপ্তাহ ও +২/+৩/+৪ সপ্তাহ বেছে নিন\n• উপরের ট্যাবগুলো: ঝুঁকি বোর্ড, ওয়ার্ড বিশ্লেষণ, সম্ভাব্য পরিস্থিতি, যাচাইকরণ, সরবরাহ, শয্যা, ভেক্টর সিমুলেটর, ডিসপ্যাচ\nকী খুঁজছেন বলুন, অথবা \"ট্যুর\" লিখুন।")
        : T("The dashboard is one click away 👇 Use the button below, or the \"Dashboard\" button at the top-right of the page (also \"Get started\" on the main banner). It opens the ward risk forecasts, maps and planning tools.",
            "ড্যাশবোর্ড এক ক্লিক দূরে 👇 নিচের বাটন বা পাতার উপরে ডানদিকের \"ড্যাশবোর্ড\" বাটনে ক্লিক করুন। সেখানে ওয়ার্ডভিত্তিক ঝুঁকির পূর্বাভাস, মানচিত্র ও পরিকল্পনা টুল পাবেন।"),
      label: () => ON_APP ? T("Take a tour", "ট্যুর নিন") : T("Open the dashboard", "ড্যাশবোর্ড খুলুন") }
  ];
  const TOPICAL_FROM = 7; // SMALL[0..6] are social replies; the rest answer real dengue / dashboard topics
  function smallTalk(q, topical) {
    const list = topical ? SMALL.slice(TOPICAL_FROM) : SMALL.slice(0, TOPICAL_FROM);
    const s = list.find(x => x.re.test(q.trim()));
    if (!s) return null;
    if (s.dashOpen) return { a: s.a(), act: { label: s.label(), fn: () => { if (ON_APP) startTour(); else location.href = "app.html"; } } };
    const act = s.tab && ON_APP ? { label: s.label(), fn: () => goTab(s.tab) } : (s.tab ? { label: s.label(), fn: () => { location.href = "app.html#" + s.tab; } } : null);
    return { a: s.a(), act };
  }

  const aiDownMsg = () => T("I'd love to answer that, but my AI brain needs an internet connection and isn't reachable right now 🙏. I can still help with the dashboard, risk tiers, supplies, beds, crews and dengue prevention. Try again in a moment!", "এই প্রশ্নের উত্তর দিতে আমার এআই সংযোগ দরকার, যা এখন পাওয়া যাচ্ছে না 🙏। তবে ড্যাশবোর্ড, ঝুঁকির স্তর, সরবরাহ, শয্যা, স্প্রে দল ও ডেঙ্গু প্রতিরোধ নিয়ে এখনও সাহায্য করতে পারি।");
  const unsureMsg = () => T("Hmm, I'm not sure I understood that 🤔. I can help you use the dashboard, explain risk tiers, supplies, beds and spraying crews, or share dengue prevention tips. Try one of the suggestions above, or say \"take a tour\".", "দুঃখিত, ঠিক বুঝতে পারিনি 🤔। ড্যাশবোর্ড ব্যবহার, ঝুঁকির স্তর, সরবরাহ, শয্যা, স্প্রে দল বা ডেঙ্গু প্রতিরোধ নিয়ে সাহায্য করতে পারি। উপরের পরামর্শ থেকে একটি বেছে নিন, অথবা \"ট্যুর\" লিখুন।");

  let busy = false;
  async function ask(q) {
    q = q.trim(); if (!q || busy) return; busy = true; say(q, "me"); inp.value = ""; updateCount();
    if (LOST.some(k => q.toLowerCase().includes(k))) { startTour(); busy = false; return; }
    const medical = /symptom|fever|treatment|medicine|sick|doctor|লক্ষণ|জ্বর|চিকিৎসা|ওষুধ|ডাক্তার/i.test(q);
    const navFirst = /where|find|open|go to|show|take me|navigate|কোথায়|খুল|দেখাও/i.test(q) ? navFor(q) : null;
    if (navFirst && !medical) { say(navFirst.a || T("Sure! Here it is 👇", "অবশ্যই! এখানে 👇"), "bot", { label: navFirst.label, fn: navFirst.go }); if (ON_APP) navFirst.go(); busy = false; return; }
    const topical = medical ? null : smallTalk(q, true);
    if (topical) { say(topical.a, "bot", topical.act); busy = false; return; }
    const local = faq(q), nav = navFor(q);
    const act = nav ? { label: nav.label, fn: nav.go } : null;
    if (local) { say(local, "bot", act); busy = false; return; }
    if (nav && nav.a) { say(nav.a, "bot", act); busy = false; return; }
    const social = smallTalk(q, false);
    if (social) { say(social.a, "bot", social.act); busy = false; return; }
    const wait = say(T("Thinking...", "ভাবছি..."), "bot");
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q, lang: isBn() ? "bn" : "en", ctx: window.DG_CONTEXT || "" }) });
      const j = await r.json();
      wait.textContent = j.ok ? j.answer : j.reason === "no_key" && !act ? T("I can only answer dashboard and dengue questions right now, because my general AI isn't switched on yet (the site owner needs to add an AI key) 🙏. Try asking about risk tiers, wards, supplies or dengue prevention!", "এই মুহূর্তে আমি শুধু ড্যাশবোর্ড ও ডেঙ্গু বিষয়ক প্রশ্নের উত্তর দিতে পারি, কারণ সাধারণ এআই এখনও চালু হয়নি 🙏। ঝুঁকির স্তর, ওয়ার্ড, সরবরাহ বা ডেঙ্গু প্রতিরোধ নিয়ে জিজ্ঞাসা করুন!") : (j.reason === "rate_limited"
        ? T("You are asking very quickly. Please wait a moment and try again.", "আপনি খুব দ্রুত প্রশ্ন করছেন। অনুগ্রহ করে একটু অপেক্ষা করে আবার চেষ্টা করুন।")
        : (act ? T("Good question! You'll find this in the section below.", "ভালো প্রশ্ন! নিচের অংশে এটি পাবেন।") : aiDownMsg()));
      if (j.ok && act) { const b = $("button", "dgc-act", act.label); b.type = "button"; b.onclick = act.fn; wait.appendChild(b); }
    } catch (e) {
      wait.textContent = act ? T("Good question! You'll find this in the section below.", "ভালো প্রশ্ন! নিচের অংশে এটি পাবেন।") : aiDownMsg();
      if (act) { const b = $("button", "dgc-act", act.label); b.type = "button"; b.onclick = act.fn; wait.appendChild(b); }
    }
    busy = false;
  }
  form.onsubmit = e => { e.preventDefault(); ask(inp.value); };
})();
