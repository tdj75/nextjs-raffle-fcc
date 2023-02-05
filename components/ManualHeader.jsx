import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";

export default function ManualHeader() {
  const {
    enableWeb3,
    account,
    isWeb3Enabled,
    deactivateWeb3,
    Moralis,
    isWeb3EnableLoading,
  } = useMoralis();

  useEffect(() => {
    const pippo = async () => {
      if (
        !isWeb3Enabled &&
        typeof window !== "undefined" &&
        window.localStorage.getItem("connected")
      )
        await enableWeb3();
    };
    pippo();
  }, [isWeb3Enabled]);

  useEffect(() => {
    const pluto = async (newAccount) => {
      console.log(`Account changed to ${newAccount}`);
      if (newAccount == null) {
        window.localStorage.removeItem("connected");
        await deactivateWeb3();
        console.log("Null Account found");
      }
    };
    Moralis.onAccountChanged(pluto);
  }, []);

  return (
    <div>
      {account ? (
        <div>
          Connesso @{account.slice(0, 5)}...
          {account.slice(account.length - 4)}
        </div>
      ) : (
        <button
          onClick={async () => {
            await enableWeb3();
            if (typeof window !== "undefined")
              window.localStorage.setItem("connected", "metamask");
          }}
          disabled={isWeb3EnableLoading}
        >
          Enable Web3
        </button>
      )}
    </div>
  );
}
