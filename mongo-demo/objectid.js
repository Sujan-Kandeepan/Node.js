const mongoose = require('mongoose');

/* _id: 5b621c6fa69d361d90ac059d (12 bytes)
- 4 bytes: timestamp
- 3 bytes: machine identifier
- 2 bytes: process identifier
- 3 bytes: counter */

const id = new mongoose.Types.ObjectId();
console.log(id);
console.log(id.getTimestamp());

const isValid = mongoose.Types.ObjectId.isValid('1234');
console.log(isValid);
