import {Head, useForm} from "@inertiajs/react";
import {useRef, useState} from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import {AiOutlineCloudUpload} from '@react-icons/all-files/ai/AiOutlineCloudUpload';
import {FileInput, Label} from 'flowbite-react';

export default function createRoom({auth}) {
    const videoInputRef = useRef(null)
    const subtitleInputRef = useRef(null)
    var [createRoomStatus, setCreateRoomStatus] = useState({
        title: false,
        video: false,
        type: false
    })
    const [dragActive, setDragActive] = useState(false);
    const {data, setData, post, progress, errors} = useForm({
        title: '',
        video: '',
        subtitle: '',
        type: ''
    })

    const calculateFileSize = (size) => {
        var fSExt = new Array('Bytes', 'KB', 'MB', 'GB'),
            i = 0;
        //check if file is in GB,MB,KB or Bytes
        while (size > 900) {
            size /= 1024; //divide file size
            i++;
        }
        //get exact size
        var exactSize = (Math.round(size * 100) / 100) + ' ' + fSExt[i];
        return exactSize
    }

    const handleVideo = (e) => {
        e.preventDefault()
        try {
            let partOfName = videoInputRef.current.files[0].name.split(".")
            let videoExtension = partOfName[partOfName.length - 1]
            let videoType = videoInputRef.current.files[0].type
            if (videoExtension == "mp4" || videoExtension == "mkv" || videoExtension == "avi") {
                if (videoType == "video/x-matroska" || videoType == "video/mp4" || videoType == "video/avi") {
                    console.log(videoInputRef.current.files[0]);
                    setCreateRoomStatus(createRoomStatus = {...createRoomStatus, video: true})
                    setData('video', videoInputRef.current.files[0])
                } else {
                    videoInputRef.current.value = ''
                    setCreateRoomStatus(createRoomStatus = {...createRoomStatus, video: false})
                }
            } else {
                videoInputRef.current.value = ''
                setCreateRoomStatus(createRoomStatus = {...createRoomStatus, video: false})
            }
        } catch (error) {
            if (error instanceof TypeError) {
                //pass
            }
        }
    }
    const handleSubtitle = (e) => {
        e.preventDefault()
        try {
            let partOfName = subtitleInputRef.current.files[0].name.split(".")
            let subtitleExtension = partOfName[partOfName.length - 1]
            let subtitleType = subtitleInputRef.current.files[0].type
            if (subtitleExtension === "srt") {
                console.log(subtitleInputRef.current.files[0]);
                // if (subtitleType == "subtitle/x-matroska" || subtitleType == "subtitle/mp4" || subtitleType == "subtitle/avi") {
                //     console.log(subtitleInputRef.current.files[0]);
                //     setCreateRoomStatus(createRoomStatus = { ...createRoomStatus, subtitle: true })
                //     setData('subtitle', subtitleInputRef.current.files[0])
                // } else {
                //     subtitleInputRef.current.value = ''
                //     setCreateRoomStatus(createRoomStatus = { ...createRoomStatus, subtitle: false })
                // }
            } else {
                subtitleInputRef.current.value = ''
                setCreateRoomStatus(createRoomStatus = {...createRoomStatus, subtitle: false})
            }
        } catch (error) {
            if (error instanceof TypeError) {
                //pass
            }
        }
    }

    const handleTitle = (e) => {
        e.preventDefault()
        if (e.target.value != '') {
            if (e.target.value.length < 50) {
                setCreateRoomStatus(createRoomStatus = {...createRoomStatus, title: true})
                setData('title', e.target.value)
            }
        } else {
            setCreateRoomStatus(createRoomStatus = {...createRoomStatus, title: false})
        }
    }

    const handleType = (e) => {
        if (e.target.value != '' || e.target.value != null) {
            setCreateRoomStatus(createRoomStatus = {...createRoomStatus, type: true})
            setData('type', e.target.value)
        } else {
            setCreateRoomStatus(createRoomStatus = {...createRoomStatus, type: false})
        }
    }

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // handleFile(e.dataTransfer.files);
            let partOfName = e.dataTransfer.files[0].name.split(".")
            let videoExtension = partOfName[partOfName.length - 1]
            let videoType = e.dataTransfer.files[0].type
            if (videoExtension == "mp4" || videoExtension == "mkv" || videoExtension == "avi") {
                if (videoType == "video/x-matroska" || videoType == "video/mp4" || videoType == "video/avi") {
                    console.log(e.dataTransfer.files[0]);
                    setCreateRoomStatus(createRoomStatus = {...createRoomStatus, video: true})
                    setData('video', e.dataTransfer.files[0])
                } else {
                    videoInputRef.current.value = ''
                    setCreateRoomStatus(createRoomStatus = {...createRoomStatus, video: false})
                }
            } else {
                videoInputRef.current.value = ''
                setCreateRoomStatus(createRoomStatus = {...createRoomStatus, video: false})
            }
        }
    };

    const onSubmitHandler = (e) => {
        e.preventDefault()
        post('/room/create', {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => {
                console.log("finished");
            },
            onSuccess: (page) => {
                console.log(page, "success")
            }
        }, data)
    }
    return (
        <AuthenticatedLayout
            auth={auth}
        >
            <Head title="Create Room"/>
            <div className="py-[4.4rem]">
                <div className="w-full lg:w-[1024px] mx-auto px-8">
                    <div
                        className="p-6 border border-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-lg bg-opacity-60 bg-black overflow-hidden shadow-sm rounded-lg">
                        <div className="w-full justify-center items-center h-14 sm:flex mobile:hidden">
                            <ApplicationLogo/>
                        </div>
                        <form onSubmit={onSubmitHandler}>
                            <div>
                                <label htmlFor="roomTitle"
                                       className="sm:text-[15pt] mobile:text-[13pt] mb-5">Title</label>

                                <TextInput
                                    id="roomTitle"
                                    type="text"
                                    className="mt-1 block w-full"
                                    autoComplete="off"
                                    isFocused={true}
                                    placeholder="Extraction 2 💣..."
                                    onChange={handleTitle}
                                    disabled={progress}
                                    required={true}
                                    maxLength={50}
                                />

                                <InputError message="" className="mt-2"/>
                            </div>
                            <input disabled={progress} ref={videoInputRef} onChange={(e) => handleVideo(e)}
                                   className="hidden" accept=".mp4,.mkv,.avi" type="file" id="videoFileInput"/>
                            <label htmlFor="videoFileInput"
                                   className="h-[20rem] cursor-pointer mt-5 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 flex items-center justify-center rounded-md p-4">
                                <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag}
                                     onDrop={handleDrop}
                                     className="border-dashed border-[3px] rounded-lg flex items-center justify-center flex-col border-gray-400 w-full h-full">
                                    {createRoomStatus.video ?
                                        <>
                                            <p className="sm:text-xl mobile:text-base select-none">Name: {videoInputRef.current.files[0].name}</p>
                                            <p className="sm:text-xl mobile:text-base select-none">Size: {calculateFileSize(videoInputRef.current.files[0].size)}</p>
                                        </> : <></>
                                    }
                                    <p className={`sm:text-xl mobile:text-base select-none`}></p>
                                    <AiOutlineCloudUpload className={createRoomStatus.video ? "hidden" : "block"}
                                                          size={70}/>
                                    <p className={`${createRoomStatus.video ? "hidden" : "block"} sm:text-xl mobile:text-base select-none`}>Drag
                                        & drop to upload</p>
                                    <p className={`${createRoomStatus.video ? "hidden" : "block"} sm:text-lg mobile:text-sm text-center select-none cursor-pointer text-fuchsia-600 hover:text-fuchsia-500 transition-all duration-300`}>or
                                        browse</p>
                                </div>
                            </label>
                            <div
                                className="max-full mt-5 md:text-left mobile:text-center"
                                id="subtitleUpload"
                            >
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="subtitle"
                                        value="Upload Subtitle"
                                    />
                                </div>
                                <FileInput
                                    helperText="If your video has subtitle you can upload it here."
                                    id="subtitle"
                                    ref={subtitleInputRef}
                                    onChange={(e) => handleSubtitle(e)}
                                    accept=".srt"
                                />
                            </div>
                            <div className="mt-5">
                                <h3 className="mb-5 text-lg md:text-left mobile:text-center font-medium text-gray-900 dark:text-white">What
                                    kind of room do you want?</h3>
                                <ul className="grid w-full gap-6 md:grid-cols-2">
                                    <li>
                                        <input disabled={progress} onChange={handleType} type="radio" id="roomPrivate"
                                               name="roomType" value="private" className="hidden peer" required/>
                                        <label htmlFor="roomPrivate"
                                               className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-cyan-500 peer-checked:border-purple-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-900 dark:hover:bg-gray-800">
                                            <div className="block">
                                                <div className="w-full text-lg font-semibold">Private room</div>
                                                <div className="w-full">Users can join only with your invite link</div>
                                            </div>
                                            <svg className="w-5 h-5 ml-3" aria-hidden="true"
                                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                                      strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                            </svg>
                                        </label>
                                    </li>
                                    <li>
                                        <input disabled={progress} onChange={handleType} type="radio" id="roomPublic"
                                               name="roomType" value="public" className="hidden peer"/>
                                        <label htmlFor="roomPublic"
                                               className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-cyan-500 peer-checked:border-purple-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-900 dark:hover:bg-gray-800">
                                            <div className="block">
                                                <div className="w-full text-lg font-semibold">Public room</div>
                                                <div className="w-full">everyone can join to your room</div>
                                            </div>
                                            <svg className="w-5 h-5 ml-3" aria-hidden="true"
                                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                                      strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                            </svg>
                                        </label>
                                    </li>
                                </ul>
                            </div>
                            <div className="w-full flex justify-between mobile:flex-col sm:flex-row" dir="rtl">
                                <button
                                    disabled={!createRoomStatus.title || !createRoomStatus.video || !createRoomStatus.type || progress}
                                    id="submitForm"
                                    className="mobile:w-full lg:w-1/4 py-3 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:text-white bg-white text-black rounded-md cursor-pointer mt-5">Create
                                    Room
                                </button>
                            </div>
                        </form>
                        {progress && (
                            // <progress className="text-white" value={progress.percentage} max="100">
                            //     {progress.percentage}%
                            // </progress>
                            <>
                                <div className="flex justify-between mb-1 mt-5">
                                    <span
                                        className="text-base font-medium text-blue-700 dark:text-white">Uploading Video</span>
                                    <span
                                        className="text-sm font-medium text-blue-700 dark:text-white">{progress.percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div className="bg-purple-600 transition-all duration-300 h-2.5 rounded-full"
                                         style={{
                                             width: progress.percentage + "%"
                                         }}></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
