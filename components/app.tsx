import { useEffect, useState } from "react";
import { get, set, del } from "idb-keyval";

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
      notes: Note[];
    };
  };
}

interface Note {
  noteType: number;
  noteDirection: number;
  index: number;
  id: number;
  time: number;
  cutType: number;
  multiplier: number;
  score: [number, number, number];
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
}

const App = () => {
  const [handleState, setHandleState] = useState<PermissionState>();
  const [playData, setPlayData] = useState<Play[]>([]);
  const [targetScore, setTargetScore] = useState<number>(115);
  const [operation, setoperation] = useState<"eq" | "gt" | "lt">("eq");

  useEffect(() => {
    if (playData.length == 0)
      getIDBDirectoryHandle().then(async (idbHandle) => {
        const state = await idbHandle?.queryPermission();
        setHandleState(state);
        if (state == "granted") getPlayData(idbHandle);
      });
  }, [playData, handleState]);

  const getIDBDirectoryHandle = async () => {
    const idbHandle = await get("directoryHandle");
    if (!(idbHandle instanceof FileSystemDirectoryHandle)) return;
    return idbHandle;
  };

  const createDirectoryHandle = async () => {
    const handle = await showDirectoryPicker();
    set("directoryHandle", handle);
    return handle;
  };

  const getPlayData = async (handle: FileSystemDirectoryHandle) => {
    try {
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
      console.error(err);
    }
  };

  const calculateStreaks = (
    targetScore: number,
    operation: "eq" | "gt" | "lt"
  ) => {
    const playCounts: { play: Play; streak: number }[] = [];

    const matches = (note: Note) => {
      const score = note.score.reduce((prev, next) => prev + next, 0);
      if (operation == "gt") return score >= targetScore;
      if (operation == "lt") return score <= targetScore;
      return score === targetScore;
    };

    for (const play of playData) {
      const noteScores = play.deepTrackers?.noteTracker?.notes;

      if (!noteScores) continue;

      const { maxCount: streak } = noteScores.reduce(
        ({ count, maxCount }, i) => {
          if (i.cutType !== 0) return { count: 0, maxCount };
          return matches(i)
            ? { count: count + 1, maxCount: Math.max(maxCount, count) }
            : { count: 1, maxCount };
        },
        { count: 1, maxCount: 1 }
      );

      playCounts.push({
        streak,
        play,
      });
    }

    return playCounts
      .sort((a, b) => b.streak - a.streak)
      .filter(({ streak }) => streak > 1)
      .slice(0, 30);
  };

  return handleState !== "granted" && playData.length == 0 ? (
    <div className="flex-1 flex p-12 md:items-center justify-center flex-col">
      <article className="prose prose-xl dark:prose-invert w-full">
        <h2>One quick first step</h2>
        {handleState !== "prompt" ? (
          <>
            <p>
              Chrome doesn&apos;t allow websites to read data from the appdata
              directory, so we need to make a symbolic link to it
            </p>
            <p>You only need to do this once.</p>
            <p>
              <strong>Copy-Paste the command below into PowerShell</strong>
            </p>
            <p>
              This will create a symbolic link from the Beat Savior app data to
              your documents folder.
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
          </>
        ) : (
          <p>Security policy requires user input to read from storage.</p>
        )}
        <p className="flex gap-4">
          <button
            className="bg-blue-600 text-white shadow-blue-600/25 shadow-lg"
            onClick={async () => {
              let handle: FileSystemDirectoryHandle;
              if (handleState == "prompt") {
                handle = await getIDBDirectoryHandle();
                await handle.requestPermission();
              } else {
                handle = await createDirectoryHandle();
              }
              return getPlayData(handle);
            }}
          >
            {handleState == "prompt" ? "Load scores" : "Open Directory Picker"}
          </button>
          {handleState ? (
            <button
              onClick={async () => {
                await del("directoryHandle");
                setHandleState(undefined);
              }}
            >
              I selected the wrong folder
            </button>
          ) : (
            ""
          )}
        </p>
      </article>
    </div>
  ) : (
    <main className="max-w-screen-lg w-full mx-auto p-12">
      <h1 className="text-3xl pb-5 mb-5 font-semibold">
        Longest streak of cuts{" "}
        <select
          className="bg-transparent p-2 px-3 border-dashed border-b-neutral-400 focus:outline-none"
          value={operation}
          // @ts-expect-error
          onChange={(e) => setoperation(e.target.value)}
        >
          <option value="lt">&le;</option>
          <option value="gt">&ge;</option>
          <option value="eq">=</option>
        </select>{" "}
        <input
          type="number"
          min={0}
          max={115}
          value={targetScore}
          onChange={(e) => setTargetScore(e.target.valueAsNumber)}
          className="p-2 border-b-2 bg-transparent border-dashed border-b-neutral-400 focus:outline-none focus:border-solid"
          style={{ font: "inherit" }}
        />
      </h1>
      <div className="prose prose-xl max-w-none dark:prose-invert prose-neutral">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Difficulty</th>
              <th>Song</th>
              <th>Artist</th>
              <th>Mapper</th>
              <th>Streak</th>
            </tr>
          </thead>
          <tbody>
            {calculateStreaks(targetScore, operation).map(
              ({ play, streak }, n) => {
                return (
                  <tr key={n}>
                    <td>{n + 1}</td>
                    <td>
                      {{
                        expertplus: "Expert+",
                        expert: "Expert",
                        hard: "Hard",
                        normal: "Normal",
                        easy: "Easy",
                      }[play.songDifficulty] ?? play.songDifficulty}
                    </td>
                    <td>{play.songName}</td>
                    <td>{play.songArtist}</td>
                    <td>{play.songMapper}</td>
                    <td>{streak}</td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default App;
