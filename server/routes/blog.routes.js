import express from 'express';
import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  generateBlogContent,
  suggestBlogTags
} from '../controllers/blog.controller.js';

const router = express.Router();

router.get('/getblogs', getBlogs);
router.post('/createblog', createBlog);
router.post('/updateblogs', updateBlog);
router.post('/deleteblogs', deleteBlog);
router.post('/generate-blog-content', generateBlogContent);
router.post('/suggest-blog-tags', suggestBlogTags);

export default router;
