document.addEventListener('DOMContentLoaded', function () {
  var block = document.querySelector('.chord-block');
  if (!block) return;

  var pre = block.querySelector('pre');
  if (!pre) return;

  var text = pre.textContent.trim();
  if (!text) return;

  var rendered = renderChordBlock(text);
  if (!rendered) return;

  block.innerHTML = rendered;
});

function isNumeral(line) {
  return /^[IVXLCivxlc]+$/.test(line.trim());
}

function isBeatLine(line) {
  return /^\d[\d\s]*$/.test(line.trim());
}

function isChordLine(line) {
  return /[A-Ga-g]/.test(line) && (line.indexOf(' - ') !== -1 || /^[A-Ga-g#b\d\/]+$/.test(line.trim()));
}

function parsePairs(beatLine, chordLine) {
  var beats = beatLine.match(/\d+/g) || [];
  var chords = chordLine.split(/\s+-\s+/).map(function (s) { return s.trim(); }).filter(Boolean);
  if (beats.length !== chords.length || beats.length === 0) return null;
  var pairs = [];
  for (var i = 0; i < beats.length; i++) {
    pairs.push({ beat: beats[i], chord: chords[i] });
  }
  return pairs;
}

function renderRow(pairs) {
  var html = '<div class="chord-row">';
  pairs.forEach(function (pair, i) {
    if (i > 0) html += '<span class="chord-sep">-</span>';
    html += '<div class="chord-pair"><span class="beat">' + pair.beat + '</span><span class="chord">' + pair.chord + '</span></div>';
  });
  html += '</div>';
  return html;
}

function renderChordBlock(text) {
  var lines = text.split('\n');
  var html = '';
  var i = 0;
  var parsedAny = false;

  while (i < lines.length) {
    var line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    if (isNumeral(line)) {
      var next = (i + 1 < lines.length) ? lines[i + 1].trim() : '';
      var after = (i + 2 < lines.length) ? lines[i + 2].trim() : '';

      if (isBeatLine(next) && isChordLine(after)) {
        html += '<div class="chord-section"><div class="section-label">' + line + '</div>';
        i++;

        while (i < lines.length) {
          var beatLine = lines[i].trim();
          var chordLine = (i + 1 < lines.length) ? lines[i + 1].trim() : '';

          if (!beatLine || isNumeral(beatLine)) break;
          if (!isBeatLine(beatLine) || !isChordLine(chordLine)) break;

          var pairs = parsePairs(beatLine, chordLine);
          if (!pairs) return null;

          html += renderRow(pairs);
          parsedAny = true;
          i += 2;

          if (i < lines.length && !lines[i].trim()) i++;
        }

        html += '</div>';
        continue;
      }

      html += '<div class="chord-repeat">' + line + '</div>';
      parsedAny = true;
      i++;
      continue;
    }

    return null;
  }

  return parsedAny ? html : null;
}
