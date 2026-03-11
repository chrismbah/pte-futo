export interface BlogPost {
  no:number;
  author: string;
  authorImage?: string;
  title: string;
  postType: "top" | "featured" | "others";
  category?: string;
  sampleImg: string;
  contents: ContentBlock[];
  likes?: number;
  likedBy?: string[];
}
export interface TBlogPost {
  no:number;
  author: string;
  authorImage?: string;
  title: string;
  postType: "top" | "featured" | "others";
  category?: string;
  sampleImg: string;
  contents: ContentBlock[];
  date: string;
  likes?: number;
  likedBy?: string[];
}

export interface ContentBlock {
  type: "p" | "p-bold" | "h1" | "h2" | "img" | "list";
  content: string | { type: "p" | "h2" | "img" | "p-bold" , content: string }[] ; // Handling nested lists
}
export interface ContentBlockProp{
  contents: ContentBlock[]
}
  export interface IBlogPost {
    id: string;
    no: number;
    author: string;
    authorImage?: string;
    date: string;
    title: string; 
    sampleImg: string;
    postType: string;
    category?: string;
    contents: ContentBlock[];
    likes?: number;
    likedBy?: string[];
  }
  export interface BlogPostProp {
    blogPosts: IBlogPost[]
    postID?:string
    postType?: string
  }
