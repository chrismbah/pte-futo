import { Helmet } from "react-helmet-async";
import { TBlogPost } from "../../../../models/misc/blog/blogPosts";

interface BlogSEOProps {
  post: TBlogPost;
  readTime: number;
}

export const BlogSEO = ({ post, readTime }: BlogSEOProps) => {
  const siteUrl = "https://ebsumsa.vercel.app";
  const postUrl = `${siteUrl}/blog/posts/${encodeURIComponent(post.title)}/${post.no}/${post.postType}`;
  
  // Extract first paragraph for description
  const description = post.contents?.[0]?.content 
    ? (typeof post.contents[0].content === "string" 
        ? post.contents[0].content.slice(0, 160) + "..."
        : `Read ${post.title} on EBSUMSA Blog`)
    : `Read ${post.title} on EBSUMSA Blog`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{post.title} | EBSUMSA Blog</title>
      <meta name="title" content={`${post.title} | EBSUMSA Blog`} />
      <meta name="description" content={description} />
      <meta name="author" content={post.author} />
      <link rel="canonical" href={postUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={postUrl} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={post.sampleImg} />
      <meta property="og:site_name" content="EBSUMSA Blog" />
      <meta property="article:published_time" content={post.date} />
      <meta property="article:author" content={post.author} />
      {post.category && <meta property="article:section" content={post.category} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={postUrl} />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={post.sampleImg} />

      {/* Article Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "image": post.sampleImg,
          "author": {
            "@type": "Person",
            "name": post.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "EBSUMSA",
            "logo": {
              "@type": "ImageObject",
              "url": `${siteUrl}/logo.png`
            }
          },
          "datePublished": post.date,
          "description": description,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": postUrl
          },
          "wordCount": post.contents?.reduce((acc, block) => {
            if (typeof block.content === "string") {
              return acc + block.content.split(/\s+/).length;
            }
            return acc;
          }, 0) || 0,
          "timeRequired": `PT${readTime}M`
        })}
      </script>
    </Helmet>
  );
};
