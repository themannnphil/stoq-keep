const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Inventory = require('../models/Inventory');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all inventory items with filtering and pagination
router.get('/', [
  auth,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isIn(['Electronics', 'Clothing', 'Food', 'Books', 'Furniture', 'Sports', 'Other'])
    .withMessage('Invalid category'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'discontinued'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const inventoryItems = await Inventory.find(filter)
      .populate('addedBy', 'username email')
      .populate('lastUpdatedBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inventory.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        inventoryItems,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching inventory items'
    });
  }
});

// Get single inventory item by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id)
      .populate('addedBy', 'username email')
      .populate('lastUpdatedBy', 'username email');

    if (!inventoryItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Inventory item not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { inventoryItem }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid inventory item ID'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching inventory item'
    });
  }
});

// Create new inventory item
router.post('/', [
  auth,
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  body('category')
    .isIn(['Electronics', 'Clothing', 'Food', 'Books', 'Furniture', 'Sports', 'Other'])
    .withMessage('Invalid category'),
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('SKU must contain only uppercase letters, numbers, and hyphens'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('minStockLevel')
    .isInt({ min: 0 })
    .withMessage('Minimum stock level must be a non-negative integer'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const inventoryData = {
      ...req.body,
      addedBy: req.user._id,
      lastUpdatedBy: req.user._id
    };

    const inventoryItem = new Inventory(inventoryData);
    await inventoryItem.save();

    await inventoryItem.populate('addedBy', 'username email');
    await inventoryItem.populate('lastUpdatedBy', 'username email');

    res.status(201).json({
      status: 'success',
      message: 'Inventory item created successfully',
      data: { inventoryItem }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'SKU already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error creating inventory item'
    });
  }
});

// Update inventory item
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  body('category')
    .optional()
    .isIn(['Electronics', 'Clothing', 'Food', 'Books', 'Furniture', 'Sports', 'Other'])
    .withMessage('Invalid category'),
  body('sku')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('SKU cannot be empty')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('SKU must contain only uppercase letters, numbers, and hyphens'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('minStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock level must be a non-negative integer'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const inventoryItem = await Inventory.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Inventory item not found'
      });
    }

    // Check if user is admin or the one who added the item
    if (req.user.role !== 'admin' && inventoryItem.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only edit items you added.'
      });
    }

    const updateData = {
      ...req.body,
      lastUpdatedBy: req.user._id
    };

    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'username email')
     .populate('lastUpdatedBy', 'username email');

    res.status(200).json({
      status: 'success',
      message: 'Inventory item updated successfully',
      data: { inventoryItem: updatedItem }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid inventory item ID'
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'SKU already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error updating inventory item'
    });
  }
});

// Delete inventory item
router.delete('/:id', auth, async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Inventory item not found'
      });
    }

    // Only admin can delete items
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Only admin can delete inventory items.'
      });
    }

    await Inventory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid inventory item ID'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error deleting inventory item'
    });
  }
});

// Get low stock items
router.get('/alerts/low-stock', auth, async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    })
    .populate('addedBy', 'username email')
    .sort({ quantity: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        lowStockItems,
        count: lowStockItems.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching low stock items'
    });
  }
});

// Update stock quantity
router.patch('/:id/stock', [
  auth,
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('operation')
    .optional()
    .isIn(['set', 'add', 'subtract'])
    .withMessage('Operation must be set, add, or subtract')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { quantity, operation = 'set' } = req.body;

    const inventoryItem = await Inventory.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Inventory item not found'
      });
    }

    let newQuantity;
    switch (operation) {
      case 'set':
        newQuantity = quantity;
        break;
      case 'add':
        newQuantity = inventoryItem.quantity + quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, inventoryItem.quantity - quantity);
        break;
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      { 
        quantity: newQuantity,
        lastUpdatedBy: req.user._id
      },
      { new: true, runValidators: true }
    ).populate('addedBy', 'username email')
     .populate('lastUpdatedBy', 'username email');

    res.status(200).json({
      status: 'success',
      message: 'Stock quantity updated successfully',
      data: { inventoryItem: updatedItem }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid inventory item ID'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error updating stock quantity'
    });
  }
});

module.exports = router;
