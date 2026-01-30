import Blog from '../models/Blog.js';

/**
 * GET ALL BLOGS
 */
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({});
    res.json(blogs);
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

/**
 * CREATE BLOG
 */
export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, image, category, tags } = req.body;

    const buffer = Buffer.from(image.split(',')[1], 'base64');

    const blog = new Blog({
      title,
      excerpt,
      content,
      image: buffer,
      category,
      tags
    });

    await blog.save();

    res.json({
      success: true,
      message: 'Blog created successfully'
    });
  } catch (error) {
    console.log('Error', error);
    res.json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

/**
 * UPDATE BLOG (POPULAR / FEATURED)
 */
export const updateBlog = async (req, res) => {
  try {
    const { id, type, value } = req.body;
    const booleanValue = value === 'true';

    if (type === 'popular') {
      await Blog.findOneAndUpdate(
        { _id: id },
        { $set: { popular: booleanValue } }
      );
    } else {
      await Blog.findOneAndUpdate(
        { _id: id },
        { $set: { featured: booleanValue } }
      );
    }

    res.json({
      success: true,
      message: 'Blog updated successfully'
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

/**
 * DELETE BLOG
 */
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.body;

    await Blog.findOneAndDelete({ _id: id });

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};
