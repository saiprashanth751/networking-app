import { useNavigate } from "react-router-dom"
import {Button} from "../components/Button"

export function AppBar(){
    const navigate = useNavigate()
    return (
        <>
            <div className="flex justify-between m-2 pb-2 items-center border-b-2">
                <div className="text-xl font-semibold">Connect!</div>
                <div className="flex gap-2">
                    <Button onClick={() => {
                        navigate("/userprofile")
                    }}
                    label={"Profile"}></Button>
                    <Button onClick={() => {
                        navigate("/signin")
                    }}
                    label={"Sign out"}></Button>
                </div>
            </div>
        </>
    )
}