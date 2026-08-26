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

function parseSectionHeader(line) {
  line = line.trim();
  var m = line.match(/^([IVXLCivxlc]+)\s+(\d+x)$/i);
  if (m) return { numeral: m[1].toUpperCase(), repeat: m[2] };
  if (isNumeral(line)) return { numeral: line.toUpperCase(), repeat: '' };
  return null;
}

function isBeatLine(line) {
  return /^\d[\d\s]*$/.test(line.trim());
}

function isChordLine(line) {
  var core = line.trim().replace(/\s+-\s+\d+x\s*$/i, '');
  return /[A-Ga-g]/.test(core) && (core.indexOf(' - ') !== -1 || /^[A-Za-z#b0-9\/]+$/.test(core));
}

function parseBeatChordLines(beatLine, chordLine) {
  var lineRepeat = '';
  var chordPart = chordLine.trim();
  var repeatMatch = chordPart.match(/\s+-\s+(\d+x)\s*$/i);
  if (repeatMatch) {
    lineRepeat = repeatMatch[1];
    chordPart = chordPart.slice(0, repeatMatch.index);
  }
  var beats = beatLine.match(/\d+/g) || [];
  var chords = chordPart.split(/\s+-\s+/).map(function (s) { return s.trim(); }).filter(Boolean);
  if (beats.length !== chords.length || beats.length === 0) return null;
  var pairs = [];
  for (var i = 0; i < beats.length; i++) {
    pairs.push({ beat: beats[i], chord: chords[i] });
  }
  return { pairs: pairs, repeat: lineRepeat };
}

function isRepeatLine(line) {
  line = line.trim();
  if (!line || isBeatLine(line)) return false;
  if (isNumeral(line)) return true;
  return /^([IVXLCivxlc]+(\s+\d+x)?)(\s*-\s*[IVXLCivxlc]+(\s+\d+x)?)*$/i.test(line);
}

function renderRow(row) {
  var pairs = row.pairs || row;
  var repeat = row.repeat || '';
  var html = '<div class="chord-row-wrap">';
  html += '<div class="chord-row">';
  pairs.forEach(function (pair, i) {
    if (i > 0) html += '<span class="chord-sep">-</span>';
    html += '<div class="chord-pair"><span class="beat">' + pair.beat + '</span><span class="chord">' + pair.chord + '</span></div>';
  });
  html += '</div>';
  if (repeat) {
    html += '<span class="line-repeat" title="Repeat this chord sequence">' + repeat + '</span>';
  }
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

    var header = parseSectionHeader(line);
    if (header) {
      var next = (i + 1 < lines.length) ? lines[i + 1].trim() : '';
      var after = (i + 2 < lines.length) ? lines[i + 2].trim() : '';

      if (isBeatLine(next) && isChordLine(after)) {
        var section = { type: 'section', numeral: header.numeral, repeat: header.repeat, rows: [] };
        i++;

        while (i < lines.length) {
          var beatLine = lines[i].trim();
          var chordLine = (i + 1 < lines.length) ? lines[i + 1].trim() : '';

          if (!beatLine || parseSectionHeader(beatLine)) break;
          if (/^\d+x$/i.test(beatLine)) break;
          if (!isBeatLine(beatLine) || !isChordLine(chordLine)) break;

          var parsed = parseBeatChordLines(beatLine, chordLine);
          if (!parsed) return null;

          var lineRepeat = parsed.repeat;
          i += 2;
          if (!lineRepeat && i < lines.length && !lines[i].trim()) i++;
          if (!lineRepeat && i < lines.length && /^\d+x$/i.test(lines[i].trim())) {
            lineRepeat = lines[i].trim();
            i++;
          }

          section.rows.push({ pairs: parsed.pairs, repeat: lineRepeat });
          if (i < lines.length && !lines[i].trim()) i++;
          continue;
        }

        if (i < lines.length && /^\d+x$/i.test(lines[i].trim())) {
          section.repeat = lines[i].trim();
          i++;
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
    if (part.repeat) {
      labelHtml += '<span class="section-repeat">' + part.repeat + '</span>';
    }

    html += '<div class="chord-part"><div class="section-label">' + labelHtml + '</div>';
    part.rows.forEach(function (pairs) {
      html += renderRow(pairs);
    });
    html += '</div>';
  });

  html += '</div>';
  return html;
}
