import React, { ReactNode, useEffect, useState } from "react";
import { get_public_key } from "../utils/keygen";
import { Buffer } from "buffer";

import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";

import circuit from "../../circuits/v2/target/main.json";

import axios from "axios";
import { stringToHexArray } from "../utils/string";
import SelectChannel from "./SelectChannel";
import Button from "../components/Button";
import { MAX_MESSAGE_LENGTH, sleep } from "../utils/common";
import Loader from "./Loader";

export enum CastMode {
  Reply = "reply",
  Cast = "cast",
}

export default function Form({
  userFid,
  privateKey,
  mode,
}: {
  userFid: number;
  privateKey: string;
  mode: CastMode;
}) {
  const [tree, setTree] = useState<any>();
  const [refreshTree, setRefreshTree] = useState({});
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    get_public_key(privateKey).then((v) => setPublicKey(v));
  }, [privateKey]);

  useEffect(() => {
    let isCancelled = false;

    axios(`${import.meta.env.VITE_API_BASE_URL}/farcaster/tree`).then(
      ({ data }) => {
        if (!isCancelled) setTree(data);
      }
    );

    return () => {
      isCancelled = true;
    };
  }, [refreshTree]);

  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [replyLink, setReplyLink] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [proofGenerationWarningVisible, setProofGenerationWarningVisible] =
    useState<boolean>(true);
  const [selectChannelModalVisible, setSelectChannelModalVisible] =
    useState<boolean>(false);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [successMessage, setSuccessMessage] = useState<ReactNode>("");

  const cast = async (): Promise<any> => {
    setLoadingMessage("Fetching Farcaster FIDs tree...");

    let reply_cast_id = "";

    // Fetch reply farcaster hash if provided
    if (replyLink.length > 0) {
      const replyLinkBase64 = Buffer.from(replyLink).toString("base64");

      try {
        const { data } = await axios(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/farcaster/warpcast/${replyLinkBase64}`
        );

        reply_cast_id = data.cast_id;
      } catch (e) {
        throw new Error(
          `Could not find a cast with the provided link. Please, try again.`
        );
      }
    }

    // @ts-ignore
    const backend = new BarretenbergBackend(circuit);
    // @ts-ignore
    const noir = new Noir(circuit, backend);

    // Search for public key
    const nodeIndex = tree.elements.findIndex((x: any) => x.key === publicKey);

    if (nodeIndex === -1) {
      return;
    }

    const node = tree.elements[nodeIndex];

    const input = {
      fid: userFid,
      public_key_preimage: privateKey,
      public_key: publicKey,
      note_root: tree.root,
      index: nodeIndex,
      note_hash_path: node.path,
      timestamp: Math.floor(Date.now() / 1000),
      message: stringToHexArray(message, 16),
      reply: stringToHexArray(reply_cast_id, 4),
    };

    setLoadingMessage("Hold on, generating the zk proof…");

    const proof = await noir.generateFinalProof(input);

    setLoadingMessage(
      "Verifying the zk proof and sending your cast. Please keep this tab open."
    );

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/farcaster/cast`,
      {
        proof: Array.from(proof.proof),
        publicInputs: proof.publicInputs.map((i) => Array.from(i)),
        channel: channel === null ? null : channel.channel.id,
      }
    );
  };

  if (!tree) return <Loader />;

  if (tree.elements.findIndex((x: any) => x.key === publicKey) === -1)
    return (
      <div>
        Your FID is not allowed to use degen confessions yet. Either you don't
        hold enough $degen or your new signer hasn't been added to the tree yet.
        Try refreshing.
      </div>
    );

  return (
    <>
      <div style={{ display: selectChannelModalVisible ? "block" : "none" }}>
        <SelectChannel
          onClose={() => {
            setSelectChannelModalVisible(false);
          }}
          onChoose={(channel) => {
            setChannel(channel);
            setSelectChannelModalVisible(false);
          }}
        />
      </div>

      <p>You can now cast as @degen-confessions :)</p>

      <div className="w-full">
        <textarea
          id="textArea"
          className="p-2 w-full md:w-80 rounded-md text-black"
          rows={8}
          value={message}
          disabled={loading}
          onChange={(e) => {
            setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH));
          }}
          placeholder="Start typing a new cast here..."
        />

        <div
          id="counter"
          className={
            message.length >= MAX_MESSAGE_LENGTH * 0.9
              ? "counter text-orange-600"
              : "counter"
          }
        >
          {message.length} / {MAX_MESSAGE_LENGTH}
        </div>
      </div>

      {mode === CastMode.Reply && (
        <div className="flex flex-col items-center gap-2 w-full">
          <div>Reply to cast:</div>
          <input
            type="text"
            className="p-2 w-full md:w-80 rounded-md text-black"
            disabled={loading}
            value={replyLink}
            onChange={(e) => {
              setReplyLink(e.target.value);
            }}
            placeholder="Paste link to the cast to reply to"
          />
        </div>
      )}

      {/*mode === CastMode.Cast && (
        <Button
          onClick={() => {
            if (channel === null) {
              setSelectChannelModalVisible(true);
            } else {
              setChannel(null);
            }
          }}
        >
          {channel === null ? "Select channel" : `${channel.channel.name} ❌`}
        </Button>
          )*/}

      <div className="mt-3 d-flex align-items-center justify-content-center w-100">
        <Button
          className="px-8"
          disabled={loading || message.length === 0}
          loading={loading}
          onClick={() => {
            setLoading(true);
            setSuccess(false);
            setError(null);
            setProofGenerationWarningVisible(false);

            cast()
              .then(() => {
                setSuccess(true);
                setMessage("");
                setReplyLink("");

                if (channel !== null) {
                  setSuccessMessage(
                    <>
                      Your cast was published successfully. View it on{" "}
                      <a
                        target="_blank"
                        href={`https://warpcast.com/~/channel/${channel.channel.id}`}
                      >
                        {channel.channel.name}
                      </a>{" "}
                      channel.
                    </>
                  );
                } else {
                  setSuccessMessage(
                    <>
                      Your cast was published successfully. View it on{" "}
                      <a
                        target="_blank"
                        href="https://warpcast.com/degen-confessions"
                      >
                        @degen-confessions
                      </a>
                      .
                    </>
                  );
                }

                setChannel(null);
              })
              .catch((e) => {
                console.log(e);

                if (axios.isAxiosError(e)) {
                  setError(e.response?.data?.message);
                } else {
                  setError(e.message);
                }
              })
              .finally(() => {
                setLoading(false);
              });
          }}
        >
          Cast
        </Button>
      </div>

      {proofGenerationWarningVisible && (
        <p>* It will take a few minutes to generate and verify the proof.</p>
      )}

      {loading === true && (
        <div className="mt-3 mb-3 d-flex align-items-center justify-content-center w-100">
          <p>{loadingMessage}</p>
        </div>
      )}

      {success === true && <p>{successMessage}</p>}

      {error !== null && (
        <>
          <p style={{ wordBreak: "break-all" }} className="text-orange-600">
            {error}
          </p>
        </>
      )}
    </>
  );
}
