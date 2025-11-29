import { Quote } from "../components/Quote";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { Button } from "../components/Button";
import { NavigationMsg } from "../components/NavigationMsg";
import { useState } from "react";
import { useSignin } from "@/hooks/mutations/user";

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    // ✅ Use the mutation hook
    const signinMutation = useSignin();

    const handleSignIn = async () => {
        if (!email || !password) {
            // You can add toast here or just let validation happen
            return;
        }

        // ✅ Mutation handles success/error automatically
        signinMutation.mutate({ email, password });
    };

    return (
        <>
            <div className="lg:grid lg:grid-cols-2">
                <div className="hidden lg:block">
                    <Quote />
                </div>
                <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 max-h-screen">
                    <Heading label={"Sign in to your account"} />
                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form 
                            className="space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSignIn();
                            }}
                        >
                            <InputBox
                                label="Email ID"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                            />
                            <InputBox
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                            />

                            <Button
                                onClick={handleSignIn}
                                label={signinMutation.isPending ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    </div>
                                ) : (
                                    "Sign in"
                                )}
                                disabled={signinMutation.isPending}
                            />

                            <NavigationMsg
                                label={"Don't have an account?"}
                                to={"/signup"}
                                action={"Sign up"}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}