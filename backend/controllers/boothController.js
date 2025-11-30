const { Booth, Expo } = require('../models');

exports.createBooth = async (req, res) => {
  try {
    const { expoId, boothNumber, size, price, location, features } = req.body;

    // Check if user has permission (admin or expo organizer)
    const expo = await Expo.findById(expoId);
    if (!expo) return res.status(404).json({ error: 'Expo not found' });

    if (req.user.role !== 'admin' && expo.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to create booths for this expo' });
    }

    // Check if booth number already exists for this expo
    const existingBooth = await Booth.findOne({ expo: expoId, boothNumber });
    if (existingBooth) {
      return res.status(400).json({ error: 'Booth number already exists for this expo' });
    }

    const booth = new Booth({
      expo: expoId,
      boothNumber,
      size: size || 'standard',
      price: price || 0,
      location,
      features: features || [],
      status: 'available'
    });

    await booth.save();

    // Populate expo data for response
    await booth.populate('expo');

    res.status(201).json(booth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignBooth = async (req, res) => {
  try {
    const { boothId, exhibitorId } = req.body;

    const booth = await Booth.findById(boothId).populate('expo');
    if (!booth) return res.status(404).json({ error: 'Booth not found' });

    // Check if user has permission (admin or expo organizer)
    if (req.user.role !== 'admin' && booth.expo.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to assign booths for this expo' });
    }

    if (booth.status !== 'available') {
      return res.status(400).json({ error: 'Booth is not available for assignment' });
    }

    // Find the approved exhibitor for this expo
    const Exhibitor = require('../models').Exhibitor;
    const exhibitor = await Exhibitor.findOne({
      _id: exhibitorId,
      expoApplication: booth.expo._id,
      status: 'approved'
    });

    if (!exhibitor) {
      return res.status(400).json({ error: 'Invalid exhibitor or not approved for this expo' });
    }

    // Update booth with assignment
    booth.exhibitor = exhibitor._id;
    booth.status = 'assigned';
    booth.assignedTo = {
      id: exhibitor._id,
      companyName: exhibitor.company,
      contactEmail: exhibitor.contact
    };

    await booth.save();

    // Update exhibitor's booths array
    if (!exhibitor.booths) exhibitor.booths = [];
    exhibitor.booths.push(booth._id);
    await exhibitor.save();

    // Populate for response
    await booth.populate('exhibitor');

    res.status(200).json({ message: 'Booth assigned successfully', booth });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBooth = async (req, res) => {
  try {
    const { boothNumber, size, price, location, features, status } = req.body;

    const booth = await Booth.findById(req.params.id).populate('expo');
    if (!booth) return res.status(404).json({ error: 'Booth not found' });

    // Check if user has permission (admin or expo organizer)
    if (req.user.role !== 'admin' && booth.expo.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to update this booth' });
    }

    // Check if booth number already exists for this expo (if changing booth number)
    if (boothNumber && boothNumber !== booth.boothNumber) {
      const existingBooth = await Booth.findOne({
        expo: booth.expo._id,
        boothNumber,
        _id: { $ne: req.params.id }
      });
      if (existingBooth) {
        return res.status(400).json({ error: 'Booth number already exists for this expo' });
      }
    }

    const updatedBooth = await Booth.findByIdAndUpdate(
      req.params.id,
      {
        boothNumber: boothNumber || booth.boothNumber,
        size: size || booth.size,
        price: price !== undefined ? price : booth.price,
        location: location || booth.location,
        features: features || booth.features,
        status: status || booth.status
      },
      { new: true }
    ).populate('expo').populate('exhibitor');

    res.json(updatedBooth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.unassignBooth = async (req, res) => {
  try {
    const { boothId } = req.body;

    const booth = await Booth.findById(boothId).populate('expo');
    if (!booth) return res.status(404).json({ error: 'Booth not found' });

    // Check if user has permission (admin or expo organizer)
    if (req.user.role !== 'admin' && booth.expo.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to unassign this booth' });
    }

    if (booth.status !== 'assigned') {
      return res.status(400).json({ error: 'Booth is not currently assigned' });
    }

    // Remove booth from exhibitor's booths array
    const Exhibitor = require('../models').Exhibitor;
    if (booth.exhibitor) {
      await Exhibitor.findByIdAndUpdate(booth.exhibitor, {
        $pull: { booths: boothId }
      });
    }

    // Update booth
    booth.exhibitor = null;
    booth.status = 'available';
    booth.assignedTo = null;
    await booth.save();

    res.status(200).json({ message: 'Booth unassigned successfully', booth });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBooth = async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id).populate('expo');
    if (!booth) return res.status(404).json({ error: 'Booth not found' });

    // Check if user has permission (admin or expo organizer)
    if (req.user.role !== 'admin' && booth.expo.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to delete this booth' });
    }

    // If booth is assigned, remove it from exhibitor's booths array
    if (booth.exhibitor) {
      const Exhibitor = require('../models').Exhibitor;
      await Exhibitor.findByIdAndUpdate(booth.exhibitor, {
        $pull: { booths: req.params.id }
      });
    }

    await Booth.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Booth deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBooths = async (req, res) => {
  try {
    const booths = await Booth.find().populate('expo').populate('exhibitor');
    res.json(booths);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBooth = async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id).populate('expo').populate('exhibitor');
    if (!booth) return res.status(404).json({ error: 'Booth not found' });
    res.json(booth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBoothsByExhibitor = async (req, res) => {
  try {
    const { exhibitorId } = req.params;

    // Find all booths assigned to this exhibitor
    const booths = await Booth.find({
      exhibitor: exhibitorId,
      status: 'assigned'
    }).populate('expo');

    res.json(booths);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
