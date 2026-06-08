/* =============================================================
   Portfolio — script.js
   - Theme toggle with localStorage + system preference
   - Mobile nav
   - Scroll spy (active nav link)
   - Header shadow on scroll
   - Scroll-reveal via IntersectionObserver
   - Accessible client-side contact-form validation
   ============================================================= */

(function () {
  "use strict";

  const root = document.documentElement;
  const STORAGE_KEY = "portfolio-theme";

  /* -------------------------------------------------------
     Theme
     ------------------------------------------------------- */
  const themeToggle = document.getElementById("themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }

  function initTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      applyTheme(stored);
      return;
    }
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(prefersLight ? "light" : "dark");
  }

  initTheme();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  // React to OS theme changes only when the user hasn't chosen explicitly.
  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? "light" : "dark");
      }
    });

  /* -------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  function closeNav() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", "false");
    navMenu.classList.remove("is-open");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navMenu.classList.toggle("is-open", !open);
    });

    // Close after picking a destination.
    navMenu.addEventListener("click", function (e) {
      if (e.target.closest(".nav-link")) closeNav();
    });

    // Close on Escape.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* -------------------------------------------------------
     Header shadow + reading-progress bar
     (rAF-throttled so scrolling stays buttery on GH Pages)
     ------------------------------------------------------- */
  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("scrollProgress");
  let ticking = false;

  function updateScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (progress) {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? Math.min(y / docHeight, 1) : 0;
      progress.style.transform = "scaleX(" + ratio + ")";
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }
  updateScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  /* -------------------------------------------------------
     Scroll spy — highlight the in-view section's nav link
     ------------------------------------------------------- */
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach(function (link) {
            const active = link.getAttribute("href") === "#" + id;
            link.classList.toggle("is-active", active);
            // Expose state to assistive tech, not just visually.
            if (active) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((section) => spy.observe(section));
  }

  /* -------------------------------------------------------
     Scroll-reveal
     ------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(
    ".section-head, .about-grid, .skill-card, .project-card, .timeline-item, .resume-grid, .contact-grid"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* -------------------------------------------------------
     Staggered reveal — siblings in a grid cascade in,
     so cards don't all pop at once.
     ------------------------------------------------------- */
  document
    .querySelectorAll(".skills-grid, .projects-grid, .timeline")
    .forEach(function (group) {
      Array.from(group.children).forEach(function (child, i) {
        if (child.classList.contains("reveal")) {
          child.style.setProperty("--reveal-delay", i * 0.08 + "s");
        }
      });
    });

  /* -------------------------------------------------------
     Pointer-tracked spotlight on cards.
     Sets --mx / --my so the CSS radial glow follows the cursor.
     Skipped for touch / reduced-motion users.
     ------------------------------------------------------- */
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (fine && !reduced) {
    document
      .querySelectorAll(".skill-card, .project-card")
      .forEach(function (card) {
        card.addEventListener("pointermove", function (e) {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty("--mx", x + "%");
          card.style.setProperty("--my", y + "%");
        });
      });
  }

  /* -------------------------------------------------------
     Contact form — client-side validation
     (No backend; wire up to a service such as Formspree,
      Netlify Forms, or your own endpoint in `submitForm`.)
     ------------------------------------------------------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  const validators = {
    name: function (v) {
      if (!v.trim()) return "Please enter your name.";
      return "";
    },
    email: function (v) {
      if (!v.trim()) return "Please enter your email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
        return "Please enter a valid email address.";
      return "";
    },
    message: function (v) {
      if (!v.trim()) return "Please enter a message.";
      if (v.trim().length < 10) return "Message should be at least 10 characters.";
      return "";
    },
  };

  function setFieldError(field, msg) {
    const wrapper = field.closest(".field");
    const errorEl = form.querySelector('[data-error-for="' + field.name + '"]');
    if (wrapper) wrapper.classList.toggle("has-error", Boolean(msg));
    if (errorEl) errorEl.textContent = msg;
    field.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function validateField(field) {
    const validate = validators[field.name];
    if (!validate) return true;
    const msg = validate(field.value);
    setFieldError(field, msg);
    return !msg;
  }

  if (form) {
    // Validate a field once the user leaves it, then live-clear errors.
    form.querySelectorAll("input, textarea").forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
      field.addEventListener("input", function () {
        if (field.closest(".field").classList.contains("has-error")) {
          validateField(field);
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (status) {
        status.textContent = "";
        status.className = "form-status";
      }

      const fields = Array.from(form.querySelectorAll("input, textarea"));
      let firstInvalid = null;
      let valid = true;

      fields.forEach(function (field) {
        const ok = validateField(field);
        if (!ok && !firstInvalid) firstInvalid = field;
        valid = valid && ok;
      });

      if (!valid) {
        if (firstInvalid) firstInvalid.focus();
        if (status) {
          status.textContent = "Please fix the highlighted fields.";
          status.classList.add("is-error");
        }
        return;
      }

      submitForm();
    });
  }

  // Where to send mail if Formspree isn't configured yet.
  const CONTACT_EMAIL = "viral.lathiya.iosdev@gmail.com";

  function setStatus(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.className = "form-status" + (type ? " is-" + type : "");
  }

  function resetButton(btn) {
    if (!btn) return;
    btn.disabled = false;
    btn.innerHTML = '<span aria-hidden="true">✉</span> Send message';
  }

  // mailto fallback — opens the visitor's email client pre-filled.
  function mailtoFallback() {
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    const subject = encodeURIComponent("Portfolio enquiry from " + name);
    const body = encodeURIComponent(
      message + "\n\n— " + name + " (" + email + ")"
    );
    window.location.href =
      "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    setStatus("Opening your email app… if nothing happens, email me directly.", "success");
  }

  function submitForm() {
    const submitBtn = form.querySelector('button[type="submit"]');
    const action = form.getAttribute("action") || "";
    const configured = action.indexOf("formspree.io") !== -1 &&
      action.indexOf("your-form-id") === -1;

    // No real endpoint wired up yet → use the mailto fallback.
    if (!configured) {
      mailtoFallback();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }
    setStatus("", null);

    fetch(action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          setStatus("Thanks — your message has been sent. I'll be in touch soon.", "success");
        } else {
          return res.json().then(function (data) {
            const msg =
              data && data.errors && data.errors.length
                ? data.errors.map(function (er) { return er.message; }).join(", ")
                : "Something went wrong. Please email me directly instead.";
            setStatus(msg, "error");
          });
        }
      })
      .catch(function () {
        setStatus(
          "Network error — please try again, or email " + CONTACT_EMAIL + " directly.",
          "error"
        );
      })
      .finally(function () {
        resetButton(submitBtn);
      });
  }

  /* -------------------------------------------------------
     Project video demos — modal lightbox
     - One shared modal serves every project.
     - The YouTube iframe is created only when a video is
       opened (lazy), so no YouTube code loads on first paint.
     - Closing destroys the iframe, which stops playback and
       frees memory.
     - Replace each button's data-video-id="VIDEO_ID" with the
       real 11-char YouTube id (the part after `watch?v=`).
     ------------------------------------------------------- */
  const modal = document.getElementById("videoModal");
  const modalFrame = document.getElementById("videoModalFrame");
  const modalTitle = document.getElementById("videoModalTitle");
  const videoTriggers = document.querySelectorAll(".video-trigger");
  let lastFocused = null;

  function openVideo(opts) {
    if (!modal || !modalFrame) return;
    const id = opts.id;
    const src = opts.src;
    const title = opts.title;

    // Resolve the embed URL: a direct src (YouTube/Vimeo/Google Drive/…)
    // takes precedence; otherwise build a YouTube embed from the id.
    let embedSrc = "";
    if (src && src !== "VIDEO_SRC") {
      embedSrc = src + (src.indexOf("?") === -1 ? "?autoplay=1" : "&autoplay=1");
    } else if (id && id !== "VIDEO_ID") {
      embedSrc =
        "https://www.youtube-nocookie.com/embed/" +
        encodeURIComponent(id) +
        "?autoplay=1&rel=0";
    } else {
      // No real video wired up yet — fail gracefully, don't open an empty box.
      window.alert("Demo video coming soon.");
      return;
    }

    modalFrame.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = embedSrc;
    iframe.title = title || "Project demo video";
    iframe.loading = "lazy";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    modalFrame.appendChild(iframe);

    if (modalTitle && title) modalTitle.textContent = title;

    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("no-scroll");

    const closeBtn = modal.querySelector(".video-modal-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeVideo() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modalFrame.innerHTML = ""; // stops playback + releases the iframe
    document.body.classList.remove("no-scroll");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  videoTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      openVideo({
        id: trigger.dataset.videoId,
        src: trigger.dataset.videoSrc,
        title: trigger.dataset.videoTitle,
      });
    });
  });

  if (modal) {
    // Close via the X button or by clicking the backdrop.
    modal.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", closeVideo);
    });

    document.addEventListener("keydown", function (e) {
      if (modal.hidden) return;
      if (e.key === "Escape") {
        closeVideo();
        return;
      }
      // Minimal focus trap: keep Tab within the dialog.
      if (e.key === "Tab") {
        const focusable = modal.querySelectorAll(
          'button, [href], iframe, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* -------------------------------------------------------
     Footer year
     ------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
