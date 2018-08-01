const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mongo-exercises', { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Could not connect to MongoDB', error));

const courseSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
    // match: /pattern/
  },
  category: {
    type: String,
    required: true,
    enum: ['web', 'mobile', 'network'],
    lowercase: true,
    // uppercase: true,
    trim: true
  },
  author: String,
  tags: {
    type: Array,
    validate: {
      isAsync: true,
      validator: function(v, callback) {
        setTimeout(() => {
          const result = v && v.length > 0
          callback(result);
        }, 2000);
      },
      message: 'A course should have at least one tag.'
    }
  },
  date: { type: Date, default: Date.now },
  isPublished: Boolean,
  price: {
    type: Number,
    required: function() { return this.isPublished; },
    min: 10,
    max: 200,
    get: v => Math.round(v),
    set: v => Math.round(v)
  }
});

const Course = mongoose.model('Course', courseSchema);

async function createCourse() {
  const course = new Course({
    name: 'Bootstrap Course',
    category: 'Web',
    author: 'Rob',
    tags: ['bootstrap', 'frontend'],
    isPublished: true,
    price: 15.8
  });

  try {
    // await course.validate();
    const result = await course.save();
    console.log(result);
  } catch (ex) {
    for (field in ex.errors) {
      console.log(ex.errors[field].message);
    }
  }
  
}

async function getCourses() {
  // Comparison operators: eq (=), ne (!=), gt (>), gte (>=), lt (<), lte (<=), in, nin (not in)
  // Logical operators: or (||), and (&&)
  const pageNumber = 1;
  const pageSize = 10;

  const courses = await Course
    .find({ author: 'Mosh', isPublished: true })
    // .find({ _id: '5b60fe6f5f544c3adcdde898' })
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

async function updateCourse(id) {
  const course = await Course.findById(id);
  if (!course) return console.log('error');
  if (course.isPublished) return console.log('cannot update');
  // course.isPublished = true;
  // course.author = 'Another Author';
  course.set({
    isPublished: true,
    author: 'Another Author'
  });
  const result = await course.save();
  console.log(result);
}

async function updateCourse2(id) {
  const result = await Course.update({ _id: id }, {
    $set: {
      author: 'Mosh',
      isPublished: false
    }
  });

  console.log(result);
}

async function updateCourse3(id) {
  const course = await Course.findByIdAndUpdate(id, {
    $set: {
      author: 'Jack',
      isPublished: true
    }
  }, { new: true });

  console.log(course);
}

async function removeCourse(id) {
  const result = await Course.deleteOne({ _id: id });
  console.log(result);
}

async function removeCourse2(id) {
  const course = await Course.findByIdAndRemove(id);
  console.log(course);
}

getCourses();
