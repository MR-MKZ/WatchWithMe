import { Head, router, useForm } from "@inertiajs/react";
import { useRef, useState, useEffect } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import { AiOutlineCloudUpload } from '@react-icons/all-files/ai/AiOutlineCloudUpload';
import { FileInput, Label } from 'flowbite-react';
import axios from "axios";
import { toast } from "react-toastify";

// const CHUNK_SIZE = 2 * (1024 * 1024); // 5MB

export default function createRoom({ auth }) {
    const videoInputRef = useRef(null)
    const subtitleInputRef = useRef(null)
    var [createRoomStatus, setCreateRoomStatus] = useState({
        title: false,
        video: false,
        type: false
    })
    const [dragActive, setDragActive] = useState(false);
    const [video, setVideo] = useState(null);
    const [step, setStep] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(null);

    const { data, setData, post, progress, errors } = useForm({
        title: '',
        // video: '',
        subtitle: '',
        type: ''
    })

    useEffect(async () => {
        await deleteRoom();
    }, []);

    const calculateFileSize = (bytes) => {
        const enUnits = ["B", "KB", "MB", "GB", "TB"];
        let i = 0;

        while (bytes >= 1000 && i < enUnits.length - 1) {
            bytes /= 1000;
            i++;
        }

        if (i === 0) {
            return [0, enUnits[i]];
        }

        return [bytes.toFixed(1), enUnits[i]];
    }

    function getOptimalChunkSize(fileSize) {
        const MB = 1024 * 1024;

        // Define tiers
        const tiers = [
            { max: 100 * MB, chunk: 5 * MB },
            { max: 1024 * MB, chunk: 20 * MB },
            { max: 5 * 1024 * MB, chunk: 64 * MB },
            { max: Infinity, chunk: 128 * MB },
        ];

        // Pick tier based on file size
        let baseChunkSize = tiers.find(t => fileSize <= t.max).chunk;

        // Try to find a clean divisor starting from baseChunkSize up to 1.5x
        for (let size = baseChunkSize; size <= baseChunkSize * 1.5; size += MB) {
            if (fileSize % size === 0) return size;
        }

        // Fallback: try smaller sizes for a clean divisor
        for (let size = baseChunkSize - MB; size >= 1 * MB; size -= MB) {
            if (fileSize % size === 0) return size;
        }

        // Ultimate fallback
        return baseChunkSize;
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
                    setCreateRoomStatus({ ...createRoomStatus, video: true })
                    setVideo(videoInputRef.current.files[0]);
                    // setData('video', videoInputRef.current.files[0])
                } else {
                    videoInputRef.current.value = ''
                    setCreateRoomStatus({ ...createRoomStatus, video: false })
                }
            } else {
                videoInputRef.current.value = ''
                setCreateRoomStatus({ ...createRoomStatus, video: false })
            }
        } catch (error) {
            videoInputRef.current.value = ''
            setCreateRoomStatus({ ...createRoomStatus, video: false })
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
                setCreateRoomStatus(createRoomStatus = { ...createRoomStatus, subtitle: false })
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
                setCreateRoomStatus(createRoomStatus = { ...createRoomStatus, title: true })
                setData('title', e.target.value)
            }
        } else {
            setCreateRoomStatus(createRoomStatus = { ...createRoomStatus, title: false })
        }
    }

    const handleType = (e) => {
        if (e.target.value != '' || e.target.value != null) {
            setCreateRoomStatus(createRoomStatus = { ...createRoomStatus, type: true })
            setData('type', e.target.value)
        } else {
            setCreateRoomStatus(createRoomStatus = { ...createRoomStatus, type: false })
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
                    setCreateRoomStatus({ ...createRoomStatus, video: true })
                    // setData('video', e.dataTransfer.files[0])
                    setVideo(e.dataTransfer.files[0]);
                } else {
                    videoInputRef.current.value = ''
                    setCreateRoomStatus({ ...createRoomStatus, video: false })
                }
            } else {
                videoInputRef.current.value = ''
                setCreateRoomStatus({ ...createRoomStatus, video: false })
            }
        }
    };

    const uploadChunks = async (filename) => {
        if (!video) return;

        const partOfName = videoInputRef.current.files[0].name.split(".")
        const videoExtension = partOfName[partOfName.length - 1]
        const videoType = videoInputRef.current.files[0].type

        if (video.size <= (1024 * 1024 * 5)) {
            const formData = new FormData();
            formData.append('chunk', video);
            formData.append('index', 1);
            formData.append('total', 1);
            formData.append('filename', filename);
            formData.append('videoExtension', videoExtension);
            formData.append('videoType', videoType);
            await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            setUploadProgress(100);
            return [video.name, 1];
        }

        const CHUNK_SIZE = getOptimalChunkSize(video.size);
        const totalChunks = Math.ceil(video.size / CHUNK_SIZE);

        console.log(totalChunks);

        setUploadProgress(0);

        for (let i = 1; i <= totalChunks; i++) {
            const start = (i - 1) * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, video.size);
            const chunk = video.slice(start, end);

            const formData = new FormData();
            formData.append('chunk', chunk);
            formData.append('index', i);
            formData.append('total', totalChunks);
            formData.append('filename', filename);
            formData.append('videoExtension', videoExtension);
            formData.append('videoType', videoType);

            await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            setUploadProgress(Math.round((i / totalChunks) * 100));
        }
    }

    const deleteRoom = async () => {
        return await axios.delete(route('room.delete'));
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setStep(1);

        let room;

        try {
            room = await axios.post('/room/create', data)
        } catch (error) {
            setStep(null);
            console.error(err);
            toast.error("Error creating room");
            await deleteRoom();
            return;
        }

        setStep(2);

        if (room.data.file) {
            try {
                await uploadChunks(room.data.file)
            } catch (error) {
                setStep(null);
                console.log(error);
                toast.error("Error uploading video");
                setUploadProgress(null);
                await deleteRoom();
                return
            }

            setStep(3);

            toast.success("Room created successfully");

            router.visit(`/room/join?party=${room.data.link}`)
        } else {
            setStep(null);
            await deleteRoom();
            toast.warn("File not exist in room data");
        }

        setUploadProgress(null);
    }
    return (
        <AuthenticatedLayout
            auth={auth}
        >
            <Head title="Create Room" />
            <div className="py-[4.4rem]">
                <div className="w-full lg:w-[1024px] mx-auto px-8">
                    <div
                        className="p-6 border border-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-lg bg-opacity-60 bg-black overflow-hidden shadow-sm rounded-lg">
                        <div className="w-full justify-center items-center h-14 sm:flex mobile:hidden">
                            <ApplicationLogo />
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

                                <InputError message="" className="mt-2" />
                            </div>
                            <input disabled={progress} ref={videoInputRef} onChange={(e) => handleVideo(e)}
                                className="hidden" accept=".mp4,.mkv,.avi" type="file" id="videoFileInput" />
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
                                        size={70} />
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
                                            name="roomType" value="private" className="hidden peer" required />
                                        <label htmlFor="roomPrivate"
                                            className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-cyan-500 peer-checked:border-purple-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-900 dark:hover:bg-gray-800">
                                            <div className="block">
                                                <div className="w-full text-lg font-semibold">Private room</div>
                                                <div className="w-full">Users can join only with your invite link</div>
                                            </div>
                                            <svg className="w-5 h-5 ml-3" aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                                    strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                            </svg>
                                        </label>
                                    </li>
                                    <li>
                                        <input disabled={progress} onChange={handleType} type="radio" id="roomPublic"
                                            name="roomType" value="public" className="hidden peer" />
                                        <label htmlFor="roomPublic"
                                            className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-cyan-500 peer-checked:border-purple-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-900 dark:hover:bg-gray-800">
                                            <div className="block">
                                                <div className="w-full text-lg font-semibold">Public room</div>
                                                <div className="w-full">everyone can join to your room</div>
                                            </div>
                                            <svg className="w-5 h-5 ml-3" aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                                    strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                            </svg>
                                        </label>
                                    </li>
                                </ul>
                            </div>
                            <div className="w-full flex justify-between mobile:flex-col sm:flex-row" dir="rtl">
                                <button
                                    disabled={!createRoomStatus.title || !createRoomStatus.video || !createRoomStatus.type || uploadProgress}
                                    id="submitForm"
                                    dir="ltr"
                                    className="mobile:w-full lg:w-1/4 py-3 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:text-white bg-white text-black rounded-md cursor-pointer mt-5">
                                    {(() => {
                                        if (!step) {
                                            return "Create Room";
                                        }

                                        if (step == 1) {
                                            return "Sending room info..."
                                        }

                                        if (step == 2) {
                                            return "Uploading video..."
                                        }

                                        if (step == 3) {
                                            return "Redirecting to room..."
                                        }

                                        return "Create Room";
                                    })()}
                                </button>
                            </div>
                        </form>
                        {uploadProgress && (
                            // <progress className="text-white" value={progress.percentage} max="100">
                            //     {progress.percentage}%
                            // </progress>
                            <>
                                <div className="flex justify-between mb-1 mt-5">
                                    <span
                                        className="text-base font-medium text-blue-700 dark:text-white">Uploading Video</span>
                                    <span
                                        className="text-sm font-medium text-blue-700 dark:text-white">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div className="bg-purple-600 transition-all duration-300 h-2.5 rounded-full"
                                        style={{
                                            width: uploadProgress + "%"
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
