import { Link } from "@inertiajs/react"

export default function error419() {
    return (
        <div className="flex flex-col gap-4 justify-center items-center font-s h-screen w-screen bg-gray-800">   
            <div className="text-5xl bg-gradient-to-r from-fuchsia-700 to-sky-500 bg-clip-text text-transparent mobile:text-3xl">419</div>
            <Link href={route('home')} className="mobile:w-52 text-center py-3 px-5 bg-gradient-to-br from-fuchsia-700 to-sky-500 text-white rounded-md">Home</Link>
        </div>
    )
}