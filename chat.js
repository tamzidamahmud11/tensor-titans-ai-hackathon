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
    if (/^t[1-6]$/.test(h)) { let n = 0; const iv = setInterval(() => { const ready = !document.getElementById("app").hidden; if (ready || ++n > 100) { clearInterval(iv); if (ready) goTab(h); } }, 100); }
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
    const n = NAV.find(n => n.k.some(k => t.includes(k))); return n ? { label: n.label(), go: () => goTab(n.tab) } : null;
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
  const FAQ_LP = {
    k: ["start", "begin", "how do i use", "how to use", "get started", "help me use", "শুরু", "কীভাবে", "ব্যবহার"],
    a: () => T(
      "Click \u201cOpen the dashboard\u201d. Pick a city corporation, the week the warning is issued and the window (+2, +3 or +4 weeks), then read the Risk board: tier counts, ranked wards and the Response planner.",
      "“ড্যাশবোর্ড খুলুন”-এ ক্লিক করুন। সিটি কর্পোরেশন, সতর্কবার্তা জারির সপ্তাহ এবং সময়সীমা (+২, +৩ বা +৪ সপ্তাহ) বেছে নিন, তারপর ঝুঁকি বোর্ডে স্তর অনুযায়ী সংখ্যা, র‍্যাংক করা ওয়ার্ড এবং প্রতিক্রিয়া পরিকল্পনাকারী দেখুন।"
    )
  };
  function faq(q) {
    const t = norm(q); let best = null, bs = 0;
    (ON_APP ? FAQ : [FAQ_LP, ...FAQ]).forEach(f => { const s = f.k.filter(k => t.includes(k)).length; if (s > bs) { bs = s; best = f; } });
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
      ? T("Hi! I can help you use this dashboard and understand the forecasts. I cannot give medical advice.", "হ্যালো! এই ড্যাশবোর্ড ব্যবহার করতে ও পূর্বাভাস বুঝতে আমি সাহায্য করতে পারি। আমি চিকিৎসা পরামর্শ দিতে পারি না।")
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

  let busy = false;
  async function ask(q) {
    q = q.trim(); if (!q || busy) return; busy = true; say(q, "me"); inp.value = ""; updateCount();
    if (LOST.some(k => q.toLowerCase().includes(k))) { startTour(); busy = false; return; }
    const local = faq(q), nav = navFor(q);
    const act = nav ? { label: nav.label, fn: nav.go } : null;
    if (local) { say(local, "bot", act); busy = false; return; }
    if (nav && nav.a) { say(nav.a, "bot", act); busy = false; return; }
    const wait = say(T("Thinking...", "ভাবছি..."), "bot");
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q, lang: isBn() ? "bn" : "en", ctx: window.DG_CONTEXT || "" }) });
      const j = await r.json();
      wait.textContent = j.ok ? j.answer : (j.reason === "rate_limited"
        ? T("You are asking very quickly. Please wait a moment and try again.", "আপনি খুব দ্রুত প্রশ্ন করছেন। অনুগ্রহ করে একটু অপেক্ষা করে আবার চেষ্টা করুন।")
        : T("I can't reach the AI helper right now. Try one of the suggested questions above, or see the " + (ON_APP ? "'How it works' tab." : "How it works section."), "এই মুহূর্তে এআই সহায়কের সাথে সংযোগ পাওয়া যাচ্ছে না। উপরের প্রস্তাবিত প্রশ্নগুলো থেকে একটি চেষ্টা করুন বা 'কীভাবে কাজ করে' অংশ দেখুন।"));
      if (j.ok && act) { const b = $("button", "dgc-act", act.label); b.type = "button"; b.onclick = act.fn; wait.appendChild(b); }
    } catch (e) {
      wait.textContent = T("I'm offline right now. Try one of the suggested questions above, or see the " + (ON_APP ? "'How it works' tab." : "How it works section."), "আমি এখন অফলাইনে আছি। উপরের প্রস্তাবিত প্রশ্নগুলো থেকে একটি চেষ্টা করুন অথবা 'কীভাবে কাজ করে' দেখুন।");
    }
    busy = false;
  }
  form.onsubmit = e => { e.preventDefault(); ask(inp.value); };
})();
