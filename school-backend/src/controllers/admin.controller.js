import { supabase } from '../services/supabase.service.js';

// Create a new schedule
export const createSchedule = async (req, res) => {
  try {
    const {
      grade,
      section = 'A',
      subject,
      teacher,
      teacherId,
      day,
      startTime,
      endTime,
      room
    } = req.body;

    // Validation
    if (!grade || !subject || !teacher || !day || !startTime || !endTime || !room) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: grade, subject, teacher, day, startTime, endTime, room'
      });
    }

    // Additional validation for teacherId
    if (!teacherId) {
      return res.status(400).json({
        success: false,
        error: 'Teacher ID is required'
      });
    }

    // Validate day
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid day. Must be one of: ' + validDays.join(', ')
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time format. Use HH:MM format'
      });
    }

    // Check if start time is before end time
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        error: 'Start time must be before end time'
      });
    }

    // Verify teacher exists in teachers table
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('id, name')
      .eq('id', teacherId)
      .single();

    if (teacherError || !teacherData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teacher selected'
      });
    }

    // Check for schedule conflicts (same grade, section, day, overlapping time)
    const { data: conflictCheck } = await supabase
      .from('schedules')
      .select('*')
      .eq('grade', grade)
      .eq('section', section)
      .eq('day', day)
      .or(`and(start_time.lte.${endTime},end_time.gt.${startTime})`);

    if (conflictCheck && conflictCheck.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Schedule conflict detected for Grade ${grade} Section ${section} on ${day} between ${startTime}-${endTime}`
      });
    }

    // Create the schedule
    const { data: scheduleData, error } = await supabase
      .from('schedules')
      .insert([{
        grade,
        section,
        subject,
        teacher_name: teacher,
        teacher_id: teacherId,
        day,
        start_time: startTime,
        end_time: endTime,
        room,
        created_by: req.user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating schedule:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create schedule'
      });
    }

    console.log('✅ Schedule created successfully:', scheduleData.id);
    res.json({
      success: true,
      data: {
        id: scheduleData.id,
        grade: scheduleData.grade,
        section: scheduleData.section,
        subject: scheduleData.subject,
        teacher: scheduleData.teacher_name,
        day: scheduleData.day,
        startTime: scheduleData.start_time,
        endTime: scheduleData.end_time,
        room: scheduleData.room
      },
      message: 'Schedule created successfully'
    });

  } catch (error) {
    console.error('Error in createSchedule:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get all schedules with optional filtering
export const getSchedules = async (req, res) => {
  try {
    const { grade, day, teacher } = req.query;

    let query = supabase
      .from('schedules')
      .select('*')
      .order('day', { ascending: true })
      .order('start_time', { ascending: true });

    // Apply filters
    if (grade) {
      query = query.eq('grade', grade);
    }
    if (day) {
      query = query.eq('day', day);
    }
    if (teacher) {
      query = query.ilike('teacher_name', `%${teacher}%`);
    }

    const { data: schedules, error } = await query;

    if (error) {
      console.error('Error fetching schedules:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch schedules'
      });
    }

    // Transform data to match frontend format
    const transformedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      grade: schedule.grade,
      section: schedule.section,
      subject: schedule.subject,
      teacher: schedule.teacher_name,
      day: schedule.day,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      room: schedule.room
    }));

    res.json({
      success: true,
      data: transformedSchedules,
      count: transformedSchedules.length
    });

  } catch (error) {
    console.error('Error in getSchedules:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Update a schedule
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      grade, 
      section, 
      subject, 
      teacher, 
      day, 
      startTime, 
      endTime, 
      room 
    } = req.body;

    // Check if schedule exists
    const { data: existingSchedule, error: fetchError } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingSchedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      });
    }

    // Validation
    if (startTime && endTime && startTime >= endTime) {
      return res.status(400).json({
        success: false,
        error: 'Start time must be before end time'
      });
    }

    // Handle teacher update
    const { teacherId: newTeacherId } = req.body;
    let teacherId = existingSchedule.teacher_id;
    
    if (newTeacherId && newTeacherId !== existingSchedule.teacher_id) {
      // Verify new teacher exists in teachers table
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id, name')
        .eq('id', newTeacherId)
        .single();

      if (teacherError || !teacherData) {
        return res.status(400).json({
          success: false,
          error: 'Invalid teacher selected'
        });
      }
      
      teacherId = newTeacherId;
    }

    // Update the schedule
    const updateData = {};
    if (grade !== undefined) updateData.grade = grade;
    if (section !== undefined) updateData.section = section;
    if (subject !== undefined) updateData.subject = subject;
    if (teacher !== undefined) {
      updateData.teacher_name = teacher;
      updateData.teacher_id = teacherId;
    }
    if (day !== undefined) updateData.day = day;
    if (startTime !== undefined) updateData.start_time = startTime;
    if (endTime !== undefined) updateData.end_time = endTime;
    if (room !== undefined) updateData.room = room;

    const { data: updatedSchedule, error } = await supabase
      .from('schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating schedule:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update schedule'
      });
    }

    console.log('✅ Schedule updated successfully:', id);
    res.json({
      success: true,
      data: {
        id: updatedSchedule.id,
        grade: updatedSchedule.grade,
        section: updatedSchedule.section,
        subject: updatedSchedule.subject,
        teacher: updatedSchedule.teacher_name,
        day: updatedSchedule.day,
        startTime: updatedSchedule.start_time,
        endTime: updatedSchedule.end_time,
        room: updatedSchedule.room
      },
      message: 'Schedule updated successfully'
    });

  } catch (error) {
    console.error('Error in updateSchedule:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Delete a schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if schedule exists
    const { data: existingSchedule, error: fetchError } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingSchedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      });
    }

    // Delete the schedule
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting schedule:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete schedule'
      });
    }

    console.log('✅ Schedule deleted successfully:', id);
    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteSchedule:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get schedule statistics
export const getScheduleStats = async (req, res) => {
  try {
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('grade, subject, teacher_name');

    if (error) {
      console.error('Error fetching schedule stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch schedule statistics'
      });
    }

    const stats = {
      totalSchedules: schedules.length,
      totalGrades: [...new Set(schedules.map(s => s.grade))].length,
      totalSubjects: [...new Set(schedules.map(s => s.subject))].length,
      totalTeachersAssigned: [...new Set(schedules.map(s => s.teacher_name))].length
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error in getScheduleStats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};