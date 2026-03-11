/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";
import { useGetUserInfo } from "../../../hooks/auth/useGetUserInfo";
import { db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { notifyUser } from "../../../helpers/notifyUser";
import { Spinner } from "../../../components/loaders/Spinner";
import { motion } from "framer-motion";
import { fadeInVariants5 } from "../../../animation/variants";
import { supabase, STORAGE_BUCKETS, getPublicUrl } from "../../../config/supabase";

export default function IDCardRegistration() {
  const { userID, studentDetails } = useGetUserInfo();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: studentDetails?.firstName || "",
    surname: studentDetails?.lastName || "",
    email: studentDetails?.email || "",
    phoneNumber: "",
    dateOfBirth: "",
    level: studentDetails?.level || "",
    classSet: "",
    registrationNumber: studentDetails?.regNo || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        notifyUser("error", "Please select a valid image file");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    // Generate unique file path for Supabase Storage
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${userID}/id-card-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.ID_CARDS)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get the public URL
    return getPublicUrl(STORAGE_BUCKETS.ID_CARDS, data.path);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.surname || !formData.email || !formData.phoneNumber || !formData.dateOfBirth || !formData.level || !formData.classSet || !formData.registrationNumber) {
      notifyUser("error", "Please fill in all required fields");
      return;
    }

    if (!imageFile) {
      notifyUser("error", "Please upload a passport photo");
      return;
    }

    if (!userID) {
      notifyUser("error", "You must be logged in to register");
      return;
    }

    setIsSubmitting(true);

    try {
      notifyUser("loading", "Uploading your ID card registration...");

      // Upload image to Supabase Storage
      const imageUrl = await uploadImageToSupabase(imageFile);

      // Save to Firestore
      await addDoc(collection(db, "idCardRegistrations"), {
        userId: userID,
        email: formData.email,
        firstName: formData.firstName,
        surname: formData.surname,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        level: formData.level,
        classSet: formData.classSet,
        registrationNumber: formData.registrationNumber,
        photoUrl: imageUrl,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Send email notification via Resend
      try {
        await fetch("/api/send-id-registration", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            surname: formData.surname,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            dateOfBirth: formData.dateOfBirth,
            level: formData.level,
            classSet: formData.classSet,
            registrationNumber: formData.registrationNumber,
            photoUrl: imageUrl,
          }),
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't fail the whole submission if email fails
      }

      notifyUser("success", "ID Card registration submitted successfully!");

      // Reset form
      setFormData({
        firstName: "",
        surname: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        level: "",
        classSet: "",
        registrationNumber: "",
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      console.error("Error submitting registration:", error);
      notifyUser("error", "Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-[80px] ss:pt-[90px] sm:pt-[105px] pb-10">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          variants={fadeInVariants5}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          custom={1}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
        >
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            ID Card Registration
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Fill in your details below to register for your student ID card.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center mb-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-green2 transition-colors overflow-hidden bg-white"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 mx-auto text-gray-400 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-xs text-gray-500">Upload Photo</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                Click to upload passport photo
              </p>
            </div>

            {/* Form Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green2 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  placeholder="Enter surname"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green2 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green2 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green2 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green2 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green2 focus:border-transparent outline-none text-sm"
                >
                  <option value="">Select Level</option>
                  <option value="100L">100 Level</option>
                  <option value="200L">200 Level</option>
                  <option value="300L">300 Level</option>
                  <option value="400L">400 Level</option>
                  <option value="500L">500 Level</option>
                  <option value="600L">600 Level</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  placeholder="Ebsu/2019/99999"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green2 focus:border-transparent outline-none text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Enter your registration number</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="classSet"
                  value={formData.classSet}
                  onChange={handleInputChange}
                  placeholder="018, 019, 020"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green2 focus:border-transparent outline-none text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Enter your class set (e.g., 018, 019, 020)</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green2 hover:bg-green1 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="w-5 h-5 text-transparent animate-spin fill-white" />
                  <span>Submitting...</span>
                </>
              ) : (
                "Submit Registration"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
