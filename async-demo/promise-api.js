const resolved = Promise.resolve({ id: 1 });
resolved.then(result => console.log('Result:', result));

const rejected = Promise.reject(new Error('message'));
rejected.catch(error => console.log('Error:', error.message));

const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('Async operation 1...');
    resolve(1);
    //reject(new Error('first promise failed'));
  }, 2000);
});

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('Async operation 2...');
    resolve(2);
    //reject(new Error('second promise failed'));
  }, 2000);
});

Promise.all([p1, p2]) // or race() to give result of first promise to be fulfilled
  .then(result => console.log('Result:', result))
  .catch(error => console.log('Error:', error.message));
