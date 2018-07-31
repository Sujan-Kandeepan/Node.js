// Anonymous functions (callback hell)
console.log('Before');
getUser(1, (user) => {
  console.log('User:', user);
  getRepositories(user.githubUsername, (repos) => {
    console.log('Repos:', repos);
    getCommits(repos[0], (commits) => {
      console.log('Commits:', commits);
    });
  }); 
});
console.log('After');

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
