export default function Spinner({ color = '#00e5ff' }: { color?: string }) {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div
        className="w-10 h-10 rounded-full border-[3px] border-t-transparent animate-spin"
        style={{ borderColor: `${color}30`, borderTopColor: color }}
      />
    </div>
  )
}
