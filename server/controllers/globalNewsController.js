import GlobalNews from "../models/GlobalNews.js";

// GET all global news
export const getGlobalNews = async (req, res) => {
  try {
    const news = await GlobalNews.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// CREATE global news
export const createGlobalNews = async (req, res) => {
  try {
    const { title, content, visibility } = req.body;

    const news = new GlobalNews({
      title,
      content,
      visibility
    });

    const savedNews = await news.save();

    res.status(201).json(savedNews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE news
export const deleteGlobalNews = async (req, res) => {
  try {
    await GlobalNews.findByIdAndDelete(req.params.id);
    res.json({ message: "News deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};