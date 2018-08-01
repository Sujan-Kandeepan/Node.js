const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/playground', { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const authorSchema = new mongoose.Schema({
  name: String,
  bio: String,
  website: String
});

const Author = mongoose.model('Author', authorSchema);

const Course = mongoose.model('Course', new mongoose.Schema({
  name: String,
  authors: [authorSchema]
}));

async function createCourse(name, authors) {
  const course = new Course({
    name, 
    authors
  }); 
  
  const result = await course.save();
  console.log(result);
}

async function listCourses() { 
  const courses = await Course.find();
  console.log(courses);
}

async function addAuthor(courseId, author) {
  const course = await Course.findById(courseId);
  course.authors.push(author);
  course.save();
}

async function removeAuthor(courseId, authorId) {
  const course = await Course.findById(courseId);
  const author = course.authors.id(authorId);
  author.remove();
  course.save();
}

async function updateAuthor(courseId) {
  await Course.update({ _id: courseId }, {
    $set: {
      'author.name': 'John Smith',
      'author.bio': 'Something',
      'author.website': 'www.website.com'
    }
  });
  // const course = await Course.findById(courseId);
  // course.author.name = 'Mosh Hamedani';
  // course.save();
}

async function removeAuthorDetails(courseId) {
  await Course.update({ _id: courseId }, {
    $unset: {
      'author.bio': '',
      'author.website': ''
    }
  });
}

// createCourse('Node Course', [
//   new Author({ name: 'Mosh' }),
//   new Author({ name: 'John' }),
// ]);

// updateAuthor('5b61e669e5fb6e07c4fa95a2');

// removeAuthorDetails('5b61e669e5fb6e07c4fa95a2');

// addAuthor('5b61f0c975524d455c98b928', new Author({ name: 'Amy' }));

removeAuthor('5b61f0c975524d455c98b928', '5b61f2914323ca4668f0eae3')
