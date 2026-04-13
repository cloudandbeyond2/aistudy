import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Megaphone, Search, Calendar, Inbox, ChevronLeft, ChevronRight, X } from "lucide-react";
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
      <div className="      space-y-6 sm:space-y-8 animate-fade-in px-2 sm:px-2 lg:px-4 max-w-[1400px] mx-auto relative pt-0 lg:pt-[65px]">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">

          {/* HEADER - Improved Tablet Layout */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
            
            {/* Logo and Title Section */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white shadow-lg">
                <Megaphone className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                  Global Announcements
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                  Latest platform updates and important announcements
                </p>
              </div>
            </div>

            {/* SEARCH - Full Width on Tablet, Fixed on Desktop */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search announcements..."
                className="pl-10 pr-10 bg-background border-border focus:ring-2 focus:ring-primary h-11 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results Info Bar - Tablet Friendly */}
          {!loading && filteredNews.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-border">
              <p className="text-sm text-muted-foreground">
                Found <span className="font-semibold text-foreground">{filteredNews.length}</span> announcement{filteredNews.length !== 1 ? 's' : ''}
              </p>
              {searchQuery && (
                <p className="text-sm text-primary">
                  Showing results for: <span className="font-medium">"{searchQuery}"</span>
                </p>
              )}
            </div>
          )}

          {/* NEWS LIST */}
          {loading ? (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 sm:h-32 lg:h-36 rounded-xl" />
              ))}
            </div>
          ) : paginatedNews.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              
              {paginatedNews.map((item: any) => (
                <Card
                  key={item._id}
                  className="border-l-4 border-l-primary hover:shadow-lg hover:scale-[1.01] transition-all duration-300 bg-background/80 backdrop-blur border border-border"
                >
                  <CardContent className="p-4 sm:p-5 md:p-6">
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                      
                      {/* Content Section */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground hover:text-primary transition line-clamp-2 md:line-clamp-1">
                          {item.title}
                        </h2>
                        
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-3">
                          {item.content}
                        </p>
                      </div>

                      {/* Date Badge */}
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1.5 text-xs whitespace-nowrap self-start sm:self-center flex-shrink-0 px-2.5 py-1"
                      >
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(item.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </Badge>

                    </div>

                  </CardContent>
                </Card>
              ))}

              {/* PAGINATION - Enhanced for Tablet */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 sm:pt-8">
                  
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="min-w-[100px]"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {/* Page Numbers for Tablet */}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                        if (i === 4) pageNum = totalPages;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-9 h-9 md:w-10 md:h-10 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="min-w-[100px]"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>

                </div>
              )}

            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 text-center">
              <div className="bg-muted p-5 rounded-full mb-4">
                <Inbox className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                No announcements found
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {searchQuery 
                  ? `No results found for "${searchQuery}". Try a different keyword.`
                  : "No announcements available at the moment. Check back later!"}
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchQuery("")}
                  className="mt-4"
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