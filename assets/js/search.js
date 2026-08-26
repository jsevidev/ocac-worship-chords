document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('search');
  var groups = Array.prototype.slice.call(document.querySelectorAll('.notebook-group'));
  var noResults = document.getElementById('no-results');

  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    var anyVisible = false;

    groups.forEach(function (group) {
      var rows = group.querySelectorAll('.song-row');
      var groupHasMatch = false;

      rows.forEach(function (row) {
        var match = row.dataset.title.indexOf(q) !== -1;
        row.style.display = match ? '' : 'none';
        if (match) groupHasMatch = true;
      });

      group.style.display = groupHasMatch ? '' : 'none';
      if (groupHasMatch) anyVisible = true;
    });

    noResults.style.display = anyVisible ? 'none' : 'block';
  });
});
