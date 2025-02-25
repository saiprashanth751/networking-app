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

export default function Signup() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async () => {
        if (!firstName || !lastName || !email || !password) {
            toast.warning("Please fill out all fields.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                "https://uni-networking-app.onrender.com/api/v1/user/signup",
                { firstName, lastName, email, password }
            );

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                toast.success("Account created successfully!");
                navigate("/verify");
            } else {
                toast.error("Failed to create account. Please try again.");
            }
        } catch (error) {
            console.error("Sign-up error:", error);
            if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
                toast.error("Invalid email or password.");
            } else {
                toast.error("An error occurred. Please try again.");
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
                <div className="flex h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                    <Heading label={"Sign up your account"} />
                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form className="space-y-6">
                            <div className="flex gap-3">
                                <InputBox
                                    label="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    type={"text"}
                                />
                                <InputBox
                                    label="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    type={"text"}
                                />
                            </div>
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
                                onClick={handleSignUp}
                                label={loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    </div>
                                ) : (
                                    "Sign up"
                                )}
                                disabled={loading}
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