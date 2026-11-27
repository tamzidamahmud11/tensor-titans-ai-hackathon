// "Submit your story" form + approved community stories (videos.html).
(function () {
  var f = document.getElementById("storyform"); if (!f) return;
  var msg = document.getElementById("storymsg"), btn = f.querySelector("button[type=submit]"), cnt = document.getElementById("storycount");
  var story = f.elements.story, MIN = 40;
  var isBn = function () { return (window.DG_I18N ? window.DG_I18N.isBn() : localStorage.getItem("dg_lang") === "bn"); };
  var T = function (en, bn) { return isBn() ? bn : en; };
  var BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  var fmtD = function (s) { return isBn() ? String(s).replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; }) : String(s); };
  var ROLE = {
    patient: function () { return T("Had dengue", "ডেঙ্গু হয়েছিল"); },
    family: function () { return T("Family member or friend", "পরিবারের সদস্য বা বন্ধু"); },
    "health-worker": function () { return T("Health worker", "স্বাস্থ্যকর্মী"); },
    other: function () { return T("Community member", "কমিউনিটির সদস্য"); }
  };
  function say(t, ok) { msg.textContent = t; msg.className = "storymsg " + (ok ? "ok" : "err"); msg.hidden = false; }
  function updateCount() { cnt.textContent = fmtD(story.value.length) + " / " + fmtD(2000); }
  story.addEventListener("input", updateCount);
  window.addEventListener("dg:langchange", updateCount);
  updateCount();

  f.addEventListener("submit", function (e) {
    e.preventDefault(); msg.hidden = true;
    if (story.value.trim().length < MIN) return say(T("Please write at least a few sentences (" + MIN + " characters).", "অনুগ্রহ করে অন্তত কয়েকটি বাক্য লিখুন (সর্বনিম্ন ৪০ অক্ষর)।"), false);
    if (!f.elements.consent.checked) return say(T("Please tick the box to confirm you agree to share your story.", "গল্পটি শেয়ার করতে সম্মতির বাক্সে টিক দিন।"), false);
    var data = { name: f.elements.name.value, place: f.elements.place.value, role: f.elements.role.value, email: f.elements.email.value,
      story: story.value, consent: f.elements.consent.checked, website: f.elements.website.value };
    btn.disabled = true; btn.textContent = T("Sending…", "পাঠানো হচ্ছে…");
    var roleText = ROLE[data.role] ? ROLE[data.role]() : "";
    var mailFallback = function () {
      var body = "Name: " + data.name + "\nPlace: " + data.place + "\nI am: " + roleText + "\nEmail: " + data.email + "\n\nMy story:\n" + data.story +
        "\n\nI agree that Dengue Protirodh may publish my story after review.";
      location.href = "mailto:team@dengueguard.example?subject=" + encodeURIComponent("[Dengue Protirodh] My dengue story") + "&body=" + encodeURIComponent(body);
      say(T("Your email app should have opened with your story filled in. Press Send there to submit it.", "আপনার গল্পসহ ইমেইল অ্যাপ খোলা হয়েছে। জমা দিতে সেখানে Send চাপুন।"), true);
    };
    if (location.protocol === "file:") { btn.disabled = false; btn.textContent = T("Submit my story", "আমার গল্প জমা দিন"); return mailFallback(); }
    fetch("/api/story", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); })
      .then(function (r) {
        if (r.j && r.j.ok) { f.reset(); updateCount(); f.hidden = true; say(T("Thank you for sharing your story. Our team reads every submission and will only publish it after review. Nothing appears on the site automatically.", "আপনার গল্প শেয়ার করার জন্য ধন্যবাদ। আমাদের দল প্রতিটি লেখা পর্যালোচনা করে প্রকাশ করবে।"), true); }
        else say((r.j && r.j.error) || T("Something went wrong. Please try again.", "কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"), false);
      })
      .catch(function () { mailFallback(); })
      .then(function () { btn.disabled = false; btn.textContent = T("Submit my story", "আমার গল্প জমা দিন"); });
  });

  var box = document.getElementById("communitystories");
  if (box && location.protocol !== "file:") fetch("/api/stories").then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    if (!j || !j.stories || !j.stories.length) return;
    var grid = box.querySelector(".vgrid");
    j.stories.forEach(function (s) {
      var a = document.createElement("article"); a.className = "card scard";
      var p = document.createElement("p"); p.className = "sbody"; p.textContent = s.story;
      var m = document.createElement("div"); m.className = "vmeta";
      var w = document.createElement("span");
      var rn = ROLE[s.role] ? ROLE[s.role]() : "";
      w.textContent = (s.name || T("Anonymous", "বেনামী")) + (s.place ? " · " + s.place : "") + (rn ? " · " + rn : "");
      m.appendChild(w); a.appendChild(p); a.appendChild(m); grid.appendChild(a);
    });
    box.hidden = false;
  }).catch(function () {});
})();
