(function () {
  var canvas = document.getElementById('hero-overview-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    w = Math.max(rect.width, 320);
    h = Math.max(rect.height, 320);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  var isBn = function () { return (window.DG_I18N ? window.DG_I18N.isBn() : localStorage.getItem('dg_lang') === 'bn'); };

  var scenes = [
    { label: '01 · WEATHER & WARD DATA', sub: '60 Wards · Rainfall, Temp & Humidity Lags',
      bnLabel: '০১ · আবহাওয়া ও ওয়ার্ডের তথ্য', bnSub: '৬০টি ওয়ার্ড · বৃষ্টিপাত, তাপমাত্রা ও আর্দ্রতার বিলম্ব', color: '#38bdf8' },
    { label: '02 · 2–4 WEEK AI FORECAST', sub: 'Gradient-Boosted Early Warning Model',
      bnLabel: '০২ · ২–৪ সপ্তাহের এআই পূর্বাভাস', bnSub: 'গ্র্যাডিয়েন্ট-বুস্টেড আগাম সতর্কবার্তা মডেল', color: '#22c55e' },
    { label: '03 · RANKED WARD RISK BOARD', sub: 'Prioritized Outbreak Alerts Before Peak',
      bnLabel: '০৩ · ওয়ার্ড ঝুঁকি তালিকা বোর্ড', bnSub: 'প্রাদুর্ভাব তীব্র হওয়ার আগেই অগ্রাধিকারভিত্তিক সতর্কতা', color: '#f59e0b' },
    { label: '04 · PREVENTION & COMMUNITY', sub: 'B-L-O-C-K Action & Local Cleanups',
      bnLabel: '০৪ · প্রতিরোধ ও কমিউনিটি', bnSub: 'B-L-O-C-K পদক্ষেপ এবং স্থানীয় পরিচ্ছন্নতা অভিযান', color: '#10b981' },
    { label: '05 · NEWS, BLOGS & RESOURCES', sub: 'Videos, Webinars & AI Guidance Hub',
      bnLabel: '০৫ · সংবাদ, ব্লগ ও রিসোর্স', bnSub: 'ভিডিও, ওয়েবিনার এবং এআই নির্দেশনা হাব', color: '#818cf8' }
  ];

  var SCENE_MS = 4000;
  var start = performance.now();

  var nodes = [];
  for (var i = 0; i < 28; i++) {
    nodes.push({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00018,
      vy: (Math.random() - 0.5) * 0.00018,
      r: 2 + Math.random() * 2.5
    });
  }

  function draw(now) {
    var elapsed = Math.max(0, now - start);
    var totalMs = SCENE_MS * scenes.length;
    var cycle = elapsed % totalMs;
    var idx = Math.floor(cycle / SCENE_MS) % scenes.length;
    var p = (cycle % SCENE_MS) / SCENE_MS;
    var scene = scenes[idx] || scenes[0];

    ctx.clearRect(0, 0, w, h);

    var bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#07111f');
    bg.addColorStop(1, '#0d1d33');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x = (n.x + n.vx + 1) % 1;
      n.y = (n.y + n.vy + 1) % 1;
      var nx = n.x * w, ny = n.y * h;
      for (var j = i + 1; j < nodes.length; j++) {
        var m = nodes[j];
        var dx = nx - m.x * w, dy = ny - m.y * h;
        if (dx * dx + dy * dy < 22000) {
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(m.x * w, m.y * h);
          ctx.stroke();
        }
      }
      ctx.fillStyle = scene.color;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(nx, ny, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.beginPath();
    ctx.strokeStyle = scene.color;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 2.5;
    for (var x = 0; x <= w; x += 14) {
      var y = h * 0.62 + Math.sin(x * 0.008 + elapsed * 0.0018 + idx) * 34
        + Math.cos(x * 0.015 - elapsed * 0.001) * 14;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    var fade = p < 0.12 ? p / 0.12 : (p > 0.88 ? (1 - p) / 0.12 : 1);
    ctx.globalAlpha = Math.max(0, Math.min(1, fade)) * 0.85;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 12px system-ui, -apple-system, sans-serif';
    var lbl = isBn() ? scene.bnLabel : scene.label;
    var sub = isBn() ? scene.bnSub : scene.sub;
    ctx.fillText(lbl + '  —  ' + sub, 24, h - 22);

    ctx.globalAlpha = 0.65;
    ctx.fillStyle = scene.color;
    ctx.fillRect(0, h - 3, w * ((idx + p) / scenes.length), 3);
    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
