import {useEffect} from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import {Head, Link, useForm} from '@inertiajs/react';
import {FileInput, Label} from "flowbite-react";
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import $ from 'jquery';

export default function Register() {
    const {data, setData, post, processing, errors, reset} = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        profilePhoto: ''
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

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

        post(route('register'));
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
        <GuestLayout>
            <Head title="Register"/>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name"/>

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2"/>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email"/>

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2"/>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password"/>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2"/>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password"/>

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />

                    <InputError message={errors.password_confirmation} className="mt-2"/>
                </div>
                <div
                    className="mt-4"
                >
                    <div className="mb-2 block">
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

                <div className="flex items-center justify-end mt-4">
                    <Link
                        href={route('login')}
                        className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ml-4" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
