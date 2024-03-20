import {Head, Link} from '@inertiajs/react';
import PubNavbar from '@/Components/PubNavbar';
import Typewriter from 'typewriter-effect'
import {WrapperContainer} from "@/Layouts/WrapperContainer.jsx";
import {useEffect, useState} from "react";
import {ToastContainer, toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function convertSecondstoTime(given_seconds) {

    let hours = Math.floor(given_seconds / 3600);
    let minutes = Math.floor((given_seconds - (hours * 3600)) / 60);
    let seconds = given_seconds - (hours * 3600) - (minutes * 60);

    let timeString;

    if (hours < 1) {
        timeString = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    } else {
        timeString = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }

    return timeString;
}

export default function Welcome({auth, rooms}) {
    const [myRoom, setMyRoom] = useState({});

    useEffect(() => {
        if (auth.user) {
            if (rooms) {
                for (let room of rooms) {
                    if (room.id === auth.user.room) {
                        setMyRoom(room);
                    }
                }
            }
        }
    }, []);

    const notify = (type, desc, theme = "dark") => {
        switch (type) {
            case "info":
                toast.info(desc, {
                    theme: theme
                })
                break
            case "error":
                toast.error(desc, {
                    theme: theme
                })
                break
            case "success":
                toast.success(desc, {
                    theme: theme
                })
                break
            case "warn":
                toast.warn(desc, {
                    theme: theme
                })
                break
            default:
                toast.info(desc, {
                    theme: theme
                })
        }
    }

    return (<>
        <Head title="Watch With Me"/>
        <PubNavbar auth={auth}/>
        {auth.user ? (<>
            <WrapperContainer>
                {Object.keys(myRoom).length > 0 && (<div className={`w-full mb-8`}>
                    <div
                        className={`backdrop-blur-[8px] bg-[#1d2230e6] border border-[#0094FF] flex gap-3 justify-between lg:h-[192px] md:h-max md:flex-row mobile:flex-col mobile:w-full p-3 relative rounded-[20px] text-white lg:w-1/2`}>
                        <img
                            className={`mobile:w-full object-cover rounded-lg md:w-1/2`}
                            src={window.location.origin + "/contents/videos/" + myRoom.id + "/" + myRoom.link + ".png"}
                            alt={myRoom.title}
                        />
                        <div
                            className={`flex flex-col justify-between lg:text-base mobile:text-lg mobile:w-full md:w-1/2 mobile:gap-2`}>
                            <div className={`h-full flex flex-col gap-2`}>
                                <h3 className={`line-clamp-2 font-semibold h-[50px]`}>{myRoom.title}</h3>
                                <p className={`text-gray-400`}>My Room</p>
                                <p className={`text-gray-200`}>{convertSecondstoTime(myRoom.duration)}</p>
                            </div>
                            <div className={`flex gap-3 justify-between lg:flex-row mobile:flex-col-reverse`}>
                                <button
                                    className={`bg-[#0085FF] mobile:w-full py-2 rounded-lg w-1/2`}
                                    onClick={() => {
                                        navigator.clipboard.writeText(route('room.home', {
                                            'party': myRoom.link
                                        }))
                                        notify("info", "Invite link copied successfully.");
                                    }}
                                >Share
                                </button>
                                <Link
                                    className={`bg-[#DB00FF] block mobile:w-full py-2 rounded-lg text-center w-1/2`}
                                    href={route('room.home', {
                                        'party': myRoom.link
                                    })}>Join</Link>
                            </div>
                        </div>
                    </div>
                </div>)}

                {/*public room separator*/}
                <div
                    className={`border border-[#7000FF] px-5 py-[10px] lg:justify-between mobile:justify-center rounded-lg bg-[#1d2230e6] backdrop-blur-[8px] text-white flex gap-5 items-center`}>
                    <p className={`lg:w-[110px] lg:text-base mobile:text-[14pt] mobile:text-center mobile:w-full`}>Public
                        Rooms</p>
                    <div className={`lg:w-full bg-white h-[1px] lg:block mobile:hidden`}></div>
                </div>

                {/*room cards*/}
                {rooms && (<div
                    className={`mt-8 flex flex-wrap ${Object.keys(rooms).length >= 2 && Object.keys(rooms).length <= 4 ? "lg:justify-start lg:gap-4" : ""} md:justify-between md:gap-y-4 md:gap-x-0`}>
                    {rooms.map((room) => {
                        if (room.id !== auth.user.room) {
                            return (
                                <div
                                    key={room.id}
                                    className={`lg:w-[305px] relative lg:h-[305px] md:w-[49%] mobile:w-full mobile:h-max flex flex-col justify-between gap-3 p-3 rounded-[20px] bg-[#1d2230e6] backdrop-blur-[8px] text-white border border-[#C0F]`}>
                                    <div className={`relative w-full h-1/2`}>
                                        <img
                                            className={`w-full h-full rounded-[8px] object-cover`}
                                            src={window.location.origin + "/contents/videos/" + room.id + "/" + room.link + ".png"}
                                            alt={room.title}
                                        />
                                        <div
                                            className={`w-max bg-black/70 px-2 rounded-[6px] lg:text-[9pt] mobile:text-base absolute right-2 bottom-2`}>{convertSecondstoTime(room.duration)}</div>
                                    </div>
                                    <div
                                        className={`w-full h-1/2 flex flex-col justify-between lg:gap-0 lg:text-base mobile:gap-3 mobile:text-lg`}>
                                        <div className={`h-full flex flex-col gap-2`}>
                                            <h3 className={`line-clamp-2 font-semibold text-lg leading-6 max-h-[50px]`}>{room.title}</h3>
                                            <p className={`text-gray-400 lg:text-base mobile:text-lg`}>{room.creator}</p>
                                        </div>
                                        <div
                                            className={`flex justify-between gap-3 lg:flex-row mobile:flex-col-reverse`}>
                                            <button
                                                className={`py-2 lg:w-1/2 rounded-lg bg-[#0085FF] mobile:w-full`}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(route('room.home', {
                                                        'party': room.link
                                                    }));
                                                    notify("info", "Invite link copied successfully.");
                                                }}
                                            >Share
                                            </button>
                                            <Link
                                                className={`block text-center py-2 lg:w-1/2 rounded-lg bg-[#DB00FF] mobile:w-full`}
                                                href={route('room.home', {
                                                    'party': room.link
                                                })}>Join</Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>)}
            </WrapperContainer>
        </>) : (<>
            <div
                className={`relative flex justify-center items-center min-h-screen selection:bg-cyan-500 selection:text-white`}>
                <div className='w-max h-max text-white lg:text-6xl sm:text-4xl mobile:text-2xl'>
                    <Typewriter
                        options={{
                            strings: ['Watch movie with your friends', 'A completely online cinema', 'Watch With Me'],
                            autoStart: true,
                            pauseFor: 1000,
                            loop: true
                        }}
                    />
                </div>
            </div>
        </>)}
        <ToastContainer
            autoClose={2000}
        />
    </>);
}
