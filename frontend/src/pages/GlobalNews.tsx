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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">

          {/* HEADER - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-4 sm:gap-6">
            
            {/* Logo and Title Section */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white shadow-lg flex-shrink-0">
                <Megaphone className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold truncate">
                  Global Announcements
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                  Latest platform updates and important announcements
                </p>
              </div>
            </div>

            {/* SEARCH - Responsive */}
            <div className="relative w-full sm:w-72 md:w-80 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search news..."
                className="pl-9 sm:pl-10 bg-background border-border focus:ring-2 focus:ring-primary text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* NEWS LIST */}
          {loading ? (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 sm:h-28 lg:h-32 rounded-xl" />
              ))}
            </div>
          ) : paginatedNews.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              
              {paginatedNews.map((item: any) => (
                <Card
                  key={item._id}
                  className="border-l-4 border-l-primary hover:shadow-lg hover:scale-[1.01] transition-all duration-300 bg-background/80 backdrop-blur border border-border"
                >
                  <CardContent className="p-4 sm:p-5 lg:p-6">
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                      
                      {/* Content Section */}
                      <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground hover:text-primary transition line-clamp-2 sm:line-clamp-1">
                          {item.title}
                        </h2>
                        
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3 lg:line-clamp-2">
                          {item.content}
                        </p>
                      </div>

                      {/* Date Badge - Responsive */}
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 text-xs whitespace-nowrap self-start sm:self-center flex-shrink-0"
                      >
                        <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="text-[10px] sm:text-xs">
                          {formatDistanceToNow(new Date(item.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </Badge>

                    </div>

                  </CardContent>
                </Card>
              ))}

              {/* PAGINATION - Responsive */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-4 sm:pt-6">
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="w-28 sm:w-auto"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                    <span className="text-xs sm:text-sm">Previous</span>
                  </Button>

                  <span className="text-xs sm:text-sm font-medium px-3 py-1.5 bg-muted rounded-md">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="w-28 sm:w-auto"
                  >
                    <span className="text-xs sm:text-sm">Next</span>
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1" />
                  </Button>

                </div>
              )}

            </div>
          ) : (
            // Empty State - Responsive
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 text-center">
              <div className="bg-muted p-4 sm:p-5 rounded-full mb-3 sm:mb-4">
                <Inbox className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                No announcements found
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs sm:max-w-md">
                {searchQuery 
                  ? `No results found for "${searchQuery}". Try a different keyword.`
                  : "No announcements available at the moment. Check back later!"}
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-3 sm:mt-4 text-xs sm:text-sm"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalNews;