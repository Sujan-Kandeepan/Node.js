// Named functions (avoid nesting)
console.log('Before');
getUser(1, displayUser);
console.log('After');

function displayUser(user) {
  console.log('User:', user);
  getRepositories(user.githubUsername, displayRepositories); 
}

function displayRepositories(repos) {
  console.log('Repos:', repos);
  getCommits(repos[0], displayCommits);
}

function displayCommits(commits) {
  console.log('Commits:', commits);
}

function getUser(id, callback) {
  setTimeout(() => {
    console.log('\nReceived user info from database');
    callback({ id, githubUsername: 'sujan' });
  }, 2000);
}

function getRepositories(username, callback) {
  setTimeout(() => {
    console.log('\nFound repos from GitHub API');
    callback(['repo1', 'repo2', 'repo3']);
  }, 2000);
}

function getCommits(repo, callback) {
  setTimeout(() => {
    console.log('\nFound commits from GitHub API');
    callback(['commit1', 'commit2', 'commit3']);
  }, 2000);
}
