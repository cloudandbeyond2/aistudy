import { useState, useEffect } from "react";
import axios from "axios";

const AdminGlobalNews = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [news, setNews] = useState([]);

  const API = "http://localhost:5001/api/global-news";

  const fetchNews = async () => {
    const res = await axios.get(API);
    setNews(res.data);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await axios.post(API, {
      title,
      content
    });

    setTitle("");
    setContent("");
    fetchNews();
  };

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">Global News</h1>

      {/* Create News */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8">

        <input
          type="text"
          placeholder="News Title"
          className="border p-2 w-full mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="News Content"
          className="border p-2 w-full mb-3"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Post News
        </button>

      </form>

      {/* News List */}
      <div className="space-y-4">
        {news.map((item: any) => (
          <div key={item._id} className="border p-4 rounded bg-gray-50">
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-gray-600">{item.content}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminGlobalNews;