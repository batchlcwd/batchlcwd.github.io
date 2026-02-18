/* script.js — Vanilla JS interaction for portfolio
   - Typing animation
   - IntersectionObserver-based reveal + nav highlighting
   - Animated counters and progress bars
   - Smooth scrolling and mobile nav
   - Contact form validation (client-side)
*/

document.addEventListener("DOMContentLoaded", () => {
  // --- Helpers ---
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  // Set current year in footer
  qs("#year").textContent = new Date().getFullYear();

  // --- Typing animation (hero) ---
  const typedEl = qs("#typed");
  const TYPED_WORDS = [
    "Full Stack Developer",
    "Backend Developer",
    "Problem Solver",
    "AI Enthusiast",
  ];
  let tIndex = 0,
    charIndex = 0,
    typing = true;

  function typeTick() {
    const word = TYPED_WORDS[tIndex];
    if (typing) {
      charIndex++;
      typedEl.textContent = word.slice(0, charIndex);
      if (charIndex === word.length) {
        typing = false;
        setTimeout(typeTick, 900);
        return;
      }
      setTimeout(typeTick, 60);
    } else {
      charIndex--;
      typedEl.textContent = word.slice(0, charIndex);
      if (charIndex === 0) {
        typing = true;
        tIndex = (tIndex + 1) % TYPED_WORDS.length;
        setTimeout(typeTick, 140);
        return;
      }
      setTimeout(typeTick, 30);
    }
  }
  typeTick();

  // --- Smooth scrolling for internal links (data-scroll) ---
  qsa("a[data-scroll]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });

      // close mobile nav if open
      closeMobileNav();
    });
  });

  // --- Mobile menu toggle ---
  const hamburger = qs(".hamburger");
  const mobileNav = qs(".mobile-nav");
  hamburger.addEventListener("click", () => {
    const expanded = hamburger.getAttribute("aria-expanded") === "true";
    hamburger.setAttribute("aria-expanded", String(!expanded));
    if (mobileNav.hasAttribute("hidden")) {
      mobileNav.removeAttribute("hidden");
      mobileNav.style.transform = "translateY(0)";
      mobileNav.style.visibility = "visible";
      mobileNav.style.opacity = "1";
    } else {
      closeMobileNav();
    }
  });
  function closeMobileNav() {
    mobileNav.setAttribute("hidden", "");
    mobileNav.style.transform = "";
    mobileNav.style.visibility = "";
    mobileNav.style.opacity = "";
    hamburger.setAttribute("aria-expanded", "false");
  }

  // --- Back to top and scroll progress ---
  const progressBar = qs(".progress-bar");
  const backToTop = qs(".back-to-top");
  window.addEventListener("scroll", () => {
    const scrolled =
      (window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight)) *
      100;
    progressBar.style.width = scrolled + "%";
    backToTop.classList.toggle("show", window.scrollY > 560);
  });
  backToTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );

  // --- Intersection Observer for reveals + nav active state ---
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  qsa(".reveal").forEach((el) => revealObserver.observe(el));
  qsa(".reveal-sm").forEach((el) => revealObserver.observe(el));

  // Nav active link highlight using Intersection Observer
  const sections = qsa("main section[id]");
  const navLinks = qsa(".nav__link");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const link = document.querySelector(`.nav__link[href="#${id}"]`);
        if (entry.isIntersecting) {
          navLinks.forEach((n) => n.classList.remove("active"));
          if (link) link.classList.add("active");
        }
      });
    },
    { threshold: 0.48 },
  );
  sections.forEach((s) => sectionObserver.observe(s));

  // --- Animated counters (run once when visible) ---
  qsa(".counter").forEach((counter) => {
    const target = +counter.dataset.target || 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true;
            let cur = 0;
            const step = Math.max(1, Math.floor(target / 60));
            const int = setInterval(() => {
              cur += step;
              counter.textContent =
                cur >= target ? String(target) : String(cur);
              if (cur >= target) clearInterval(int);
            }, 14);
            o.unobserve(counter);
          }
        });
      },
      { threshold: 0.6 },
    );
    io.observe(counter);
  });

  // --- Progress bars (animate when visible) ---
  qsa(".progress").forEach((bar) => {
    const span = qs("span", bar);
    const pct = +bar.dataset.percent || 0;
    const io = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            span.style.width = pct + "%";
            o.unobserve(bar);
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(bar);
  });

  // --- Contact form validation (basic client-side) ---
  const form = qs("#contact-form");
  const nameField = qs("#name");
  const emailField = qs("#email");
  const messageField = qs("#message");
  const statusEl = qs("#form-status");

  function setError(input, msg) {
    const error = input.parentElement.querySelector(".error");
    error.textContent = msg || "";
    input.setAttribute("aria-invalid", !!msg);
  }
  function validateEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;

    if (!nameField.value.trim()) {
      ok = false;
      setError(nameField, "Please enter your name");
    } else setError(nameField, "");
    if (!validateEmail(emailField.value.trim())) {
      ok = false;
      setError(emailField, "Please enter a valid email");
    } else setError(emailField, "");
    if (messageField.value.trim().length < 10) {
      ok = false;
      setError(messageField, "Message should be at least 10 characters");
    } else setError(messageField, "");

    if (!ok) {
      statusEl.textContent = "Please fix the highlighted fields.";
      return;
    }

    // Simulate sending (demo only)
    statusEl.textContent = "Sending message...";
    const formData = {
      name: nameField.value.trim(),
      email: emailField.value.trim(),
      message: messageField.value.trim(),
    };
    setTimeout(() => {
      statusEl.textContent = "Thanks — your message was sent (demo).";
      form.reset();
    }, 900);
  });

  // Accessibility: close mobile nav on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileNav();
  });

  // Small enhancement: reveal nav link of top on load
  const topLink = document.querySelector('.nav__link[href="#hero"]');
  if (!topLink) {
    // if hero isn't in nav, mark first link active until scroll
    navLinks[0]?.classList.add("active");
  }
});
