import express from 'express';
import TaxRecord from '../models/TaxRecord.js';

const router = express.Router();

// POST: Calculate and save a tax record
router.post('/', async (req, res) => {
  const { income } = req.body;

  // Tax brackets
  const taxBrackets = [
    { limit: 10275, rate: 0.10 },
    { limit: 41775, rate: 0.12 },
    { limit: 89075, rate: 0.22 },
    { limit: 170050, rate: 0.24 },
    { limit: 215950, rate: 0.32 },
    { limit: 539900, rate: 0.35 },
    { limit: Infinity, rate: 0.37 }
  ];

  // Tax calculation logic
  const calculateTax = (income) => {
    let totalTax = 0;
    let remainingIncome = income;

    for (const bracket of taxBrackets) {
      if (remainingIncome > bracket.limit) {
        totalTax += bracket.limit * bracket.rate;
        remainingIncome -= bracket.limit;
      } else {
        totalTax += remainingIncome * bracket.rate;
        break;
      }
    }

    return totalTax;
  };

  const tax = calculateTax(income);

  try {
    const newRecord = new TaxRecord({ income, tax });
    const savedRecord = await newRecord.save();
    res.json(savedRecord);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: Fetch all tax records
router.get('/', async (req, res) => {
  try {
    const records = await TaxRecord.find();
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE: Delete a tax record by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRecord = await TaxRecord.findByIdAndDelete(id);
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
