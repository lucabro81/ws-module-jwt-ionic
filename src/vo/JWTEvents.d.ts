import {EventEmitter} from "@angular/core";

export interface JWTEvents {
    onEndRequest: EventEmitter,
    onCreateNameSpacedStorageSuccess: EventEmitter,
    onCreateNameSpacedStorageError: EventEmitter,
    onReadSecureStorageSuccess: EventEmitter,
    onReadSecureStorageError: EventEmitter,
    onTokensDataSet: EventEmitter,
    onStorageComplete: EventEmitter,
    onStorageError: EventEmitter
}