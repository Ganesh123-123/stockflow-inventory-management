const prisma = require('../lib/prisma');

// GET /api/settings
const getSettings = async (req, res) => {
  try {
    const organizationId = req.organizationId;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        defaultLowStockThreshold: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    return res.status(200).json({ settings: organization });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const { name, defaultLowStockThreshold } = req.body;

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ message: 'Organization name cannot be empty.' });
    }

    if (defaultLowStockThreshold !== undefined) {
      const threshold = Number(defaultLowStockThreshold);
      const hasNumericValue = typeof defaultLowStockThreshold === 'number'
        || (typeof defaultLowStockThreshold === 'string' && defaultLowStockThreshold.trim() !== '');
      if (!hasNumericValue || !Number.isSafeInteger(threshold) || threshold < 0) {
        return res.status(400).json({ message: 'Default low stock threshold must be a non-negative integer.' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (defaultLowStockThreshold !== undefined) updateData.defaultLowStockThreshold = Number(defaultLowStockThreshold);

    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
      select: {
        id: true,
        name: true,
        defaultLowStockThreshold: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({ message: 'Settings updated successfully.', settings: organization });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { getSettings, updateSettings };
