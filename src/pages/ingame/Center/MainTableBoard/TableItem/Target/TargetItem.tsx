import {IProps} from "system/types/CommonTypes";
import classes from "./TargetItem.module.css";
import LocalContext from "system/context/localInfo/local-context";
import RoomContext from "system/context/roomInfo/room-context";
import {Fragment, useContext, useEffect, useState} from "react";
import {CardPool} from "system/cards/CardPool";
import {useTranslation} from "react-i18next";
import {isNull} from "system/GameConstants";
import VerticalLayout from "pages/components/ui/VerticalLayout";
import HorizontalLayout from "pages/components/ui/HorizontalLayout";
import {inferTargetPanel} from "pages/ingame/Center/MainTableBoard/TableItem/Target/TargetInferer";
import useAnimFocus, {AnimType} from "system/hooks/useAnimFocus";


export default function TargetItem(props: IProps) {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const action = ctx.room.game.action;
    const target = ctx.room.playerMap.get(action.targetId);
    const {t} = useTranslation();
    const [elem, setJSX] = useState<JSX.Element>(<Fragment/>);
    const panelCss = useAnimFocus(ctx.room.game.state.board, AnimType.FadeIn);
    useEffect(() => {
        const stateElem: JSX.Element = inferTargetPanel(t, ctx, localCtx, action.targetId, target);
        setJSX(stateElem);
    }, [ctx.room.game.state.board, ctx.room.game.action]);
    if (isNull(target)) return <Fragment/>;


    const lastCard = CardPool.getCard(target!.lastClaimed);
    return (
        <VerticalLayout className={`${props.className}`}>
            <div className={classes.nameContainer}>
                <p className={classes.playerName}>{target!.name}</p>
            </div>
            <HorizontalLayout>
                <img
                    className={classes.mainImg}
                    src={`${lastCard.getImage()}`}
                    alt={lastCard.getName(t)}
                />
                <div className={`${classes.actionContainer} ${panelCss}`}>
                    {elem}
                </div>
            </HorizontalLayout>
        </VerticalLayout>
    );
}
