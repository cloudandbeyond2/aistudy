import express from 'express';
import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog
} from '../controllers/blog.controller.js';

const router = express.Router();

router.get('/getblogs', getBlogs);
router.post('/createblog', createBlog);
router.post('/updateblogs', updateBlog);
router.post('/deleteblogs', deleteBlog);

export default router;
