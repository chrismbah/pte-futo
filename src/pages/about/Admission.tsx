import Footer from "../../components/footer/Footer";

export default function Admission() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1280px] w-full mx-auto flex items-center justify-center px-2">
        <div className="px-2 sm:px-14 sm:py-10 py-6 my-16 ss:mt-20 sm:my-24 bg-white shadow rounded-lg">
          <h2 className="">
            <div className="bar-style" />
            Medicine and Surgery Programme - EBSU
          </h2>
          <p className="text-gray-700 font-semibold text-ss ss:text-sm xlg:text-xs mb-4">
            Ebonyi State University offers a comprehensive six-year Bachelor of Medicine, Bachelor of Surgery (MBBS) programme designed to produce competent and compassionate medical doctors.
          </p>
          <p className="text-sm sm:text-xs text-gray-700 leading-7 mb-4">
            The Programme is structured as follows:
          </p>
          <ol className=" space-y-2 list-decimal list-inside text-sm sm:text-xs text-gray-700 leading-7 mb-4">
            <li>
              <span className="font-semibold">Pre-Clinical Phase (Year 1-2):</span> Students study Anatomy, Physiology, Biochemistry, Medical Microbiology, and Pathology, providing foundational knowledge for clinical practice.
            </li>
            <li>
              <span className="font-semibold">Clinical Phase (Year 3-5):</span> Students undertake clinical rotations in medicine, surgery, pediatrics, obstetrics and gynecology, psychiatry, and other specialties, gaining practical clinical experience.
            </li>
            <li>
              <span className="font-semibold">Final Year (Year 6):</span> Students complete advanced clinical attachments, electives, and prepare for final examinations and internship.
            </li>
            <li>
              <span className="font-semibold">Internship Programme:</span> Following graduation, doctors complete a mandatory one-year internship programme rotating through various medical departments before full registration.
            </li>
          </ol>
          <h3 className="text-md sm:text-xl md:text-xll font-[600] mb-4 mt-6">
            Admission Requirements for Medicine and Surgery, EBSU
          </h3>
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-green1 mb-3">1. UTME ENTRY REQUIREMENTS:</h4>
            <ul className=" space-y-2 list-disc list-inside text-sm sm:text-xs text-gray-700 leading-7 mb-4">
              <li>
                Candidates must possess a Senior School Certificate Examination (SSCE) or General Certificate of Education (GCE) with credit passes in five (5) subjects, including:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>English Language (compulsory)</li>
                  <li>Mathematics (compulsory)</li>
                  <li>Chemistry (compulsory)</li>
                  <li>Physics (compulsory)</li>
                  <li>Biology or any other approved science subject</li>
                </ul>
              </li>
              <li>These subjects must be obtained in not more than two sittings (WAEC, NECO, or equivalent).</li>
              <li>Candidates must achieve a competitive score in the UTME with the minimum cutoff score as set by JAMB for the current admission year (typically minimum 200 for Medicine).</li>
              <li>Candidates must meet the post-UTME screening score requirements set by Ebonyi State University.</li>
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-green1 mb-3">2. DIRECT ENTRY REQUIREMENTS:</h4>
            <ul className=" space-y-2 list-disc list-inside text-sm sm:text-xs text-gray-700 leading-7 mb-4">
              <li>
                <span className="font-semibold">A-Level/IJMB Holders:</span> Candidates with at least three passes in A-Level or IJMB examinations in Chemistry, Physics, and Biology (or Medicine and allied subjects) in not more than two sittings may be admitted into Year 2, provided they also meet the O-level requirements.
              </li>
              <li>
                <span className="font-semibold">OND Holders:</span> Holders of Ordinary National Diploma (OND) in relevant health or science programmes with a minimum of Upper Credit pass may be considered for admission, subject to departmental requirements and meeting all O-level credit requirements.
              </li>
              <li>
                All direct entry candidates must possess the compulsory SSCE/GCE credit passes as specified in UTME requirements.
              </li>
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-green1 mb-3">3. GENERAL REQUIREMENTS:</h4>
            <ul className=" space-y-2 list-disc list-inside text-sm sm:text-xs text-gray-700 leading-7 mb-4">
              <li>Age: Candidates should preferably be below 25 years at the time of admission.</li>
              <li>Health: Candidates must be in good health and free from conditions that would prevent them from practicing medicine.</li>
              <li>Character: Candidates must possess good moral character with no criminal record.</li>
              <li>All admission is subject to the provision of verifiable credentials and JAMB approval.</li>
            </ul>
          </div>
          <h3 className="text-md sm:text-xl md:text-xll font-[600] mb-4 mt-6">
            Duration of Programme
          </h3>
          <p className="text-sm sm:text-xs text-gray-700 leading-7">
            The Bachelor of Medicine, Bachelor of Surgery (MBBS) programme spans a minimum of six (6) academic years for UTME entrants. Direct entry candidates may complete the programme in four or five years depending on their entry level. Upon completion, graduates undertake a mandatory one-year internship programme before full medical registration and licensure.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
