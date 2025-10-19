import jwt from 'jsonwebtoken';
import Student from '../models/student.model.js';
import Admin from '../models/admin.model.js';

// General middleware to protect routes, checks for student or admin
export const protectAll = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        try {
            token = req.cookies.token;
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Try finding user as Student first
            let user = await Student.findById(decoded.id).select('-password');
            if (user) {
                req.user = user; // Attach general user info
                req.student = user; // Attach specific student info
                return next(); // Student found, proceed
            }

            // If not a student, try finding as Admin
            user = await Admin.findById(decoded.id).select('-password');
            if (user) {
                req.user = user; // Attach general user info
                // req.admin = user; // Optionally attach specific admin info if needed later
                return next(); // Admin found, proceed
            }

            // If user ID in token doesn't match any user
            return res.status(401).json({ message: 'Not authorized, user not found' });

        } catch (error) {
            console.error('Token verification failed:', error);
            // Handle different JWT errors specifically if needed (e.g., TokenExpiredError)
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Not authorized, token invalid' });
            }
             if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Not authorized, token expired' });
            }
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If no token is found in cookies
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Example of specific middleware if you needed routes ONLY for students
// export const protectStudent = async (req, res, next) => {
//   // Implementation similar to protectAll but only checks Student model
// };

// Example of specific middleware if you needed routes ONLY for admins
// export const protectAdmin = async (req, res, next) => {
//   // Implementation similar to protectAll but only checks Admin model
// };