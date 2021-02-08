export const ProgressBar: React.FC<{
  className?: string
  width: number | string
  color: string
}> = ({ className = "", width, color, children }) => (
  <div
    className={
      `border-2 border-gray-700 bg-gray-300 h-1 box-content relative ` +
      className
    }
  >
    <div
      className="absolute h-full -top-0.5 border-l-0 border-r-0 border-2 border-gray-700 box-content"
      style={{
        backgroundColor: color,
        width: width + "%",
      }}
    ></div>
    {children}
  </div>
)
