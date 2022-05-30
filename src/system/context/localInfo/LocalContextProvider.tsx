import { useState } from "react";
import LocalContext, {
  LocalContextType,
  LocalField,
} from "system/context/localInfo/local-context";
import { Player } from "system/GameStates/GameTypes";
import { IProps, SolvingState } from "system/types/CommonTypes";
/*
Local context holds local data that does not go into database
*/

export enum CursorState {
  Idle = "Idle",
  Selecting = "Selecting",
}

export default function LocalProvider(props: IProps) {
  const [myId, setMyId] = useState<string | null>(null);
  const [sortedPlayerList, setSortedPlayerList] = useState<Player[]>([]);
  const [playerSelector, setPlayerSelected]: [string, any] =
    useState<CursorState>(CursorState.Idle);
  const [tutorialSelector, setTutorialSelected]: [string, any] =
    useState<CursorState>(CursorState.Idle);
  const [solvingState, setSolvingState] = useState<SolvingState>(
    SolvingState.Init
  );

  //https://immerjs.github.io/immer/example-setstate

  const map = new Map();
  map.set(LocalField.Id, {
    val: myId,
    set: setMyId,
  });
  map.set(LocalField.SortedList, {
    val: sortedPlayerList,
    set: setSortedPlayerList,
  });
  map.set(LocalField.PlayerSelector, {
    val: playerSelector,
    set: setPlayerSelected,
  });
  map.set(LocalField.TutorialSelector, {
    val: tutorialSelector,
    set: setTutorialSelected,
  });
  map.set(LocalField.Solver, {
    val: solvingState,
    set: setSolvingState,
  });

  /*
  Map is not supposed to be used by other classes
  use get and set 
  */
  const context: LocalContextType = {
    map,
    getVal: (field: LocalField) => {
      return map.get(field).val!;
    },
    setVal: (field: LocalField, val: any) => {
      map.get(field).set(val);
    },
  };
  return (
    <LocalContext.Provider value={context}>
      {props.children}
    </LocalContext.Provider>
  );
}
