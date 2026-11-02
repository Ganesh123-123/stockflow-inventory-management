const prisma = require('../lib/prisma');

const isNonNegativeInteger = (value) => (
  (typeof value === 'number' || (typeof value === 'string' && value.trim() !== ''))
  && Number.isSafeInteger(Number(value))
  && Number(value) >= 0
);
const isNonNegativeNumber = (value) => (
  (typeof value === 'number' || (typeof value === 'string' && value.trim() !== ''))
  && Number.isFinite(Number(value))
  && Number(value) >= 0
);

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search } = req.query;
    const organizationId = req.organizationId;

    const whereClause = {
      organizationId,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
        ],
      }),
    };

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with low-stock status
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { defaultLowStockThreshold: true },
    });

    const enrichedProducts = products.map((p) => {
      const threshold = p.lowStockThreshold !== null ? p.lowStockThreshold : org.defaultLowStockThreshold;
      return {
        ...p,
        effectiveThreshold: threshold,
        isLowStock: p.quantityOnHand <= threshold,
      };
    });

    return res.status(200).json({ products: enrichedProducts });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.organizationId;

    const product = await prisma.product.findFirst({
      where: { id, organizationId },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { defaultLowStockThreshold: true },
    });

    const threshold = product.lowStockThreshold !== null ? product.lowStockThreshold : org.defaultLowStockThreshold;

    return res.status(200).json({
      product: {
        ...product,
        effectiveThreshold: threshold,
        isLowStock: product.quantityOnHand <= threshold,
      },
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = req.body;

    // Validate required fields
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required.' });
    }
    if (typeof sku !== 'string' || !sku.trim()) {
      return res.status(400).json({ message: 'SKU is required.' });
    }
    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({ message: 'Description must be text.' });
    }

    // Validate numeric fields
    if (quantityOnHand !== undefined && quantityOnHand !== '') {
      if (!isNonNegativeInteger(quantityOnHand)) {
        return res.status(400).json({ message: 'Quantity must be a non-negative integer.' });
      }
    }
    if (costPrice !== undefined && costPrice !== '' && costPrice !== null) {
      if (!isNonNegativeNumber(costPrice)) {
        return res.status(400).json({ message: 'Cost price must be a non-negative number.' });
      }
    }
    if (sellingPrice !== undefined && sellingPrice !== '' && sellingPrice !== null) {
      if (!isNonNegativeNumber(sellingPrice)) {
        return res.status(400).json({ message: 'Selling price must be a non-negative number.' });
      }
    }
    if (lowStockThreshold !== undefined && lowStockThreshold !== '' && lowStockThreshold !== null
      && !isNonNegativeInteger(lowStockThreshold)) {
      return res.status(400).json({ message: 'Low stock threshold must be a non-negative integer.' });
    }

    // Check SKU uniqueness within organization
    const existingSku = await prisma.product.findUnique({
      where: {
        organizationId_sku: {
          organizationId,
          sku: sku.trim().toUpperCase(),
        },
      },
    });

    if (existingSku) {
      return res.status(409).json({ message: 'A product with this SKU already exists in your organization.' });
    }

    const product = await prisma.product.create({
      data: {
        organizationId,
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        description: description ? description.trim() : null,
        quantityOnHand: quantityOnHand !== undefined && quantityOnHand !== '' ? parseInt(quantityOnHand) : 0,
        costPrice: costPrice !== undefined && costPrice !== '' && costPrice !== null ? parseFloat(costPrice) : null,
        sellingPrice: sellingPrice !== undefined && sellingPrice !== '' && sellingPrice !== null ? parseFloat(sellingPrice) : null,
        lowStockThreshold: lowStockThreshold !== undefined && lowStockThreshold !== '' && lowStockThreshold !== null ? parseInt(lowStockThreshold) : null,
      },
    });

    return res.status(201).json({ message: 'Product created successfully.', product });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A product with this SKU already exists in your organization.' });
    }
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.organizationId;
    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = req.body;

    // Check product exists in org
    const existingProduct = await prisma.product.findFirst({
      where: { id, organizationId },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Validate required fields
    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ message: 'Product name cannot be empty.' });
    }
    if (sku !== undefined && (typeof sku !== 'string' || !sku.trim())) {
      return res.status(400).json({ message: 'SKU cannot be empty.' });
    }
    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({ message: 'Description must be text.' });
    }

    // Validate numeric fields
    if (quantityOnHand !== undefined && quantityOnHand !== '') {
      if (!isNonNegativeInteger(quantityOnHand)) {
        return res.status(400).json({ message: 'Quantity must be a non-negative integer.' });
      }
    }
    if (costPrice !== undefined && costPrice !== '' && costPrice !== null && !isNonNegativeNumber(costPrice)) {
      return res.status(400).json({ message: 'Cost price must be a non-negative number.' });
    }
    if (sellingPrice !== undefined && sellingPrice !== '' && sellingPrice !== null && !isNonNegativeNumber(sellingPrice)) {
      return res.status(400).json({ message: 'Selling price must be a non-negative number.' });
    }
    if (lowStockThreshold !== undefined && lowStockThreshold !== '' && lowStockThreshold !== null
      && !isNonNegativeInteger(lowStockThreshold)) {
      return res.status(400).json({ message: 'Low stock threshold must be a non-negative integer.' });
    }

    // Check SKU uniqueness (if SKU is being changed)
    if (sku && sku.trim().toUpperCase() !== existingProduct.sku) {
      const existingSku = await prisma.product.findUnique({
        where: {
          organizationId_sku: {
            organizationId,
            sku: sku.trim().toUpperCase(),
          },
        },
      });
      if (existingSku) {
        return res.status(409).json({ message: 'A product with this SKU already exists in your organization.' });
      }
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (sku !== undefined) updateData.sku = sku.trim().toUpperCase();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (quantityOnHand !== undefined && quantityOnHand !== '') updateData.quantityOnHand = parseInt(quantityOnHand);
    if (costPrice !== undefined) updateData.costPrice = costPrice !== '' && costPrice !== null ? parseFloat(costPrice) : null;
    if (sellingPrice !== undefined) updateData.sellingPrice = sellingPrice !== '' && sellingPrice !== null ? parseFloat(sellingPrice) : null;
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold !== '' && lowStockThreshold !== null ? parseInt(lowStockThreshold) : null;

    const product = await prisma.product.update({
      where: { id, organizationId },
      data: updateData,
    });

    return res.status(200).json({ message: 'Product updated successfully.', product });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A product with this SKU already exists in your organization.' });
    }
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.organizationId;

    // Verify product belongs to this org
    const product = await prisma.product.findFirst({
      where: { id, organizationId },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await prisma.product.delete({ where: { id } });

    return res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
