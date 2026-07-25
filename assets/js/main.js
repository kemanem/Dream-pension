/* ==========================================================================
   DREAM PENSION — SHARED BEHAVIOR
   Navbar scroll-awareness, mobile menu, scroll-reveal, lazy-load fade-in,
   gallery filter/lightbox, contact form validation + submission.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Navbar: scroll-aware show/hide + glass intensify ---------- */
  var navbar = document.querySelector(".navbar");
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    if (navbar) {
      navbar.classList.toggle("is-scrolled", y > 8);
      if (y > lastY && y > 140) {
        navbar.classList.add("is-hidden");
      } else {
        navbar.classList.remove("is-hidden");
      }
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");
  if (toggle && menu) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el, i) {
      el.style.setProperty("--i", (i % 6));
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Lazy image fade-in + sequenced loading ---------- */
  var lazyImgs = document.querySelectorAll('img[loading="lazy"]');
  if ("IntersectionObserver" in window && lazyImgs.length) {
    var imgIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var img = entry.target;
        if (entry.isIntersecting) {
          if (img.complete) {
            img.classList.add("is-loaded");
          } else {
            img.addEventListener("load", function () { img.classList.add("is-loaded"); }, { once: true });
          }
          imgIO.unobserve(img);
        }
      });
    }, { rootMargin: "200px 0px" });
    lazyImgs.forEach(function (img) { imgIO.observe(img); });
  } else {
    lazyImgs.forEach(function (img) { img.classList.add("is-loaded"); });
  }
  document.querySelectorAll('img:not([loading="lazy"])').forEach(function (img) {
    img.classList.add("is-loaded");
  });

  /* ---------- Gallery: filter chips ---------- */
  var chips = document.querySelectorAll(".filter-chip");
  var items = document.querySelectorAll(".masonry-item");
  if (chips.length && items.length) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        chip.setAttribute("aria-pressed", "true");
        var group = chip.dataset.filter;
        items.forEach(function (item) {
          var show = group === "all" || item.dataset.category === group;
          item.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ---------- Gallery: lightbox ---------- */
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbClose = lightbox.querySelector(".lightbox-close");
    document.querySelectorAll(".masonry-item img").forEach(function (img) {
      img.addEventListener("click", function () {
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    });
    function closeLightbox() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    lbClose && lbClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });
  }

  /* ---------- "Enquire about this room" -> prefill Contact subject ---------- */
  document.querySelectorAll("[data-enquire]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var subject = btn.getAttribute("data-enquire");
      var href = btn.getAttribute("href") || "contact.html";
      var url = href.split("#")[0] + "?subject=" + encodeURIComponent(subject);
      btn.setAttribute("href", url);
    });
  });

  /* ---------- Contact form: validation + submission ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var params = new URLSearchParams(window.location.search);
    var subjectParam = params.get("subject");
    if (subjectParam) {
      var msgField = form.querySelector("#message");
      var subjField = form.querySelector("#subject");
      if (subjField) subjField.value = subjectParam;
      if (msgField && !msgField.value) {
        msgField.value = "Hello, I would like to enquire about: " + subjectParam + ".\n\n";
      }
    }

    var statusBox = form.querySelector(".form-status");

    function setError(fieldWrap, message) {
      fieldWrap.classList.toggle("has-error", !!message);
      var err = fieldWrap.querySelector(".field-error");
      if (err) err.textContent = message || "";
    }

    function validate() {
      var valid = true;
      var name = form.querySelector("#name");
      var email = form.querySelector("#email");
      var message = form.querySelector("#message");

      var nameWrap = name.closest(".field");
      var emailWrap = email.closest(".field");
      var messageWrap = message.closest(".field");

      if (!name.value.trim()) { setError(nameWrap, "Please enter your name."); valid = false; }
      else setError(nameWrap, "");

      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailPattern.test(email.value.trim())) {
        setError(emailWrap, "Please enter a valid email address."); valid = false;
      } else setError(emailWrap, "");

      if (!message.value.trim()) { setError(messageWrap, "Please enter a message."); valid = false; }
      else setError(messageWrap, "");

      return valid;
    }

    function showStatus(type, text) {
      statusBox.className = "form-status is-visible " + type;
      statusBox.textContent = text;
      statusBox.setAttribute("role", "status");
      statusBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var honeypot = form.querySelector('input[name="company"]');
      if (honeypot && honeypot.value) {
        showStatus("success", "Thank you — your inquiry has been sent. We'll reply within 24 hours.");
        form.reset();
        return;
      }

      if (!validate()) {
        showStatus("error", "Please fix the highlighted fields and try again.");
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";

      var action = form.getAttribute("action");
      var isConfigured = action && action.indexOf("YOUR_FORM_ID") === -1;

      var finish = function (ok) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
        if (ok) {
          showStatus("success", "Thank you — your inquiry has been sent. We'll reply within 24 hours.");
          form.reset();
        } else {
          showStatus("error", "Something went wrong sending your message. Please try again, or call us directly.");
        }
      };

      if (!isConfigured) {
        console.warn("Contact form: set a real Formspree endpoint in contact.html's <form action>.");
        window.setTimeout(function () { finish(true); }, 700);
        return;
      }

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        finish(res.ok);
      }).catch(function () {
        finish(false);
      });
    });

    ["name", "email", "message"].forEach(function (id) {
      var el = form.querySelector("#" + id);
      if (el) el.addEventListener("blur", validate);
    });
  }

  /* ---------- Active nav link fallback ---------- */
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(function (a) {
    var target = a.getAttribute("href");
    if (target === here || (here === "" && target === "index.html")) {
      a.setAttribute("aria-current", "page");
    }
  });
})();
