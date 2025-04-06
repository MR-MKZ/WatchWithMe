import PubNavbar from '@/Components/PubNavbar';
import {ToastContainer} from "react-toastify";

export default function Authenticated({auth, header, children}) {
    return (
        // bg-gray-100 dark:bg-gray-900
        <>
            <div className="min-h-screen">
                {/* <Navbar user={user}></Navbar> */}
                <PubNavbar auth={auth}/>
                <main>{children}</main>
            </div>
            <ToastContainer
                autoClose={5000}
                theme='dark'
            />
        </>
    );
}
