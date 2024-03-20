import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BsChevronDown } from '@react-icons/all-files/bs/BsChevronDown'
import { useState } from 'react';

export default function Dashboard({ auth, users }) {
    for (let user in users) {
        if (users[user].id == auth.user.id || users[user].role == 3) users.splice(user, 1)
    }

    const formatTime = (timeStamp) => {
        var dateList = new Date(timeStamp).toString().split(" ")
        var year = dateList[3]
        var day = dateList[2]
        var month = dateList[1]
        var time = dateList[4]
        return <>{year}/{month}/{day} {time}</>
    }

    const userRole = (role) => {
        switch (role) {
            case 0:
                return <span className='w-[14%] lg:block mobile:hidden text-green-500 text-center'>Member</span>
                break;
            case 1:
                return <span className='w-[14%] lg:block mobile:hidden text-yellow-500 text-center'>VIP</span>
                break
            case 2:
                return <span className='w-[14%] lg:block mobile:hidden text-cyan-500 text-center'>Admin</span>
                break
            case 3:
                return <span className='w-[14%] lg:block mobile:hidden text-fuchsia-500 text-center'>Owner</span>
                break
            default:
                return <span className='w-[14%] lg:block mobile:hidden text-red-500 text-center'>Unknown</span>
                break;
        }
    }

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-[4.4rem]">
                <div className="w-full mx-auto px-8">
                    <div className="backdrop-blur-lg bg-opacity-60 bg-black overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className='lg:flex mobile:hidden justify-between mb-4 lg:gap-8 p-4 border-fuchsia-600 border rounded-lg'>
                                <span className='md:w-[14%]'>ID</span>
                                <span className='md:w-[28%]'>Display Name</span>
                                <span className='md:w-[28%]'>Email</span>
                                <span className='md:w-[14%] lg:block mobile:hidden text-center'>Role</span>
                                <span className='md:w-[14%] xl:block mobile:hidden text-center'>Last Update</span>
                                <span className='md:w-[14%] xl:block mobile:hidden text-center'>Joined</span>
                            </div>
                            {users.map((user) => (
                                <div key={user.id}div className={`flex justify-between mb-2 lg:gap-8 break-all items-center border-white border rounded-lg p-5 box-border hover:border-cyan-500  cursor-pointer duration-300 transition-all`}>
                                    <span uid={user.id} className='md:w-[14%] w-[20%]'>{user.id}</span>
                                    <span uid={user.id} className='md:w-[28%] sm:w-[40%] mobile:w-3/5 sm:text-left mobile:text-right'>{user.name}</span>
                                    <span className={`md:w-[28%] sm:w-[40%] sm:block mobile:hidden`}>{user.email}</span>
                                    {userRole(user.role)}
                                    <span className='md:w-[14%] xl:block mobile:hidden text-center'>{formatTime(user.created_at)}</span>
                                    <span className='md:w-[14%] xl:block mobile:hidden text-center'>{formatTime(user.updated_at)}</span>
                                </div>
                            ))}</div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}