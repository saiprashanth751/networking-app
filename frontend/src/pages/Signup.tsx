import { Quote } from "../components/Quote";
import { Heading } from "../components/Heading";
import { Button } from "../components/ui/button";
import { NavigationMsg } from "../components/NavigationMsg";
import { useState } from "react";
import { useSignup } from "@/hooks/mutations/user";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Signup() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signupMutation = useSignup();

    const handleSignUp = async () => {
        if (!firstName || !lastName || !email || !password) {
            return;
        }

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


                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    ></Input>
                                </div>



                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    ></Input>
                                </div>
                            </div>


                            <div className="space-y-2">
                                <Label htmlFor="email">Email ID</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                ></Input>
                            </div>



                            <div className="space-y-2">
                                <Label htmlFor="password">Password (Minimum 8 characters)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                ></Input>
                            </div>

                            <Button
                                onClick={handleSignUp}
                                disabled={signupMutation.isPending}
                            >
                                {signupMutation.isPending ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    </div>
                                ) : (
                                    "Sign up"
                                )}
                            </Button>

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