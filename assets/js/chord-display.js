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

function isNumeral(line) {
  return /^[IVXLCivxlc]+$/.test(line.trim());
}

function isBeatLine(line) {
  return /^\d[\d\s]*$/.test(line.trim());
}

function isChordLine(line) {
  return /[A-Ga-g]/.test(line) && (line.indexOf(' - ') !== -1 || /^[A-Ga-g#b\d\/]+$/.test(line.trim()));
}

function isRepeatLine(line) {
  line = line.trim();
  if (!line || isBeatLine(line)) return false;
  if (isNumeral(line)) return true;
  return /^([IVXLCivxlc]+(\s+\d+x)?)(\s*-\s*[IVXLCivxlc]+(\s+\d+x)?)*$/i.test(line);
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

function renderRepeatFlow(text) {
  return '<div class="repeat-flow"><span class="repeat-tag">Repeat</span><span class="repeat-text">' + text + '</span></div>';
}

function parseSong(text) {
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
    }

    if (isRepeatLine(line)) {
      parts.push({ type: 'repeat', text: line });
      i++;
      continue;
    }

    return null;
  }

  return parts.length ? parts : null;
}

function renderChordBlock(text, legend) {
  var parts = parseSong(text);
  if (!parts) return null;

  var html = '<div class="chord-sheet">';

  parts.forEach(function (part) {
    if (part.type === 'repeat') {
      html += renderRepeatFlow(part.text);
      return;
    }

    var sectionName = legend[part.numeral] || legend[part.numeral.toUpperCase()];
    var labelHtml = sectionName
      ? '<span class="section-numeral">' + part.numeral + '</span><span class="section-name">' + sectionName + '</span>'
      : '<span class="section-numeral">' + part.numeral + '</span>';

    html += '<div class="chord-part"><div class="section-label">' + labelHtml + '</div>';
    part.rows.forEach(function (pairs) {
      html += renderRow(pairs);
    });
    html += '</div>';
  });

  html += '</div>';
  return html;
}
