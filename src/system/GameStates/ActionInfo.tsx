import {ActionType} from "system/GameStates/States";

const actionMap = new Map<ActionType, ActionInfo>();
export const ActionPool = {
    get(action: ActionType): ActionInfo {
        if (!actionMap.has(action)) {
            actionMap.set(action, new ActionInfo(action));
        }
        return actionMap.get(action)!;
    }
};

export class ActionInfo {
    actionType: ActionType;

    constructor(actionType: ActionType) {
        this.actionType = actionType;
    }

    getName(t: any): string {
        switch (this.actionType) {
            case ActionType.Accept:
                return t("_action_accept");
            case ActionType.Assassinate:
                return t("_action_assassinate");
            case ActionType.ChangeCards:
                return t("_action_ambassador");
            case ActionType.ContessaBlocksAssassination:
                return t("_action_ContessaBlocksAssassination");
            case ActionType.Coup:
                return t("_action_Coup");
            case ActionType.DefendWithAmbassador:
                return t("_action_DefendWithAmbassador");
            case ActionType.DefendWithCaptain:
                return t("_action_DefendWithCaptain");
            case ActionType.GetOne:
                return t("_action_income");
            case ActionType.GetForeignAid:
                return t("_action_foreign_aid");
            case ActionType.GetThree:
                return t("_action_getThree");
            case ActionType.IsALie:
                return t("_action_is_a_lie");
            case ActionType.None:
                return t("_action_none");
            case ActionType.Steal:
                return t("_action_steal");
            case ActionType.DukeBlocksForeignAid:
                return t("_action_DukeBlocksForeignAid");
        }
    }
}
