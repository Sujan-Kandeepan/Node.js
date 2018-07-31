const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/playground', { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Could not connect to MongoDB', error));

const courseSchema = new mongoose.Schema({
  name: String,
  author: String,
  tags: [ String ],
  date: { type: Date, default: Date.now },
  isPublished: Boolean
});

const Course = mongoose.model('Course', courseSchema);

async function createCourse() {
  const course = new Course({
    name: 'Angular Course',
    author: 'Mosh',
    tags: ['angular', 'frontend'],
    isPublished: true
  });

  const result = await course.save();
  console.log(result);
}

async function getCourses() {
  // Comparison operators: eq (=), ne (!=), gt (>), gte (>=), lt (<), lte (<=), in, nin (not in)
  // Logical operators: or (||), and (&&)
  const pageNumber = 1;
  const pageSize = 10;

  const courses = await Course
    .find({ author: 'Mosh', isPublished: true })
    // .find({ price: { $gte: 10, $lte: 20 } })
    // .find({ price: { $in: [10, 15, 20] } })
    // .find()
    // .or([{ author: 'Mosh' }, { isPublished: true }])
    // .and([])
    // .find({ author: /^Mosh/ })
    // .find({ author: /Hamedani$/i })
    // .find({ author: /.*Mosh.*/i })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort({ name: 1 }) //ascending, -1 for descending
    .select({ name: 1, tags: 1 }); // .countDocuments() for count instead of result
  console.log(courses);
}

getCourses();
