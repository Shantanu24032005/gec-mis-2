import Student from '../models/student.model.js';
import Academic from '../models/academic.model.js';
import Fee from '../models/fee.model.js';
import Department from '../models/department.model.js'; // Keep this if you need HoD

export const getStudentDetails = async (req, res) => {
  try {
    const studentId = req.student?._id;

    if (!studentId) {
        return res.status(403).json({ message: 'Forbidden: User is not a student or ID not found' });
    }

    // REMOVED .populate() for department
    const student = await Student.findById(studentId).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // **Optional:** Fetch department details separately if needed (e.g., for HoD)
    let departmentDetails = null;
    if (student.department_name) {
        departmentDetails = await Department.findOne({ name: student.department_name }).select('head_of_department'); // Select only needed fields
    }

    const academics = await Academic.find({ student_id: studentId }).sort({ semester: 1 });
    const fees = await Fee.find({ student_id: studentId }).sort({ payment_date: -1 });

    res.json({
      details: {
          ...student.toObject(), // Spread student details
          head_of_department: departmentDetails?.head_of_department || null // Add HoD if found
      },
      academics,
      fees,
    });

  } catch (error) {
    console.error("Get Student Details Error:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};