/**
 * Marketplace homepage interactions: carousels, copy host, explore filters.
 */

function stepWidth(track: HTMLElement): number {
  const card = track.querySelector(".m-card") as HTMLElement | null;
  const gap = 16;
  return (card?.offsetWidth ?? 280) + gap;
}

function initCarousel(section: HTMLElement) {
  if (section.dataset.carouselReady === "1") return;
  const root = section.querySelector<HTMLElement>("[data-carousel-root]");
  const track = section.querySelector<HTMLElement>("[data-carousel-track]");
  const prev = section.querySelector<HTMLButtonElement>("[data-carousel-prev]");
  const next = section.querySelector<HTMLButtonElement>("[data-carousel-next]");
  if (!root || !track || !prev || !next) return;
  section.dataset.carouselReady = "1";

  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft >= max;
    prev.disabled = atStart;
    next.disabled = atEnd;
    root.classList.toggle("is-at-start", atStart);
    root.classList.toggle("is-at-end", atEnd || max <= 0);
  };

  prev.addEventListener("click", () => {
    track.scrollBy({ left: -stepWidth(track), behavior: "smooth" });
  });
  next.addEventListener("click", () => {
    track.scrollBy({ left: stepWidth(track), behavior: "smooth" });
  });

  track.addEventListener("scroll", () => requestAnimationFrame(update), {
    passive: true,
  });
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      track.scrollBy({ left: stepWidth(track), behavior: "smooth" });
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      track.scrollBy({ left: -stepWidth(track), behavior: "smooth" });
    }
  });

  // Pointer drag to scroll — must not swallow Join / Copy clicks.
  // Production trackpads often move >4px on a "click", which used to
  // preventDefault() the card links (worked in careful local clicks).
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let suppressClick = false;
  const DRAG_THRESHOLD_PX = 12;

  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = e.target as HTMLElement | null;
    // Let anchors/buttons receive the full click; don't start a drag.
    if (el?.closest("a, button, input, textarea, select, label")) return;

    dragging = true;
    suppressClick = false;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
    track.classList.add("is-dragging");
  });

  track.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX) suppressClick = true;
    track.scrollLeft = startScroll - dx;
  });

  const endDrag = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
    try {
      track.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);

  // Only block the click that ends a real drag (not link clicks).
  track.addEventListener(
    "click",
    (e) => {
      if (!suppressClick) return;
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
    },
    true,
  );

  update();
  window.addEventListener("resize", update, { passive: true });
}

function initCarousels() {
  document
    .querySelectorAll<HTMLElement>(".m-carousel")
    .forEach((section) => initCarousel(section));
}

function initCopyButtons() {
  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((btn) => {
    if (btn.dataset.copyReady === "1") return;
    btn.dataset.copyReady = "1";
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy ?? "";
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        const prev = btn.textContent;
        btn.textContent = "Copied";
        btn.classList.add("is-copied");
        window.setTimeout(() => {
          btn.textContent = prev;
          btn.classList.remove("is-copied");
        }, 1400);
      } catch {
        btn.textContent = "Fail";
        window.setTimeout(() => {
          btn.textContent = "Copy";
        }, 1200);
      }
    });
  });
}

function initExplore() {
  const root = document.querySelector<HTMLElement>("[data-explore]");
  if (!root || root.dataset.exploreReady === "1") return;
  root.dataset.exploreReady = "1";

  const search = root.querySelector<HTMLInputElement>("[data-explore-search]");
  const chips = root.querySelectorAll<HTMLButtonElement>("[data-explore-tag]");
  const cards = root.querySelectorAll<HTMLElement>("[data-explore-card]");
  const empty = root.querySelector<HTMLElement>("[data-explore-empty]");
  const countEl = root.querySelector<HTMLElement>("[data-explore-count]");

  let activeTag = "all";

  const apply = () => {
    const q = (search?.value ?? "").trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const tags = (card.dataset.tags ?? "").split(",").filter(Boolean);
      const name = card.dataset.name ?? "";
      const blurb = card.dataset.blurb ?? "";
      const tagOk = activeTag === "all" || tags.includes(activeTag);
      const qOk =
        !q ||
        name.includes(q) ||
        blurb.includes(q) ||
        tags.some((t) => t.toLowerCase().includes(q));
      const show = tagOk && qOk;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible > 0;
    if (countEl) {
      countEl.textContent =
        visible === 1 ? "1 community" : `${visible} communities`;
    }
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeTag = chip.dataset.exploreTag ?? "all";
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      apply();
    });
  });

  search?.addEventListener("input", () => apply());
  apply();
}

function initMarket() {
  initCarousels();
  initCopyButtons();
  initExplore();
}

initMarket();
document.addEventListener("astro:page-load", initMarket);
