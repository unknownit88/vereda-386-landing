// Vereda 386 — interações da landing

// Preencha com os contatos reais do escritório
const CONTATO = {
  whatsapp: '5535987122036',            // só números, com DDI e DDD
  email: 'contato@vereda386.exemplo.com', // FICTÍCIO: trocar pelo e-mail real
  instagram: 'vereda386',
};

const $ = (s, el = document) => el.querySelector(s);

// Menu: fundo ao rolar e abrir/fechar no celular
const nav = $('#nav');
const toggle = $('#navToggle');
const floatCta = $('#floatCta');

const onScroll = () => {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 40);
  const contato = $('#contato').getBoundingClientRect();
  const nearContact = contato.top < window.innerHeight * 0.8 && contato.bottom > 0;
  floatCta.classList.toggle('is-visible', y > window.innerHeight * 0.9 && !nearContact);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
$('#navLinks').addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

// Animações de entrada
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    io.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  // pequeno atraso em cascata para itens irmãos
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
  el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 90}ms`;
  io.observe(el);
});
io.observe($('.manifesto'));

// Paralaxe leve no fundo do manifesto
const manifestoBg = $('.manifesto__bg');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) {
  window.addEventListener('scroll', () => {
    const r = manifestoBg.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
    manifestoBg.style.transform = `scale(1.1) translateY(${p * -40}px)`;
  }, { passive: true });
}

// Formulário → mensagem pronta no WhatsApp
const form = $('#contactForm');
const msg = $('#formMsg');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = form.nome.value.trim();
  const field = form.nome.closest('.field');
  if (!nome) {
    field.classList.add('has-error');
    msg.textContent = 'Por favor, informe o seu nome.';
    form.nome.focus();
    return;
  }
  field.classList.remove('has-error');

  const texto = [
    `Olá, Vereda 386! Meu nome é ${nome}.`,
    `Tenho interesse em um projeto: ${form.tipo.value}.`,
    form.cidade.value.trim() && `Cidade: ${form.cidade.value.trim()}.`,
    form.mensagem.value.trim(),
  ].filter(Boolean).join('\n');

  if (!CONTATO.whatsapp) {
    msg.textContent = 'Demonstração: o número de WhatsApp do escritório ainda não foi configurado.';
    return;
  }
  window.open(`https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  msg.textContent = 'Abrimos o WhatsApp com a sua mensagem. É só enviar!';
  form.reset();
});

// Links do rodapé
const links = {
  lnkWhats: CONTATO.whatsapp && `https://wa.me/${CONTATO.whatsapp}`,
  lnkEmail: CONTATO.email && `mailto:${CONTATO.email}`,
  lnkInstagram: CONTATO.instagram && `https://instagram.com/${CONTATO.instagram}`,
};
Object.entries(links).forEach(([id, href]) => {
  const a = document.getElementById(id);
  if (href) {
    a.href = href;
    if (!href.startsWith('mailto')) { a.target = '_blank'; a.rel = 'noopener'; }
  } else {
    a.addEventListener('click', (e) => { e.preventDefault(); msg.textContent = 'Contato ainda não configurado.'; location.hash = '#contato'; });
  }
});

$('#ano').textContent = new Date().getFullYear();

// Vídeos (vento nas plantas): a imagem de capa aparece na hora; cada vídeo só é
// baixado quando a seção se aproxima da tela e surge suavemente por cima dela.
const saveData = navigator.connection && navigator.connection.saveData;
if (!reduce && !saveData) {
  const loadVideo = (video) => {
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(([key, type]) => {
      const src = document.createElement('source');
      src.src = video.dataset[key];
      src.type = type;
      video.appendChild(src);
    });
    video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
    video.load();
    video.play().catch(() => {});
  };
  const loader = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      loader.unobserve(entry.target);
      loadVideo(entry.target);
    });
  }, { rootMargin: '400px 0px' });

  // pausa fora da tela para poupar bateria
  const player = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!target.currentSrc) return;
      if (isIntersecting) target.play().catch(() => {}); else target.pause();
    });
  });

  // só começa depois que a página (imagens e fontes) terminou de carregar
  const startVideos = () => document.querySelectorAll('video.lazy-video').forEach((video) => {
    loader.observe(video);
    player.observe(video);
  });
  if (document.readyState === 'complete') startVideos();
  else window.addEventListener('load', startVideos, { once: true });
}

