import { React, useEffect, useState } from "react";
import {
  useWeb3Contract,
  useMoralis,
  useWeb3ExecuteFunction,
} from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { ethers } from "ethers";
import { useNotification, Table } from "web3uikit";

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  // State variables

  const [entranceFee, setEntranceFee] = useState("0");
  const [numberOfPlayers, setNumberOfPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");
  const [playerArray, setPlayerArray] = useState([]);
  const [playerArrayIsLoading, setPlayerArrayIsLoading] = useState(false);

  const {
    runContractFunction: enterRaffle,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  const { fetch: getPlayer } = useWeb3ExecuteFunction();

  // Update UI section

  useEffect(() => {
    if (isWeb3Enabled) {
      console.log("Web3 enabled!");
      updateUI();
    } else {
      console.log("Web3 disabled!");
    }
  }, [isWeb3Enabled]);

  const updateUI = async () => {
    const entranceFeeFromCall = await getEntranceFee();
    const numberOfPlayersFromCall = await getNumberOfPlayers();
    const recentWinnerFromCall = await getRecentWinner();

    let pArray = [];
    setPlayerArrayIsLoading(true);

    for (let i = 0; i < numberOfPlayersFromCall; i++) {
      const options = {
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getPlayer",
        params: { index: i },
      };
      const getPlayerFromCall = await getPlayer({ params: options });
      pArray.push(`<styled.div>${getPlayerFromCall}</styled.div>`);
      console.log(getPlayerFromCall);
    }

    setPlayerArray([pArray]);
    setPlayerArrayIsLoading(false);

    setEntranceFee(entranceFeeFromCall.toString());
    setNumberOfPlayers(numberOfPlayersFromCall.toString());
    setRecentWinner(recentWinnerFromCall);
  };

  // Notification handles

  const handleSuccess = async (tx) => {
    await tx.wait();
    console.log(`Transaction success hash: ${tx.hash}`);

    console.log(tx);
    handleNewNotification("success", "Transaction success!");
    updateUI();
  };

  const handleError = (err) => {
    console.log(`Transaction error message: ${err.message}`);
    handleNewNotification("error", err.message);
  };

  const handleComplete = () => {
    console.log("Transaction complete!");
  };

  const dispatch = useNotification();

  const handleNewNotification = (notifyType, notifyMessage) => {
    dispatch({
      type: notifyType,
      message: notifyMessage,
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    });
  };

  // Render DOM

  return (
    <div className="py-10">
      Hi from lottery entrance!
      {raffleAddress ? (
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white border-4 border-blue-700  rounded-lg font-bold m-2 p-3 mx-center"
            onClick={async () => {
              await enterRaffle({
                onComplete: handleComplete,
                onError: handleError,
                onSuccess: handleSuccess,
              });
            }}
            disabled={isFetching || isLoading}
          >
            {isFetching || isLoading ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Enter Raffle</div>
            )}
          </button>
          <div className="m-2 p-3 w-full bg-red-100 border-4 border-red-200 rounded-lg">
            The entrance fee to enter the raffle is:{" "}
            {ethers.utils.formatUnits(entranceFee, "ether")} ETH
          </div>
          <div className="m-2 p-3 w-full bg-red-100 border-4 border-red-200 rounded-lg">
            There are {numberOfPlayers} players in the raffle
          </div>
          <div className="m-2 p-3 w-full bg-red-100 border-4 border-red-200 rounded-lg">
            The last winner address is: {recentWinner}
          </div>
          <Table
            cellPadding="0px"
            columnGapSize={0}
            columnsConfig="1fr"
            customTableBorder="1px solid black"
            data={playerArray}
            header={[
              `There are currently ${numberOfPlayers} players in the
                raffle`,
            ]}
            headerTextColor="blue"
            // noPagination
            // onPageNumberChanged={function noRefCheck() {}}
            // onRowClick={function noRefCheck() {}}
            pageSize={5}
            maxPages={5}
            isLoading={playerArrayIsLoading}
          />
        </div>
      ) : (
        <div>No Raffle address detected!</div>
      )}
    </div>
  );
}
