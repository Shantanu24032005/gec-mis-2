import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // Reference to the Student model
    required: true,
  },
  transaction_id: { // Unique identifier for the payment transaction
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Fee amount is required.'],
    min: [0, 'Amount cannot be negative.'],
    default: 40000
  },
  payment_date: {
    type: Date,
    default: Date.now, // Default to the time the record is created
  },
  payment_for: { // Type of fee
    type: String,
    required: true,
    enum: {
        values: ['Tuition Fee', 'Exam Registration Fee'],
        message: '{VALUE} is not a supported fee type.'
    }
  },
  academic_year: { // e.g., "2023-2024"
    type: String,
    required: true,
    trim: true,
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in YYYY-YYYY format'],
  },
  semester: { // The semester this fee applies to
    type: Number,
    required: true,
    min: 1,
    max: 8, // Adjust if needed
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Failed', 'Refunded'], // Added 'Refunded'
    default: 'Pending',
    required: true
  },
  payment_method: { // Optional: How the fee was paid
      type: String,
      trim: true,
      enum: ['Online', 'Cash', 'Cheque', 'DD']
  },
  remarks: { // Optional: Any notes about the payment
      type: String,
      trim: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});


const Fee = mongoose.model('Fee', feeSchema);

export default Fee;

