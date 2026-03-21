import Blog from '../models/Blog.js';
import { getGenAI } from '../config/gemini.js';

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

    const [mimePart, base64Part] = image.split(',');
    const buffer = Buffer.from(base64Part || image, 'base64');
    const imageContentType = mimePart ? mimePart.split(':')[1].split(';')[0] : 'image/jpeg';

    const blog = new Blog({
      title,
      excerpt,
      content,
      image: buffer,
      imageContentType,
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

// export const updateBlog = async (req, res) => {
//   try {
//     const { id, type, value } = req.body;
//     const booleanValue = value === 'true';

//     if (type === 'popular') {
//       await Blog.findOneAndUpdate(
//         { _id: id },
//         { $set: { popular: booleanValue } }
//       );
//     } else {
//       await Blog.findOneAndUpdate(
//         { _id: id },
//         { $set: { featured: booleanValue } }
//       );
//     }

//     res.json({
//       success: true,
//       message: 'Blog updated successfully'
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({
//       success: false,
//       message: 'Internal Server Error'
//     });
//   }
// };

/**
 * UPDATE BLOG (FULL EDIT + POPULAR / FEATURED)
 */
export const updateBlog = async (req, res) => {
  try {
    const { id, type, value, title, excerpt, content, image, category, tags } = req.body;

    // ===============================
    // CASE 1: POPULAR / FEATURED TOGGLE
    // ===============================
    if (type === 'popular' || type === 'featured') {
      const booleanValue = value === 'true';

      await Blog.findByIdAndUpdate(id, {
        $set: { [type]: booleanValue }
      });

      return res.json({
        success: true,
        message: 'Blog updated successfully'
      });
    }

    // ===============================
    // CASE 2: FULL BLOG EDIT
    // ===============================
    const updateData = {
      title,
      excerpt,
      content,
      category,
      tags
    };

    // Update image only if new one is sent
    if (image) {
      const [mimePart, base64Part] = image.split(',');
      const buffer = Buffer.from(base64Part || image, 'base64');
      const imageContentType = mimePart ? mimePart.split(':')[1].split(';')[0] : 'image/jpeg';
      
      updateData.image = buffer;
      updateData.imageContentType = imageContentType;
    }

    await Blog.findByIdAndUpdate(id, updateData);

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

/**
 * GENERATE BLOG CONTENT (AI)
 */
export const generateBlogContent = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.json({ success: false, message: 'Prompt is required' });
    }

    const genAI = await getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `You are a professional blog writer. Given a topic or prompt, generate a high-quality blog post.
      Return the response in JSON format with the following keys:
      "title": A catchy title for the blog post.
      "excerpt": A short summary (max 160 characters).
      "content": The full blog post content in HTML format (using semantic tags like <h2>, <p>, <strong>, <em>, <ul>, <li>, etc.).
      "category": A suitable category (one of: technology, education, ai, programming, design, business).
      "tags": A string of 5-8 comma-separated tags.`,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const data = JSON.parse(text);
      res.json({ success: true, data });
    } catch (parseError) {
      console.error('AI Response Parse Error:', text);
      res.status(500).json({ success: false, message: 'AI returned invalid format. Try again.' });
    }
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

/**
 * SUGGEST BLOG TAGS (AI)
 */
export const suggestBlogTags = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title && !content) {
      return res.json({ success: false, message: 'Title or content is required' });
    }

    const genAI = await getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are an SEO expert. Based on the following blog details, suggest 5-8 relevant SEO tags.",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `Title: ${title || 'N/A'}
    Content Snippet: ${(content || '').substring(0, 1000)}
    
    Return the tags in JSON format with a single key "tags" containing a comma-separated string.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const { tags } = JSON.parse(text);
      res.json({ success: true, tags });
    } catch (parseError) {
      res.json({ success: true, tags: "" });
    }
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
