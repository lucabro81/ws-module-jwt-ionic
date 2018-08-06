import {EventEmitter} from "@angular/core";

export interface JWTEvents {
    onEndRequest: EventEmitter,
    onReadStorageSuccess: EventEmitter,
    onReadStorageError: EventEmitter,
    onStorageComplete: EventEmitter,
    onStorageError: EventEmitter
}