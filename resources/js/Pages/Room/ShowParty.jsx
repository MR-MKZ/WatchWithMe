import {StrictMode, useEffect, useRef, useState} from "react";
import VideoPlayer from "@/Components/VideoPlayer";
import PubNavbar from '@/Components/PubNavbar';
import {Scrollbar} from "react-scrollbars-custom";
import {Link} from "@inertiajs/react";
import {HiOutlineTrash} from "@react-icons/all-files/hi/HiOutlineTrash.js";
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import $ from 'jquery';

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
    const [connectionStatus, setConnectionStatus] = useState(false);
    const [chatActive, setChatActive] = useState(true);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [inRoom, setInRoom] = useState(false);
    const [ping, setPing] = useState("N/A");

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
            } else {
                setConnectionStatus(true)
            }
        }, 2000)
        return () => {
            clearInterval(timeout)
        }
    });

    var pingStartTime;

    useEffect(() => {
        let sent = false
        socket.on('pong', () => {
            const reqPing = Date.now() - pingStartTime;
            if (`${reqPing}ms` !== ping && !isNaN(reqPing)) {
                setPing(`${reqPing}ms`)
            }
        });

        let timer = setInterval(() => {
            pingStartTime = Date.now();
            socket.emit('ping');
            sent = true
        }, 5000);

        return () => {
            socket.off("pong")
            clearInterval(timer)
        }
    }, []);


    const sendMsg = () => {
        if (sendMessageRef.current.value != null && sendMessageRef.current.value.trim() !== '') {
            socket.emit('sendMessage', {
                "userName": auth.user.name,
                "uid": auth.user.id,
                "isOwner": isOwner(),
                "link": partyUrl,
                "msg": sendMessageRef.current.value.trim(),
                "photo": auth.user.photo
            })
            sendMessageRef.current.value = ""
        }
    }

    useEffect(() => {

        if (!inRoom) {
            setTimeout(() => {
                socket.connect()
                if (socket.connect().connected) {
                    socket.emit('connectedToRoom', {
                        "uid": auth.user.id,
                        "roomId": roomData.id,
                        "isOwner": isOwner(),
                        'ownerId': roomData.uid,
                        "link": partyUrl,
                        "userName": auth.user.name,
                        "photo": auth.user.photo
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
                }
            }, 2000)
        }

        socket.on('connect_error', () => {
            setConnectionStatus(false)
            notify("warn", "retrying to connect ...")
        })

        socket.on("connect", () => {
            // console.log("connected")
            $(".announceMessage").remove()
            notify("success", "Connected to the room")
            socket.emit('connectedToRoom', {
                "uid": auth.user.id,
                "roomId": roomData.id,
                "isOwner": isOwner(),
                'ownerId': roomData.uid,
                "link": partyUrl,
                "userName": auth.user.name,
                "photo": auth.user.photo
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
        })

        socket.on('roomUsersChanged', (newData) => {
            var members = []
            for (let i in newData.members) {
                members.push(newData.members[i])
            }
            setMembers(members)
        })

        socket.on("newUserJoined", (user) => {
            let message = `
                <div class="announceMessage flex flex-row gap-2 mb-4">
                    <div class="border-2 flex items-center px-2.5 py-1.5 rounded-xl rtl text-[11pt] text-center w-full">
                        <p class="w-full">
                            <span class="text-cyan-500 mb-0.5">${user.name}</span>
                            <span> joined the room</span>
                        </p>
                    </div>
                </div>
            `
            if (auth.user.id !== user.id) {
                $(message).insertBefore($(".last-message-scroller"))
                setUsersOpen(false)
                setChatOpen(true)
                setChatActive(true)
                messagesRef.current?.scrollIntoView({behavior: "smooth"})
            }
        })

        socket.on("userLeft", (user) => {
            let message = `
                <div class="announceMessage flex flex-row gap-2 mb-4">
                    <div class="border-2 flex items-center px-2.5 py-1.5 rounded-xl rtl text-[11pt] text-center w-full">
                        <p class="w-full">
                            <span class="text-cyan-500 mb-0.5">${user.name}</span>
                            <span> left the room</span>
                        </p>
                    </div>
                </div>
            `
            if (auth.user.id !== user.id) {
                $(message).insertBefore($(".last-message-scroller"))
                setUsersOpen(false)
                setChatOpen(true)
                setChatActive(true)
                messagesRef.current?.scrollIntoView({behavior: "smooth"})
            }
        })

        socket.on('newMessage', (msgData) => {
            setUsersOpen(false)
            setChatOpen(true)
            setChatActive(true)
            if (msgData.uid === auth.user.id) {
                let message = `
                    <div id="myMessage" class="message flex flex-row-reverse gap-2 mb-4">
                        <img
                            src=${auth.user.photo !== null ? "../" + auth.user.photo : "../contents/users/default/profile.jpg"}
                            alt=${msgData.userName + " profile"}
                            class="mobile:w-[2.5rem] lg:w-[3rem] mobile:h-[2.5rem] lg:h-[3rem] rounded-full object-cover"
                        />
                        <div class="w-max min-w-[170px] lg:max-w-[calc(100%-111px)] md:max-w-[60%] mobile:max-w-full text-[11pt] flex items-center rtl px-2.5 py-1.5 border-[#6100FF] border-2 rounded-xl">
                            <p class="break-words ${isRtl(msgData.msg) ? "text-right" : "text-left"}">
                                ${msgData.msg}
                            </p>
                        </div>
                    </div>
                `
                $(message).insertBefore($(".last-message-scroller"))
                messagesRef.current?.scrollIntoView({behavior: "smooth"})
            } else {
                let message = `
                    <div id="otherMessage" class="message flex flex-row gap-2 mb-4" user=${msgData.uid}>
                        <img
                            src=${"../" + msgData.photo}
                            alt=${msgData.userName + " profile"}
                            class="mobile:w-[2.5rem] lg:w-[3rem] mobile:h-[2.5rem] lg:h-[3rem] rounded-full object-cover"
                        />
                        <div class="w-max min-w-[170px] lg:max-w-[calc(100%-111px)] md:max-w-[60%] mobile:max-w-full text-[11pt] flex items-center rtl px-2.5 py-1.5 border-[#0094FF] border-2 rounded-xl">
                            <p class="w-full break-words ${isRtl(msgData.msg) ? "text-right" : "text-left"}"><span
                                class="text-cyan-500 mb-0.5 block ${isRtl(msgData.userName) ? "text-right" : "text-left lg:w-full"}">${msgData.isOwner ? "⭐" : ""}${msgData.userName}</span>
                                ${msgData.msg}
                            </p>
                        </div>
                    </div>
                `
                $(message).insertBefore($(".last-message-scroller"))
                messagesRef.current?.scrollIntoView({behavior: "smooth"})
            }
        })

        return () => {
            setInRoom(false)
            socket.off("connect")
            socket.off("connect_error")
            socket.off("roomUsersChanged")
            socket.off("newUserJoined")
            socket.off("userLeft")
            socket.off("newMessage")
            socket.disconnect();
        }
    }, []);

    const isOwner = () => {
        return roomData.uid === auth.user.id && auth.user.room === roomData.id;
    }

    const isRtl = (text) => {
        return /[^\x00-\x7F]/.test(text);
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
                $(".announceMessage").show()
                $(".message").show()
            } else {
                setChatOpen(!chatOpen)
                setChatActive(true)
                $(".announceMessage").show()
                $(".message").show()
            }
        } else {
            if (usersOpen) {
                setUsersOpen(false)
                setChatOpen(true)
                setChatActive(true)
                $(".announceMessage").show()
                $(".message").show()
            } else {
                setChatOpen(true)
                setChatActive(true)
                $(".announceMessage").show()
                $(".message").show()
            }
        }
    }

    const handleUsersOpen = () => {
        if (!isDesktop) {
            if (chatOpen) {
                setChatOpen(false)
                setUsersOpen(true)
                setChatActive(false)
                $(".announceMessage").hide()
                $(".message").hide()
            } else {
                setUsersOpen(!usersOpen)
                setChatActive(false)
                $(".announceMessage").hide()
                $(".message").hide()
            }
        } else {
            if (chatOpen) {
                setChatOpen(false)
                setUsersOpen(true)
                setChatActive(false)
                $(".announceMessage").hide()
                $(".message").hide()
            } else {
                setUsersOpen(true)
                setChatActive(false)
                $(".announceMessage").hide()
                $(".message").hide()
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

    var css = `
        body {
            overflow: hidden;
        }
    `
    return (
        <>
            <PubNavbar auth={auth}/>
            <style>{css}</style>
            <div
                className="lg:pt-[4.2rem] mobile:pt-[3.2rem] lg:pb-[1rem] mx-auto w-[100vw] h-[100vh] mobile:fixed mobile:bottom-0">
                <div className="w-full h-full lg:px-8">
                    <div
                        className="lg:p-6 flex justify-between mobile:flex-col lg:flex-row gap-6 border h-full border-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-lg bg-opacity-60 bg-black shadow-sm lg:rounded-lg">
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
                                                connectionStatus={connectionStatus}
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
                                        <p>Ping: <span
                                            className={`${connectionStatus ? "text-[#3B9A00]" : "text-[#e68200]"}`}>{connectionStatus ? ping : "Connecting"}</span>
                                            <br/>
                                            {socket.disconnected && (
                                                <button onClick={() => socket.connect()}><span
                                                    className={`text-[#ffc800]`}>Reconnect Now</span>
                                                </button>
                                            )}
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
                                        className={`w-full h-full chatContainer`}>
                                        <Scrollbar scrollbarWidth={0}>
                                            <div ref={messagesRef} className={"last-message-scroller"}></div>
                                        </Scrollbar>
                                    </div>
                                    <div
                                        className={`w-full h-14 bg-[#565656] rounded-lg flex items-center px-3 justify-between`}>
                                        <input
                                            ref={sendMessageRef}
                                            onFocus={handleMessageFocus}
                                            onBlur={handleMessageBlur}
                                            onKeyUp={(key) => {
                                                if (key.keyCode === 13) {
                                                    sendMsg();
                                                }
                                            }}
                                            type="text"
                                            placeholder={`Write your message ...`}
                                            className={`auto-dir h-full w-[87%] mr-2 bg-transparent text-white placeholder-white border-none p-0 focus:ring-transparent`}/>
                                        <button onClick={sendMsg} type={`submit`} className="send-logo"></button>
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
                                                        <img
                                                            src={"../" + member.photo}
                                                            alt={member.name + " profile"}
                                                            className={`lg:w-[3rem] mobile:w-[2.5rem] lg:h-[3rem] mobile:h-[2.5rem] rounded-full object-cover`}
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
            <ToastContainer
                autoClose={2000}
            />
        </>
    )
}
