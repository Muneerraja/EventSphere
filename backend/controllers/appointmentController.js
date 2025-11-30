const { Appointment, User, Exhibitor, Expo, Booth } = require('../models');

exports.createAppointment = async (req, res) => {
  try {
    const { exhibitorId, boothId, expoId, dateTime, duration = 30, purpose, notes } = req.body;

    // Validate required fields
    if (!exhibitorId || !expoId || !dateTime) {
      return res.status(400).json({ error: 'Exhibitor ID, Expo ID, and date/time are required' });
    }

    // Check if exhibitor exists and is approved for this expo
    const exhibitor = await Exhibitor.findOne({
      user: exhibitorId,
      expoApplication: expoId,
      status: 'approved'
    });

    if (!exhibitor) {
      return res.status(404).json({ error: 'Exhibitor not found or not approved for this expo' });
    }

    // Check if expo exists
    const expo = await Expo.findById(expoId);
    if (!expo) {
      return res.status(404).json({ error: 'Expo not found' });
    }

    // Check if booth belongs to the exhibitor (if boothId provided)
    let booth = null;
    if (boothId) {
      booth = await Booth.findOne({
        _id: boothId,
        exhibitor: exhibitor._id,
        status: 'assigned'
      });
      if (!booth) {
        return res.status(400).json({ error: 'Invalid booth for this exhibitor' });
      }
    }

    // Check for scheduling conflicts (basic check)
    const appointmentDateTime = new Date(dateTime);
    const endTime = new Date(appointmentDateTime.getTime() + (duration * 60000));

    const conflictingAppointment = await Appointment.findOne({
      exhibitor: exhibitorId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          dateTime: { $lt: endTime },
          $expr: { $gt: [{ $add: ['$dateTime', { $multiply: ['$duration', 60000] }] }, appointmentDateTime] }
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(400).json({ error: 'Time slot conflicts with existing appointment' });
    }

    // Create appointment
    const appointment = new Appointment({
      attendee: req.user._id,
      exhibitor: exhibitorId,
      booth: boothId || null,
      expo: expoId,
      dateTime: appointmentDateTime,
      duration,
      purpose,
      notes,
      status: 'pending'
    });

    await appointment.save();

    // Populate for response
    await appointment.populate([
      { path: 'attendee', select: 'username profile.firstName profile.lastName' },
      { path: 'exhibitor', select: 'username profile.firstName profile.lastName' },
      { path: 'booth' },
      { path: 'expo', select: 'title' }
    ]);

    // Create notification for exhibitor
    const { createNotification } = require('./notificationController');
    await createNotification(
      exhibitorId,
      'New Appointment Request',
      `You have a new appointment request from ${req.user.username}`,
      { appointmentId: appointment._id, attendeeId: req.user._id },
      true // Send email notification
    );

    res.status(201).json({
      message: 'Appointment scheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('attendee', 'username profile.firstName profile.lastName')
      .populate('exhibitor', 'username profile.firstName profile.lastName')
      .populate('booth')
      .populate('expo', 'title date')
      .sort({ dateTime: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('attendee', 'username profile.firstName profile.lastName')
      .populate('exhibitor', 'username profile.firstName profile.lastName')
      .populate('booth')
      .populate('expo', 'title date location');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user is authorized to view this appointment
    if (appointment.attendee._id.toString() !== req.user._id.toString() &&
        appointment.exhibitor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to view this appointment' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAppointmentsByAttendee = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if requesting user is the attendee or an admin
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const appointments = await Appointment.find({ attendee: userId })
      .populate('exhibitor', 'username profile.firstName profile.lastName')
      .populate('booth')
      .populate('expo', 'title date location')
      .sort({ dateTime: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAppointmentsByExhibitor = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if requesting user is the exhibitor or an admin
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const appointments = await Appointment.find({ exhibitor: userId })
      .populate('attendee', 'username profile.firstName profile.lastName')
      .populate('booth')
      .populate('expo', 'title date location')
      .sort({ dateTime: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user is authorized to update this appointment
    if (appointment.attendee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the attendee can update the appointment' });
    }

    // Only allow updates for pending appointments
    if (appointment.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot update confirmed or completed appointments' });
    }

    const { dateTime, duration, purpose, notes } = req.body;

    // Check for conflicts if dateTime is being changed
    if (dateTime && new Date(dateTime).getTime() !== appointment.dateTime.getTime()) {
      const newDateTime = new Date(dateTime);
      const endTime = new Date(newDateTime.getTime() + ((duration || appointment.duration) * 60000));

      const conflictingAppointment = await Appointment.findOne({
        exhibitor: appointment.exhibitor,
        status: { $in: ['pending', 'confirmed'] },
        _id: { $ne: req.params.id },
        $or: [
          {
            dateTime: { $lt: endTime },
            $expr: { $gt: [{ $add: ['$dateTime', { $multiply: ['$duration', 60000] }] }, newDateTime] }
          }
        ]
      });

      if (conflictingAppointment) {
        return res.status(400).json({ error: 'Time slot conflicts with existing appointment' });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { dateTime, duration, purpose, notes },
      { new: true }
    ).populate([
      { path: 'attendee', select: 'username profile.firstName profile.lastName' },
      { path: 'exhibitor', select: 'username profile.firstName profile.lastName' },
      { path: 'booth' },
      { path: 'expo', select: 'title' }
    ]);

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user is authorized to update status
    // Exhibitors can confirm/cancel, attendees can cancel their own pending appointments
    const isExhibitor = appointment.exhibitor.toString() === req.user._id.toString();
    const isAttendee = appointment.attendee.toString() === req.user._id.toString();

    if (!isExhibitor && !isAttendee) {
      return res.status(403).json({ error: 'Unauthorized to update this appointment' });
    }

    // Validation rules
    if (isAttendee && !['cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Attendees can only cancel appointments' });
    }

    if (isExhibitor && !['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Exhibitors can only confirm or cancel appointments' });
    }

    appointment.status = status;
    await appointment.save();

    await appointment.populate([
      { path: 'attendee', select: 'username profile.firstName profile.lastName' },
      { path: 'exhibitor', select: 'username profile.firstName profile.lastName' },
      { path: 'booth' },
      { path: 'expo', select: 'title' }
    ]);

    // Create notification for the other party
    const { createNotification } = require('./notificationController');
    const notificationRecipient = isExhibitor ? appointment.attendee._id : appointment.exhibitor._id;
    const notificationMessage = isExhibitor
      ? `Your appointment request has been ${status}`
      : `An appointment has been ${status} by the attendee`;

    await createNotification(
      notificationRecipient,
      'Appointment Update',
      notificationMessage,
      { appointmentId: appointment._id },
      true
    );

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Only allow deletion by the attendee for pending appointments
    if (appointment.attendee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the attendee can delete the appointment' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot delete confirmed or completed appointments' });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
