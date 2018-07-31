// Promise chains (return promise instead of value)
console.log('Before');
getUser(1)
  .then(user => getRepositories(user.githubUsername))
  .then(repos => getCommits(repos[0]))
  .catch(error => console.log('Error:', error.message));
console.log('After');

function getUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = { id, githubUsername: 'sujan' };
      console.log('\nReceived user info from database');
      console.log('User:', user);
      resolve(user);
    }, 2000);
  });
}

function getRepositories(username) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const repos = ['repo1', 'repo2', 'repo3'];
      console.log('\nFound repos from GitHub API');
      console.log('Repos:', repos);
      resolve(repos);
    }, 2000);
  });
}

function getCommits(repo) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const commits = ['commit1', 'commit2', 'commit3'];
      console.log('\nFound commits from GitHub API');
      console.log('Commits:', commits)
      resolve(commits);
    }, 2000);
  });
}
