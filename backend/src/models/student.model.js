import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'First name is required.'],
    trim: true,
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required.'],
    trim: true,
  },
  date_of_birth: {
    type: Date,
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'is invalid'], // Basic email format validation
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minlength: [6, 'Password must be at least 6 characters long'] // Example validation
  },
  phone_number: {
    type: String,
    trim: true,
  },
  address: {
    type:String
  },
  enrollment_number: {
    type: String,
    required: [true, 'Enrollment number is required.'],
    unique: true,
    trim: true,
    uppercase: true
  },
  roll_number: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    required: false // Set to true if an image is mandatory
},
  admission_year: {
    type: Number,
    required: [true, 'Admission year is required']
  },
  current_year: {
    type: Number,
    min: 1,
    max: 4,
  },
  current_semester: {
    type: Number,
    min: 1,
    max: 8,
  },
  // **MODIFIED FIELD**
  department_name: {
    type: String,
    required: [true, 'Department name is required.'],
    enum: { // Ensure the name is one of the valid departments
      values: [
        "Computer",
        "Information Technology",
        "Electrical and Electronics",
        "Electronics and Telecommunications",
        "Civil",
        "Mechanical"
      ],
      message: '{VALUE} is not a supported department name.'
    },
    // ref: 'Department', // REMOVED ref
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// Password Hashing Middleware (remains the same)
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Password Comparison Method (remains the same)
studentSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};



const Student = mongoose.model('Student', studentSchema);

export default Student;