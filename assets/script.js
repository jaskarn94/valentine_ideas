function runStagger() {
  const blocks = document.querySelectorAll(".stagger");
  blocks.forEach((block, index) => {
    window.setTimeout(() => {
      block.classList.add("is-visible");
    }, 180 + index * 170);
  });
}

function scrambleText(node) {
  const source = node.dataset.source || node.textContent;
  node.dataset.source = source;

  const chars = "!<>-_/[]{}=+*^?#";
  let frame = 0;
  const duration = 8;

  const timer = window.setInterval(() => {
    frame += 1;
    const amount = frame / duration;
    node.textContent = source
      .split("")
      .map((ch, idx) => {
        if (ch === " ") {
          return " ";
        }
        return idx < source.length * amount
          ? source[idx]
          : chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");

    if (frame >= duration) {
      window.clearInterval(timer);
      node.textContent = source;
    }
  }, 35);
}

function runGlitch() {
  const nodes = document.querySelectorAll("[data-glitch]");
  if (!nodes.length) {
    return;
  }

  const pulse = () => {
    const node = nodes[Math.floor(Math.random() * nodes.length)];
    scrambleText(node);
  };

  pulse();
  window.setInterval(pulse, 3200);
}

function runWarningCountdown() {
  const countdownNode = document.querySelector("[data-countdown]");
  if (!countdownNode) {
    return;
  }

  const loader = document.getElementById("decryptLoader");
  const bar = document.getElementById("progressBar");
  const button = document.getElementById("openFileBtn");

  let remaining = 10;
  countdownNode.textContent = String(remaining);

  const countdownTimer = window.setInterval(() => {
    remaining -= 1;
    countdownNode.textContent = String(Math.max(remaining, 0));

    if (remaining > 0) {
      return;
    }

    window.clearInterval(countdownTimer);
    loader.classList.remove("hidden");

    let percent = 0;
    const loadTimer = window.setInterval(() => {
      percent += 5;
      bar.style.width = `${percent}%`;
      if (percent < 100) {
        return;
      }

      window.clearInterval(loadTimer);
      button.classList.remove("hidden");
      button.addEventListener("click", () => {
        window.location.href = "./reveal.html";
      });
    }, 80);
  }, 1000);
}

function runRevealNote() {
  const button = document.getElementById("yesBtn");
  const note = document.getElementById("loveNote");
  if (!button || !note) {
    return;
  }

  button.addEventListener("click", () => {
    note.classList.remove("hidden");
    button.textContent = "You just made this heart very happy";
    button.disabled = true;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  runStagger();
  runGlitch();
  runWarningCountdown();
  runRevealNote();
});
