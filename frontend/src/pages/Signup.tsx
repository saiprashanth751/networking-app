import { Quote } from "../components/Quote";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { Button } from "../components/Button";
import { NavigationMsg } from "../components/NavigationMsg";
import { useState } from "react";
import { useSignup } from "@/hooks/mutations/user";

export default function Signup() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    // ✅ Use the mutation hook
    const signupMutation = useSignup();

    const handleSignUp = async () => {
        if (!firstName || !lastName || !email || !password) {
            // Validation - you can add toast here if needed
            return;
        }

        // ✅ Mutation handles success/error/navigation automatically
        signupMutation.mutate({ firstName, lastName, email, password });
    };

    return (
        <>
            <div className="lg:grid lg:grid-cols-2">
                <div className="hidden lg:block">
                    <Quote />
                </div>
                <div className="flex h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                    <Heading label={"Sign up your account"} />
                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form 
                            className="space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSignUp();
                            }}
                        >
                            <div className="flex gap-3">
                                <InputBox
                                    label="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    type="text"
                                />
                                <InputBox
                                    label="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    type="text"
                                />
                            </div>
                            <InputBox
                                label="Email ID"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                            />
                            <InputBox
                                label="Password (Minimum 8 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                            />

                            <Button
                                onClick={handleSignUp}
                                label={signupMutation.isPending ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    </div>
                                ) : (
                                    "Sign up"
                                )}
                                disabled={signupMutation.isPending}
                            />

                            <NavigationMsg
                                label={"Already have an account?"}
                                to={"/signin"}
                                action={"Sign in"}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}