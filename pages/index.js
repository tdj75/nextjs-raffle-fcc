import Head from "next/head";

import Link from "next/link";

import Header from "../components/Header";
import LotteryEntrance from "../components/LotteryEntrance";

export default function Home() {
  return (
    <>
      <Head>
        <title>Smart Contract Lottery</title>
        <meta name="description" content="My smart contract lottery" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <LotteryEntrance />
      <h2>
        <Link href="/players-list">Go to players list!</Link>
      </h2>
    </>
  );
}
