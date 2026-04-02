import logo from "../../../assets/logo/logo.png";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { logInSchema } from "../../../validation";
import { ILoginForm } from "../../../models/auth/form";
import { Spinner } from "../../../components/loaders/Spinner";
import useLoginUser from "../../../hooks/auth/useLoginUser";
import { useState } from "react";
import { Link } from "react-router-dom";

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

export default function Login() {
  const { loading, loginUser } = useLoginUser();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginForm>({ resolver: yupResolver(logInSchema) });

  return (
    <section className="bg-white">
      <div className="flex items-center justify-center px-4 sm:px-6 py-8 mx-auto h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow border border-gray-200 mt-16 max-w-md sm:max-w-lg xl:p-0">
          <div className="space-y-4 md:space-y-6 p-3 ss:p-6 sm:p-8">
            <div className="flex items-center justify-center flex-col">
              <a className="flex items-center mb-3 text-xl font-semibold text-gray-900">
                <img className="w-16 h-16 sm:w-20 sm:h-20" src={logo} alt="logo" />
              </a>
              <h1 className="text-base sm:text-md font-bold leading-tight tracking-tight text-gray-900 md:text-[21px]">
                Login to your account
              </h1>
            </div>

            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(loginUser)}>
              <div>
                <label htmlFor="email" className="block mb-2 text-ss ss:text-sm sm:text-xs font-bold text-gray-900">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="bg-transparent font-medium text-gray-700 border border-gray-300 text-ss ss:text-sm sm:text-xs rounded-lg focus:ring-green1 focus:border-green1 block w-full p-2.5"
                  placeholder="eg. name@gmail.com"
                  {...register("email")}
                />
                {errors.email && <p className="form-error-message">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-ss ss:text-sm sm:text-xs font-bold text-gray-900">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    className="bg-transparent border font-medium border-gray-300 text-gray-700 text-ss ss:text-sm sm:text-xs rounded-lg focus:ring-green1 focus:border-green1 block w-full p-2.5 pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {errors.password && <p className="form-error-message">{errors.password.message}</p>}
                <div className="flex justify-end mt-1.5">
                  <Link to="/forgot-password" className="text-xs font-semibold text-green1 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="text-white bg-green1 hover:bg-green1/90 font-semibold rounded-lg text-sm sm:text-xs w-fit px-3 ss:px-4 sm:px-5 py-2 ss:py-2.5"
              >
                {loading ? <Spinner className="w-4 h-4 md:w-5 md:h-5 text-transparent animate-spin fill-white" /> : "Login"}
              </button>
            </form>
          </div>
          <div className="border-t border-t-gray-300 px-6 py-4 sm:px-8">
            <p className="text-ss sm:text-sm font-semibold text-gray-700">
              New Student?{" "}
              <a href="/signup" className="font-semibold text-green1 hover:underline">
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
