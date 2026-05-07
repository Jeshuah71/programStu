import Header from "./Header";

function Layout({ activeView, onChangeView, loading, error, notice, demoMode, children }) {
  return (
    <div className="min-h-screen bg-hero-glow text-ink">
      <div className="w-full px-4 py-3 sm:px-5 lg:px-6">
        <Header activeView={activeView} onChangeView={onChangeView} />

        {demoMode ? (
          <div className="glass-panel mb-6 border border-suu-red/15 bg-[#fff7f7] p-4 text-sm text-suu-darkGray">
            <span className="font-semibold text-suu-red">Demo mode:</span> backend unavailable. Showing sample onboarding data.
          </div>
        ) : null}

        {notice ? (
          <div className="glass-panel mb-6 border border-suu-black/8 bg-white p-4 text-sm text-suu-darkGray">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="glass-panel mb-6 border border-suu-red/15 bg-[#fff7f7] p-4 text-sm text-suu-red">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="glass-panel mb-6 flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm font-semibold text-suu-black">Loading onboarding data</p>
              <p className="text-sm text-suu-darkGray">
                Pulling SUU student progress, blockers, and dashboard metrics.
              </p>
            </div>
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-suu-gray border-t-suu-red" />
          </div>
        ) : null}

        {children}

        <footer className="mt-10 overflow-hidden rounded-[24px] border border-white/10 bg-[#3f3f3f] text-white shadow-card">
          <div className="flex flex-col gap-3 px-6 py-5 text-sm sm:flex-row sm:items-center sm:justify-center sm:gap-8 sm:text-base">
            <div className="flex items-center justify-center gap-3 text-center sm:text-left">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-suu-red text-xs font-bold uppercase tracking-[0.2em] text-white">
                SUU
              </span>
              <span className="font-medium text-white/95">
                &copy; Southern Utah University 2026
              </span>
            </div>

            <a
              href="#"
              className="text-center font-medium text-white transition hover:text-white/75"
            >
              Need Help?
            </a>

            <a
              href="#"
              className="text-center font-medium text-white transition hover:text-white/75"
            >
              Privacy
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Layout;
