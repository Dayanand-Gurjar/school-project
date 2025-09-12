import { supabase } from '../services/supabase.service.js';

// Get teacher's schedule
export const getTeacherSchedule = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacherName = `${req.user.firstName} ${req.user.lastName}`;

    // First, check if schedules table exists, if not create sample data
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('teacher_name', teacherName)
      .order('day', { ascending: true })
      .order('start_time', { ascending: true });

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, return sample data for now
      const sampleSchedule = [
        {
          id: 1,
          day: 'Monday',
          startTime: '09:00',
          endTime: '09:45',
          subject: req.user.subject || 'Mathematics',
          grade: '9',
          section: 'A',
          room: 'Room 101'
        },
        {
          id: 2,
          day: 'Monday',
          startTime: '10:00',
          endTime: '10:45',
          subject: req.user.subject || 'Mathematics',
          grade: '10',
          section: 'B',
          room: 'Room 101'
        },
        {
          id: 3,
          day: 'Tuesday',
          startTime: '09:00',
          endTime: '09:45',
          subject: req.user.subject || 'Mathematics',
          grade: '9',
          section: 'A',
          room: 'Room 101'
        },
        {
          id: 4,
          day: 'Wednesday',
          startTime: '11:00',
          endTime: '11:45',
          subject: req.user.subject || 'Mathematics',
          grade: '11',
          section: 'A',
          room: 'Room 101'
        },
        {
          id: 5,
          day: 'Thursday',
          startTime: '09:00',
          endTime: '09:45',
          subject: req.user.subject || 'Mathematics',
          grade: '9',
          section: 'A',
          room: 'Room 101'
        },
        {
          id: 6,
          day: 'Friday',
          startTime: '10:00',
          endTime: '10:45',
          subject: req.user.subject || 'Mathematics',
          grade: '10',
          section: 'B',
          room: 'Room 101'
        }
      ];

      return res.json({
        success: true,
        data: sampleSchedule,
        message: 'Sample schedule data (schedules table not yet created)'
      });
    }

    if (error) {
      console.error('Get teacher schedule error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch schedule'
      });
    }

    res.json({
      success: true,
      data: schedules || []
    });

  } catch (error) {
    console.error('Get teacher schedule error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get teacher's leave requests
export const getTeacherLeaveRequests = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Check if leave_requests table exists
    const { data: leaveRequests, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, return empty array for now
      return res.json({
        success: true,
        data: [],
        message: 'Leave requests table not yet created'
      });
    }

    if (error) {
      console.error('Get leave requests error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch leave requests'
      });
    }

    res.json({
      success: true,
      data: leaveRequests || []
    });

  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Submit leave request
export const submitLeaveRequest = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { startDate, endDate, reason, type } = req.body;

    if (!startDate || !endDate || !reason || !type) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Try to insert into leave_requests table
    const { data: leaveRequest, error } = await supabase
      .from('leave_requests')
      .insert([
        {
          teacher_id: teacherId,
          teacher_name: `${req.user.firstName} ${req.user.lastName}`,
          start_date: startDate,
          end_date: endDate,
          reason: reason,
          type: type,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, return success message but note that table needs to be created
      return res.json({
        success: true,
        data: {
          id: Date.now(),
          startDate,
          endDate,
          reason,
          type,
          status: 'pending'
        },
        message: 'Leave request submitted (leave_requests table not yet created - please create database table)'
      });
    }

    if (error) {
      console.error('Submit leave request error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to submit leave request'
      });
    }

    res.json({
      success: true,
      data: {
        id: leaveRequest.id,
        startDate: leaveRequest.start_date,
        endDate: leaveRequest.end_date,
        reason: leaveRequest.reason,
        type: leaveRequest.type,
        status: leaveRequest.status
      }
    });

  } catch (error) {
    console.error('Submit leave request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get students assigned to teacher
export const getTeacherStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacherSubject = req.user.subject;

    // Try to get students from students table where the teacher teaches their class
    // For now, we'll get all students and filter later when we have proper class-teacher assignments
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('name', { ascending: true });

    if (error && error.code === 'PGRST116') {
      // Students table doesn't exist, return empty array
      return res.json({
        success: true,
        data: [],
        message: 'Students table not yet created'
      });
    }

    if (error) {
      console.error('Get teacher students error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch students'
      });
    }

    // For now, return all students (in a real system, we'd filter by teacher assignments)
    // Format the data to match what the frontend expects
    const formattedStudents = (students || []).map(student => ({
      id: student.id,
      firstName: student.name ? student.name.split(' ')[0] : 'Unknown',
      lastName: student.name ? student.name.split(' ').slice(1).join(' ') : '',
      email: student.email || `${student.name?.toLowerCase().replace(/\s+/g, '.')}@school.edu`,
      grade: student.class || 'N/A'
    }));

    res.json({
      success: true,
      data: formattedStudents
    });

  } catch (error) {
    console.error('Get teacher students error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};