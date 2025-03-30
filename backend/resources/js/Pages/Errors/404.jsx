import { Link } from "@inertiajs/react"

export default function error404() {
    return (
        <div className="flex flex-col gap-4 justify-center items-center font-s h-screen">   
            <div className="text-6xl bg-gradient-to-r from-fuchsia-700 to-sky-500 bg-clip-text text-transparent">Page Not Found</div>
            <Link href={route('home')} className="text-center py-3 px-5 bg-gradient-to-br from-fuchsia-700 to-sky-500 text-white rounded-md">Home</Link>
        </div>
    )
}