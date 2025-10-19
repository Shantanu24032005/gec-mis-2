import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  course_code: { type: String, required: true, trim: true, uppercase: true },
  course_name: { type: String, required: true, trim: true },
  internal_marks: { type: Number, min: 0, default: null }, // Use null default if marks aren't always present initially
  term_work_marks: { type: Number, min: 0, default: null },
  end_sem_exam_marks: { type: Number, min: 0, default: null },
  grade: { type: String, trim: true, uppercase: true, default: null },
}, { _id: false });

const academicSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // Reference to the Student model
    required: true,
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8, // Adjust if needed
  },
  courses: [courseSchema], // Array of course records for the semester
  sgpa: {
    type: Number,
    min: 0,
    max: 10, // Assuming a 10-point scale
    default: null
  },
  cgpa: { // Updated CGPA after this semester
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  registration_status: {
    type: String,
    enum: ['Registered', 'Not Registered', 'Pending'], // Added 'Pending' if applicable
    default: 'Not Registered',
  },
  registration_date: {
    type: Date,
  },
  academic_year: { // e.g., "2022-2023"
    type: String,
    required: true,
    trim: true,
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in YYYY-YYYY format'], // Basic format validation
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});



const Academic = mongoose.model('Academic', academicSchema);

export default Academic;