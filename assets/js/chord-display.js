document.addEventListener('DOMContentLoaded', function () {
  var block = document.querySelector('.chord-block');
  if (!block) return;

  var pre = block.querySelector('pre');
  if (!pre) return;

  var text = pre.textContent.trim();
  if (!text) return;

  var rendered = renderChordBlock(text, getLegend(block));
  if (!rendered) return;

  block.innerHTML = rendered;
});

function getLegend(block) {
  var raw = block.getAttribute('data-section-legend');
  var legend = {};
  if (!raw) return legend;
  raw.split('|').forEach(function (entry) {
    var parts = entry.split(':');
    if (parts.length === 2) legend[parts[0].trim()] = parts[1].trim();
  });
  return legend;
}

function repeatLabel(numeral, legend) {
  var name = legend[numeral] || legend[numeral.toUpperCase()];
  return name ? '\u21A9 ' + name : '\u21A9 Section ' + numeral;
}

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

function renderRepeat(numeral, legend) {
  return '<div class="repeat-marker"><span>' + repeatLabel(numeral, legend) + '</span></div>';
}

function renderChordBlock(text, legend) {
  var lines = text.split('\n');
  var parts = [];
  var i = 0;

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
        var section = { type: 'section', numeral: line, rows: [] };
        i++;

        while (i < lines.length) {
          var beatLine = lines[i].trim();
          var chordLine = (i + 1 < lines.length) ? lines[i + 1].trim() : '';

          if (!beatLine || isNumeral(beatLine)) break;
          if (!isBeatLine(beatLine) || !isChordLine(chordLine)) break;

          var pairs = parsePairs(beatLine, chordLine);
          if (!pairs) return null;

          section.rows.push(pairs);
          i += 2;

          if (i < lines.length && !lines[i].trim()) i++;
        }

        parts.push(section);
        continue;
      }

      parts.push({ type: 'repeat', numeral: line });
      i++;
      continue;
    }

    return null;
  }

  if (parts.length === 0) return null;

  var html = '<div class="chord-sheet">';

  parts.forEach(function (part) {
    if (part.type === 'repeat') {
      html += renderRepeat(part.numeral, legend);
      return;
    }

    var sectionName = legend[part.numeral] || legend[part.numeral.toUpperCase()];
    var label = sectionName ? part.numeral + ' \u00b7 ' + sectionName : part.numeral;

    html += '<div class="chord-part"><div class="section-label">' + label + '</div>';
    part.rows.forEach(function (pairs) {
      html += renderRow(pairs);
    });
    html += '</div>';
  });

  html += '</div>';
  return html;
}
