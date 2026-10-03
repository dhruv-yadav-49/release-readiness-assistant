import express from 'express';
import Release from '../models/Release';
import GeneratedStatement from '../models/GeneratedStatement';
import { analyzeReleasePackage } from '../services/ai.service';

const router = express.Router();

router.get('/', async (req, res) => {
  const releases = await Release.find().sort({ createdAt: -1 });
  res.json(releases);
});

router.post('/', async (req, res) => {
  try {
    const newRelease = new Release(req.body);
    await newRelease.save();

    // Trigger AI Analysis
    const aiStatements = await analyzeReleasePackage(req.body);
    
    const statementDocs = aiStatements.map((st: any) => ({
      releaseId: newRelease._id,
      type: st.type,
      statement: st.statement,
      evidenceReferences: st.evidenceReferences,
      reviewStatus: 'pending',
      isStale: false
    }));
    
    await GeneratedStatement.insertMany(statementDocs);
    
    res.status(201).json(newRelease);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/statements', async (req, res) => {
  try {
    const statements = await GeneratedStatement.find({ releaseId: req.params.id });
    res.json(statements);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/statements/:id', async (req, res) => {
  try {
    const { statement, reviewStatus } = req.body;
    const updated = await GeneratedStatement.findByIdAndUpdate(
      req.params.id,
      { statement, reviewStatus },
      { new: true }
    );
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
