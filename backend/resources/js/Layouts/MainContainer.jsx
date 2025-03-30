export default function MainContainer({children}) {
    return (
        <div className="py-[4.4rem]">
            <div className="w-full mx-auto px-8">
                <div
                    className="p-6 text-gray-900 dark:text-gray-100 backdrop-blur-lg bg-opacity-60 bg-black overflow-hidden shadow-sm rounded-lg">
                    {children}
                </div>
            </div>
        </div>
    )
}
