const prisma = require('../lib/prisma');

// GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const organizationId = req.organizationId;

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { defaultLowStockThreshold: true },
    });

    const products = await prisma.product.findMany({
      where: { organizationId },
    });

    const totalProducts = products.length;

    const totalStockQuantity = products.reduce((sum, p) => sum + p.quantityOnHand, 0);

    const totalInventoryValue = products.reduce((sum, p) => {
      if (p.costPrice !== null) {
        return sum + p.quantityOnHand * p.costPrice;
      }
      return sum;
    }, 0);

    const lowStockProducts = products.filter((p) => {
      const threshold = p.lowStockThreshold !== null ? p.lowStockThreshold : org.defaultLowStockThreshold;
      return p.quantityOnHand <= threshold;
    });

    return res.status(200).json({
      stats: {
        totalProducts,
        totalStockQuantity,
        totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
        lowStockCount: lowStockProducts.length,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// GET /api/dashboard/low-stock
const getLowStockProducts = async (req, res) => {
  try {
    const organizationId = req.organizationId;

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { defaultLowStockThreshold: true },
    });

    const products = await prisma.product.findMany({
      where: { organizationId },
      orderBy: { quantityOnHand: 'asc' },
    });

    const lowStockProducts = products
      .map((p) => {
        const threshold = p.lowStockThreshold !== null ? p.lowStockThreshold : org.defaultLowStockThreshold;
        return {
          ...p,
          effectiveThreshold: threshold,
          isLowStock: p.quantityOnHand <= threshold,
        };
      })
      .filter((p) => p.isLowStock);

    return res.status(200).json({ lowStockProducts });
  } catch (error) {
    console.error('Low stock error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// GET /api/dashboard/recent-products
const getRecentProducts = async (req, res) => {
  try {
    const organizationId = req.organizationId;

    const products = await prisma.product.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { defaultLowStockThreshold: true },
    });

    const enriched = products.map((p) => {
      const threshold = p.lowStockThreshold !== null ? p.lowStockThreshold : org.defaultLowStockThreshold;
      return { ...p, effectiveThreshold: threshold, isLowStock: p.quantityOnHand <= threshold };
    });

    return res.status(200).json({ recentProducts: enriched });
  } catch (error) {
    console.error('Recent products error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { getDashboardStats, getLowStockProducts, getRecentProducts };

