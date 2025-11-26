const form = document.getElementById('searchForm');
const input = document.getElementById('usernameInput');
const statusEl = document.getElementById('status');
const profileEl = document.getElementById('profile');
const reposEl = document.getElementById('repos');
const avatar = document.getElementById('avatar');
const nameEl = document.getElementById('name');
const bioEl = document.getElementById('bio');
const followersEl = document.getElementById('followers');
const followingEl = document.getElementById('following');
const reposCountEl = document.getElementById('reposCount');
const profileLink = document.getElementById('profileLink');
const reposList = document.getElementById('reposList');
const refreshBtn = document.getElementById('refreshBtn');

let lastSearched = null;

function showStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? 'crimson' : '';
}

function clearProfile() {
  profileEl.classList.add('hidden');
  reposEl.classList.add('hidden');
  reposList.innerHTML = '';
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function loadUser(username) {
  showStatus('Loading...');
  clearProfile();

  try {
    // Fetch user and repos in parallel
    const [user, repos] = await Promise.all([
      fetchJson(`https://api.github.com/users/${encodeURIComponent(username)}`),
      fetchJson(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=50&sort=updated`)
    ]);

    // Update profile
    avatar.src = user.avatar_url || '';
    nameEl.textContent = user.name || user.login;
    bioEl.textContent = user.bio || '';
    followersEl.textContent = user.followers;
    followingEl.textContent = user.following;
    reposCountEl.textContent = user.public_repos;
    profileLink.href = user.html_url;
    profileEl.classList.remove('hidden');

    // Repos list
    reposList.innerHTML = '';
    if (repos.length === 0) {
      reposList.innerHTML = '<li class="muted">No public repos</li>';
    } else {
      repos.forEach(r => {
        const li = document.createElement('li');
        const left = document.createElement('div');
        const right = document.createElement('div');
        left.innerHTML = `<div class="repo-name"><a href="${r.html_url}" target="_blank" rel="noopener">${r.name}</a></div>
                          <div class="repo-desc">${r.description || ''}</div>`;
        right.innerHTML = `<div class="muted">${r.stargazers_count} ★</div>`;
        li.appendChild(left);
        li.appendChild(right);
        reposList.appendChild(li);
      });
    }
    reposEl.classList.remove('hidden');

    showStatus('Loaded successfully.');
    lastSearched = username;
  } catch (err) {
    if (err.status === 404) {
      showStatus('User not found. Try another username.', true);
    } else {
      showStatus('Network or server error. Open console for details.', true);
      console.error(err);
    }
  }
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const user = input.value.trim();
  if (!user) return;
  loadUser(user);
});

refreshBtn.addEventListener('click', () => {
  if (!lastSearched) {
    showStatus('No previous search to refresh.', true);
    return;
  }
  loadUser(lastSearched);
});