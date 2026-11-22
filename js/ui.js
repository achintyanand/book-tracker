/**
 * Small UI helpers: toast, reset dialog and the celebration.
 */

const Toast = {
  _timer: null,
  _icons: {
    success: 'fa-circle-check toast__icon--success',
    info: 'fa-circle-info toast__icon--info',
    warn: 'fa-bell toast__icon--warn',
  },

  show(message, type = 'success') {
    $('toastMessage').textContent = message;
    $('toastIcon').className = `fa-solid ${this._icons[type] || this._icons.success} toast__icon`;

    const toast = $('toast');
    toast.classList.add('is-visible');
    clearTimeout(this._timer);
    this._timer = setTimeout(() => toast.classList.remove('is-visible'), TOAST_DURATION_MS);
  },
};

const ResetDialog = {
  open() {
    const dialog = $('resetDialog');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  },

  close() {
    $('resetDialog').close();
  },
};

const Celebration = {
  /** Golden confetti from both sides for ~3 seconds. */
  fire() {
    if (typeof confetti !== 'function' || prefersReducedMotion()) return;

    const duration = 3000;
    const end = Date.now() + duration;
    const base = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000, colors: CONFETTI_COLORS };
    const between = (min, max) => Math.random() * (max - min) + min;

    const timer = setInterval(() => {
      const timeLeft = end - Date.now();
      if (timeLeft <= 0) return clearInterval(timer);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...base, particleCount, origin: { x: between(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...base, particleCount, origin: { x: between(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  },
};
