import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blogData";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardFooter from "@/components/DashboardFooter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, User } from "lucide-react";

const Blogs = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Insights & Analysis</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Deep dives into urban cybercrime trends, forecasting methodology, and the data science behind our predictions.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-1">
            {blogPosts.map((post, index) => (
              <Card key={post.id} className="blog-card overflow-hidden border border-border hover:border-primary/20 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs px-2 py-1 ${
                          post.category === 'Prevention' ? 'bg-success/10 text-success border-success/20' :
                          post.category === 'Awareness' ? 'bg-warning/10 text-warning border-warning/20' :
                          post.category === 'Technical' ? 'bg-primary/10 text-primary border-primary/20' :
                          post.category === 'Trends' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          'bg-muted text-muted-foreground'
                        }`}
                      >
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.readTime}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <CardTitle className="text-2xl lg:text-3xl font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer">
                    <Link to={`/blogs/${post.id}`} className="hover:no-underline">
                      {post.title}
                    </Link>
                  </CardTitle>

                  <CardDescription className="text-base text-muted-foreground leading-relaxed mt-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {post.date}
                      </div>
                    </div>

                    <Button asChild variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Link to={`/blogs/${post.id}`}>
                        Read Article →
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default Blogs;

