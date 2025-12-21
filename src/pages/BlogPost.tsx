import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { blogPosts } from "@/data/blogData";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardFooter from "@/components/DashboardFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, Clock, User, Share2, Bookmark } from "lucide-react";

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const [readingProgress, setReadingProgress] = useState(0);
  const post = blogPosts.find((p) => p.id === id);

  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setReadingProgress(scrollPercent);
    };

    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  if (!post) {
    return <Navigate to="/blogs" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Reading Progress Bar */}
      <div className="reading-progress">
        <div
          className="reading-progress-bar"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <DashboardHeader />

      <main className="flex-1 container mx-auto px-6 py-12">
        <article className="max-w-4xl mx-auto space-y-8">
          {/* Article Header */}
          <header className="space-y-6">
            <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
              <Link to="/blogs" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Blogs
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {post.category}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {post.readTime}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-y border-border">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{post.author}</span>
                    <span className="text-sm text-muted-foreground">Author</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {post.date}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Article Footer */}
          <footer className="border-t border-border pt-8 mt-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{post.author}</p>
                    <p className="text-sm text-muted-foreground">Cybersecurity Expert</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Article
                </Button>
              </div>
            </div>

            <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">About this article</h3>
              <p className="text-sm text-muted-foreground">
                This article provides insights into urban cybercrime trends and prevention strategies.
                The analysis is based on real data from Indian cities and established cybersecurity best practices.
              </p>
            </div>
          </footer>
        </article>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default BlogPost;

