// "Stay in the Know" email sign-up (any form with class "subform").
(function () {
  var forms = document.querySelectorAll("form.subform"); if (!forms.length) return;
  var RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var isBn = function () { return (window.DG_I18N ? window.DG_I18N.isBn() : localStorage.getItem("dg_lang") === "bn"); };
  var T = function (en, bn) { return isBn() ? bn : en; };

  Array.prototype.forEach.call(forms, function (f) {
    var msg = f.querySelector(".submsg"), btn = f.querySelector("button[type=submit]");
    function say(t, ok) { msg.textContent = t; msg.className = "submsg " + (ok ? "ok" : "err"); msg.hidden = false; }
    function resetBtn() {
      btn.disabled = false;
      btn.textContent = T("Subscribe", "সাবস্ক্রাইব করুন");
    }
    f.addEventListener("submit", function (e) {
      e.preventDefault(); msg.hidden = true;
      var email = f.elements.email.value.trim();
      if (!RE.test(email)) { f.elements.email.focus(); return say(T("Please enter a valid email address.", "অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা লিখুন।"), false); }
      if (!f.elements.consent.checked) return say(T("Please tick the box to agree to receive emails.", "ইমেইল পেতে সম্মতির বাক্সে টিক দিন।"), false);
      var data = { email: email, consent: true, website: f.elements.website.value };
      btn.disabled = true; btn.textContent = T("Subscribing…", "সাবস্ক্রাইব হচ্ছে…");
      var mailFallback = function () {
        location.href = "mailto:team@dengueguard.example?subject=" + encodeURIComponent("[Dengue Protirodh] Subscribe me to Stay in the Know") +
          "&body=" + encodeURIComponent("Please add this address to the Dengue Protirodh email updates list:\n" + email + "\n\nI agree to receive emails from Dengue Protirodh and can unsubscribe at any time.");
        say(T("Your email app should have opened with a sign-up message. Press Send there to subscribe.", "সাইন-আপ বার্তাসহ আপনার ইমেইল অ্যাপ খোলা হয়েছে। সাবস্ক্রাইব করতে সেখানে Send চাপুন।"), true);
      };
      if (location.protocol === "file:") { resetBtn(); return mailFallback(); }
      fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (j) { return { j: j }; }); })
        .then(function (r) {
          if (r.j && r.j.ok) { f.reset(); say(T("Thank you! You are on the list for Dengue Protirodh updates. You can unsubscribe at any time.", "ধন্যবাদ! আপনি ডেঙ্গু প্রতিরোধের আপডেট তালিকায় যুক্ত হয়েছেন। যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।"), true); }
          else say((r.j && r.j.error) || T("Something went wrong. Please try again.", "কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"), false);
        })
        .catch(function () { mailFallback(); })
        .then(resetBtn);
    });
  });
})();
