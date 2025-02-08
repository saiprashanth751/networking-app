import { Quote } from "../components/Quote"
import { Heading } from "../components/Heading"
import { InputBox } from "../components/InputBox"
import { Button } from "../components/Button"
import { NavigationMsg } from "../components/NavigationMsg"
import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Signup() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    return (
        <>
            <div className="lg:grid lg:grid-cols-2">
                <div className="hidden lg:block"> <Quote /> </div>
                <div className="flex h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 ">
                    <Heading label={"Sign up your account"} />
                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

                        <form className="space-y-6">
                            <div className="flex gap-3">
                                <InputBox label="First Name" onChange={(e) => {
                                    setFirstName(e.target.value)
                                }} />
                                <InputBox label="Last Name" onChange={(e) => {
                                    setLastName(e.target.value)
                                }} />
                            </div>
                            <InputBox label="University Email ID" onChange={(e) => {
                                setEmail(e.target.value)
                            }} />
                            <InputBox label="Password" onChange={(e) => {
                                setPassword(e.target.value)
                            }} />

                            <Button onClick={async () => {
                                const response = await axios.post("https://uni-networking-app.onrender.com/api/v1/user/signup", {
                                    firstName,
                                    lastName,
                                    email,
                                    password
                                })
                                localStorage.setItem("token", response.data.token)
                                console.log(response.data.token)
                                navigate("/verify")
                            }}
                                label={"Sign up"} />

                            <NavigationMsg label={"Already have an account?"} to={"/signin"} action={"Sign in"}></NavigationMsg>

                        </form>
                    </div>
                </div>

            </div>
        </>
    )
}
