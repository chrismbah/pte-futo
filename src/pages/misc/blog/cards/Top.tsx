import { Carousel } from "flowbite-react";
import { FC } from "react";
import { BlogPostProp } from "../../../../models/misc/blog/blogPosts";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeInVariants7 } from "../../../../animation/variants";
import { EngagementStats } from "../components/EngagementStats";

export const TopPosts: FC<BlogPostProp> = ({ blogPosts }) => {
  return (
    <>
      {blogPosts && (
        <motion.div
          variants={fadeInVariants7}
          initial="initial"
          whileInView="animate"
          viewport={{
            once: true,
          }}
          className=" overflow-hidden h-[520px] md:h-[513px] w-full bg-white border border-gray-200 rounded-lg shadow"
        >
          <Carousel slideInterval={2000} indicators={false}>
            {blogPosts
              .filter((post) => post.postType === "top")
              .map(
                (
                  { title, sampleImg, contents, date, author, postType, no, likes },
                  i
                ) => (
                  <div key={i} className="h-full hover:bg-gray-100">
                    <Link to={`/blog/posts/${encodeURIComponent(title)}/${no}/${postType}`}>
                      <img
                        className="object-cover rounded-t-lg h-3/5 w-full"
                        src={sampleImg}
                        alt={title}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="p-5 h-2/5 w-full flex flex-col justify-between">
                        <div>
                          <h5 className="mb-2 text-base md:text-lg lg:text-xl xlg:text-xll font-bold tracking-tight text-gray-900">
                            {title}
                          </h5>
                          <p className="mb-3 font-normal text-sm xl:text-xs text-gray-700">
                            {contents && contents[0] && typeof contents[0].content === "string" &&
                              contents[0].content
                                .split(" ")
                                .slice(0, 20)
                                .join(" ")}
                            ...
                          </p>{" "}
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-gray-700 text-ss lg:text-xs flex-1 min-w-0 truncate">
                            {author} on {date}
                          </p>
                          <EngagementStats likes={likes} className="flex-shrink-0" />
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              )}
          </Carousel>
        </motion.div>
      )}
    </>
  );
};
