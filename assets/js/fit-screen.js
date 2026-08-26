(function () {
  var STORAGE_KEY = 'ocac-fit-screen';
  var toggle = document.getElementById('fit-screen-toggle');
  var stage = document.querySelector('.fit-stage');
  var scaler = document.querySelector('.fit-scaler');
  var content = document.querySelector('.fit-content');
  var hint = document.querySelector('.fit-hint');
  if (!toggle || !stage || !scaler || !content) return;

  document.body.classList.add('song-view');

  function isFitEnabled() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return true;
    return saved === 'true';
  }

  function clearLayout() {
    content.style.transform = '';
    content.style.width = '';
    scaler.style.width = '';
    scaler.style.height = '';
    stage.style.height = '';
    document.body.classList.remove('fit-cols-2', 'fit-cols-3');
  }

  function updateToggleUi(on) {
    toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    toggle.classList.toggle('fit-toggle--active', on);
    toggle.textContent = on ? 'Scroll mode' : 'Fit to screen';
    if (hint) {
      hint.textContent = on
        ? 'Whole song on one screen — tap to scroll instead'
        : 'Scroll freely — tap to fit the whole song on screen';
    }
  }

  function setFitEnabled(on) {
    localStorage.setItem(STORAGE_KEY, on ? 'true' : 'false');
    document.body.classList.toggle('fit-screen', on);
    updateToggleUi(on);
    if (on) {
      requestAnimationFrame(function () {
        requestAnimationFrame(applyScale);
      });
    } else {
      clearLayout();
    }
  }

  function getAvailableSize() {
    var header = document.querySelector('.site-header');
    var controls = document.querySelector('.song-controls');
    var headerH = header ? header.offsetHeight : 58;
    var controlsH = controls && document.body.classList.contains('fit-screen') ? controls.offsetHeight : 0;
    var pad = 8;
    return {
      width: Math.max(stage.clientWidth - pad * 2, 200),
      height: Math.max(window.innerHeight - headerH - controlsH - pad * 2, 200)
    };
  }

  function measureAtWidth(width) {
    content.style.width = width + 'px';
    return content.scrollHeight;
  }

  function pickColumnLayout(avail) {
    document.body.classList.remove('fit-cols-2', 'fit-cols-3');

    var height = measureAtWidth(avail.width);
    if (height <= avail.height) {
      return { height: height, width: avail.width };
    }

    if (avail.width >= 520) {
      document.body.classList.add('fit-cols-2');
      height = measureAtWidth(avail.width);
      if (height <= avail.height) {
        return { height: height, width: avail.width };
      }
    }

    if (avail.width >= 780) {
      document.body.classList.remove('fit-cols-2');
      document.body.classList.add('fit-cols-3');
      height = measureAtWidth(avail.width);
      return { height: height, width: avail.width };
    }

    return { height: height, width: avail.width };
  }

  function applyScale() {
    if (!document.body.classList.contains('fit-screen')) return;

    clearLayout();

    var avail = getAvailableSize();
    var layout = pickColumnLayout(avail);
    var naturalW = layout.width;
    var naturalH = layout.height;
    if (!naturalW || !naturalH) return;

    var scaleY = avail.height / naturalH;
    var scale = scaleY;
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
