import logo from "../../../assets/logo/logo.png";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { Link } from "react-router-dom";
import { Spinner } from "../../../components/loaders/Spinner";
import { notifyUser } from "../../../helpers/notifyUser";
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim(), {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      setSent(true);
      notifyUser("success", "Reset link sent! Check your inbox — also check your spam/junk folder.");
    } catch (error: any) {
      console.log("[v0] Password reset error:", error.code, error.message);
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
        notifyUser("error", "No account found with that email address.");
      } else if (error.code === "auth/unauthorized-continue-uri" || error.code === "auth/invalid-continue-uri") {
        try {
          await sendPasswordResetEmail(auth, email.trim());
          setSent(true);
          notifyUser("success", "Reset link sent! Check your inbox — also check your spam/junk folder.");
        } catch (fallbackErr: any) {
          console.log("[v0] Fallback error:", fallbackErr.code, fallbackErr.message);
          notifyUser("error", `Error: ${fallbackErr.message}`);
        }
      } else {
        notifyUser("error", `Error (${error.code}): ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-8">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green1/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with Gradient */}
          <div className="relative h-32 bg-gradient-to-r from-green1 to-cyan-500 p-8 flex flex-col items-center justify-center text-white overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 right-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 left-2 w-32 h-32 bg-white rounded-full blur-2xl"></div>
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <Lock className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Reset Password</h1>
            </div>
            <p className="text-xs text-white/90 mt-1 text-center">Secure your account in seconds</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {sent ? (
              <div className="space-y-4 animate-in fade-in duration-500">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green1 to-cyan-500 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Success Message */}
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We've sent a password reset link to{" "}
                    <span className="font-semibold text-green1 break-all">{email}</span>
                  </p>
                </div>

                {/* Steps */}
                <div className="bg-gradient-to-br from-green1/5 to-cyan-500/5 rounded-lg p-4 space-y-3 border border-green1/10">
                  <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Next steps:</p>
                  <ol className="text-sm space-y-2 text-gray-700">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green1 text-white text-xs font-bold flex items-center justify-center">1</span>
                      <span>Check your inbox for our email</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green1 text-white text-xs font-bold flex items-center justify-center">2</span>
                      <span>Click the reset link</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green1 text-white text-xs font-bold flex items-center justify-center">3</span>
                      <span>Create a new password</span>
                    </li>
                  </ol>
                </div>

                {/* Hint */}
                <p className="text-xs text-gray-500 text-center">
                  💡 <span className="font-semibold">Tip:</span> Don't see it? Check your spam or junk folder.
                </p>

                {/* Button */}
                <button
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="w-full mt-4 py-2.5 px-4 rounded-lg bg-gradient-to-r from-green1 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  Try Another Email
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Icon */}
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green1/10 to-cyan-500/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-green1" />
                  </div>
                </div>

                {/* Description */}
                <div className="text-center space-y-1 mb-4">
                  <p className="text-sm text-gray-600">
                    Enter your email address and we'll send you a secure link to reset your password.
                  </p>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-green1 focus:ring-2 focus:ring-green1/20 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-400"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">Use the email address associated with your account</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-green1 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Spinner className="w-4 h-4 text-transparent animate-spin fill-white" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Security Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-semibold text-blue-900">🔒 Security Notice</p>
                  <p className="text-xs text-blue-800">Reset links expire in 1 hour. Never share your password reset link with anyone.</p>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200/50 px-8 py-4 bg-gradient-to-r from-gray-50 to-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-700">
              Remember your password?{" "}
              <Link to="/login" className="font-semibold text-green1 hover:text-green1/80 transition-colors">
                Back to Login
              </Link>
            </p>
            <p className="text-xs text-gray-500 font-medium">EBSU MSA</p>
          </div>

          {/* Developer Signature */}
          <div className="bg-slate-900 text-white px-8 py-3 text-center border-t border-slate-800">
            <p className="text-xs font-medium text-slate-300">
              Crafted with care by <span className="text-green1 font-bold">Ken</span> — EBSUMSA Lead Developer
            </p>
            <p className="text-xs text-slate-500 mt-1">Ensuring secure and seamless authentication</p>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">Need additional help?</p>
          <a href="mailto:support@ebsu.edu" className="text-sm font-semibold text-green1 hover:text-green1/80 transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

