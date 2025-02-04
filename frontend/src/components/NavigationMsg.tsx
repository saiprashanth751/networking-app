import { Link } from "react-router-dom"

export function NavigationMsg({ label, to , action}: { label: string, to: string, action: string }) {
    return (
        <>
        <div className="flex gap-2 justify-center">
            <div>
                {label}
            </div>
            <div className="underline text-blue-800">
                <Link to={to}>{action}</Link>
            </div>
            </div>
        </>
    )
}