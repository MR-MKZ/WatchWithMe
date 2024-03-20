import React, {StrictMode, useCallback, useEffect, useRef, useState} from 'react'
import ReactPlayer from 'react-player'
import {getTrackBackground, Range} from "react-range";
import {FullScreen, useFullScreenHandle} from "react-full-screen";


export default function VideoPlayer({src, subtitle, messageInput, auth, roomData, playingStatus}) {

    const playerBg = useRef(null)
    const playerWrapper = useRef(null)

    // calculate percent for duration width: {playedTime / maxDuration * 100}%

    const [volumeHovered, setVolumeHovered] = useState(false)
    const [volumeStatus, setVolumeStatus] = useState(null)
    const [lastVol, setLastVol] = useState(0)
    const [qualityOpen, setQualityOpen] = useState(false)
    const [activeControls, setActiveControls] = useState(false)
    const [mouseMove, setMouseMove] = useState(false)
    const [videoLoaded, setVideoLoaded] = useState(false)
    const [playedStatus, setPlayedStatus] = useState(playingStatus);

    const search = window.location.search;
    const params = new URLSearchParams(search);
    const partyUrl = params.get('party');

    const isOwner = () => {
        return roomData.uid === auth.user.id && auth.user.room === roomData.id;
    }

    const keyPress = useCallback(
        (e) => {
            switch (e.code) {
                case "Space":
                    if (!messageInput) {
                        if (isOwner()) {
                            handlePlayPause()
                        }
                    }
                    break;
                case "ArrowUp":
                    if (!messageInput) {
                        if (vol.values[0] < 1) {
                            if (vol.values[0] > 0.8) {
                                setVol({values: [1]})
                            } else {
                                setVol({values: [vol.values[0] + 0.1]})
                            }
                        }
                    }
                    break;
                case "ArrowDown":
                    if (!messageInput) {
                        if (vol.values[0] > 0) {
                            if (vol.values[0] < 0.2) {
                                setVol({values: [0]})
                            } else {
                                setVol({values: [vol.values[0] - 0.1]})
                            }
                        }
                    }
                    break;
                case "ArrowRight":
                    if (!messageInput) {
                        if (isOwner()) {
                            handleSeekChange([state.status.playedSeconds + 5])
                        }
                    }
                    break;
                case "ArrowLeft":
                    if (!messageInput) {
                        if (isOwner()) {
                            handleSeekChange([state.status.playedSeconds - 5])
                        }
                    }
                    break;
                case "KeyM":
                    if (!messageInput) {
                        handleToggleMuted()
                    }
                    break;
                case "KeyF":
                    if (!messageInput) {
                        if (handleFullscreen.active) {
                            handleFullscreen.exit()
                        } else {
                            handleFullscreen.enter()
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    )

    useEffect(() => {
        document.addEventListener("keydown", keyPress)
        return () => document.removeEventListener("keydown", keyPress)
    })

    var [vol, setVol] = useState({
        values: [1]
    })

    var [state, setState] = useState({
        pip: false,
        playing: false,
        light: false,
        muted: false,
        played: 0,
        loaded: 0,
        duration: 0,
        playbackRate: 1.0,
        loop: false,
        seeking: false,
        status: {
            loaded: 0,
            loadedSeconds: 0,
            played: 0,
            playedSeconds: 0
        }
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => {

        socket.once("seekChanged", (data) => {
            setState({
                ...state,
                playing: data.playingStatus,
                status: {...state.status, playedSeconds: data.playedSeconds}
            })
            playerRef.current.seekTo(data.playedSeconds)
        })
    }, [state.status]);

    socket.on('playPauseChanged', (data) => {
        if (data) {
            handlePlay()
        } else {
            handlePause()
        }
    })


    useEffect(() => {
        socket.once('hostProgress', (progress) => {
            if (progress > state.status.playedSeconds + 2 || progress + 1 < state.status.playedSeconds) {
                handleSeekChange([progress])
            }
            if (progress < state.duration) {
                handlePlay()
            }
        })
    }, [state.status.playedSeconds]);

    // TODO : Check for bugs, check sync with other internet speeds and decrease delay.


    useEffect(() => {
        if (state.muted) {
            setVolumeStatus("volume-mute")
        } else {
            if (vol.values[0] > 0.6) {
                setVolumeStatus("volume-high")
            } else if (vol.values[0] > 0.3) {
                setVolumeStatus("volume-mid")
            } else {
                setVolumeStatus("volume-low")
            }
        }
    }, [state.muted, setState, vol, setVol]);

    const STEP = 0.1;
    const MIN = 0;
    const MAX = 1;

    function format(seconds) {
        const date = new Date(seconds * 1000)
        const hh = date.getUTCHours()
        const mm = date.getUTCMinutes()
        const ss = pad(date.getUTCSeconds())
        if (hh === 0) {
            return `${pad(mm)}:${ss}`
        } else if (hh < 10) {
            return `0${hh}:${pad(mm)}:${ss}`
        } else {
            return `${hh}:${pad(mm)}:${ss}`
        }
    }

    function pad(string) {
        return ('0' + string).slice(-2)
    }

    document.getElementById('video-duration').innerText = "Duration: " + format(state.duration)

    var handlePlayPause = () => {
        setState({...state, playing: !state.playing})

        if (isOwner()) {
            socket.emit("handlePlayPause", {
                "uid": auth.user.id,
                "link": partyUrl,
                "playPauseStatus": !state.playing,
                "playedSeconds": !state.playing === false ? state.status.playedSeconds : 0
            })
        }
    }

    var handleToggleLight = () => {
        setState({...state, light: !state.light})
    }

    var handleToggleLoop = () => {
        setState({...state, loop: !state.loop})
    }

    var handleToggleMuted = () => {
        setState({...state, muted: !state.muted})
        if (vol.values[0] > 0) {
            setLastVol(vol.values[0])
            setVol({values: [0]})
        } else {
            if (lastVol) {
                setVol({values: [lastVol]})
            } else {
                setVol({values: [1]})
            }
        }
    }

    var handleSetPlaybackRate = e => {
        setState({...state, playbackRate: parseFloat(e.target.value)})
    }

    var handleOnPlaybackRateChange = (speed) => {
        setState({...state, playbackRate: parseFloat(speed)})
    }

    var handleTogglePIP = () => {
        setState({...state, pip: !state.pip})
    }

    var handlePlay = () => {
        setState({...state, playing: true})
    }

    var handleEnablePIP = () => {
        setState({...state, pip: true})
    }

    var handleDisablePIP = () => {
        setState({...state, pip: false})
    }

    var handlePause = () => {
        setState({...state, playing: false})
    }

    var handleSeekMouseDown = e => {
        setState({...state, seeking: true, playing: false})
    }

    var handleSeekChange = e => {
        setState({...state, status: {...state.status, playedSeconds: e[0]}})
        playerRef.current.seekTo(e[0])
    }

    var handleSeekMouseUp = e => {
        setState({...state, seeking: false})
        if (isOwner()) {
            socket.emit("handleSeekChange", {
                "uid": auth.user.id,
                "link": partyUrl,
                "playedSeconds": state.status.playedSeconds,
                "playingStatus": false
            })
        }
    }

    var handleProgress = progress => {
        if (playedStatus !== 0) {
            setState({
                ...state,
                status: {...state.status, playedSeconds: playedStatus}
            })
            playerRef.current.seekTo(playedStatus)
            setPlayedStatus(0)
        }
        if (!state.seeking) {
            setState({...state, status: progress})
            if (state.playing) {
                if (isOwner()) {
                    socket.emit("progressUpdated", {
                        "uid": auth.user.id,
                        "link": partyUrl,
                        "playedSeconds": progress.playedSeconds
                    })
                }
            }
        }
    }

    var handleEnded = () => {
        setState({...state, playing: state.loop})
    }

    var handleDuration = (duration) => {
        setState({...state, duration: duration})
    }

    var qualityDropdownHandler = () => {
        setQualityOpen(!qualityOpen)
    }

    const handleFullscreen = useFullScreenHandle();

    var handleQuality = (e) => {
        let quality = e.target.value
        console.log("VideoPLayer: " + quality);
        setQualityOpen(false)
        const internalPlayer = playerRef.current?.getInternalPlayer('hls');
        if (internalPlayer) {
            if (e.target.value == "auto") {
                internalPlayer.nextLevel = -1
            } else {
                internalPlayer.nextLevel = e.target.value
            }
        }
    }

    const playerRef = useRef(null)
    if (!state.muted) {
        if (vol.values[0] === 0) {
            setState({...state, muted: true})
        }
    } else {
        if (vol.values[0] > 0) {
            setState({...state, muted: false})
        }
    }
    const handleShortcutKey = (e) => {
        if (e.keyCode === 32) {
            handlePlayPause()
        }
    }

    const handleMouseMove = (e) => {
        console.log("move");
        if (handleFullscreen.active) {
            e.preventDefault();
            setMouseMove(true);

            let timeout;
            (() => {
                clearTimeout(timeout);
                timeout = setTimeout(() => setMouseMove(false), 50);
            })();
        }
    }

    let height = ""

    if (handleFullscreen.active && !isOwner()) {
        height = "100%!important"
    } else if (handleFullscreen.active && isOwner()) {
        height = "92%!important"
    } else {
        height = ""
    }

    var css = `
    .player-video video {
      height: ${height};
      border-radius: 0.5rem
    }

  `

    return (
        <>
            <style>{css}</style>
            <div onMouseEnter={() => {
                if (state.playing) {
                    setActiveControls(false)
                }
            }} onMouseLeave={() => {
                if (state.playing) {
                    setActiveControls(true)
                }
            }} className="player-wrapper">
                <FullScreen handle={handleFullscreen}>
                    <div
                        className={`${loading ? `block` : `hidden`} text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl`}>
                        <div id="wifi-loader">
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
                    </div>
                    <ReactPlayer
                        ref={playerRef}
                        className={`player-video`}
                        width='100%'
                        height='100%'
                        url={src}
                        pip={state.pip}
                        playing={state.playing}
                        controls={false}
                        light={state.light}
                        loop={state.loop}
                        playbackRate={state.playbackRate}
                        volume={vol.values[0]}
                        muted={state.muted}
                        onReady={() => console.log('VideoPLayer: onReady')}
                        onStart={() => console.log('VideoPLayer: onStart')}
                        onPlay={handlePlay}
                        onEnablePIP={handleEnablePIP}
                        onDisablePIP={handleDisablePIP}
                        onPause={handlePause}
                        onBuffer={(e) => setLoading(true)}
                        onBufferEnd={() => setLoading(false)}
                        onPlaybackRateChange={handleOnPlaybackRateChange}
                        onEnded={handleEnded}
                        onError={e => console.log('VideoPLayer:', e)}
                        onProgress={handleProgress}
                        onDuration={handleDuration}
                        onPlaybackQualityChange={e => console.log('VideoPLayer: onPlaybackQualityChange', e)}
                        onLoadStart={() => {
                            console.log('VideoPLayer: ...I am loading...')
                        }}
                        onLoadedData={() => {
                            console.log('VideoPLayer: Data is loaded!')
                            setVideoLoaded(true)
                        }}
                        config={subtitle ? {
                            file: {
                                attributes: {
                                    crossOrigin: "true"
                                },
                                tracks: [
                                    {
                                        kind: "subtitles",
                                        src: subtitle,
                                        srcLang: "any",
                                        default: true
                                    }
                                ]
                            }
                        } : {}}
                    />
                    <p className="absolute top-[5px] left-[10px] text-white z-[101] text-sm select-none">v1.0</p>
                    <p className="absolute top-[5px] right-[10px] text-white z-[101] text-sm select-none">{Math.round(state.status.loaded * 100)}%</p>
                    <div
                        className={`absolute left-0 w-full top-0 ${state.playing && activeControls ? "h-full" : "h-[80%]"}`}
                        onClick={isOwner() ? handlePlayPause : console.log()}></div>
                    <div ref={playerBg}
                         className={`player-controls-bg-top rounded-lg ${handleFullscreen.active ? "player-hide" : ""} ${state.playing && activeControls ? "player-hide" : ""}`}></div>
                    <div ref={playerBg}
                         className={`player-controls-bg rounded-lg ${handleFullscreen.active ? "player-hide" : ""} ${state.playing && activeControls ? "player-hide" : ""}`}></div>
                    <div ref={playerWrapper}
                         className={`player-controls-wrapper rounded-lg ${state.playing && activeControls ? "player-hide" : ""}`}>
                        {isOwner() ? (
                            <div className="progress-bar-container">
                                <div className="player-video-progress" onMouseDown={handleSeekMouseDown}
                                     onMouseUp={handleSeekMouseUp}>
                                    <Range
                                        values={[state.status.playedSeconds]}
                                        step={0.001}
                                        min={0}
                                        max={state.duration !== 0 ? state.duration : 0.1}
                                        onChange={handleSeekChange}
                                        renderTrack={({props, children}) => (
                                            <div
                                                onMouseDown={props.onMouseDown}
                                                onTouchStart={props.onTouchStart}
                                                style={{
                                                    ...props.style,
                                                    height: "max-content",
                                                    display: "flex",
                                                    width: "100%",
                                                    marginBottom: "15px",
                                                }}
                                            >
                                                <div
                                                    ref={props.ref}
                                                    style={{
                                                        height: "5px",
                                                        width: "100%",
                                                        borderRadius: "4px",
                                                        background: getTrackBackground({
                                                            values: [state.status.playedSeconds],
                                                            colors: ["#8F00FF", "#919191"],
                                                            min: 0,
                                                            max: state.duration !== 0 ? state.duration : 0.1
                                                        }),
                                                        alignSelf: "center"
                                                    }}
                                                >
                                                    {children}
                                                </div>
                                            </div>
                                        )}
                                        renderThumb={({props, isDragged}) => (
                                            <div
                                                {...props}
                                                style={{
                                                    ...props.style,
                                                    height: "9px",
                                                    width: "9px",
                                                    borderRadius: "50%",
                                                    backgroundColor: "#a533ff",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    border: "none",
                                                }}
                                            >

                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        ) : (<></>)}
                        <div className="controles-container">
                            <div className="player-left-controls">
                                {isOwner() ? (
                                    <button onClick={handlePlayPause}
                                            className={`${state.playing ? `player-pause` : `player-play`}`}></button>
                                ) : (<></>)}
                                <div className="volume-control flex items-center gap-3" onMouseEnter={() => {
                                    setVolumeHovered(true)
                                }} onMouseLeave={() => {
                                    setVolumeHovered(false)
                                }}>
                                    <button className={volumeStatus} onClick={handleToggleMuted}></button>
                                    <Range
                                        values={vol.values}
                                        step={STEP}
                                        min={MIN}
                                        max={MAX}
                                        onChange={(values) => setVol({values: values})}
                                        renderTrack={({props, children}) => (
                                            <div
                                                onMouseDown={props.onMouseDown}
                                                onTouchStart={props.onTouchStart}
                                                style={{
                                                    ...props.style,
                                                    height: "30px",
                                                    display: "flex",
                                                    width: volumeHovered ? 75 + "px" : 0 + "px",
                                                    transition: ".3s all ease"
                                                }}
                                            >
                                                <div
                                                    ref={props.ref}
                                                    style={{
                                                        height: "3px",
                                                        width: "100%",
                                                        borderRadius: "4px",
                                                        background: getTrackBackground({
                                                            values: vol.values,
                                                            colors: ["#8F00FF", "#919191"],
                                                            min: MIN,
                                                            max: MAX
                                                        }),
                                                        alignSelf: "center"
                                                    }}
                                                >
                                                    {children}
                                                </div>
                                            </div>
                                        )}
                                        renderThumb={({props, isDragged}) => (
                                            <div
                                                {...props}
                                                style={{
                                                    ...props.style,
                                                    height: "7px",
                                                    width: "7px",
                                                    borderRadius: "50%",
                                                    backgroundColor: "#a533ff",
                                                    display: volumeHovered ? "flex" : "none",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    border: "none",
                                                }}
                                            >

                                            </div>
                                        )}
                                    />
                                </div>
                                <div className="h-full flex items-center gap-1">
                                    <span>{format(state.status.playedSeconds)}</span>/<span
                                    id={`movie-duration`}>{format(state.duration)}</span>
                                </div>
                            </div>
                            <div className="player-right-controls">
                                <button className="settings-icon" onClick={qualityDropdownHandler}></button>
                                <div
                                    className={`${qualityOpen ? "block" : "hidden"} absolute bottom-[3.5rem] right-[17rem] h-max w-max`}>
                                    <div id="dropdownQualityRadio"
                                         className={`z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-[12rem] dark:bg-[#00000099] backdrop-blur-sm border border-white dark:divide-gray-600`}
                                         data-popper-reference-hidden="" data-popper-escaped=""
                                         data-popper-placement="top" style={{
                                        position: "absolute",
                                        inset: "auto 0px 0px",
                                        margin: "0px",
                                    }}>
                                        <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200"
                                            aria-labelledby="dropdownHelperRadioButton">
                                            <p>Video Quality</p>
                                            <li className="cursor-pointer">
                                                <div
                                                    className="flex p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                                    <div className="flex items-center mr-4">
                                                        <input defaultChecked onClick={handleQuality} id="quality-auto"
                                                               type="radio" value="auto" name="colored-radio"
                                                               className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-600 dark:border-gray-600"/>
                                                        <label htmlFor="quality-auto"
                                                               className="ml-2 lg:w-[130px] text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">Auto</label>
                                                    </div>
                                                </div>
                                            </li>
                                            {videoLoaded ? playerRef.current?.getInternalPlayer('hls').levels.map((quality, id) => {
                                                return (
                                                    <li key={id} className="cursor-pointer">
                                                        <div
                                                            className="flex p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                                            <div className="flex items-center mr-4">
                                                                <input onClick={handleQuality} id={`quality-${id}`}
                                                                       type="radio" value={id} name="colored-radio"
                                                                       className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-600 dark:border-gray-600"/>
                                                                <label htmlFor={`quality-${id}`}
                                                                       className="ml-2 lg:w-[130px] text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">{quality.height}p</label>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )
                                            }) : <></>}
                                        </ul>
                                    </div>
                                </div>
                                <button className={handleFullscreen.active ? "hidden" : "pip-icon"}
                                        onClick={handleTogglePIP}></button>
                                <button className="fullscreen-icon" onClick={() => {
                                    if (handleFullscreen.active) {
                                        handleFullscreen.exit()
                                    } else {
                                        handleFullscreen.enter()
                                    }
                                }}></button>
                            </div>
                        </div>
                    </div>
                </FullScreen>
            </div>
        </>
    )
}
