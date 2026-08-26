document.addEventListener('DOMContentLoaded', function () {
  var PAGE_SIZE = 20;
  var songs = JSON.parse(document.getElementById('song-data').textContent);
  var listEl = document.getElementById('song-list');
  var searchInput = document.getElementById('search');
  var sortSelect = document.getElementById('sort-by');
  var notebookSelect = document.getElementById('filter-notebook');
  var listMeta = document.getElementById('list-meta');
  var pagination = document.getElementById('pagination');
  var pagePrev = document.getElementById('page-prev');
  var pageNext = document.getElementById('page-next');
  var pageInfo = document.getElementById('page-info');
  var noResults = document.getElementById('no-results');
  var currentPage = 1;

  populateNotebookFilter();
  bindEvents();
  render();

  function populateNotebookFilter() {
    var notebooks = [];
    songs.forEach(function (song) {
      var nb = String(song.notebook);
      if (notebooks.indexOf(nb) === -1) notebooks.push(nb);
    });
    notebooks.sort(compareNotebook);
    notebooks.forEach(function (nb) {
      var opt = document.createElement('option');
      opt.value = nb;
      opt.textContent = 'Notebook ' + nb;
      notebookSelect.appendChild(opt);
    });
  }

  function compareNotebook(a, b) {
    var na = Number(a);
    var nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return String(a).localeCompare(String(b), undefined, { numeric: true });
  }

  function bindEvents() {
    searchInput.addEventListener('input', resetAndRender);
    sortSelect.addEventListener('change', resetAndRender);
    notebookSelect.addEventListener('change', resetAndRender);
    pagePrev.addEventListener('click', function () {
      if (currentPage > 1) {
        currentPage--;
        render();
        scrollToList();
      }
    });
    pageNext.addEventListener('click', function () {
      if (currentPage < getTotalPages(getFilteredSorted())) {
        currentPage++;
        render();
        scrollToList();
      }
    });
  }

  function resetAndRender() {
    currentPage = 1;
    render();
  }

  function scrollToList() {
    listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function getFilteredSorted() {
    var query = searchInput.value.trim().toLowerCase();
    var notebook = notebookSelect.value;
    var sortMode = sortSelect.value;

    var filtered = songs.filter(function (song) {
      if (notebook !== 'all' && String(song.notebook) !== notebook) return false;
      if (query && song.title.toLowerCase().indexOf(query) === -1) return false;
      return true;
    });

    filtered.sort(function (a, b) {
      if (sortMode === 'notebook') {
        var nb = compareNotebook(a.notebook, b.notebook);
        if (nb !== 0) return nb;
      }
      return a.title.localeCompare(b.title);
    });

    return filtered;
  }

  function getTotalPages(items) {
    return Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  }

  function createSongRow(song, showNotebook) {
    var li = document.createElement('li');
    li.className = 'song-row';

    var link = document.createElement('a');
    link.href = song.url;
    link.textContent = song.title;
    li.appendChild(link);

    var meta = document.createElement('span');
    meta.className = 'page-num';
    meta.textContent = showNotebook
      ? 'Notebook ' + song.notebook + ' \u00b7 p. ' + song.page
      : 'p. ' + song.page;
    li.appendChild(meta);

    return li;
  }

  function createNotebookGroup(notebook) {
    var div = document.createElement('div');
    div.className = 'notebook-group';

    var h2 = document.createElement('h2');
    h2.className = 'notebook-heading';
    h2.textContent = 'Notebook ' + notebook;
    div.appendChild(h2);

    var ul = document.createElement('ul');
    ul.className = 'song-index';
    div.appendChild(ul);

    return { root: div, list: ul };
  }

  function render() {
    var items = getFilteredSorted();
    var total = items.length;
    var totalPages = getTotalPages(items);

    if (currentPage > totalPages) currentPage = totalPages;

    listEl.innerHTML = '';
    noResults.hidden = total > 0;
    listEl.hidden = total === 0;

    if (total === 0) {
      listMeta.hidden = true;
      pagination.hidden = true;
      return;
    }

    var start = (currentPage - 1) * PAGE_SIZE;
    var pageItems = items.slice(start, start + PAGE_SIZE);
    var sortMode = sortSelect.value;
    var lastNotebook = null;
    var currentGroup = null;

    if (sortMode === 'notebook') {
      pageItems.forEach(function (song) {
        var nb = String(song.notebook);
        if (nb !== lastNotebook) {
          currentGroup = createNotebookGroup(nb);
          listEl.appendChild(currentGroup.root);
          lastNotebook = nb;
        }
        currentGroup.list.appendChild(createSongRow(song, false));
      });
    } else {
      var ul = document.createElement('ul');
      ul.className = 'song-index';
      pageItems.forEach(function (song) {
        ul.appendChild(createSongRow(song, true));
      });
      listEl.appendChild(ul);
    }

    var end = Math.min(start + PAGE_SIZE, total);
    listMeta.textContent = 'Showing ' + (start + 1) + '\u2013' + end + ' of ' + total +
      ' song' + (total === 1 ? '' : 's');
    listMeta.hidden = false;

    pageInfo.textContent = 'Page ' + currentPage + ' of ' + totalPages;
    pagePrev.disabled = currentPage <= 1;
    pageNext.disabled = currentPage >= totalPages;
    pagination.hidden = totalPages <= 1;
  }
});
