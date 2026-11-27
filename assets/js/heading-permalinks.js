(function () {
  const root = document.documentElement;
  const masthead = null; // Popp has no fixed masthead.
  let copiedTimerId = 0;

  function getHeaderLinks() {
    return Array.from(document.querySelectorAll("main .header-link"));
  }

  function getPermalink(targetHash) {
    const url = new URL(document.querySelector('link[rel="canonical"]').href);
    url.hash = targetHash;
    return url.toString();
  }

  function setMastheadOffset() {
    if (!masthead) {
      return 0;
    }

    const offset = Math.ceil(masthead.getBoundingClientRect().height);
    root.style.setProperty("--ifc-masthead-offset", offset + "px");
    return offset;
  }

  function getHashTarget() {
    if (!window.location.hash) {
      return null;
    }

    try {
      return document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    } catch {
      return null;
    }
  }

  function getScrollTarget(target) {
    if (target && target.matches(".ifc-faq-entry__title")) {
      return target.closest(".ifc-faq-entry") || target;
    }

    return target;
  }

  function scrollHashTargetIntoPlace() {
    const target = getHashTarget();

    if (!target) {
      return;
    }

    const scrollTarget = getScrollTarget(target);
    const mastheadOffset = setMastheadOffset() + 12;
    const top = Math.max(0, Math.round(scrollTarget.getBoundingClientRect().top + window.scrollY - mastheadOffset));

    window.scrollTo({
      top: top,
      behavior: "auto"
    });
  }

  function queueHashTargetScroll() {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(scrollHashTargetIntoPlace);
    });
  }

  function announce(message) {
    const toast = document.querySelector("[data-permalink-toast]");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(copiedTimerId);
    copiedTimerId = window.setTimeout(function () {
      toast.classList.remove("is-visible");
      toast.textContent = "";
    }, 1600);
  }

  function markCopied() {
    announce("Copied to clipboard");
  }

  function fallbackCopy(text) {
    const activeElement = document.activeElement;
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "1px";
    textarea.style.height = "1px";
    textarea.style.padding = "0";
    textarea.style.border = "0";
    textarea.style.outline = "0";
    textarea.style.boxShadow = "none";
    textarea.style.background = "transparent";
    textarea.style.color = "transparent";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    textarea.style.zIndex = "-1";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;

    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    document.body.removeChild(textarea);

    if (activeElement && typeof activeElement.focus === "function") {
      activeElement.focus();
    }

    return copied;
  }

  function copyPermalink(link) {
    const href = link.getAttribute("href");

    if (!href || href.charAt(0) !== "#") {
      return Promise.resolve(false);
    }

    const permalink = getPermalink(href);

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(permalink).then(function () {
        markCopied(link);
        return true;
      }, function () {
        if (fallbackCopy(permalink)) {
          markCopied(link);
          return true;
        }

        return false;
      });
    }

    if (fallbackCopy(permalink)) {
      markCopied(link);
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }

  function handlePermalinkActivation(event, link) {
    event.preventDefault();
    event.stopPropagation();
    copyPermalink(link).then(function (copied) {
      if (!copied) announce("Could not copy the heading link.");
    });
  }

  function syncHeaderLinks() {
    getHeaderLinks().forEach(function (link) {
      Array.from(link.childNodes).forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === "Permalink") {
          node.remove();
        } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("sr-only")) {
          node.remove();
        }
      });

      if (!link.hasAttribute("aria-label") || link.getAttribute("aria-label") === "Permalink copied") {
        link.setAttribute("aria-label", "Copy permalink");
      }

      if (!link.title || link.title === "Permalink") {
        link.title = "Copy permalink";
      }

      if (link.dataset.ifcPermalinkBound === "true") {
        return;
      }

      link.dataset.ifcPermalinkBound = "true";
      link.addEventListener("click", function (event) {
        handlePermalinkActivation(event, link);
      });
      link.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        handlePermalinkActivation(event, link);
      });
    });
  }

  const toast = document.createElement("span");
  toast.className = "permalink-feedback";
  toast.setAttribute("role", "status");
  toast.setAttribute("data-permalink-toast", "");
  document.body.appendChild(toast);

  for (const heading of document.querySelectorAll("main .reading h2, main .reading h3, main .reading h4, main .hub-section > h2")) {
    if (heading.closest("nav, dialog, .ifc-annotation-layer, [hidden]") || !heading.textContent.trim()) continue;
    if (heading.querySelector(".header-link")) continue;
    if (!heading.id) {
      const slug = heading.textContent.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
      let id = slug;
      for (let suffix = 2; document.getElementById(id); suffix++) id = slug + "-" + suffix;
      heading.id = id;
    }

    const link = document.createElement("a");
    link.className = "header-link";
    link.href = "#" + encodeURIComponent(heading.id);
    link.setAttribute("aria-label", "Copy link to " + heading.textContent.trim());
    heading.append(link);
  }

  setMastheadOffset();
  syncHeaderLinks();
  window.addEventListener("resize", setMastheadOffset);
  window.addEventListener("load", function () {
    setMastheadOffset();
    syncHeaderLinks();
    queueHashTargetScroll();
  });
  window.addEventListener("hashchange", function () {
    setMastheadOffset();
    syncHeaderLinks();
    queueHashTargetScroll();
  });
})();
