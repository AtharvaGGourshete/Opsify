import React from 'react'

const Footer = () => {
  return (
    <div>
      <footer className="border-t border-neutral-200 bg-[#58a4b0] px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 py-8 text-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-bold text-white">Opsify</p>
              <p className="text-[11px] text-white">Deploy smarter. Ship faster.</p>
            </div>
          </div>
          <div className="text-xs font-medium text-white">
            © {new Date().getFullYear()} All Rights Reserved by Opsify Inc.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer
