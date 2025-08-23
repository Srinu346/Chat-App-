

export const MessageBox = () => {
    return (
   <div className="flex items-center justify-center  p-6">
  <div className="relative h-[70px] w-[240px] rounded-[2rem] p-1 shadow-xl shadow-slate-950/60 bg-black/10">
    <div className="flex w-full h-full rounded-[1.7rem] overflow-hidden p-1 bg-white">
      
      {/* Left button/text */}
      <div className="flex-1 bg-slate-800 text-white flex items-center justify-center font-semibold tracking-wide text-lg
                      hover:bg-slate-700 transition-all duration-300 ease-out cursor-pointer rounded-[2rem] p-1">
        Hie Heellooooo
      </div>

      {/* Right button (icon or blank for now) */}
      <div className="w-[70px] bg-slate-800 text-white flex items-center justify-center
                      hover:bg-slate-700 transition-all duration-300 ease-out cursor-pointer rounded-[2rem] p-1">
        🚀
      </div>
    </div>

    {/* Glow effect */}
    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-40 blur-md -z-10" />
  </div>
</div>
    );  
}