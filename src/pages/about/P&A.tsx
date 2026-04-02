import Footer from "../../components/footer/Footer";
export default function PhilosophyAndObjectives() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1280px] w-full mx-auto flex items-center justify-center px-2">
        <div className="px-2 sm:px-14 sm:py-10 py-6 my-16 ss:mt-20 sm:my-24 bg-white shadow rounded-lg">
          <h2 className="">
            {" "}
            <div className="bar-style" />
            Department of Medicine and Surgery, EBSU
          </h2>
          <h4 className="mb-4 font-semibold text-base sm:text-md ">
            Philosophy and Objectives
          </h4>
          <div className="mb-5">
            <h5 className="text-xs sm:text-base font-medium text-green1">Philosophy</h5>
            <p className="text-sm sm:text-xs text-gray-700 leading-7 mb-5">
              The Department of Medicine and Surgery is committed to producing competent, ethical, and compassionate medical and surgical professionals who will serve as agents of change in healthcare delivery. Our philosophy is anchored on the principles of "Pro Deo et Humanitate" (For God and Humanity), recognizing that medical practitioners have a sacred responsibility to improve public health and transform lives. We believe in holistic medical education that combines rigorous scientific knowledge with clinical excellence, research innovation, and community engagement.
            </p>
            <p className="text-sm sm:text-xs text-gray-700 leading-7 mb-4">
              The Department houses two faculties — the <span className="font-semibold text-gray-800">Faculty of Clinical Sciences</span> and the <span className="font-semibold text-gray-800">Faculty of Basic Clinical Sciences</span> — as well as the <span className="font-semibold text-gray-800">Faculty of Basic Medical Sciences</span>, all working collaboratively to deliver a comprehensive and integrated medical curriculum. Together, these faculties ensure that students receive a strong foundation in the biomedical sciences alongside advanced clinical training, preparing them for the full spectrum of medical practice.
            </p>
            <p className="text-sm sm:text-xs text-gray-700 leading-7">
              The Department emphasizes the development of culturally-sensitive, socially responsible physicians who understand the unique healthcare challenges of Nigeria and Africa, and are equipped to address these challenges with evidence-based practice. We foster an environment of continuous learning, critical thinking, and professional development, ensuring that our graduates are competitive on the global stage while remaining committed to addressing local health disparities and improving community wellbeing.
            </p>
          </div>
          <div className="mb-5">
            <h5 className="text-xs sm:text-base font-medium text-green1">Objectives</h5>
            <p className="text-sm sm:text-xs text-gray-700 leading-7 mb-2">
              The principal objectives of the Medicine and Surgery Programme include the following:
            </p>
            <ul className=" space-y-2 text-gray-700 text-sm sm:text-xs list-disc list-inside mb-4 leading-7">
              <li>
                To provide comprehensive medical education grounded in basic sciences, clinical knowledge, and practical skills necessary for effective diagnosis, treatment, and prevention of diseases.
              </li>
              <li>
                To develop physicians who demonstrate exceptional clinical competence, ethical practice, and commitment to evidence-based medicine in all healthcare settings.
              </li>
              <li>
                To foster research mentality and innovation among medical professionals to advance medical knowledge and contribute to solving pressing health challenges in Nigeria and the African continent.
              </li>
              <li>
                To instill values of professionalism, integrity, empathy, and social responsibility, ensuring graduates serve as role models in their communities and advocate for public health.
              </li>
              <li>
                To prepare physicians capable of functioning in diverse healthcare environments, from rural clinics to tertiary institutions, with emphasis on addressing healthcare disparities.
              </li>
              <li>
                To promote collaborative learning and interdisciplinary practice, preparing graduates for effective teamwork with other healthcare professionals.
              </li>
            </ul>
            <p className="text-gray-700 text-sm sm:text-xs mb-4 leading-7 ">
              Graduates of this programme are prepared for employment in the following healthcare sectors:
            </p>
            <ul className=" space-y-1 text-gray-700 text-sm sm:text-xs list-disc list-inside mb-4 leading-7">
              <li>Federal, State, and Local Government Hospitals and Healthcare Centers</li>
              <li>Private Hospitals and Medical Clinics</li>
              <li>Medical Research Institutions and Universities</li>
              <li>Public Health and Epidemiology Services</li>
              <li>Clinical Practice and Medical Consultation</li>
              <li>International Health Organizations and NGOs</li>
              <li>Military Medical Services</li>
              <li>Medical Education and Academic Medicine</li>
              <li>Healthcare Administration and Health Policy</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
