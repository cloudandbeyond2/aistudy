import { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "@/constants";

const GlobalNews = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    const res = await axios.get(`${serverURL}/api/global-news`);
    setNews(res.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Global News</h1>

      {news.map((item: any) => (
        <div key={item._id} className="border p-4 mb-4 rounded bg-white">
          <h2 className="font-bold text-lg">{item.title}</h2>
          <p className="text-gray-600">{item.content}</p>
        </div>
      ))}
    </div>
  );
};

export default GlobalNews;
