import logo from "../../../assets/logo/logo.png";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { logInSchema } from "../../../validation";
import { ILoginForm } from "../../../models/auth/form";
import { Spinner } from "../../../components/loaders/Spinner";
import useLoginUser from "../../../hooks/auth/useLoginUser";

export default function Login() {
  const { loading, loginUser } = useLoginUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginForm>({ resolver: yupResolver(logInSchema) });

  return (
    <section className="bg-white">
      <div className="flex items-center justify-center px-4 sm:px-6 py-8 mx-auto h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow border border-gray-200 mt-16 max-w-md sm:max-w-lg xl:p-0">
          <div className=" space-y-4 md:space-y-6 p-3 ss:p-6 sm:p-8">
            <div className="flex items-center justify-center flex-col">
              <a className="flex items-center mb-3 text-xl font-semibold text-gray-900">
                <img
                  className="w-16 h-16 sm:w-20 sm:h-20"
                  src={logo}
                  alt="logo"
                />
              </a>
              <h1 className="text-base sm:text-md font-bold leading-tight tracking-tight text-gray-900 md:text-[21px]">
                Login to your account
              </h1>
            </div>

            <form
              className="space-y-4 md:space-y-6"
              onSubmit={handleSubmit(loginUser)}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-ss ss:text-sm sm:text-xs font-bold text-gray-900"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="bg-transparent font-medium text-gray-700 border border-gray-300 text-ss ss:text-sm sm:text-xs rounded-lg focus:ring-green1 focus:border-green1 block w-full p-2.5"
                  placeholder="eg. name@gmail.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="form-error-message">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-ss ss:text-sm sm:text-xs font-bold text-gray-900"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-transparent border font-medium border-gray-300 text-gray-700 text-ss ss:text-sm sm:text-xs rounded-lg focus:ring-green1 focus:border-green1 block w-full p-2.5"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="form-error-message">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className=" text-white bg-green1 hover:bg-green1/90  font-semibold rounded-lg text-sm sm:text-xs w-fit px-3 ss:px-4 sm:px-5 py-2 ss:py-2.5"
              >
                {loading ? <Spinner className="w-4 h-4 md:w-5 md:h-5 text-transparent animate-spin fill-white" /> : "Login"}
              </button>
            </form>
          </div>
          <div className="border-t border-t-gray-300 px-6 py-4 sm:px-8">
            <p className="text-ss sm:text-sm font-semibold text-gray-700">
              New Student ?{" "}
              <a
                href="/signup"
                className="font-semibold text-green1 hover:underline "
              >
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
