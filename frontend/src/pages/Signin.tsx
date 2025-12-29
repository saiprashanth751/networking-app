import { Quote } from "../components/Quote";
import { Heading } from "../components/Heading";
import { Button } from "../components/ui/button";
import { NavigationMsg } from "../components/NavigationMsg";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { useSignin } from "@/hooks/mutations/user";

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signinMutation = useSignin();

    const handleSignIn = async () => {
        if (!email || !password) {
            return;
        }

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
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                ></Input>
                            </div>

                            <Button
                                onClick={handleSignIn}
                                disabled={signinMutation.isPending}
                            >
                                {signinMutation.isPending ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    </div>
                                ) : (
                                    "Sign in"
                                )}
                            </Button>

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