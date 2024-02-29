import React from "react";
import Button from "../components/Button";

export default function Settings({ onClose }: { onClose: () => void }) {
  const signOut = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="absolute flex items-center align-center top-0 left-0 right-0 bottom-0 bg-[#00000077]" onClick={onClose}>
      <div className="relative mx-auto my-auto bg-black border border-1 rounded-md p-8">
        <p>Signing out will require you to authenticate again in the future.</p>

        <Button className="mt-6" onClick={() => alert("hey")}>
          Sign out ⚠️
        </Button>
      </div>
    </div>
  );
}
