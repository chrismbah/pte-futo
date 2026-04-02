import { useEffect, useState } from "react";
import { fadeInVariants3 } from "../../animation/variants";
import Footer from "../../components/footer/Footer";
import { classReps as staticClassReps } from "../../data/students/classReps";
import { motion } from "framer-motion";
import { GraduateCapIcon } from "../../components/icons/general/GraduateCapIcon";
import { ProfileIcon } from "../../components/icons/general/ProfileIcon";
import { supabase } from "../../config/supabase";
import placeholderImg from "../../assets/img/team/placeholder.png";

interface ClassRepDisplay {
  img: string;
  name: string;
  regNo: string | number;
  title: string;
  work?: string;
  phone?: string;
}

export default function ClassReps() {
  const [reps, setReps] = useState<ClassRepDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scroll(0, 0);
    supabase
      .from("team_images")
      .select("member_id, image_url, name, role, extra")
      .eq("team_type", "classRep")
      .then(({ data }) => {
        const overrides: Record<string, { image_url?: string; name?: string; role?: string; extra?: string }> = {};
        if (data && data.length > 0) {
          data.forEach((row) => { overrides[row.member_id] = row; });
        }
        setReps(
          staticClassReps.map((rep, idx) => {
            const patch = overrides[`classrep-${idx}`];
            if (!patch) return { ...rep };
            return {
              ...rep,
              img:   patch.image_url || rep.img,
              name:  patch.name      || rep.name,
              title: patch.role      || rep.title,
              phone: patch.extra     || rep.phone || "",
            };
          })
        );
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="box-width">
        <div className="px-3 py-20 sm:px-10 xl:px-20 sm:py-24">
          <div className="flex items-center justify-center flex-col mb-4">
            <h2>
              <div className="bar-style" />
              Class Representatives
            </h2>
            <h3 className="text-gray-700 font-[500] text-ss ss:text-sm xlg:text-xs capitalize">
              Our esteemed student representatives across all levels
            </h3>
          </div>
          <div className="grid sss:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-8">
            {loading
              ? Array.from({ length: staticClassReps.length }).map((_, i) => (
                  <div key={i} className="w-full rounded-lg overflow-hidden bg-white shadow-4 animate-pulse">
                    <div className="w-full h-[260px] bg-gray-200" />
                    <div className="p-3 flex flex-col gap-2.5">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))
              : reps.map(({ img, name, title, phone }, i) => (
              <motion.div
                variants={fadeInVariants3}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                custom={i}
                key={i}
                className="w-full shadow-4 transition-shadow duration-200 ease-in-out rounded-lg overflow-hidden bg-white"
              >
                <img
                  src={img}
                  alt={name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholderImg; }}
                  className="w-full h-[260px] object-cover"
                />
                <div className="p-3 flex flex-col gap-1.5">
                  <p className="font-bold text-sm md:text-xs uppercase flex gap-1.5 items-center text-gray-900">
                    <ProfileIcon className="w-5 h-5 flex-shrink-0" /> {name}
                  </p>
                  <p className="font-semibold text-ss uppercase flex gap-1.5 items-center text-gray-900">
                    <GraduateCapIcon className="w-5 h-5 flex-shrink-0 fill-green1" /> {title}
                  </p>
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="font-semibold text-ss flex gap-1.5 items-center text-green1 hover:underline"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-1.31.655a11.042 11.042 0 005.516 5.516l.655-1.31a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 18.72V21a2 2 0 01-2 2h-1C9.716 23 1 14.284 1 5V4a1 1 0 011-1z" />
                      </svg>
                      {phone}
                    </a>
                  )}
                </div>
              </motion.div>
              ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
