import React, { useState } from "react";

import Cast from "./pages/Cast";
import Settings from "./pages/Settings";

export default function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="bg-black text-main min-h-screen">
      <header className="sticky top-0 w-full p-4 border-b border-[#ccc]/[0.1337] bg-black">
        <div className="flex flex-row justify-between items-center max-w-screen-2xl mx-auto">
          <div className="flex gap-4 items-center">
            <img src="https://www.degen.tips/logo_light.svg" width="30" />
            <h3>$DEGEN confessions</h3>
          </div>
          <button onClick={() => setShowSettings(true)}>Settings</button>
        </div>
      </header>
      <main className="flex flex-col items-center p-8 pt-10 md:p-24 md:pt-36 gap-8 lg:gap-12 text-center">
        <Cast />

        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </main>
    </div>
  );
}
