import React from "react";

import { setPrivateKey } from "../redux/authSlice";
import { useDispatch } from "react-redux";
import { generate_private_key } from "../utils/keygen";

export default function GeneratePrivateKey() {
  const dispatch = useDispatch();

  return (
    <div>
      To use degen-confessions you need to generate a private key and register a
      new farcaster signer. If you've used degen-confessions before and already
      have a key registered, enter it here. If not, click the generate
      new-button.
      <input type="text" />
      <button onClick={() => dispatch(setPrivateKey(generate_private_key()))}>
        Generate
      </button>
    </div>
  );
}
