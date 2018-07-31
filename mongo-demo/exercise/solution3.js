const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mongo-exercises', { useNewUrlParser: true });

const courseSchema = new mongoose.Schema({
  name: String,
  author: String,
  tags: [ String ],
  date: Date,
  isPublished: Boolean,
  price: Number
});

const Course = mongoose.model('Course', courseSchema);

async function getCourses() {
  return await Course
    .find({ isPublished: true })
    .or([
      { price: { $gte: 15 } },
      { name: /.*by.*/i }
    ])
    .sort('-price')
    .select('name author price');
}

async function run() {
  const courses = await getCourses();
  console.log(courses);
}

run();
