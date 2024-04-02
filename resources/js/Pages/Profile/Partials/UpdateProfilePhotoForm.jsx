import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import {Link, useForm, usePage} from '@inertiajs/react';
import {Transition} from '@headlessui/react';
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import $ from 'jquery';
import {FileInput, Label} from "flowbite-react";

export default function UpdateProfilePhotoForm({className = '', userData}) {
    const user = userData ? userData : usePage().props.auth.user;

    // console.log(user)

    const {data, setData, post, errors, processing, recentlySuccessful} = useForm({
        profilePhoto: user.photo
    });

    const handleProfilePhoto = (event) => {
        const file = event.target.files[0];

        if (file.size <= 10 * 1024 * 1024) {
            let partOfName = file.name.split(".")
            let photoExtension = partOfName[partOfName.length - 1]
            if (photoExtension === "jpg" || photoExtension === "jpeg" || photoExtension === "png") {
                setData('profilePhoto', file)
            } else {
                $("#profilePhoto").val('')
                setData('profilePhoto', null)
                notify("error", "Only (.PNG .JPG .JPEG) allowed")
            }
        } else {
            $("#profilePhoto").val('')
            setData('profilePhoto', null)
            notify("error", "File size exceeds the limit of 10MB.")
        }
    }

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.updatephoto'));

        window.location.reload();
    };

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

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Profile Photo</h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update your account's profile photo.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    {user.photo !== null ? (
                        <img src={user.photo} alt={user.name}
                             className={`md:w-[200px] aspect-square object-cover rounded-lg mobile:w-full`}/>
                    ) : (
                        <p className={`text-white`}>No profile photo!</p>
                    )}
                    <div className="mb-2 block mt-4">
                        <Label
                            htmlFor="profilePhoto"
                            value="Profile Photo"
                        />
                    </div>
                    <FileInput
                        helperText="Image size must be less than 10MB"
                        id="profilePhoto"
                        accept=".png, .jpg, .jpeg"
                        onChange={handleProfilePhoto}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
