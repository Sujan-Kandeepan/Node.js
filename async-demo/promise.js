const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    //resolve(1);
    reject(new Error('error message'));
  }, 2000);
});

promise
  .then(result => console.log('Result:', result))
  .catch(error => console.log('Error:', error.message));
