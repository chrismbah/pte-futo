import logo from "../../../assets/logo/logo.png";
import { Spinner } from "../../../components/loaders/Spinner";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ISignUpForm } from "../../../models/auth/form";
import { Link } from "react-router-dom";
import { signUpSchema } from "../../../validation";
import useSignUpUser from "../../../hooks/auth/useSignUpUser";
import { useState } from "react";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function SignUp() {
  const { loading, signUpUser } = useSignUpUser();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ISignUpForm>({ resolver: yupResolver(signUpSchema) });

  return (
    <div className="bg-white">
      <div className="w-full min-h-screen flex items-center justify-center sm:px-10 pt-24 pb-10">
        <div className="bg-white rounded-lg shadow w-[95%] sm:min-w-[650px] sm:w-auto">
          <form onSubmit={handleSubmit(signUpUser)} className="px-3 py-4 sm:px-6 sm:py-4">
            <div className="flex flex-col items-center justify-center">
              <img src={logo} alt="PTE LOGO" className="w-14 h-14" />
              <div className="text-center mb-4 mt-2">
                <p className="font-bold text-xs sm:text-base text-wrap">
                  Medicine and Surgery Department, EBSU
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <div className="grid xxss:grid-cols-2 gap-2 xxss:gap-4">
                <div>
                  <label htmlFor="firstName" className="block mb-1 text-ss sm:text-sm font-semibold text-gray-900">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="bg-transparent font-medium text-gray-700 border border-gray-300 text-ss sm:text-sm rounded-lg focus:ring-green1 focus:border-green1 block w-full p-1.5 ss:p-2"
                    placeholder="eg. Ken"
                    {...register("firstName")}
                  />
                  {errors.firstName && <p className="form-error-message">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label htmlFor="lastName" className="block mb-1 text-ss sm:text-sm font-semibold text-gray-900">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="bg-transparent font-medium text-gray-700 border border-gray-300 text-ss sm:text-sm rounded-lg focus:ring-green1 focus:border-green1 block w-full p-1.5 ss:p-2"
                    placeholder="eg. Chigozie"
                    {...register("lastName")}
                  />
                  {errors.lastName && <p className="form-error-message">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="grid xxss:grid-cols-2 gap-2 xxss:gap-4">
                <div>
                  <label htmlFor="regNo" className="block mb-1 text-ss sm:text-sm font-semibold text-gray-900">
                    Matric No.
                  </label>
                  <input
                    type="text"
                    id="regNo"
                    className="bg-transparent font-medium text-gray-700 border border-gray-300 text-ss sm:text-sm rounded-lg focus:ring-green1 focus:border-green1 block w-full p-1.5 ss:p-2"
                    placeholder="eg. EBSU/2019/24567"
                    {...register("regNo")}
                  />
                  {errors.regNo && <p className="form-error-message">{errors.regNo.message}</p>}
                </div>
                <div>
                  <label htmlFor="level" className="block mb-1 text-ss sm:text-sm font-semibold text-gray-900">
                    Level
                  </label>
                  <select
                    id="level"
                    className="bg-transparent font-medium text-gray-700 border border-gray-300 text-ss sm:text-sm rounded-lg focus:ring-green1 focus:border-green1 block w-full p-1.5 ss:p-2"
                    {...register("level")}
                  >
                    <option hidden value="">Select Your Level</option>
                    <option value="Aspirant">Aspirant</option>
                    <option value="100L">100L</option>
                    <option value="200L">200L</option>
                    <option value="300L">300L</option>
                    <option value="400L">400L</option>
                    <option value="500L">500L</option>
                    <option value="600L">600L</option>
                    <option value="Visitor">Visitor</option>
                  </select>
                  {errors.level && <p className="form-error-message">{errors.level.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block mb-1 text-ss sm:text-sm font-semibold text-gray-900">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="bg-transparent font-medium text-gray-700 border border-gray-300 text-ss sm:text-sm rounded-lg focus:ring-green1 focus:border-green1 block w-full p-1.5 ss:p-2"
                  placeholder="eg. name@gmail.com"
                  {...register("email")}
                />
                {errors.email && <p className="form-error-message">{errors.email.message}</p>}
              </div>

              <div className="grid xxss:grid-cols-2 gap-2 xxss:gap-4">
                <div>
                  <label htmlFor="password" className="block mb-1 text-ss sm:text-sm font-semibold text-gray-900">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="bg-transparent font-medium text-gray-700 border border-gray-300 text-ss sm:text-sm rounded-lg focus:ring-green1 focus:border-green1 block w-full p-1.5 ss:p-2 pr-9"
                      placeholder="••••••••"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {errors.password && <p className="form-error-message">{errors.password.message}</p>}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block mb-1 text-ss sm:text-sm font-semibold text-gray-900">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      id="confirmPassword"
                      className="bg-transparent font-medium text-gray-700 border border-gray-300 text-ss sm:text-sm rounded-lg focus:ring-green1 focus:border-green1 block w-full p-1.5 ss:p-2 pr-9"
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400 hover:text-gray-600"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="form-error-message">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="text-white bg-green1 hover:bg-green1/90 font-semibold rounded-lg text-ss xss:text-sm sm:text-xs w-fit px-3 ss:px-4 sm:px-5 py-2 ss:py-2.5"
            >
              {loading ? (
                <Spinner className="w-4 h-4 md:w-5 md:h-5 text-transparent animate-spin fill-white" />
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
          <div className="border-t border-t-gray-300 px-3 py-4 sm:px-6">
            <p className="text-ss sm:text-sm font-semibold text-gray-700">
              Already have an account?{" "}
              <Link className="text-ss sm:text-sm font-semibold text-green1 hover:underline" to="/login">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
