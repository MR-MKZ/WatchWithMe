import { Link } from "@inertiajs/react";

export default function ApplicationLogo(props) {
    if (props.size === "sm") {
        return (
            <Link href="/" className="w-max text-xl font-bold bg-gradient-to-r from-cyan-500 to-fuchsia-800 text-transparent bg-clip-text">Watch With Me</Link>
        );
    } else if (props.size === "xl") {
        return (
            <Link href="/" className="w-max text-3xl font-bold bg-gradient-to-r from-cyan-500 to-fuchsia-800 text-transparent bg-clip-text">Watch With Me</Link>
        );
    } else {
        return (
            <Link href="/" className="w-max text-3xl font-bold bg-gradient-to-r from-cyan-500 to-fuchsia-800 text-transparent bg-clip-text">Watch With Me</Link>
        );
    }

}
