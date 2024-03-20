import { Link } from "@inertiajs/react"

export default function error403() {
    return (
        <div className="flex flex-col gap-4 justify-center items-center font-s h-screen w-screen">   
            <div className="text-6xl bg-gradient-to-r from-fuchsia-700 to-sky-500 bg-clip-text text-transparent">Access Denied ! 403</div>
            <Link href={route('home')} className="text-center py-3 px-5 bg-gradient-to-br from-fuchsia-700 to-sky-500 text-white rounded-md">Home</Link>
        </div>
    )
}