// Linha terracota do manifesto: acompanha o mouse indo e voltando pela seção
// (no celular, a rolagem) e solta um rastro de nuvem pela ponta.
const manifesto = $('.manifesto');
const linePath = document.getElementById('manifestoPath');
const revealRect = document.getElementById('lineRevealRect');
const tip = document.getElementById('manifestoTip');
const mist = document.getElementById('manifestoMist');
if (manifesto && linePath) {
  const VB = { x0: -20, x1: 1220, w: 1200, h: 400 };
  const setWidth = (x) => revealRect.setAttribute('width', Math.max(0, x - VB.x0));

  if (reduce) {
    setWidth(VB.x1);
  } else {
    // tabela x → y do caminho, para achar a ponta da linha
    const total = linePath.getTotalLength();
    const samples = Array.from({ length: 241 }, (_, i) => linePath.getPointAtLength((total * i) / 240));
    const yAt = (x) => {
      for (let i = 1; i < samples.length; i++) {
        const a = samples[i - 1], b = samples[i];
        if (x <= b.x) return a.y + ((b.y - a.y) * (x - a.x)) / ((b.x - a.x) || 1);
      }
      return samples[samples.length - 1].y;
    };

    // rastro de nuvem (canvas)
    const ctx = mist.getContext('2d');
    let W = 0, H = 0;
    const resize = () => {
      const r = manifesto.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      mist.width = W * dpr; mist.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const puffs = [];
    const COLORS = ['255,246,232', '236,206,170', '214,150,108'];
    const emit = (x, y, amount) => {
      const n = Math.min(3, Math.ceil(amount / 10));
      for (let i = 0; i < n; i++) {
        puffs.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -0.15 - Math.random() * 0.35,
          r: 8 + Math.random() * 10,
          grow: 0.35 + Math.random() * 0.4,
          life: 0,
          max: 50 + Math.random() * 40,
          c: COLORS[(Math.random() * COLORS.length) | 0],
          a: 0.16 + Math.random() * 0.16,
        });
      }
      if (puffs.length > 120) puffs.splice(0, puffs.length - 120);
    };

    let target = VB.x0;
    let current = VB.x0;
    let lastScreen = null;
    let raf = 0;

    const frame = () => {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.3) current = target;
      setWidth(current);

      const sx = (current / VB.w) * W;
      const sy = (yAt(current) / VB.h) * H;
      tip.style.transform = `translate(${sx}px, ${sy}px)`;
      if (lastScreen) {
        const moved = Math.hypot(sx - lastScreen.x, sy - lastScreen.y);
        if (moved > 0.8) emit(sx, sy, moved);
      }
      lastScreen = { x: sx, y: sy };

      ctx.clearRect(0, 0, W, H);
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.life++;
        if (p.life > p.max) { puffs.splice(i, 1); continue; }
        p.x += p.vx; p.y += p.vy; p.r += p.grow;
        const t = p.life / p.max;
        const alpha = p.a * Math.sin(Math.PI * Math.min(1, t * 1.15)) * (1 - t);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(${p.c},${alpha})`);
        g.addColorStop(1, `rgba(${p.c},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = current !== target || puffs.length ? requestAnimationFrame(frame) : 0;
    };
    const goTo = (x) => {
      target = Math.min(VB.x1, Math.max(VB.x0, x));
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (canHover) {
      manifesto.addEventListener('pointerenter', resize);
      manifesto.addEventListener('pointermove', (e) => {
        const r = manifesto.getBoundingClientRect();
        goTo(VB.x0 + ((e.clientX - r.left) / r.width) * (VB.x1 - VB.x0));
        tip.classList.add('is-on');
      });
      manifesto.addEventListener('pointerleave', () => tip.classList.remove('is-on'));
    } else {
      window.addEventListener('scroll', () => {
        const r = manifesto.getBoundingClientRect();
        const vh = window.innerHeight;
        if (r.bottom < 0 || r.top > vh) { tip.classList.remove('is-on'); return; }
        const p = Math.min(1, Math.max(0, ((vh - r.top) / (vh + r.height)) * 1.5));
        goTo(VB.x0 + p * (VB.x1 - VB.x0));
        tip.classList.toggle('is-on', p > 0 && p < 1);
      }, { passive: true });
    }
  }
}
