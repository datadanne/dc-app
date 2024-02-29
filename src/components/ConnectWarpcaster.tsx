import React, { useEffect } from "react";

import QRCodeSVG from "qrcode.react";
import { poll_signed_key_request } from "../utils/warpcast";
import { setUserFid } from "../redux/authSlice";
import { useDispatch } from "react-redux";

const POLLING_INTERVAL_MS = 2000;

export default function ConnectWarpcaster({
  signedKeyResponse,
}: {
  signedKeyResponse: SignedKeyRequestResponse;
}) {
  const dispatch = useDispatch();

  // Poll signed key response
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await poll_signed_key_request(signedKeyResponse.token);

      if (data.userFid !== undefined) {
        dispatch(setUserFid(data.userFid));
        clearInterval(interval);
      }
    }, POLLING_INTERVAL_MS);
  }, [signedKeyResponse]);

  return (
    <div className="flex flex-col items-center w-80 gap-4">
      <p className="w-full">
        $DEGEN confessions is only available to Farcaster users with a connected
        address that holds at least{" "}
        <span className="text-degen">3M $DEGEN</span>.
      </p>
      <p>
        Sign in with your Farcaster account to get started. Click on QR code or
        scan it with your mobile device.
      </p>
      <a
        href={signedKeyResponse.deeplinkUrl}
        style={{
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          KhtmlUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          userSelect: "none",
        }}
      >
        <QRCodeSVG value={signedKeyResponse.deeplinkUrl} />
      </a>
      <p className="w-full">
        Your FID is not stored or sent anywhere. It is only used for generating
        zero-knowledge proofs.
      </p>
    </div>
  );
}
