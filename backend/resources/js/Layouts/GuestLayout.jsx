import ApplicationLogo from '@/Components/ApplicationLogo';
import PubNavbar from '@/Components/PubNavbar';
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Guest({children}) {
    return (
        // bg-gray-100 dark:bg-gray-900
        <>
            <div className=''>
                <div
                    className="max-w-full lg:max-w-7xl mx-auto min-h-screen flex flex-col justify-center items-center p-6 sm:pt-0">
                    {/* <div className='w-full text-center sm:max-w-md mt-6 px-6 py-4 bg-white dark:bg-gray-800 shadow-md overflow-hidden sm:rounded-lg'>
                    <Link href="/">
                        <ApplicationLogo />
                    </Link>
                </div> */}
                    <PubNavbar/>


                    <div
                        className="w-96 sm:max-w-sm px-6 py-4 backdrop-blur-lg bg-opacity-60 bg-black shadow-md overflow-hidden rounded-lg mobile:max-w-xs">
                        <div className='w-full flex justify-center mb-8'>
                            <ApplicationLogo/>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
            <ToastContainer
                autoClose={5000}
            />
        </>
    );
}
