import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'],
    unique: true,
    trim: true,
    lowercase: true // Standardize username case
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minlength: [8, 'Password must be at least 8 characters long'] // Enforce stronger passwords
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'is invalid'], // Basic email format validation
  },
  role: {
    type: String,
    enum: ['super_admin', 'department_admin', 'finance_admin'], // Added more roles as example
    required: true,
    default: 'department_admin' // Set a default role if applicable
  },
  department_id: { // Link admin to a department if their role requires it
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    // Make this field required *only if* the role is 'department_admin'
    required: function() { return this.role === 'department_admin'; }
  },
  is_active: { // To easily enable/disable admin accounts
      type: Boolean,
      default: true
  },
  last_login: {
    type: Date,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, // Use built-in timestamps
});

// **Password Hashing Middleware:** Hashes password before saving (similar to Student model)
adminSchema.pre('save', async function(next) {
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

// **Password Comparison Method:** Instance method to compare passwords (similar to Student model)
adminSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};



const Admin = mongoose.model('Admin', adminSchema);

export default Admin;