import { supabase } from '../services/supabase.service.js';

// Get teacher's schedule
export const getTeacherSchedule = async (req, res) => {
  try {
    const teacherId = req.user.id;
    console.log("teacher id: ",req.user.id)

    // Fetch schedules by teacher_id (most robust - doesn't change when names are updated)
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('day', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Get teacher schedule error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch schedule'
      });
    }

    // Transform database format to frontend format
    const transformedSchedules = (schedules || []).map(schedule => ({
      id: schedule.id,
      day: schedule.day,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      subject: schedule.subject,
      grade: schedule.grade,
      section: schedule.section,
      room: schedule.room
    }));

    res.json({
      success: true,
      data: transformedSchedules
    });
    console.log("teacher schedule",transformedSchedules);

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

    // Transform database format to frontend format
    const transformedLeaveRequests = (leaveRequests || []).map(request => ({
      id: request.id,
      startDate: request.start_date,
      endDate: request.end_date,
      reason: request.reason,
      type: request.type,
      status: request.status,
      createdAt: request.created_at,
      approvedBy: request.approved_by,
      approvedAt: request.approved_at
    }));

    res.json({
      success: true,
      data: transformedLeaveRequests
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

    // Try to insert into leave_requests table with auto-approval
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
          status: 'approved', // Auto-approve all teacher leave requests
          approved_by: teacherId, // Self-approved
          approved_at: new Date().toISOString(),
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
          status: 'approved' // Auto-approved even in fallback
        },
        message: 'Leave request submitted and auto-approved (leave_requests table not yet created - please create database table)'
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