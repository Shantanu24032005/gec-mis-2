// backend/src/controller/auth.controller.js
import Student from '../models/student.model.js';
import Admin from '../models/admin.model.js';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js'; // <-- Make sure this is imported

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// --- REPLACE YOUR OLD register FUNCTION WITH THIS ---
export const register = async (req, res) => {
  // 1. Destructure ALL fields from the body (text fields)
  const {
    first_name,
    last_name,
    date_of_birth,
    email,
    password,
    phone_number,
    address,
    enrollment_number,
    roll_number,
    admission_year, // <-- Now it's being read
    current_year,
    current_semester,
    department_name
  } = req.body; // <-- from req.body

  // 2. Get image URL from req.file (if it exists)
  let imageUrl = null;
  let imagePublicId = null; // Store this if you want to delete/replace images later

  if (req.file) {
    imageUrl = req.file.path;       // This is the Cloudinary URL
    imagePublicId = req.file.filename; // This is the public_id
  }

  try {
    const studentExists = await Student.findOne({ 
      $or: [{ email: email.toLowerCase() }, { enrollment_number: enrollment_number.toUpperCase() }]
    });

    if (studentExists) {
      // If student exists, delete the image that was just uploaded
      if (imagePublicId) {
        await cloudinary.uploader.destroy(imagePublicId);
      }
      return res.status(400).json({ message: 'Student with this email or enrollment number already exists' });
    }

    // 3. Basic validation for required fields
    if (!first_name || !last_name || !email || !password || !enrollment_number || !admission_year || !department_name) {
        // If validation fails, delete the uploaded image
        if (imagePublicId) {
          await cloudinary.uploader.destroy(imagePublicId);
        }
        return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // 4. Create the student with ALL fields
    const student = await Student.create({
      first_name,
      last_name,
      date_of_birth, // Optional
      email,
      password,
      phone_number, // Optional
      address, // Optional
      enrollment_number,
      roll_number, // Optional
      image: imageUrl, // <-- Add the Cloudinary URL
      admission_year, // <-- Pass it to the database
      current_year, // Optional
      current_semester, // Optional
      department_name 
    });

    if (student) {
      const token = generateToken(student._id);
      res.cookie('token', token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV !== 'development',
        // sameSite: 'strict',
        // maxAge: 30 * 24 * 60 * 60 * 1000
      });
      res.status(201).json({
        _id: student._id,
        name: `${student.first_name} ${student.last_name}`,
        email: student.email,
        userType: 'student',
        imageUrl: student.image, // Send back the image URL
        message: "Registration successful"
      });
    } else {
      // This case is unlikely but good to have
      if (imagePublicId) {
        await cloudinary.uploader.destroy(imagePublicId);
      }
      res.status(400).json({ message: 'Invalid student data' });
    }
  } catch (error) {
    // 5. If any error occurs during creation, delete the uploaded image
    if (imagePublicId) {
      try {
        await cloudinary.uploader.destroy(imagePublicId);
        console.log('Cleaned up orphaned Cloudinary image:', imagePublicId);
      } catch (cleanupError) {
        console.error('Error cleaning up Cloudinary image:', cleanupError);
      }
    }

    // Catch validation errors (e.g., invalid department name)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
// --- END OF REPLACEMENT ---


// --- Your login and logout functions remain unchanged ---
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        let user = await Student.findOne({ email });
        let userType = 'student';

        // If not found as student, check if it's an admin
        if (!user) {
            user = await Admin.findOne({ email });
            userType = 'admin';
        }

        // If user exists and password matches
        if (user && (await user.comparePassword(password))) {
            const token = generateToken(user._id);

            res.cookie('token', token, {
                httpOnly: true,
                // secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
                // sameSite: 'strict', // Prevent CSRF
                // maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            res.json({
                _id: user._id,
                // Use username for admin, first/last name for student
                name: userType === 'admin' ? user.username : `${user.first_name} ${user.last_name}`,
                email: user.email,
                userType: userType,
                message: "Login successful"
            });
        } else {
            // Generic message for security (don't reveal if email exists)
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Login Error:", error); // Log the detailed error
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const logout = (req, res) => {
  // Clear the cookie by setting an expired date
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    // secure: process.env.NODE_ENV !== 'development', // Match settings used in login
    // sameSite: 'strict', // Match settings used in login
  });
  res.status(200).json({ message: 'Logged out successfully' });
};