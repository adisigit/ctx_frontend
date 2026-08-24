import { CheckCircle2, Terminal, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

type LoginClient = "web" | "cli";

function buildLoginUrl(client: LoginClient, sessionId: string | null) {
  const params = new URLSearchParams({ client });
  if (sessionId) params.set("session_id", sessionId);
  return `/login?${params.toString()}`;
}

export default function LoginCompletePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status") === "success" ? "success" : "error";
  const client = (searchParams.get("client") as LoginClient) || "web";
  const sessionId = searchParams.get("session_id");
  const message = searchParams.get("message");

  const isSuccess = status === "success";
  const isCli = client === "cli";

  const title = isSuccess
    ? isCli
      ? "CLI login successful"
      : "Login successful"
    : "Login failed";

  const description = isSuccess
    ? isCli
      ? "Authentication complete. You can close this window and return to your terminal."
      : "You have been signed in successfully."
    : message ?? "Something went wrong during sign in. Please try again.";

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
        {isSuccess ? (
          isCli ? (
            <Terminal className="mx-auto mb-4 h-12 w-12 text-primary" />
          ) : (
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
          )
        ) : (
          <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        )}

        <div className="text-2xl font-semibold mb-2">{title}</div>
        <div className="text-gray-500 mb-6">{description}</div>

        {!isSuccess && (
          <Button
            className="w-full h-10"
            onClick={() => navigate(buildLoginUrl(client, sessionId))}
          >
            Try again
          </Button>
        )}

        {isSuccess && isCli && (
          <p className="text-sm text-gray-400">This tab can be closed safely.</p>
        )}
      </div>
    </div>
  );
}
