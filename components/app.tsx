import { useState } from "react";

interface Play {
  songDataType: number;
  playerID: string;
  songID: string;
  songDifficulty: string;
  songName: string;
  songArtist: string;
  songMapper: string;
  gameMode: string;
  songDifficultyRank: number;
  songSpeed: number;
  songStartTime: number;
  songDuration: number;
  trackers: {
    hitTracker: {
      leftNoteHit: number;
      rightNoteHit: number;
      bombHit: number;
      maxCombo: number;
      nbOfWallHit: number;
      miss: number;
      missedNotes: number;
      badCuts: number;
      leftMiss: number;
      leftBadCuts: number;
      rightMiss: number;
      rightBadCuts: number;
    };
    accuracyTracker: {
      accRight: number;
      accLeft: number;
      averageAcc: number;
      leftSpeed: number;
      rightSpeed: number;
      averageSpeed: number;
      leftHighestSpeed: number;
      rightHighestSpeed: number;
      leftPreswing: number;
      rightPreswing: number;
      averagePreswing: number;
      leftPostswing: number;
      rightPostswing: number;
      averagePostswing: number;
      leftTimeDependence: number;
      rightTimeDependence: number;
      averageTimeDependence: number;
      leftAverageCut: number[];
      rightAverageCut: number[];
      averageCut: number[];
      gridAcc: number[];
      gridCut: number[];
    };
    scoreTracker: {
      rawScore: number;
      score: number;
      personalBest: number;
      rawRatio: number;
      modifiedRatio: number;
      personalBestRawRatio: number;
      personalBestModifiedRatio: number;
      modifiersMultiplier: number;
      modifiers: never[];
    };
    winTracker: {
      won: boolean;
      rank: string;
      endTime: number;
      nbOfPause: number;
    };
    distanceTracker: {
      rightSaber: number;
      leftSaber: number;
      rightHand: number;
      leftHand: number;
    };
    scoreGraphTracker: {
      graph: {
        [id: string]: number;
      };
    };
  };
  deepTrackers: {
    noteTracker: {
      notes: {
        noteType: number;
        noteDirection: number;
        index: number;
        id: number;
        time: number;
        cutType: number;
        multiplier: number;
        score: number[];
        noteCenter: number[];
        noteRotation: number[];
        timeDeviation: number;
        speed: number;
        preswing: number;
        postswing: number;
        distanceToCenter: number;
        cutPoint: number[];
        saberDir: number[];
        cutNormal: number[];
        timeDependence: number;
      }[];
    };
  };
}

const App = () => {
  const [playData, setPlayData] = useState<Play[]>();
  const [targetScore, setTargetScore] = useState<number>(115);

  const getPlayData = async () => {
    try {
      const handle = await window.showDirectoryPicker({});
      const plays = [];

      for await (const [name, file] of handle.entries()) {
        if (name.startsWith("_") || file instanceof FileSystemDirectoryHandle)
          continue;

        const fileValue = await (await file.getFile()).text();
        const fileData = fileValue.split("\n").map((i) => JSON.parse(i));
        if (fileData.length <= 1) continue;
        for (let i = 1; i < fileData.length; ++i) {
          plays.push(fileData[i]);
        }
      }

      setPlayData(plays);
    } catch (err) {
      console.info(err);
    }
  };

  const calculateStreaks = (targetScore: number) => {
    const playCounts: { play: Play; streak: number }[] = [];
    for (const play of playData) {
      const noteScores = play.deepTrackers?.noteTracker?.notes?.map(
        (t) => t.score[0] + t.score[1] + t.score[2]
      );

      if (!noteScores) continue;

      const { maxCount: streak } = noteScores.reduce(
        ({ count, maxCount }, i) => {
          return i === targetScore
            ? { count: count + 1, maxCount: Math.max(maxCount, count) }
            : { count: 0, maxCount };
        },
        { count: 0, maxCount: 0 }
      );

      playCounts.push({
        streak,
        play,
      });
    }

    return playCounts.sort((a, b) => b.streak - a.streak).slice(0, 30);
  };

  return !playData ? (
    <div className="flex-1 flex items-center justify-center flex-col">
      <article className="prose prose-xl">
        <h2>One quick first step </h2>
        <p>
          Chrome doesn&apos;t allow websites to read data from the appdata
          directory, so we need to make a symbolic link to it
        </p>
        <p>You only need to do this once.</p>
        <p>
          <strong>Copy-Paste the command below into PowerShell</strong>
        </p>
        <p>
          This will create a symbolic link from the Beat Savior app data to your
          documents folder.
        </p>
        <pre>
          <code>
            {`New-Item -ItemType Junction -Path ([environment]::getfolderpath("mydocuments") + "\\Beat Savior Data") -Target "$env:AppData\\Beat Savior Data"`}
          </code>
        </pre>

        <p>
          Once that&apos;s done, click the button below and open the{" "}
          <code>Documents/Beat Savior Data</code> folder
        </p>
        <p>
          <button
            className="p-2 px-3 bg-gray-100 rounded-lg"
            onClick={() => getPlayData()}
          >
            Open Directory Picker
          </button>
        </p>
      </article>
    </div>
  ) : (
    <main className="max-w-screen-lg w-full mx-auto p-12">
      <h1 className="text-3xl pb-5 mb-5 font-semibold border-b-2">
        30 Longest Streaks of{" "}
        <input
          type="number"
          min={0}
          max={115}
          value={targetScore}
          onChange={(e) => setTargetScore(e.target.valueAsNumber)}
          className="p-2 border-b-2 border-dashed border-b-gray-400 focus:outline-none focus:border-solid"
          style={{ font: "inherit" }}
        />
      </h1>
      <div className="prose max-w-none">
        <table>
          <thead>
            <th>#</th>
            <th>Song</th>
            <th>Artist</th>
            <th>Mapper</th>
            <th>Streak</th>
          </thead>
          <tbody>
            {calculateStreaks(targetScore).map(({ play, streak }, n) => {
              return (
                <tr key={n}>
                  <td>{n + 1}</td>
                  <td>{play.songName}</td>
                  <td>{play.songArtist}</td>
                  <td>{play.songMapper}</td>
                  <td>{streak}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default App;
