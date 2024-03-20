import {Link} from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {MdVideoLibrary} from '@react-icons/all-files/md/MdVideoLibrary';
import {BiUser} from '@react-icons/all-files/bi/BiUser';
import {BsChevronDown} from '@react-icons/all-files/bs/BsChevronDown'
import {useState} from 'react';
import {FiLogOut} from "@react-icons/all-files/fi/FiLogOut"
import {IoMdClose} from '@react-icons/all-files/io/IoMdClose'
import {AiOutlineMenu} from '@react-icons/all-files/ai/AiOutlineMenu'

export default function PubNavbar({auth, ...props}) {
    var [profileDropOpen, profileDropSetOpen] = useState(false)
    if (!auth) {
        auth = ''
    }
    // console.log(auth);
    const toggleOpen = () => {
        if (burgerOpen == true) {
            toggleBurger()
            profileDropSetOpen((profileDropOpen) => !profileDropOpen)
        } else {
            profileDropSetOpen((profileDropOpen) => !profileDropOpen)
        }
    }

    var [burgerOpen, burgerSetOpen] = useState(false)
    const toggleBurger = () => {
        if (profileDropOpen == true) {
            toggleOpen()
            burgerSetOpen((burgerOpen) => !burgerOpen)
        } else {
            burgerSetOpen((burgerOpen) => !burgerOpen)
        }
    }

    const profileBorder = (role) => {
        switch (role) {
            case 0:
                return "h-8 w-8 bg-green-900 flex items-center justify-center rounded-full border-green-500 border-2 text-gray-300"
                break;
            case 1:
                return "h-8 w-8 bg-yellow-900 flex items-center justify-center rounded-full border-yellow-500 border-2 text-gray-300"
                break
            case 2:
                return "h-8 w-8 bg-cyan-900 flex items-center justify-center rounded-full border-cyan-500 border-2 text-gray-300"
                break
            case 3:
                return "sm:h-8 mobile:h-7 sm:w-8 mobile:w-7 bg-fuchsia-900 flex items-center justify-center rounded-full border-fuchsia-500 border-2 text-gray-300"
                break
            default:
                return "h-8 w-8 bg-red-900 flex items-center justify-center rounded-full border-red-500 border-2 text-gray-300"
                break;
        }
    }
    const profileIcon = (role) => {
        switch (role) {
            case 0:
                return "text-green-500"
                break;
            case 1:
                return "text-yellow-500"
                break
            case 2:
                return "text-cyan-500"
                break
            case 3:
                return "text-fuchsia-500"
                break
            default:
                return "text-red-500"
                break;
        }
    }

    var grayDropdownBtn = 'w-full text-center text-gray-300 hover:bg-zinc-700 p-1 rounded-md duration-300'
    var dangerDropdownBtn = 'w-full flex gap-1 items-center justify-center text-center text-red-600 hover:bg-red-700 hover:text-white p-1 rounded-md duration-300'
    var primaryDropdownBtn = 'w-full text-center text-blue-600 hover:bg-blue-600 hover:text-white p-1 rounded-md duration-300'

    return (
        <>
            <div
                className="mobile:fixed mobile:flex duration-300 items-center justify-between z-40 h-[52px] w-full backdrop-blur-lg bg-opacity-60 bg-black mobile:top-0 mobile:right-0 px-8 text-right">
                {/* Left Side */}
                <div className='flex gap-8 items-center'>
                    <ApplicationLogo size="sm"/>
                    <div className='w-max lg:flex mobile:hidden items-center gap-8'>
                        {auth.user ? (
                            <>
                                {!auth.user.room ? (
                                    <>
                                        <Link href={route('room.create')}
                                              className='flex items-center text-gray-300 hover:text-fuchsia-600 duration-150'>Create
                                            Room</Link>
                                    </>
                                ) : (
                                    <>
                                        {/*<Link*/}
                                        {/*    className='flex items-center gap-1 text-gray-300 hover:text-fuchsia-600 duration-150'><MdVideoLibrary/>All*/}
                                        {/*    Rooms</Link>*/}
                                        <Link href={route('room.home', {'party': auth.user.link})}
                                              className='flex items-center text-gray-300 hover:text-fuchsia-600 duration-150'>My
                                            Room</Link>
                                    </>
                                )}
                            </>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
                {/* End Left Side */}
                {/* Right Side */}
                <div className='w-max flex items-center h-full gap-3'>
                    <div className='h-full lg:flex mobile:flex gap-3 w-max py-2'>
                        {auth.user ? (
                            <>
                                <div
                                    className='h-full w-max flex items-center text-gray-300 gap-3 cursor-pointer select-none'
                                    onClick={toggleOpen}>
                                    <BsChevronDown
                                        className={`${profileDropOpen ? "rotate-180" : "rotate-0"} sm:block  duration-300`}/>
                                    <p className='sm:block mobile:hidden'>{auth.user.name}</p>
                                    <div className={profileBorder(auth.user.role)}><BiUser
                                        className={profileIcon(auth.user.role)} size="20"/></div>
                                </div>
                                <div
                                    className={`${profileDropOpen ? "flex opacity-100 lg:top-16 mobile:top-[52px]" : "opacity-0 top-10 hidden"
                                    } h-max duration-300 lg:w-48 mobile:w-full flex-col gap-1 absolute lg:right-7 mobile:right-0 lg:rounded-md p-3 lg:bg-zinc-800 mobile:backdrop-blur-lg mobile:bg-opacity-80 mobile:bg-black`}>
                                    {!auth.user.room ? (
                                        <>
                                            <Link href={route('room.create')}
                                                  className={grayDropdownBtn}>Create
                                                Room</Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link href={route('room.home', {'party': auth.user.link})}
                                                  className={grayDropdownBtn}>My
                                                Room</Link>
                                        </>
                                    )}
                                    <Link className={grayDropdownBtn} href={route('profile.edit')}>My Profile</Link>
                                    {auth.user.role == 2 || auth.user.role == 3 ? (
                                        <>
                                            <Link className={grayDropdownBtn} href={route('dashboard')}>Dashboard</Link>
                                        </>
                                    ) : (<></>)}
                                    <Link className={primaryDropdownBtn} href={route('home')}>Home</Link>
                                    <Link className={dangerDropdownBtn} method='post' href={route('logout')}
                                          as='button'><FiLogOut/> Logout</Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link as='button' href={route('register')}
                                      className='h-full w-max mobile:hidden sm:flex items-center rounded-md pr-4 pl-4 bg-fuchsia-700 hover:bg-fuchsia-500 duration-150 text-gray-200'>Register</Link>
                                <Link as='button' href={route('login')}
                                      className='h-full w-max mobile:hidden sm:flex items-center rounded-md pr-4 pl-4 bg-zinc-700 hover:bg-zinc-500 duration-150 text-gray-200'>Login</Link>
                                <Link href={route('register')}
                                      className='sm:hidden mobile:flex h-8 w-8 bg-zinc-700 items-center justify-center rounded-full border-zinc-500 border-2 text-gray-400'><BiUser
                                    className='' size="20"/></Link>
                            </>
                        )}
                    </div>
                    {/*<div className='h-full w-7 text-white relative mobile:flex lg:hidden items-center justify-center'*/}
                    {/*     onClick={toggleBurger}>*/}
                    {/*    <AiOutlineMenu*/}
                    {/*        className={`${!burgerOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"} duration-200 absolute`}*/}
                    {/*        size={25}/>*/}
                    {/*    <IoMdClose*/}
                    {/*        className={`${!burgerOpen ? "opacity-0 rotate-0" : "opacity-100 rotate-90"} duration-200 absolute`}*/}
                    {/*        size={27}/>*/}
                    {/*</div>*/}
                </div>
                {/* End Right Side */}
                {/* Burger Menu */}
                {/*<div*/}
                {/*    className={`${burgerOpen ? "flex opacity-100 h-max" : "h-0 opacity-0 hidden"} lg:h-0 lg:opacity-0 w-full top-[52px] left-2/4 -translate-x-2/4 absolute z-50 text-white backdrop-blur-lg overflow-y-auto bg-opacity-80 bg-black sm:flex-row sm:jusify-between sm:p-8 mobile:py-5 duration-300 mobile:flex-col gap-3 sm:flex-wrap`}>*/}
                {/*    {auth.user ? (*/}
                {/*        <>*/}
                {/*            {!auth.user.room ? (*/}
                {/*                <>*/}
                {/*                    <Link href={route('room.create')}*/}
                {/*                          className='flex items-center justify-center text-gray-300 hover:text-fuchsia-600 duration-150'>Create*/}
                {/*                        Room</Link>*/}
                {/*                </>*/}
                {/*            ) : (*/}
                {/*                <>*/}
                {/*                    <Link href={route('room.home', {'party': auth.user.link})}*/}
                {/*                          className='flex items-center justify-center text-gray-300 hover:text-fuchsia-600 duration-150'>My*/}
                {/*                        Room</Link>*/}
                {/*                </>*/}
                {/*            )}*/}
                {/*        </>*/}
                {/*    ) : (*/}
                {/*        <></>*/}
                {/*    )}*/}
                {/*</div>*/}
                {/* End Burger Menu */}
            </div>
        </>
    )
}
