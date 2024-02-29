import React, { useState, useEffect } from "react";

import Loader from "../components/Loader";

import { useSelector, useDispatch } from "react-redux";
import { setPrivateKey, setSignedKeyResponse } from "../redux/authSlice";
import { RootState } from "../redux/store";
import { generate_private_key, setupSignedKeyResponse } from "../utils/keygen";

import ConnectWarpcaster from "../components/ConnectWarpcaster";
import Button from "../components/Button";
import Form, { CastMode } from "../components/Form";

export default function Cast() {
  const dispatch = useDispatch();

  const [castMode, setCastMode] = useState(CastMode.Cast);

  const privateKey = useSelector((state: RootState) => state.auth.privateKey);
  const signedKeyResponse = useSelector(
    (state: RootState) => state.auth.signedKeyResponse
  );
  const userFid = useSelector((state: RootState) => state.auth.userFid);

  if (privateKey === null) {
    dispatch(setPrivateKey(generate_private_key()));
  }

  useEffect(() => {
    if (signedKeyResponse !== null || privateKey === null) return;

    setupSignedKeyResponse(privateKey).then((response) => {
      dispatch(setSignedKeyResponse(response));
    });
  }, [privateKey]);

  if (privateKey === null || signedKeyResponse === null) {
    return <Loader />;
  }

  if (userFid === null) {
    return <ConnectWarpcaster signedKeyResponse={signedKeyResponse} />;
  }

  return (
    <>
      <div className="flex flex-col items-center gap-6">
        {/*<div className="flex flex-row gap-4 mb-8">
          <Button onClick={() => setCastMode(CastMode.Cast)} className="w-24">
            {castMode === CastMode.Cast && "✓"} Cast
          </Button>
          <Button onClick={() => setCastMode(CastMode.Reply)} className="w-24">
            {castMode === CastMode.Reply && "✓"}Reply
          </Button>
            </div>*/}
        <Form privateKey={privateKey} userFid={userFid} mode={CastMode.Reply} />
      </div>
    </>
  );
}
