
export function Heading({label}: {label: string}) : JSX.Element {
    return (
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                {label}
            </h2>
        </div>
    )
}