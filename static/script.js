// -------------------------------
// Reaction progress animation
// -------------------------------
const rxnBar = document.getElementById("rxnBar");
let w = 12;
setInterval(() => {
  w += Math.random() * 7;
  if (w > 96) w = 18;
  rxnBar.style.width = `${w}%`;
}, 550);

// -------------------------------
// BOUNCING, UN-CATCHABLE "NO"
// -------------------------------
const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");

if (!noBtn) {
  console.error("No button not found. Ensure index.html has id='noBtn'.");
}

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Physics-ish settings (tune these)
const repelRadius = 220;      // start repelling when cursor within this distance
const strongRadius = 140;     // stronger push when very close
const baseSpeed = 4.2;        // normal drifting speed
const maxSpeed = 13;          // cap speed so it doesn't teleport
const friction = 0.985;       // slows down slightly over time
const jitter = 0.06;          // tiny random movement to keep it lively

// Position + velocity (screen coords)
let x = window.innerWidth * 0.62;
let y = window.innerHeight * 0.68;
let vx = (Math.random() < 0.5 ? -1 : 1) * baseSpeed;
let vy = (Math.random() < 0.5 ? -1 : 1) * (baseSpeed * 0.8);

function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

function getBounds() {
  const r = noBtn.getBoundingClientRect();
  const pad = 10;
  return {
    minX: pad,
    minY: pad,
    maxX: window.innerWidth - r.width - pad,
    maxY: window.innerHeight - r.height - pad,
    w: r.width,
    h: r.height
  };
}

function place() {
  noBtn.style.left = `${x}px`;
  noBtn.style.top  = `${y}px`;
}

// track cursor
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// mobile: treat touch like mouse proximity
document.addEventListener("touchmove", (e) => {
  if (e.touches && e.touches[0]) {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
  }
}, { passive: true });

// If she somehow clicks No, bounce harder (still doesn't change text)
noBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  // kick it away from cursor
  const r = noBtn.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const dx = cx - mouseX;
  const dy = cy - mouseY;
  const d = Math.max(1, Math.hypot(dx, dy));
  vx += (dx / d) * 10;
  vy += (dy / d) * 10;

  // also pulse YES a bit
  yesBtn?.animate(
    [{transform:"scale(1)"},{transform:"scale(1.10)"},{transform:"scale(1)"}],
    {duration: 600}
  );
});

function tick() {
  if (!noBtn) return;

  const b = getBounds();
  const r = noBtn.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  // Repulsion force from cursor when close
  const dx = cx - mouseX;
  const dy = cy - mouseY;
  const dist = Math.max(1, Math.hypot(dx, dy));

  if (dist < repelRadius) {
    // Force grows as cursor gets closer
    const strength = (repelRadius - dist) / repelRadius; // 0..1
    const boost = dist < strongRadius ? 2.2 : 1.0;

    vx += (dx / dist) * (1.2 + 10 * strength) * boost;
    vy += (dy / dist) * (1.2 + 10 * strength) * boost;
  }

  // Add tiny random jitter so it never settles
  vx += (Math.random() - 0.5) * jitter;
  vy += (Math.random() - 0.5) * jitter;

  // Apply friction
  vx *= friction;
  vy *= friction;

  // Keep it moving at least a bit
  const speed = Math.hypot(vx, vy);
  if (speed < baseSpeed) {
    const s = baseSpeed / Math.max(0.001, speed);
    vx *= s;
    vy *= s;
  }

  // Cap speed
  const sp = Math.hypot(vx, vy);
  if (sp > maxSpeed) {
    const s = maxSpeed / sp;
    vx *= s;
    vy *= s;
  }

  // Update position
  x += vx;
  y += vy;

  // Bounce off walls
  if (x <= b.minX) { x = b.minX; vx = Math.abs(vx); }
  if (x >= b.maxX) { x = b.maxX; vx = -Math.abs(vx); }
  if (y <= b.minY) { y = b.minY; vy = Math.abs(vy); }
  if (y >= b.maxY) { y = b.maxY; vy = -Math.abs(vy); }

  place();
  requestAnimationFrame(tick);
}

// Start with a safe in-bounds position
window.addEventListener("load", () => {
  if (!noBtn) return;
  const b = getBounds();
  x = clamp(x, b.minX, b.maxX);
  y = clamp(y, b.minY, b.maxY);
  place();
  requestAnimationFrame(tick);
});

window.addEventListener("resize", () => {
  if (!noBtn) return;
  const b = getBounds();
  x = clamp(x, b.minX, b.maxX);
  y = clamp(y, b.minY, b.maxY);
  place();
});