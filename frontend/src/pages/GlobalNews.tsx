// import { useEffect, useState } from "react";
// import axios from "axios";
// import { serverURL } from "@/constants";

// const GlobalNews = () => {
//   const [news, setNews] = useState([]);

//   useEffect(() => {
//     fetchNews();
//   }, []);

//   const fetchNews = async () => {
//     const res = await axios.get(`${serverURL}/api/global-news`);
//     setNews(res.data);
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Global News</h1>

//       {news.map((item: any) => (
//         <div key={item._id} className="border p-4 mb-4 rounded bg-white">
//           <h2 className="font-bold text-lg">{item.title}</h2>
//           <p className="text-gray-600">{item.content}</p>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default GlobalNews;

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Megaphone, Search, Calendar, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { serverURL } from "@/constants";

const GlobalNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const API = `${serverURL}/api/global-news`;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);

      const sortedData = res.data.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNews(sortedData);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = useMemo(() => {
    return news.filter((item: any) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [news, searchQuery]);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  const paginatedNews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNews, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
            <Megaphone className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-3xl font-bold">Global Announcements</h1>
            <p className="text-muted-foreground text-md">
              Latest platform updates and important announcements
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search news..."
            className="pl-10 bg-white shadow-sm border-gray-200 focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

      </div>

      {/* NEWS LIST */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i)=>(
            <Skeleton key={i} className="h-28 rounded-xl"/>
          ))}
        </div>
      ) : paginatedNews.length > 0 ? (
        <div className="space-y-4">

          {paginatedNews.map((item:any)=>(
            <Card
              key={item._id}
              className="border-l-4 border-l-blue-600 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 bg-white/80 backdrop-blur"
            >
              <CardContent className="p-5">

                <div className="flex justify-between items-start gap-4">

                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition">
                      {item.title}
                    </h2>

                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 text-xs whitespace-nowrap"
                  >
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </Badge>

                </div>

              </CardContent>
            </Card>
          ))}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <span className="text-sm font-medium">
                Page {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>

            </div>
          )}

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gray-100 p-5 rounded-full mb-4">
            <Inbox className="h-10 w-10 text-gray-400"/>
          </div>
          <h3 className="text-lg font-semibold">No announcements found</h3>
          <p className="text-gray-500 text-sm">
            Try searching with another keyword
          </p>
        </div>
      )}
    </div>
  );
};

export default GlobalNews;