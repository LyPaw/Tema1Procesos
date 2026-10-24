/* ============================================================
   UD1 · Programación Multiproceso en Java — script.js
   Funcionalidad: modo oscuro, búsqueda, copias, menú móvil,
   progreso, soluciones desplegables, filtros de propuestos
   ============================================================ */

(function () {
  "use strict";

  /* ---------------- Modo oscuro ---------------- */
  const btnDark = document.getElementById("btn-dark");
  const htmlEl = document.documentElement;

  function cargarTema() {
    const guardado = localStorage.getItem("ud1-tema");
    if (guardado === "dark") {
      htmlEl.setAttribute("data-theme", "dark");
      btnDark.textContent = "☀️";
    } else {
      htmlEl.removeAttribute("data-theme");
      btnDark.textContent = "🌙";
    }
  }

  btnDark.addEventListener("click", () => {
    const esOscuro = htmlEl.getAttribute("data-theme") === "dark";
    if (esOscuro) {
      htmlEl.removeAttribute("data-theme");
      localStorage.setItem("ud1-tema", "light");
      btnDark.textContent = "🌙";
    } else {
      htmlEl.setAttribute("data-theme", "dark");
      localStorage.setItem("ud1-tema", "dark");
      btnDark.textContent = "☀️";
    }
  });

  cargarTema();

  /* ---------------- Menú móvil ---------------- */
  const btnMenu = document.getElementById("btn-menu");
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");

  btnMenu.addEventListener("click", () => {
    const open = sidebar.classList.toggle("open");
    btnMenu.setAttribute("aria-expanded", open);
  });

  // Cerrar menú al hacer clic en un enlace del sidebar
  document.querySelectorAll(".sidebar nav a").forEach((a) => {
    a.addEventListener("click", () => {
      sidebar.classList.remove("open");
      btnMenu.setAttribute("aria-expanded", "false");
    });
  });

  // Cerrar menú al hacer clic fuera
  main.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      btnMenu.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------------- Copiar código ---------------- */
  window.copyCode = function (button) {
    const codeBlock = button.closest(".code-block");
    if (!codeBlock) return;
    const code = codeBlock.querySelector("pre code");
    if (!code) return;
    const text = code.innerText;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => mostrarCopiado(button))
        .catch(() => fallbackCopy(text, button));
    } else {
      fallbackCopy(text, button);
    }
  };

  function fallbackCopy(text, button) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      mostrarCopiado(button);
    } catch (e) {
      button.textContent = "Selecciona el código";
      setTimeout(() => (button.textContent = "Copiar"), 1500);
    } finally {
      ta.remove();
    }
  }

  function mostrarCopiado(button) {
    const prev = button.textContent;
    button.textContent = "¡Copiado!";
    button.style.color = "#34c759";
    setTimeout(() => {
      button.textContent = prev;
      button.style.color = "";
    }, 1300);
  }

  /* ---------------- Búsqueda ---------------- */
  const searchInput = document.getElementById("search");
  let searchStatus = null;

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLocaleLowerCase("es");
    let visible = 0;

    document.querySelectorAll("section[data-searchable]").forEach((s) => {
      const match = !q || s.innerText.toLocaleLowerCase("es").includes(q);
      s.classList.toggle("hidden-by-search", !match);
      if (match) visible++;
    });

    if (!searchStatus) {
      searchStatus = document.createElement("div");
      searchStatus.id = "searchStatus";
      searchStatus.className = "search-status";
      document.querySelector(".topbar").after(searchStatus);
    }

    searchStatus.textContent = q
      ? `${visible} sección(es) coinciden con “${searchInput.value}”.`
      : "Busca términos como fork, BCP, SIGUSR1, waitFor, ExecutorService…";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === "Escape") {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));
      searchInput.blur();
      sidebar.classList.remove("open");
      btnMenu.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------------- Progreso del temario ---------------- */
  const checkItems = [
    { id: "a", label: "Puedo explicar concurrencia, paralelismo y distribución sin confundirlos." },
    { id: "b", label: "Conozco las partes del BCP y las transiciones de estados." },
    { id: "c", label: "Recuerdo los tres retornos posibles de fork()." },
    { id: "d", label: "Puedo escribir un pipe con padre e hijo y cerrar los extremos correctos." },
    { id: "e", label: "Diferencio FIFO, señales, signal(), kill(), pause() y sleep()." },
    { id: "f", label: "Puedo lanzar un proceso con ProcessBuilder, leer su salida y recoger su código de retorno." },
    { id: "g", label: "Sé crear hilos con Thread, Runnable y ExecutorService." },
    { id: "h", label: "Entiendo synchronized, Lock y wait/notify." },
    { id: "i", label: "Conozco los problemas clásicos: carrera, deadlock, inanición." },
    { id: "j", label: "Sé gestionar prioridades, join(), sleep() e interrupt()." },
  ];

  const progressContainer = document.getElementById("progreso-checks");
  const progressFill = document.getElementById("progress-fill");
  const progressPercent = document.getElementById("progress-percent");
  const progressHint = document.getElementById("progress-hint");
  const btnReset = document.getElementById("btn-reset-progreso");

  // Renderizar checks si existe el contenedor (se añade al inicio)
  if (progressContainer) {
    checkItems.forEach((item) => {
      const guardado = localStorage.getItem("ud1-progreso-" + item.id) === "1";
      const label = document.createElement("label");
      label.className = "checkline" + (guardado ? " done" : "");
      label.innerHTML = `
        <input type="checkbox" data-progreso="${item.id}" ${guardado ? "checked" : ""}>
        <span>${item.label}</span>
      `;
      progressContainer.appendChild(label);
    });

    const checks = document.querySelectorAll('[data-progreso]');

    function actualizarProgreso() {
      const n = Array.from(checks).filter((c) => c.checked).length;
      const pct = Math.round((n / checks.length) * 100);
      progressFill.style.width = pct + "%";
      progressPercent.textContent = pct + "%";
      progressHint.textContent = `${n} de ${checks.length} completados`;
    }

    checks.forEach((c) => {
      c.addEventListener("change", () => {
        localStorage.setItem(
          "ud1-progreso-" + c.dataset.progreso,
          c.checked ? "1" : "0"
        );
        c.closest(".checkline").classList.toggle("done", c.checked);
        actualizarProgreso();
      });
    });

    if (btnReset) {
      btnReset.addEventListener("click", () => {
        checks.forEach((c) => {
          c.checked = false;
          localStorage.removeItem("ud1-progreso-" + c.dataset.progreso);
          c.closest(".checkline").classList.remove("done");
        });
        actualizarProgreso();
      });
    }

    actualizarProgreso();
  }

  /* ---------------- Soluciones desplegables (propuestos) ---------------- */
  window.toggleSolucion = function (btn, id) {
    const sol = document.getElementById(id);
    if (!sol) return;
    const visible = sol.style.display === "block";
    sol.style.display = visible ? "none" : "block";
    btn.textContent = visible ? "Ver solución" : "Ocultar solución";
    if (!visible) {
      sol.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  /* ---------------- Filtro ejercicios propuestos ---------------- */
  window.filterPropuestos = function (tipo) {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    document.getElementById("chip-" + (tipo === "todos" ? "todos" : tipo)).classList.add("active");

    document.querySelectorAll(".proposed-card").forEach((card) => {
      const dif = card.dataset.dificultad;
      const mostrar = tipo === "todos" || dif === tipo;
      card.style.display = mostrar ? "" : "none";
    });
  };

  /* ---------------- Resaltar sección activa al hacer scroll ---------------- */
  const observerOptions = { threshold: 0.18, rootMargin: "-100px 0% -60% 0%" };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        document.querySelectorAll(".nav-link").forEach((a) => {
          a.classList.remove("active");
          if (a.getAttribute("href") === "#" + id) {
            a.classList.add("active");
          }
        });
      }
    });
  }, observerOptions);

  document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));

  /* ---------------- Botón imprimir mejorado ---------------- */
  document.getElementById("btn-print")?.addEventListener("click", () => window.print());
})();
