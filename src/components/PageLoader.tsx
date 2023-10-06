export const PageLoader = () => {
  return (
    <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white overflow-y-hidden z-[99]">
      <h3 className="text-primary text-3xl font-semibold select-none mb-2.5">
        minharifa
      </h3>
      <div className="flex items-center gap-3">
        <div
          className="animate-pageLoader rounded-full h-5 w-5 bg-primary"
          style={{ transform: "scale(0)" }}
        />
        <div
          className="animate-pageLoader rounded-full h-5 w-5 bg-primary"
          style={{ transform: "scale(0)", animationDelay: "0.3s" }}
        />
        <div
          className="animate-pageLoader rounded-full h-5 w-5 bg-primary"
          style={{ transform: "scale(0)", animationDelay: "0.6s" }}
        />
      </div>
    </div>
  );
};
