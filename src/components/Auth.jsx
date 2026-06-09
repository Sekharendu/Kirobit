import { supabase } from '../supabaseClient'
import { KiroBitLogo } from './KiroBitLogo'

export function Auth() {
  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const handleGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin }
    })
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5"
      style={{ background: '#050505' }}
    >
      <div className="relative w-full max-w-[400px]">
        {/* Single card — everything in one surface so there's one clear object on screen */}
        <div
          className="rounded-3xl px-8 pt-10 pb-8"
          style={{
            background: '#151515',
            border: '1px solid #282828',
            boxShadow: '0 0 80px rgba(16, 185, 129, 0.06), 0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Logo + headline */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <div
              className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.12) 0%, #1a1a1a 100%)',
                border: '1px solid #333',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.06)',
              }}
            >
              <KiroBitLogo variant="minimal" size="sm" />
            </div>
            <div className="text-center">
              <h1 className="text-[22px] font-bold tracking-tight" style={{ color: '#f5f5f5' }}>
                Welcome to <span style={{ color: '#34d399' }}>KiroBit</span>
              </h1>
              <p className="mt-1 text-[14px]" style={{ color: '#777' }}>
                Sign in to your personal workspace
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3.5 text-[14px] font-medium transition-all cursor-pointer"
              style={{
                background: '#f5f5f5',
                color: '#111',
                border: '1px solid #ddd',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffffff'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,255,255,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f5f5f5'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 py-0.5">
              <div className="flex-1 h-px" style={{ background: '#2a2a2a' }} />
              <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#555' }}>or</span>
              <div className="flex-1 h-px" style={{ background: '#2a2a2a' }} />
            </div>

            <button
              type="button"
              onClick={handleGithub}
              className="flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3.5 text-[14px] font-medium transition-all cursor-pointer"
              style={{
                background: '#222',
                color: '#d0d0d0',
                border: '1px solid #363636',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2a2a2a'
                e.currentTarget.style.borderColor = '#444'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#222'
                e.currentTarget.style.borderColor = '#363636'
              }}
            >
              <svg className="h-5 w-5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Footer inside card */}
          <p className="mt-6 text-center text-[11px] leading-relaxed" style={{ color: '#555' }}>
            By signing in, you agree to our terms of service
          </p>
        </div>
      </div>
    </div>
  )
}
