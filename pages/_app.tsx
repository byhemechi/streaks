import Head from "next/head";
import "../styles/globals.css";
import logo from "../public/sadcloud.svg";
import Image from "next/image";

function StreaksApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>streaks</title>
      </Head>
      <header className="bg-black/10 dark:bg-black/50 backdrop-blur-lg text-xl font-semibold sticky top-0">
        <div className="max-w-screen-lg mx-auto p-4 px-10 flex items-center gap-4">
          <div className="flex justify-center items-center gap-2 w-12 h-12 rounded-md bg-gradient-to-br from-orange-600 to-purple-600 text-white p-1">
            <Image src={logo} alt="byhemechi" />
          </div>
          Score Streaks
        </div>
      </header>
      <Component {...pageProps} />
    </>
  );
}

export default StreaksApp;
