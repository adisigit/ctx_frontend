import { FaGithub, FaGoogle } from "react-icons/fa";
import { authService } from "../services/AuthServices";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm min-h-60">
        <div className="text-center text-2xl font-semibold mb-2">Welcome to CTX</div>
        <div className="text-center text-gray-500 mb-2">Sign in to continue</div>

        <Button
          className="w-full mb-4 h-10"
          onClick={() => authService.loginWithProvider("google")}
        >
          <FaGoogle className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        <Button
          variant="outline"
          className="w-full h-10"
          onClick={() => authService.loginWithProvider("github")}
        >
          <FaGithub className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
      </div>
    </div>
  );
}
