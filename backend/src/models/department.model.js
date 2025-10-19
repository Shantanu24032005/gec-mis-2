import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required.'],
    enum: {
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
    unique: true // Department names should be unique
  },
  head_of_department: {
    type: String,
    trim: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, // Use Mongoose's built-in timestamps
});



const Department = mongoose.model('Department', departmentSchema);

export default Department;

