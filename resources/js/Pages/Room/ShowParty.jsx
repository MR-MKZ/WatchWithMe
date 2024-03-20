import {StrictMode, useCallback, useEffect, useRef, useState} from "react";
import VideoPlayer from "@/Components/VideoPlayer";
import PubNavbar from '@/Components/PubNavbar';
import {Scrollbar} from "react-scrollbars-custom";
import {Link} from "@inertiajs/react";
import {HiOutlineTrash} from "@react-icons/all-files/hi/HiOutlineTrash.js";
import autoAnimate from "@formkit/auto-animate";
import {io} from "socket.io-client";

export default function PartyHome({auth, roomData}) {

    const [percentage, setPercentage] = useState(null)
    const [bannerUrl, setBannerUrl] = useState("")
    const [videoUrl, setVideoUrl] = useState(null)
    const [queue, setQueue] = useState(0)
    const [processMsg, setProcessMsg] = useState("Checking room data, please wait a second ...")
    const [process, setProcess] = useState(0)
    const [messageInputSelected, setMessageInputSelected] = useState(false);
    const [chatOpen, setChatOpen] = useState(true);
    const [usersOpen, setUsersOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
    const [members, setMembers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState(false);
    const [chatActive, setChatActive] = useState(true);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [inRoom, setInRoom] = useState(false);
    const [roomReconnect, setRoomReconnect] = useState(0);

    const rightSidebarRef = useRef(null);
    const messagesRef = useRef(null);
    const sendMessageRef = useRef(null);

    let search = window.location.search;
    let params = new URLSearchParams(search);
    let partyUrl = params.get('party');

    useEffect(() => {
        const timeout = setInterval(() => {
            if (!socket.connected) {
                setConnectionStatus(false)
                setInRoom(false)
                // socket.connect()
            } else {
                setConnectionStatus(true)
            }
        }, 2000)
        return () => {
            clearInterval(timeout)
        }
    });


    const sendMsg = () => {
        socket.emit('sendMessage', {
            "userName": auth.user.name,
            "uid": auth.user.id,
            "isOwner": isOwner(),
            "link": partyUrl,
            "msg": sendMessageRef.current.value
        })
        sendMessageRef.current.value = ""
    }

    useEffect(() => {

        if (!inRoom) {
            setTimeout(() => {
                socket.connect()
            }, 2000)
        }
        // let partyUrl = params.get('party');

        socket.on('connect_error', () => {
            setConnectionStatus(false)
            window.location.href = window.location.href
        })

        socket.emit('connectedToRoom', {
            "uid": auth.user.id,
            "roomId": roomData.id,
            "isOwner": isOwner(),
            'ownerId': roomData.uid,
            "link": partyUrl,
            "userName": auth.user.name
        }, (newData) => {
            var members = []
            for (let i in newData.members) {
                members.push(newData.members[i])
            }
            setMembers(members)
            setVideoPlaying(newData.played)
            setConnectionStatus(true)
            setInRoom(true)
        })

        socket.on('roomUsersChanged', (newData) => {
            // console.log(newData)
            var members = []
            for (let i in newData.members) {
                members.push(newData.members[i])
            }
            setMembers(members)
        })

        socket.on('newMessage', (msgData) => {
            setMessages(oldMessages => [
                ...oldMessages,
                msgData
            ])
        })

        return () => {
            setInRoom(false)
            socket.disconnect();
        }
    }, [socket]);

    // TODO Fix socket connection problem. connected custom listener need to check and debug.

    useEffect(() => {
        messagesRef.current?.scrollIntoView({behavior: "smooth"})
    }, [messages]);

    const isOwner = () => {
        if (roomData.uid === auth.user.id && auth.user.room === roomData.id) {
            return true
        } else {
            return false
        }
    }

    const handleMessageFocus = () => {
        setMessageInputSelected(true)
    }

    const handleMessageBlur = () => {
        setMessageInputSelected(false)
    }

    const toggleChatOpen = () => {
        if (!isDesktop) {
            if (usersOpen) {
                setUsersOpen(false)
                setChatOpen(true)
                setChatActive(true)
            } else {
                setChatOpen(!chatOpen)
                setChatActive(true)
            }
        } else {
            if (usersOpen) {
                setUsersOpen(false)
                setChatOpen(true)
                setChatActive(true)
            } else {
                setChatOpen(true)
                setChatActive(true)
            }
        }
    }

    const handleUsersOpen = () => {
        if (!isDesktop) {
            if (chatOpen) {
                setChatOpen(false)
                setUsersOpen(true)
                setChatActive(false)
            } else {
                setUsersOpen(!usersOpen)
                setChatActive(false)
            }
        } else {
            if (chatOpen) {
                setChatOpen(false)
                setUsersOpen(true)
                setChatActive(false)
            } else {
                setUsersOpen(true)
                setChatActive(false)
            }
        }
    }


    useEffect(() => {
        const req = setTimeout(() => {
            axios.get(`${window.location.origin}/room/processing_status?id=${roomData.uid}`).then((resp) => {
                if (resp.data.processing) {
                    setProcess(process + 1)
                    if (resp.data['inQueue']) {
                        setProcessMsg("You are in queue, please wait until your turn")
                        setQueue(queue + 1)
                    } else {
                        setProcessMsg("Processing your video ...")
                        setBannerUrl(`${window.location.origin}/contents/videos/${roomData.id}/${partyUrl}.png`)
                        // Processing on video ...
                        if (resp.data.percentage < 97) {
                            setPercentage(resp.data.percentage)
                        } else {
                            setPercentage(100)
                            setVideoUrl(`${window.location.origin}/video/${partyUrl}.m3u8?rid=${roomData.id}`)
                        }
                    }
                } else if (!resp.data.processing && resp.data.msg) {
                    setProcess(0)
                    setBannerUrl(`${window.location.origin}/contents/videos/${roomData.id}/${partyUrl}.png`)
                    setVideoUrl(`${window.location.origin}/video/${partyUrl}.m3u8?rid=${roomData.id}`)
                }
                // console.log(resp.data);
            })
        }, 3000);
        return () => {
            clearTimeout(req)
        }
    }, [percentage, setPercentage, queue, setQueue, process, setProcess]);
    var css = `
        body {
            overflow: hidden;
        }
    `
    return (
        <>
            <PubNavbar auth={auth}/>
            <style>{css}</style>
            <div className="lg:pt-[4.2rem] mobile:pt-[3.2rem] lg:pb-[1rem] mx-auto w-[100vw] h-[100vh]">
                <div className="w-full h-full lg:px-8">
                    <div
                        className="lg:p-6 flex justify-between overflow-y-hidden mobile:flex-col lg:flex-row gap-6 border h-full border-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-lg bg-opacity-60 bg-black shadow-sm lg:rounded-lg">
                        <div
                            className="lg:w-[70%] mobile:h-full lg:gap-4 flex flex-col overflow-hidden">
                            {!process ? (
                                <div
                                    className="w-full lg:h-3/4 mobile:h-1/2 bg-[#232323] lg:p-2 lg:rounded-lg relative">
                                    {videoUrl ? (
                                        <StrictMode>
                                            <VideoPlayer
                                                src={videoUrl}
                                                messageInput={messageInputSelected}
                                                auth={auth}
                                                roomData={roomData}
                                                playingStatus={videoPlaying}
                                            />
                                        </StrictMode>

                                    ) : (
                                        <>
                                            {/*<img src={bannerUrl} className="mx-auto" alt="video banner"/>*/}
                                            <div id="wifi-loader"
                                                 className={`top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}>
                                                <svg className="circle-outer" viewBox="0 0 86 86">
                                                    <circle className="back" cx="43" cy="43" r="40"></circle>
                                                    <circle className="front" cx="43" cy="43" r="40"></circle>
                                                    <circle className="new" cx="43" cy="43" r="40"></circle>
                                                </svg>
                                                <svg className="circle-middle" viewBox="0 0 60 60">
                                                    <circle className="back" cx="30" cy="30" r="27"></circle>
                                                    <circle className="front" cx="30" cy="30" r="27"></circle>
                                                </svg>
                                                <svg className="circle-inner" viewBox="0 0 34 34">
                                                    <circle className="back" cx="17" cy="17" r="14"></circle>
                                                    <circle className="front" cx="17" cy="17" r="14"></circle>
                                                </svg>
                                                <div className="text" data-text=""></div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div
                                    className={`w-full flex flex-col justify-between h-3/4 p-2 rounded-lg relative`}>
                                    {/*<div*/}
                                    {/*    className={`w-[270px] h-[270px] bg-center bg-[url(../build/assets/icons/computer3Icon.png)] mx-auto bg-[100%, 100%] bg-no-repeat relative top-1/2 -translate-y-1/2`}>*/}
                                    {/*    <p className={`absolute top-[35%] left-1/2 -translate-x-1/2 text-lg`}>Processing*/}
                                    {/*        ...</p>*/}
                                    {/*</div>*/}
                                    <div className={`w-full h-full bg-no-repeat bg-contain bg-center`} style={{
                                        backgroundImage: `url(${bannerUrl})`
                                    }}></div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span
                                                className="text-base font-medium text-blue-700 dark:text-white">{processMsg}</span>
                                            <span
                                                className="text-sm font-medium text-blue-700 dark:text-white">{percentage != null ? percentage : 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div
                                                className="bg-purple-600 h-2.5 transition-all duration-300 rounded-full"
                                                style={{
                                                    width: percentage != null ? percentage + "%" : 0 + "%"
                                                }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="w-full mobile:px-8 lg:px-0 pt-2 lg:h-1/4 mobile:h-1/2">
                                {/*<div className=" w-full h-full flex flex-col gap-4">*/}
                                {/*</div>*/}
                                <Scrollbar>
                                    <div className={`w-full flex sm:flex-row mobile:flex-col gap-4 justify-between`}>
                                        <p className={`sm:text-xl mobile:text-lg`}>{roomData.title}</p>
                                        <p>Status: <span
                                            className={`${connectionStatus ? "text-[#3B9A00]" : "text-[#e68200]"}`}>{connectionStatus ? "Connected" : "Connecting"}</span>
                                        </p>
                                    </div>
                                    <div className={`flex items-center gap-2 mt-4`}>
                                        <duration-icon></duration-icon>
                                        <p id={`video-duration`}>Duration: 00:00</p>
                                        {/*Duration: {duration ? duration : "00:00"}*/}
                                    </div>
                                    <div className={`flex items-center gap-2 mt-4`}>
                                        <crown-icon></crown-icon>
                                        <p>Owner: {roomData.uname}</p>
                                    </div>
                                    {isOwner() ? (
                                        <Link
                                            className={`w-[40px] h-[40px] bg-red-800 rounded-xl flex justify-between items-center mt-4 transition-all duration-300 group hover:w-[140px] px-2`}
                                            href={route('room.delete')}
                                            as={'button'}
                                            method={'delete'}
                                        >
                                            <div className={`w-max h-[40px] flex items-center justify-center`}>
                                                <HiOutlineTrash size={23}/>
                                            </div>
                                            <span
                                                className={`select-none text-center w-0 group-hover:w-full transition-all overflow-hidden whitespace-nowrap`}>Delete Room</span>
                                        </Link>
                                    ) : <></>}
                                </Scrollbar>
                            </div>
                        </div>
                        <div
                            className={`lg:w-[30%] bg-[#232323] p-4 rounded-lg lg:relative mobile:absolute mobile:w-full lg:bottom-[unset] ${chatOpen || usersOpen ? "bottom-0" : "bottom-[-41%]"} lg:h-full mobile:h-1/2 flex flex-col justify-between transition-all duration-300`}
                            ref={rightSidebarRef}>
                            <div className={`lg:h-[10%] mobile:h-[20%] flex gap-4 flex-row-reverse`}>
                                <button
                                    onClick={toggleChatOpen}
                                    className={`lg:w-[57px] mobile:w-[45px] lg:h-[57px] mobile:h-[45px] bg-[#232323] rounded-xl relative border-2 ${chatOpen ? "border-[#00C2FF]" : "border-[#8E8E8E]"}`}>
                                    <chat-icon
                                        style={{
                                            background: chatOpen ? "#8F00FF" : "",
                                        }}></chat-icon>
                                    {/*<active-line></active-line>*/}
                                </button>
                                <button
                                    onClick={handleUsersOpen}
                                    className={`lg:w-[57px] mobile:w-[45px] lg:h-[57px] mobile:h-[45px] bg-[#232323] rounded-xl relative border-2 ${usersOpen ? "border-[#00C2FF]" : "border-[#8E8E8E]"}`}>
                                    <users-icon
                                        style={{
                                            background: usersOpen ? "#8F00FF" : "",
                                        }}></users-icon>
                                </button>
                                <div
                                    className={`lg:w-[57px] mobile:w-[45px] lg:h-[57px] lg:text-[12pt] mobile:text-[9pt] mobile:h-[45px] bg-[#232323] rounded-xl flex flex-col justify-center items-center border-2 border-[#8E8E8E]`}>
                                    <span className={`select-none`}>{members.length}</span>
                                    <view-icon></view-icon>
                                </div>
                            </div>
                            {chatActive ? (
                                <div
                                    className={`h-[90%] flex w-full mt-4 flex-col justify-end gap-4 transition-all duration-300`}>
                                    <div
                                        className={`w-full h-full`}>
                                        <Scrollbar scrollbarWidth={0}>
                                            {messages.map((msgData) => (
                                                msgData.uid === auth.user.id ? (
                                                    <div key={messages.indexOf(msgData)} id={`myMessage`}
                                                         className={`flex flex-row-reverse gap-2 mb-4`}>
                                                        <img src="../contents/users/1/profile.jpg"
                                                             alt="profile Mr.MKZ"
                                                             className={`mobile:w-[2.5rem] lg:w-[3rem] mobile:h-[2.5rem] lg:h-[3rem] rounded-full`}
                                                        />
                                                        <div
                                                            className={`w-full text-[11pt] flex items-center px-2.5 py-1.5 bg-[#383838] border-[#6100FF] border-2 rounded-xl`}>
                                                            <p className={`break-all`}>{msgData.msg}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div key={messages.indexOf(msgData)} id={`otherMessage`}
                                                         className={`flex flex-row gap-2 mb-4`}>
                                                        <img src="../contents/users/2/profile.jpg"
                                                             alt="profile Mr.MKZ"
                                                             className={`mobile:w-[2.5rem] lg:w-[3rem] mobile:h-[2.5rem] lg:h-[3rem] rounded-full`}
                                                        />
                                                        <div
                                                            className={`w-full text-[11pt] flex items-center px-2.5 py-1.5 bg-[#434343] border-[#0094FF] border-2 rounded-xl`}>
                                                            <p className={`w-full break-all`}><span
                                                                className={`text-cyan-500 mb-0.5`}>{msgData.userName}</span><br/>
                                                                {msgData.msg}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                            <div ref={messagesRef}></div>
                                        </Scrollbar>
                                    </div>
                                    <div
                                        className={`w-full h-14 bg-[#565656] rounded-lg flex items-center px-3 justify-between`}>
                                        <input
                                            ref={sendMessageRef}
                                            onFocus={handleMessageFocus}
                                            onBlur={handleMessageBlur}
                                            type="text"
                                            placeholder={`Write your message ...`}
                                            className={`h-full w-[87%] mr-2 bg-transparent text-white placeholder-white border-none p-0 focus:ring-transparent`}/>
                                        <button onClick={sendMsg} className="send-logo"></button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={`h-[90%] flex w-full mt-4 flex-col justify-end gap-4 transition-all duration-300`}>
                                    <div
                                        className={`w-full h-full`}>
                                        <Scrollbar scrollbarWidth={0}>
                                            {members.map((member) => {
                                                // console.log(member)
                                                return (
                                                    <div
                                                        key={member.id}
                                                        className={`flex flex-row-reverse gap-4 items-center bg-[#383838] p-2 rounded-lg mb-2 cursor-pointer`}>
                                                        <img src="../contents/users/2/profile.jpg"
                                                             alt="profile Mr.MKZ"
                                                             className={`lg:w-[3rem] mobile:w-[2.5rem] lg:h-[3rem] mobile:h-[2.5rem] rounded-full`}
                                                        />
                                                        <p>{member.name}</p>
                                                    </div>
                                                )
                                            })}
                                        </Scrollbar>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
