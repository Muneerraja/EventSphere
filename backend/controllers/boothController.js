const { Booth, Expo } = require('../models');

exports.createBooth = async (req, res) => {
  try {
    const { expo, exhibitor, space, products, contact } = req.body;
    const booth = new Booth({ expo, exhibitor, space, products, contact });
    await booth.save();

    // Update Exhibitor booths array
    const exhibitorDoc = await require('../models').Exhibitor.findById(exhibitor);
    if (exhibitorDoc) {
      exhibitorDoc.booths.push(booth._id);
      await exhibitorDoc.save();
    }

    // Update Expo floor plan
    const expoDoc = await Expo.findById(expo);
    if (expoDoc && expoDoc.floorPlan) {
      const boothData = expoDoc.floorPlan.find(b => b.boothId === space);
      if (boothData) {
        boothData.available = false;
        boothData.assignedTo = exhibitor;
        await expoDoc.save();
      }
    }

    res.status(201).json(booth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignBooth = async (req, res) => {
  try {
    const { expoId, exhibitorId, boothId } = req.body;

    const expo = await Expo.findById(expoId);
    if (!expo) return res.status(404).json({ error: 'Expo not found' });
    if (expo.organizer.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    const boothData = expo.floorPlan.find(b => b.boothId === boothId);
    if (!boothData) return res.status(404).json({ error: 'Booth not found' });
    if (!boothData.available) return res.status(400).json({ error: 'Booth already assigned' });

    const exhibitor = await require('../models').Exhibitor.findById(exhibitorId);
    if (!exhibitor || exhibitor.status !== 'approved') return res.status(400).json({ error: 'Invalid exhibitor or not approved' });

    // Create booth record
    const booth = new Booth({
      expo: expoId,
      exhibitor: exhibitorId,
      space: boothId,
      products: exhibitor.products,
      contact: exhibitor.contact
    });
    await booth.save();

    // Update relations
    exhibitor.booths.push(booth._id);
    await exhibitor.save();

    boothData.available = false;
    boothData.assignedTo = exhibitorId;
    await expo.save();

    // Real-time broadcast booth availability update
    if (global.io) {
      global.io.to(`expo-${expoId}`).emit('booth-updated', {
        boothId: boothId,
        available: false,
        assignedTo: exhibitorId
      });
    }

    res.status(200).json({ message: 'Booth assigned successfully', booth });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBooth = async (req, res) => {
  try {
    const { space, products, contact } = req.body;
    const booth = await Booth.findById(req.params.id);
    if (!booth) return res.status(404).json({ error: 'Booth not found' });
    if (booth.exhibitor.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    const updatedBooth = await Booth.findByIdAndUpdate(req.params.id, { space, products, contact }, { new: true });
    res.json(updatedBooth);
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
