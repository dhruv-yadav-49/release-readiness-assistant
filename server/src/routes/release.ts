import express from 'express';
import mongoose from 'mongoose';
import Release from '../models/Release.js';
import GeneratedStatement from '../models/GeneratedStatement.js';
import { analyzeReleasePackage } from '../services/ai.service.js';
import { releaseSchema } from '../services/validation.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const releases = await Release.find().sort({ createdAt: -1 });
    res.json(releases);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid release ID' });
    }
    const release = await Release.findById(req.params.id);
    if (!release) return res.status(404).json({ error: 'Release not found' });
    res.json(release);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const parseResult = releaseSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error });
    }
    
    const parsedData = parseResult.data;
    const newRelease = new Release({ ...parsedData, analysisStatus: 'processing' });
    await newRelease.save();

    try {
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
      newRelease.analysisStatus = 'completed';
      await newRelease.save();
    } catch (aiError) {
      console.error('AI Analysis Failed:', aiError);
      newRelease.analysisStatus = 'failed';
      await newRelease.save();
    }
    
    res.status(201).json(newRelease);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/retry-analysis', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid release ID' });
    }
    const release = await Release.findById(req.params.id);
    if (!release) return res.status(404).json({ error: 'Release not found' });
    
    release.analysisStatus = 'processing';
    await release.save();

    try {
      const aiStatements = await analyzeReleasePackage(release.toObject());
      const statementDocs = aiStatements.map((st: any) => ({
        releaseId: release._id,
        type: st.type,
        statement: st.statement,
        evidenceReferences: st.evidenceReferences,
        reviewStatus: 'pending',
        isStale: false
      }));
      
      await GeneratedStatement.deleteMany({ releaseId: release._id });
      await GeneratedStatement.insertMany(statementDocs);
      
      release.analysisStatus = 'completed';
      await release.save();
    } catch (aiError) {
      console.error('AI Analysis Retry Failed:', aiError);
      release.analysisStatus = 'failed';
      await release.save();
    }
    
    res.json(release);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/statements', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid release ID' });
    }
    const statements = await GeneratedStatement.find({ releaseId: req.params.id });
    res.json(statements);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/final-brief', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid release ID' });
    }
    const statements = await GeneratedStatement.find({ 
      releaseId: req.params.id,
      reviewStatus: 'approved',
      isStale: false
    });
    res.json(statements);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/statements/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid statement ID' });
    }
    const { statement, reviewStatus } = req.body;
    
    const allowedStatuses = ['pending', 'approved', 'rejected'];
    if (reviewStatus && !allowedStatuses.includes(reviewStatus)) {
      return res.status(400).json({ error: 'Invalid review status' });
    }
    if (statement !== undefined && (typeof statement !== 'string' || !statement.trim())) {
      return res.status(400).json({ error: 'Invalid statement content' });
    }

    const updateData: any = {};
    if (statement !== undefined) updateData.statement = statement.trim();
    if (reviewStatus !== undefined) updateData.reviewStatus = reviewStatus;

    const updated = await GeneratedStatement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Statement not found' });
    }
    
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get version history
router.get('/:id/history', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid release ID' });
    }
    const history: any[] = [];
    let currentId: string | null = req.params.id;
    while (currentId) {
      const release: any = await Release.findById(currentId);
      if (!release) break;
      history.push(release);
      currentId = release.previousVersionId ? release.previousVersionId.toString() : null;
    }
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new version of an existing release
router.post('/:id/new-version', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid release ID' });
    }
    
    const parseResult = releaseSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error });
    }

    const oldRelease = await Release.findById(req.params.id);
    if (!oldRelease) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const parsedData = parseResult.data;
    const newVersionData = {
      ...parsedData,
      previousVersionId: oldRelease._id,
      status: 'draft'
    };

    const newRelease = new Release(newVersionData);
    await newRelease.save();

    newRelease.analysisStatus = 'processing';
    await newRelease.save();

    try {
      // 1. Copy old statements and determine staleness
      const oldStatements = await GeneratedStatement.find({ releaseId: oldRelease._id });
      const oldItemsMap = new Map(oldRelease.items.map(i => [i.itemId, i]));
      const newItemsMap = new Map(newRelease.items.map(i => [i.itemId, i]));
      
      const copiedStatements = oldStatements.map(st => {
        let isStale = false;
        if (!st.evidenceReferences || st.evidenceReferences.length === 0) {
           isStale = false;
        } else {
          for (const ref of st.evidenceReferences) {
            const oldItem = oldItemsMap.get(ref);
            const newItem = newItemsMap.get(ref);
            if (!newItem) {
              isStale = true;
            } else if (oldItem && (oldItem.qaEvidence !== newItem.qaEvidence || oldItem.description !== newItem.description || oldItem.type !== newItem.type)) {
              isStale = true;
            }
          }
        }
        
        return {
          releaseId: newRelease._id,
          type: st.type,
          statement: st.statement,
          evidenceReferences: st.evidenceReferences,
          reviewStatus: 'pending',
          isStale: isStale
        };
      });
      
      if (copiedStatements.length > 0) {
        await GeneratedStatement.insertMany(copiedStatements);
      }

      // 2. Generate fresh statements ONLY for added/modified items
      const itemsForAI = newRelease.items.filter(item => {
        const oldItem = oldItemsMap.get(item.itemId);
        return !oldItem || oldItem.qaEvidence !== item.qaEvidence || oldItem.description !== item.description || oldItem.type !== item.type;
      });

      if (itemsForAI.length > 0) {
        const aiStatements = await analyzeReleasePackage({ ...newRelease.toObject(), items: itemsForAI });
        const newStatementDocs = aiStatements.map((st: any) => ({
          releaseId: newRelease._id,
          type: st.type,
          statement: st.statement,
          evidenceReferences: st.evidenceReferences,
          reviewStatus: 'pending',
          isStale: false
        }));
        await GeneratedStatement.insertMany(newStatementDocs);
      }

      newRelease.analysisStatus = 'completed';
      await newRelease.save();
    } catch (error) {
      console.error('AI Analysis for new version failed:', error);
      newRelease.analysisStatus = 'failed';
      await newRelease.save();
    }
    
    res.status(201).json(newRelease);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
