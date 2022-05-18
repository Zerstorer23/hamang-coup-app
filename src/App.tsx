import Lobby from "./pages/lobby/Lobby";
import { Route, Switch, useHistory } from "react-router-dom";
import InGame from "./pages/ingame/InGame";
import LoadingHome from "pages/LoadingHome/LoadingHome";

import { Fragment, useContext, useEffect, useState } from "react";
import { ActionPerformer, UpdateType } from "system/context/room-context";
import {
  DB_PLAYERS,
  initialiseRoom,
  joinLobby,
  loadRoom,
  registerListeners,
} from "system/Database/RoomDatabase";
import {
  Listeners,
  ListenerTypes,
  LISTEN_CHILD_ADDED,
  LISTEN_CHILD_CHANGED,
  LISTEN_CHILD_REMOVED,
  LISTEN_VALUE,
} from "system/types/CommonTypes";
import {
  GameAction,
  Player,
  Room,
  RoomHeader,
} from "system/GameStates/GameTypes";
import firebase from "firebase/compat/app";
import RoomContext from "system/context/room-context";
import LocalContext from "system/context/localInfo/local-context";
import { db } from "system/Database/Firebase";
import { PAGE_LOBBY } from "system/GameStates/States";

type Snapshot = firebase.database.DataSnapshot;

function checkNull<T>(snapshot: Snapshot): [boolean, T] {
  const data: T = snapshot.val();
  return [data !== null, data];
}

enum LoadStatus {
  init,
  isLoading,
  loaded,
  listening,
  joined,
  outerSpace,
}
export default function App(): JSX.Element {
  const [isLoaded, setStatus] = useState(LoadStatus.init);
  const context = useContext(RoomContext);
  const history = useHistory();
  console.log("Loading Status = " + isLoaded);
  ///====LOAD AND LISTEN DB===///
  //https://firebase.google.com/docs/reference/node/firebase.database.Reference#on
  function updateField<T>(listenerType: ListenerTypes, snapshot: Snapshot) {
    const [valid, data] = checkNull<T>(snapshot);
    if (!valid) return;
    context.onUpdateField(listenerType, data);
  }
  function onUpdatePlayer(snapshot: Snapshot) {
    const [valid, player] = checkNull<Player>(snapshot);
    if (!valid) return;
    context.onUpdatePlayer({ id: snapshot.key!, player }, UpdateType.Update);
  }
  function onAddPlayer(snapshot: Snapshot) {
    const [valid, player] = checkNull<Player>(snapshot);
    if (!valid) return;
    context.onUpdatePlayer({ id: snapshot.key!, player }, UpdateType.Delete);
  }
  function onRemovePlayer(snapshot: Snapshot) {
    const [valid, player] = checkNull<Player>(snapshot);
    if (!valid) return;
    context.onUpdatePlayer({ id: snapshot.key!, player }, UpdateType.Insert);
  }
  function onUpdateClient(snapshot: Snapshot) {
    const [valid, action] = checkNull<GameAction>(snapshot);
    if (!valid) return;
    context.onUpdateGameAction(action, ActionPerformer.Client);
  }
  function onUpdatePier(snapshot: Snapshot) {
    const [valid, action] = checkNull<GameAction>(snapshot);
    if (!valid) return;
    context.onUpdateGameAction(action, ActionPerformer.Pier);
  }
  function onUpdateDeck(snapshot: Snapshot) {
    updateField<string>(ListenerTypes.Deck, snapshot);
  }
  function onUpdateTurn(snapshot: Snapshot) {
    updateField<number>(ListenerTypes.Turn, snapshot);
  }
  function onUpdateHeader(snapshot: Snapshot) {
    updateField<RoomHeader>(ListenerTypes.Header, snapshot);
  }
  function setListeners(listeners: Listeners) {
    const playerListRef = listeners.get(ListenerTypes.PlayerList)!;
    playerListRef.on(LISTEN_CHILD_CHANGED, onUpdatePlayer);
    playerListRef.on(LISTEN_CHILD_ADDED, onAddPlayer);
    playerListRef.on(LISTEN_CHILD_REMOVED, onRemovePlayer);
    //Add game listener
    listeners.get(ListenerTypes.Deck)!.on(LISTEN_VALUE, onUpdateDeck);
    listeners.get(ListenerTypes.Client)!.on(LISTEN_VALUE, onUpdateClient);
    listeners.get(ListenerTypes.Pier)!.on(LISTEN_VALUE, onUpdatePier);
    listeners.get(ListenerTypes.Turn)!.on(LISTEN_VALUE, onUpdateTurn);
    //Add Header listener
    listeners.get(ListenerTypes.Header)!.on(LISTEN_VALUE, onUpdateHeader);
  }

  ///////////////END LISTENER--////////////////////////
  const localCtx = useContext(LocalContext);
  function onDisconnectCleanUp(id: string) {
    localCtx.setMyId(id);
    const rootRef = db.ref(`${DB_PLAYERS}/${id}`);
    rootRef.onDisconnect().remove();
  }
  async function setUpRoom() {
    const myId = await initialiseRoom();
    onDisconnectCleanUp(myId);
  }
  async function playerJoin() {
    const myId = await joinLobby();
    onDisconnectCleanUp(myId);
  }
  function joinPlayer() {
    if (context.room.playerMap.size === 0) {
      //Join as host
      console.log("Join as host");
      setUpRoom();
    } else {
      //Join as client
      console.log("Join as client");
      playerJoin();
    }
  }
  switch (isLoaded) {
    case LoadStatus.init:
      setStatus(LoadStatus.isLoading);
      loadRoom().then((room: Room) => {
        //
        context.onRoomLoaded(room);
        setStatus(LoadStatus.loaded);
      });
      break;
    case LoadStatus.loaded:
      const listeners = registerListeners();
      setListeners(listeners);
      setStatus(LoadStatus.listening);
      break;
    case LoadStatus.listening:
      joinPlayer();
      setStatus(LoadStatus.joined);
      break;
    case LoadStatus.joined:
      console.log("is joined");
      if (context.room.game.currentTurn < 0) {
        history.replace("/lobby");
      } else {
        history.replace("/game");
      }
      //      setStatus(LoadStatus.outerSpace);
      break;
    case LoadStatus.outerSpace:
      console.log("Outer space");
      break;
  }
  return (
    <Fragment>
      {/* <p>{JSON.stringify(context.room)}</p> */}
      <Switch>
        <Route path="/loading" exact>
          <LoadingHome />
        </Route>
        <Route path="/lobby" exact>
          <Lobby />
        </Route>
        <Route path="/game" exact>
          <InGame />
        </Route>
        <Route>
          <p>Not found</p>
        </Route>
      </Switch>
    </Fragment>
  );
}
