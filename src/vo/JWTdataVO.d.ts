import {TokenVO} from "./TokenVO";

export interface JWTdataVO extends CustomEvent {
    access: TokenVO,
    refresh: TokenVO
}