import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface pt-20 pb-16">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/3 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/6 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/3 h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" />
      </div>
      <div className="relative z-10">
        <SignIn />
      </div>
    </div>
  );
}
