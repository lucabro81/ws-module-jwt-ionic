import {EventEmitter} from "@angular/core";
import { JWTdataVO } from "./JWTdataVO";

export interface JWTEvents {
    onEndRequest: EventEmitter<JWTdataVO>;
    onReadStorageSuccess: EventEmitter<JWTdataVO>;
    onReadStorageError: EventEmitter<any>;
    onStorageComplete: EventEmitter<JWTdataVO>;
    onStorageError: EventEmitter<any>;
}