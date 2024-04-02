import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import {Head} from '@inertiajs/react';
import UpdateProfilePhotoForm from "@/Pages/Profile/Partials/UpdateProfilePhotoForm.jsx";

export default function Edit({auth, mustVerifyEmail, status}) {
    return (
        <AuthenticatedLayout
            auth={auth}
            // header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Profile</h2>}
        >
            <Head title="Profile"/>

            <div className="py-[4.4rem]">
                <div className="w-full mx-auto px-8 space-y-6">
                    <div className="p-4 sm:p-8 backdrop-blur-lg bg-opacity-60 bg-black shadow rounded-lg">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="p-4 sm:p-8 backdrop-blur-lg bg-opacity-60 bg-black shadow rounded-lg">
                        <UpdateProfilePhotoForm
                            className="max-w-xl"
                        />
                    </div>

                    <div className="p-4 sm:p-8 backdrop-blur-lg bg-opacity-60 bg-black shadow rounded-lg">
                        <UpdatePasswordForm className="max-w-xl"/>
                    </div>

                    <div className="p-4 sm:p-8 backdrop-blur-lg bg-opacity-60 bg-black shadow rounded-lg">
                        <DeleteUserForm className="max-w-xl"/>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
