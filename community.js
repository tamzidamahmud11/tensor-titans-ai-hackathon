// Community Forum and Peer Support for Dengue Protirodh (Bilingual EN/BN)
(function() {
  const isBn = () => (window.DG_I18N ? window.DG_I18N.isBn() : localStorage.getItem("dg_lang") === "bn");
  const T = (en, bn) => (isBn() ? bn : en);
  const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const toBnD = s => isBn() ? String(s).replace(/[0-9]/g, d => BN_DIGITS[+d]) : String(s);

  const DEFAULT_POSTS = [
    {
      id: "post-01",
      title: "How our apartment committee in Mirpur eliminated rooftop larvae in 48 hours",
      tag: "tip",
      tagName: "Field Guide",
      author: "Rafiqul Islam",
      area: "Mirpur Ward 11, Dhaka",
      date: "2026-11-23",
      content: "After seeing the dengue forecast for Ward 11 rise into Critical last week, our building committee inspected all 14 rooftop water storage overflow trays. 9 of them had active Aedes larvae! We treated them with temephos granules and added mesh strainers. Here is a simple checklist every building caretaker should run weekly.",
      upvotes: 42,
      replies: 8
    },
    {
      id: "post-02",
      title: "Warning signs: My daughter’s platelet dropped on Day 5 after fever broke",
      tag: "recovery",
      tagName: "Survivor Story",
      author: "Nasreen Sultana",
      area: "Shantinagar, Dhaka",
      date: "2026-11-20",
      content: "Many parents assume when the high fever drops, the danger has passed. For severe dengue, the 'critical phase' often begins right when the temperature normalizes. On Day 5 my daughter became lethargic and complained of severe stomach ache. We rushed to DMCH where her platelets had fallen to 38,000. Please monitor hematocrit and fluid intake constantly between Day 3 and 7!",
      upvotes: 89,
      replies: 15
    },
    {
      id: "post-03",
      title: "Clogged storm drain near Agrabad Commercial Area accumulating stagnant water",
      tag: "alert",
      tagName: "Hotspot Alert",
      author: "Imtiaz Mahmud",
      area: "Agrabad Ward 27, Chattogram",
      date: "2026-11-19",
      content: "Spotted significant standing water behind Agrabad Access Road culvert after unseasonal monsoon showers. We have reported this to CCC Conservancy Wing for the upcoming cleanup drive. Anyone nearby, please take precautions with window screens and mosquito coils during dusk hours.",
      upvotes: 27,
      replies: 4
    },
    {
      id: "post-04",
      title: "Does papaya leaf extract or dragon fruit juice actually raise platelet counts?",
      tag: "question",
      tagName: "Medical Q&A",
      author: "Tanvir Hasan",
      area: "Uttara, Dhaka",
      date: "2026-11-15",
      content: "My brother was diagnosed with dengue NS1 positive yesterday. Family members are advising pure papaya leaf juice. Does this interfere with medical treatment or have verified scientific efficacy? Our physician advised oral rehydration solution (ORS) and coconut water.",
      upvotes: 35,
      replies: 12
    }
  ];

  const BN_POSTS = {
    "post-01": {
      title: "মিরপুরে আমাদের অ্যাপার্টমেন্ট কমিটি কীভাবে ৪৮ ঘণ্টায় ছাদের লার্ভা নির্মূল করল",
      author: "রফিকুল ইসলাম",
      area: "মিরপুর ওয়ার্ড ১১, ঢাকা",
      content: "গত সপ্তাহে ওয়ার্ড ১১-এর ডেঙ্গু পূর্বাভাস সংকটজনক স্তরে উঠতে দেখে আমাদের ভবন কমিটি ছাদের ১৪টি পানির ট্যাংকের ওভারফ্লো ট্রে পরিদর্শন করে। এর মধ্যে ৯টিতে জীবন্ত এডিস লার্ভা পাওয়া যায়! আমরা টেমেফস দানা প্রয়োগ করি এবং নেট ছাঁকনি বসাই। প্রতিটি ভবনের কেয়ারটেকারের প্রতি সপ্তাহে চালানোর মতো একটি সহজ চেকলিস্ট এখানে দিলাম।"
    },
    "post-02": {
      title: "সতর্ক লক্ষণ: জ্বর ছেড়ে যাওয়ার পর ৫ম দিনে আমার মেয়ের প্লেটলেট কমে গিয়েছিল",
      author: "নাসরীন সুলতানা",
      area: "শান্তিনগর, ঢাকা",
      content: "অনেক বাবা-মা মনে করেন তীব্র জ্বর নেমে গেলেই বিপদ কেটে গেছে। গুরুতর ডেঙ্গুর ক্ষেত্রে তাপমাত্রা স্বাভাবিক হওয়ার সময়ই 'ক্রিটিক্যাল ফেজ' শুরু হয়। ৫ম দিনে আমার মেয়ে নিস্তেজ হয়ে পড়ে ও তীব্র পেটব্যথার কথা বলে। আমরা দ্রুত ঢাকা মেডিকেলে নিয়ে যাই, সেখানে তার প্লেটলেট ৩৮,০০০-এ নেমে এসেছিল। অনুগ্রহ করে ৩য় থেকে ৭ম দিন পর্যন্ত হেমাটোক্রিট ও তরল গ্রহণ নিয়মিত পর্যবেক্ষণ করুন!"
    },
    "post-03": {
      title: "আগ্রাবাদ বাণিজ্যিক এলাকার কাছে বন্ধ ড্রেনে জমে থাকা পানি",
      author: "ইমতিয়াজ মাহমুদ",
      area: "আগ্রাবাদ ওয়ার্ড ২৭, চট্টগ্রাম",
      content: "অসময়ের বৃষ্টির পর আগ্রাবাদ অ্যাকসেস রোডের কালভার্টের পেছনে প্রচুর পানি জমে থাকতে দেখা গেছে। আসন্ন পরিচ্ছন্নতা অভিযানের জন্য আমরা চসিক কনজারভেন্সি বিভাগে জানিয়েছি। আশেপাশের সবাই সন্ধ্যায় জানালার নেট ও মশা তাড়ানোর ব্যবস্থা ব্যবহার করুন।"
    },
    "post-04": {
      title: "পেঁপে পাতার রস বা ড্রাগন ফলের জুস কি আসলেই প্লেটলেট বাড়ায়?",
      author: "তানভীর হাসান",
      area: "উত্তরা, ঢাকা",
      content: "গতকাল আমার ভাইয়ের ডেঙ্গু NS1 পজিটিভ শনাক্ত হয়েছে। পরিবারের সদস্যরা খাঁটি পেঁপে পাতার রস খাওয়ার পরামর্শ দিচ্ছেন। এটি কি চিকিৎসায় ব্যাঘাত ঘটায় নাকি এর বৈজ্ঞানিক প্রমাণ রয়েছে? আমাদের চিকিৎসক ওরস্যালাইন (ORS) ও ডাবের পানি পান করতে বলেছেন।"
    }
  };

  const BN_TAGS = {
    tip: "মাঠ নির্দেশিকা",
    recovery: "বিজয়ীর গল্প",
    alert: "হটস্পট সতর্কতা",
    question: "চিকিৎসা প্রশ্নোত্তর",
    discussion: "আলোচনা"
  };

  let posts = [];
  try {
    const saved = localStorage.getItem("dg_community_posts");
    posts = saved ? JSON.parse(saved) : DEFAULT_POSTS;
  } catch (e) { posts = DEFAULT_POSTS; }

  let userUpvotes = [];
  try {
    const uSaved = localStorage.getItem("dg_user_upvotes");
    userUpvotes = uSaved ? JSON.parse(uSaved) : [];
  } catch (e) { userUpvotes = []; }

  let currentFilter = "all";

  function savePosts() { try { localStorage.setItem("dg_community_posts", JSON.stringify(posts)); } catch (e) {} }
  function saveUpvotes() { try { localStorage.setItem("dg_user_upvotes", JSON.stringify(userUpvotes)); } catch (e) {} }

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2500);
  }

  function renderPosts(filter = currentFilter) {
    currentFilter = filter;
    const list = document.getElementById("discussionList");
    if (!list) return;
    const filtered = posts.filter(p => filter === "all" || p.tag === filter);
    const bn = isBn();

    list.innerHTML = filtered.map(p => {
      const hasUpvoted = userUpvotes.includes(p.id);
      const loc = bn && BN_POSTS[p.id] ? BN_POSTS[p.id] : p;
      const tagLabel = bn ? (BN_TAGS[p.tag] || p.tagName) : p.tagName;
      const dateStr = bn ? toBnD(p.date) : p.date;
      const authorArea = bn
        ? `পোস্ট করেছেন <b>${loc.author}</b> (${loc.area})`
        : `Posted by <b>${p.author}</b> (${p.area})`;
      return `
        <article class="discussion-card">
          <div class="discussion-header">
            <span class="discussion-tag tag-${p.tag}">${tagLabel}</span>
            <span style="font-size:0.8rem;color:var(--mu)">${dateStr}</span>
          </div>
          <h3 class="discussion-title">${loc.title}</h3>
          <p class="discussion-content">${loc.content}</p>
          <div class="discussion-meta">
            <span>${authorArea}</span>
            <span>💬 ${bn ? toBnD(p.replies) + "টি উত্তর" : p.replies + " responses"}</span>
            <button type="button" class="btn-upvote" data-id="${p.id}" ${hasUpvoted ? 'style="border-color:var(--ac);color:var(--ac)"' : ''}>
              ${bn ? `▲ সহায়ক (${toBnD(p.upvotes)})` : `▲ Helpful (${p.upvotes})`}
            </button>
          </div>
        </article>
      `;
    }).join("");

    list.querySelectorAll(".btn-upvote").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const post = posts.find(x => x.id === id);
        if (!post) return;
        if (userUpvotes.includes(id)) {
          post.upvotes = Math.max(0, post.upvotes - 1);
          userUpvotes = userUpvotes.filter(x => x !== id);
          toast(T("Upvote removed", "ভোট সরানো হয়েছে"));
        } else {
          post.upvotes += 1;
          userUpvotes.push(id);
          toast(T("Marked as helpful!", "সহায়ক হিসেবে চিহ্নিত হয়েছে!"));
        }
        savePosts(); saveUpvotes(); renderPosts(filter);
      });
    });
  }

  function setupNewPostForm() {
    const form = document.getElementById("newPostForm");
    const msg = document.getElementById("newPostMsg");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const title = fd.get("title").trim();
      const tag = fd.get("tag");
      const author = fd.get("author").trim();
      const area = fd.get("area").trim();
      const content = fd.get("content").trim();
      if (!title || !content) return;

      const tagMap = { tip: "Field Guide", alert: "Hotspot Alert", recovery: "Survivor Story", question: "Medical Q&A" };
      const newPost = {
        id: "post-" + Date.now().toString(36),
        title, tag,
        tagName: tagMap[tag] || "Discussion",
        author: author || "Anonymous Neighbor",
        area: area || "Bangladesh",
        date: new Date().toISOString().split("T")[0],
        content, upvotes: 1, replies: 0
      };

      posts.unshift(newPost);
      savePosts();
      form.reset();

      if (msg) {
        msg.className = "event-feedback-msg success";
        msg.textContent = T("Your story/discussion topic has been published to the community forum!", "আপনার গল্প/আলোচনার বিষয়টি কমিউনিটি ফোরামে প্রকাশিত হয়েছে!");
        msg.hidden = false;
        setTimeout(() => { msg.hidden = true; }, 4000);
      }

      renderPosts();
      toast(T("Discussion published!", "আলোচনা প্রকাশিত হয়েছে!"));
    });
  }

  function init() {
    document.querySelectorAll(".community-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".community-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderPosts(btn.dataset.tag);
      });
    });
    setupNewPostForm();
    renderPosts();
    window.addEventListener("dg:langchange", () => renderPosts());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
