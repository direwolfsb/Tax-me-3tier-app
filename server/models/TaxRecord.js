import mongoose from 'mongoose';

const taxRecordSchema = new mongoose.Schema({
  income: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TaxRecord = mongoose.model('TaxRecord', taxRecordSchema);

export default TaxRecord;
