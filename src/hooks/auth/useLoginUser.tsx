/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ILoginForm } from "../../models/auth/form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { notifyUser } from "../../helpers/notifyUser";
import { logInSchema } from "../../validation";
import { yupResolver } from "@hookform/resolvers/yup";

export default function useLoginUser() {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { reset } = useForm<ILoginForm>({ resolver: yupResolver(logInSchema) });

  const loginUser = async (data: ILoginForm) => {
    try {
      setLoading(true);
      const { email, password } = data;
      await signInWithEmailAndPassword(auth, email, password);
      
      // Check for redirect parameter, otherwise go to home
      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate("/");
      }
      
      reset();
      notifyUser("success", `Login Successful. Good to have you back!`);
    } catch (error: any) {
      console.log(error);
      if (error.code == "auth/invalid-credential") {
        notifyUser("error", "Invalid Email or Password.");
      } else {
        notifyUser("error", "Something went wrong. Please try again");
      }
      setLoading(false);
    }
  };

  return { loginUser, loading };
}
