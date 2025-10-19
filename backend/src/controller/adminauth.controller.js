import Admin from '../models/admin.model.js';
import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (adminId, adminRole, res) => {
  // Ensure you have JWT_SECRET in your .env file
  const token = jwt.sign(
    { adminId, role: adminRole },
    process.env.JWT_SECRET,
    {
      expiresIn: '15d', // Token will expire in 15 days
    }
  );

  res.cookie('admin_jwt', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
  });
};
export const adminRegister = async (req, res) => {
  try {
    const { username, email, password, role, department_id } = req.body;
    if (!username || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: 'Missing required fields: username, email, password, role.' });
    }
    const existingAdmin = await Admin.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });

    if (existingAdmin) {
      return res
        .status(409) // 409 Conflict
        .json({ message: 'Admin with this username or email already exists.' });
    }
    const newAdmin = new Admin({
      username,
      email,
      password,
      role,
      department_id: role === 'department_admin' ? department_id : undefined,
    });

    const savedAdmin = await newAdmin.save();
    const adminResponse = savedAdmin.toObject();
    delete adminResponse.password;


    res.status(201).json({
      message: 'Admin registered successfully.',
      admin: adminResponse,
    });

  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: error.errors });
    }
    console.error('Error in adminRegister:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // 1. Find the admin by username (which is saved as lowercase)
    const admin = await Admin.findOne({ username: username.toLowerCase() });

    // 2. Check if admin exists and is active
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    if (!admin.is_active) {
        return res.status(403).json({ message: 'This admin account is disabled.' });
    }

    // 3. Compare password using the method from your model
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 4. Generate token and set cookie
    generateTokenAndSetCookie(admin._id, admin.role, res);

    // 5. Update last_login field
    admin.last_login = Date.now();
    await admin.save();

    // 6. Send response (excluding password)
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(200).json({
      message: 'Admin logged in successfully.',
      admin: adminResponse,
    });

  } catch (error) {
    console.error('Error in adminLogin:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const adminLogout = (req, res) => {
  try {
    // Clear the cookie by setting it to an empty string and expiring it
    res.cookie('admin_jwt', '', {
      httpOnly: true,
      expires: new Date(0), // Expire immediately
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Admin logged out successfully.' });
  } catch (error) {
    console.error('Error in adminLogout:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};