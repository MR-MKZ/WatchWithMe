export function WrapperContainer({children}) {
    return (
        <div className={`flow-root mobile:w-full my-[80px] mx-auto px-4 relative lg:w-[1280px]`}>
            {children}
        </div>
    )
}
