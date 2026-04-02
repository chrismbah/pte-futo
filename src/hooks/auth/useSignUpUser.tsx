/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ISignUpForm } from "../../models/auth/form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setDoc, doc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { signUpSchema } from "../../validation";
import { yupResolver } from "@hookform/resolvers/yup";
import { notifyUser } from "../../helpers/notifyUser";
import { getCurrentDate } from "../../helpers/formatDate";
import { getCurrentTime } from "../../helpers/getCurrentTime";
import { StudentDetails } from "../../models/auth/studentDetails";

export default function useSignUpUser() {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { reset } = useForm<ISignUpForm>({
    resolver: yupResolver(signUpSchema),
  });

  const signUpUser = async (data: ISignUpForm) => {
    setLoading(true);
    try {
      const { email, password, regNo, firstName, lastName, level } = data;
      const user = await createUserWithEmailAndPassword(auth, email, password);
      const userID = user.user.uid;
      const userInfo: StudentDetails = {
        userID,
        firstName,
        lastName,
        email,
        regNo,
        level,
        registeredDate: getCurrentDate(),
        registeredTime: getCurrentTime(),
        loginDate: getCurrentDate(),
        loginTime: getCurrentTime(),
        profileImageURL: "",
        profileImageID: "",
        registeredTimeStamp: new Date(),
      };
      await setDoc(doc(db, "userInfo", userID), userInfo);
      setLoading(false);
      reset();
      
      // Check for redirect parameter, otherwise go to home
      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate("/");
      }
      
      notifyUser(
        "success",
        "Sign up successful. Welcome to the Medicine and Surgery Portal."
      );
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        notifyUser("error", "Email Account already in use");
      } else {
        notifyUser("error", "Something went wrong. Please try again");
      }
      setLoading(false);
    }
  };

  return { signUpUser, loading };
}
