import { Quote } from "../components/Quote";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { Button } from "../components/Button";
import { NavigationMsg } from "../components/NavigationMsg";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignIn = async () => {
        if (!email || !password) {
            toast.warning("Please fill out all fields.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                "https://uni-networking-app.onrender.com/api/v1/user/signin",
                { email, password }
            );

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                toast.success("Signed in successfully!");
                navigate("/createprofile");
            } else {
                toast.error("Incorrect email or password.");
            }
        } catch (error) {
            console.error("Sign-in error:", error);
            if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
                toast.error("Incorrect email or password.");
            } else {
                toast.error("An error occurred. Please check your credentials.");
            }
        } finally {
            setLoading(false);
        }
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
                        <form className="space-y-6">
                            <InputBox
                                label="Email ID"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type={"email"}
                            />
                            <InputBox
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type={"password"}
                            />

                            <Button
                                onClick={handleSignIn}
                                label={loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    </div>
                                ) : (
                                    "Sign in"
                                )}
                                disabled={loading}
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

            {/* Toast Container for Notifications */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </>
    );
}