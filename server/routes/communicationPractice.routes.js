import express from 'express';
import {
  getProfile,
  generateDailyScenario,
  submitScenario,
  generateVocabulary,
  saveVocabulary,
  toggleVocabularyMastery,
  deleteVocabulary,
  generateGrammarTest,
  submitGrammarTest
} from '../controllers/communicationPractice.controller.js';

const router = express.Router();

router.get('/communication-practice/profile', getProfile);

// Scenarios
router.get('/communication-practice/scenario', generateDailyScenario);
router.post('/communication-practice/scenario', submitScenario);

// Vocabulary
router.get('/communication-practice/vocabulary', generateVocabulary);
router.post('/communication-practice/vocabulary', saveVocabulary);
router.patch('/communication-practice/vocabulary/mastery', toggleVocabularyMastery);
router.delete('/communication-practice/vocabulary', deleteVocabulary);

// Tests
router.get('/communication-practice/grammar-test', generateGrammarTest);
router.post('/communication-practice/grammar-test', submitGrammarTest);

export default router;
