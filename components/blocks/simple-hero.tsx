export default function SimpleHero() {
  return (
    <div className="w-full flex justify-center items-center text-center min-h-[60vh]">
      <div className="my-32 sm:my-48 text-[5.5px] sm:text-[7px] md:text-[10px]">
        <h1 className="text-[8em] font-light leading-[1.1] text-[#282828]">
          <span className="text-[0.56em] block mb-[-1.75em] mt-0 whitespace-nowrap">
            Cleanroom
          </span>
          <br />
          <span className="font-bold tracking-[-0.04em]">LESS BOILERPLATE</span>
          <br />& <span className="font-bold tracking-[-0.04em]">MORE BOIL 🔥</span>
        </h1>
      </div>
    </div>
  );
}
