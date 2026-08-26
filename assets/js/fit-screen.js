(function () {
  var STORAGE_KEY = 'ocac-fit-screen';
  var toggle = document.getElementById('fit-screen-toggle');
  var stage = document.querySelector('.fit-stage');
  var scaler = document.querySelector('.fit-scaler');
  var content = document.querySelector('.fit-content');
  if (!toggle || !stage || !scaler || !content) return;

  document.body.classList.add('song-view');

  function isFitEnabled() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return true;
    return saved === 'true';
  }

  function clearScale() {
    content.style.transform = '';
    content.style.width = '';
    scaler.style.width = '';
    scaler.style.height = '';
    stage.style.height = '';
  }

  function setFitEnabled(on) {
    localStorage.setItem(STORAGE_KEY, on ? 'true' : 'false');
    document.body.classList.toggle('fit-screen', on);
    toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    toggle.classList.toggle('fit-toggle--active', on);
    toggle.textContent = on ? 'Fit to screen' : 'Scroll mode';
    if (on) {
      requestAnimationFrame(function () {
        requestAnimationFrame(applyScale);
      });
    } else {
      clearScale();
    }
  }

  function getAvailableSize() {
    var header = document.querySelector('.site-header');
    var controls = document.querySelector('.song-controls');
    var headerH = header ? header.offsetHeight : 58;
    var controlsH = controls && document.body.classList.contains('fit-screen') ? controls.offsetHeight : 0;
    var pad = 8;
    return {
      width: Math.max(stage.clientWidth - pad * 2, 180),
      height: Math.max(window.innerHeight - headerH - controlsH - pad * 2, 180)
    };
  }

  function applyScale() {
    if (!document.body.classList.contains('fit-screen')) return;

    clearScale();

    var avail = getAvailableSize();
    var naturalW = content.offsetWidth;
    var naturalH = content.scrollHeight;
    if (!naturalW || !naturalH) return;

    var scaleX = avail.width / naturalW;
    var scaleY = avail.height / naturalH;
    var scale = Math.min(scaleX, scaleY);
    scale = Math.max(0.22, Math.min(scale, 2.8));

    var scaledW = Math.ceil(naturalW * scale);
    var scaledH = Math.ceil(naturalH * scale);

    content.style.width = naturalW + 'px';
    content.style.transform = 'scale(' + scale + ')';
    content.style.transformOrigin = 'top left';
    scaler.style.width = scaledW + 'px';
    scaler.style.height = scaledH + 'px';
    stage.style.height = scaledH + 'px';
  }

  toggle.addEventListener('click', function () {
    setFitEnabled(!document.body.classList.contains('fit-screen'));
  });

  window.addEventListener('resize', applyScale);
  window.addEventListener('orientationchange', function () {
    setTimeout(applyScale, 120);
  });

  document.addEventListener('chord-sheet-rendered', applyScale);

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () {
      applyScale();
    }).observe(content);
  }

  setFitEnabled(isFitEnabled());
})();
