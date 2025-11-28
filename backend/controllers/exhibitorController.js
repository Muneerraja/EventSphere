const { Exhibitor } = require('../models');

exports.createExhibitor = async (req, res) => {
  try {
    const { company, products, logo, contact, description, expoId } = req.body;
    const user = req.user.id;
    const logoFile = req.file ? req.file.filename : null;
    const exhibitor = new Exhibitor({ user, company, products, logo: logoFile, contact, description, expoApplication: expoId });
    await exhibitor.save();
    res.status(201).json(exhibitor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getExhibitorProfile = async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findOne({ user: req.user.id }).populate('user').populate('expoApplication').populate('booths');
    if (!exhibitor) return res.status(404).json({ error: 'Exhibitor profile not found' });
    res.json(exhibitor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateExhibitorProfile = async (req, res) => {
  try {
    const { company, products, contact, description } = req.body;
    const logoFile = req.file ? req.file.filename : undefined;
    const exhibitor = await Exhibitor.findOne({ user: req.user.id });
    if (!exhibitor) return res.status(404).json({ error: 'Exhibitor profile not found' });

    const updateFields = { company, products, contact, description };
    if (logoFile) updateFields.logo = logoFile;
    const updatedExhibitor = await Exhibitor.findByIdAndUpdate(exhibitor._id, updateFields, { new: true }).populate('user').populate('expoApplication').populate('booths');
    res.json(updatedExhibitor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateExhibitor = async (req, res) => {
  try {
    const { company, products, logo, contact, description } = req.body;
    const logoFile = req.file ? req.file.filename : undefined;
    const exhibitor = await Exhibitor.findById(req.params.id);
    if (!exhibitor) return res.status(404).json({ error: 'Exhibitor not found' });
    if (exhibitor.user.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    const updateFields = { company, products, logo, contact, description };
    if (logoFile) updateFields.logo = logoFile;
    const updatedExhibitor = await Exhibitor.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(updatedExhibitor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteExhibitor = async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findById(req.params.id);
    if (!exhibitor) return res.status(404).json({ error: 'Exhibitor not found' });
    if (exhibitor.user.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await Exhibitor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exhibitor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveExhibitor = async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findById(req.params.id);
    if (!exhibitor) return res.status(404).json({ error: 'Exhibitor not found' });
    exhibitor.status = 'approved';
    await exhibitor.save();
    res.json(exhibitor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectExhibitor = async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findById(req.params.id);
    if (!exhibitor) return res.status(404).json({ error: 'Exhibitor not found' });
    exhibitor.status = 'rejected';
    await exhibitor.save();
    res.json(exhibitor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchExhibitors = async (req, res) => {
  try {
    const { category, keywords } = req.query;
    let query = {};

    if (category) query.products = { $in: [category] };
    if (keywords) query.$or = [
      { company: { $regex: keywords, $options: 'i' } },
      { description: { $regex: keywords, $options: 'i' } },
      { products: { $in: [new RegExp(keywords, 'i')] } }
    ];

    const exhibitors = await Exhibitor.find(query).populate('user');
    res.json(exhibitors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getExhibitors = async (req, res) => {
  try {
    const exhibitors = await Exhibitor.find().populate('user').populate('products');
    res.json(exhibitors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getExhibitor = async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findById(req.params.id).populate('user');
    if (!exhibitor) return res.status(404).json({ error: 'Exhibitor not found' });
    res.json(exhibitor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicExhibitorsByExpo = async (req, res) => {
  try {
    const { expoId } = req.params;
    const exhibitors = await Exhibitor.find({ expoApplication: expoId, status: 'approved' }).populate('user');
    res.json(exhibitors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
