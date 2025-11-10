export default function SimpleNav() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-6">
      <a href="/" className="text-2xl no-underline hover:no-underline">
        ✨
      </a>
      <div className="flex gap-6">
        <a
          href="/components"
          className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
        >
          components
        </a>
        <a
          href="/blocks"
          className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
        >
          blocks
        </a>
      </div>
    </nav>
  );
}
