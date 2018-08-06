import { EventEmitter, Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { JWTdataVO } from "../vo/JWTdataVO";
import { Const } from "../utils/Const";
import { TokenVO } from "../vo/TokenVO";
import { JWTEvents } from "../vo/JWTEvents";

@Injectable()
export class IonicJWSService {

    public events: JWTEvents = <JWTEvents>{
        onEndRequest: new EventEmitter<JWTdataVO>(),
        onReadStorageSuccess: new EventEmitter<JWTdataVO>(),
        onReadStorageError: new EventEmitter<any>(),
        onStorageComplete: new EventEmitter<JWTdataVO>(),
        onStorageError: new EventEmitter<any>()
    };

    private _tokens: JWTdataVO;
    private _expiring_time: number = 720; // 12 minutes

  /////////////////////////////////
 ////////// CONSTRUCTOR //////////
/////////////////////////////////

    /**
     *
     * @param storage
     */
    public constructor(private storage: Storage) {
    }

  ////////////////////////////
 ////////// PUBLIC //////////
////////////////////////////

    /**
     *
     * @returns {Promise<JWTdataVO>}
     */
    public init(): Promise<void> {
        return this.storage
                   .get(Const.KEYS.JWT_TOKENS)
                   .then(
                       (data: JWTdataVO) => {
                           this.events.onEndRequest.subscribe(this._saveTokens);
                           this._readStorageSuccess(data);
                       },
                       (err) => {
                           this._readStorageError(err);
                       }
                   );
    }

    /**
     *
     * @returns {TokenVO}
     */
    public getLastAccessToken(): TokenVO {
        return (this._tokens.access) ? this._tokens.access : null;
    }

    /**
     *
     * @returns {TokenVO}
     */
    public getLastRefreshToken(): TokenVO {
        return (this._tokens.refresh) ? this._tokens.refresh : null;
    }

    /**
     * Quanti secondi mancano prima che scada l'access token
     *
     * @returns {number}
     */
    public getSecondsLeft(): number {
        let now: number = Date.now();
        return this._tokens.access.expires - (now / 1000);
    }

    /**
     * Quanti minuti mancano prima che scada l'access token
     *
     * @returns {number}
     */
    public getMinutesLeft(): number {
        let now: number = Date.now();
        return (this._tokens.access.expires - (now / 1000)) / 60;
    }

    /**
     * Setta l'intervallo di tempo dopo il quale considerare scaduti gli access token, default 720 secondi (12 minuti)
     *
     * @param seconds
     */
    public setAccessTimeExpiring(seconds: number): void {
        this._expiring_time = seconds;
    }

  /////////////////////////////
 ////////// PRIVATE //////////
/////////////////////////////

    /**
     *
     * @param evt
     * @private
     */
    private _saveTokens(evt: JWTdataVO) {
        this._tokens = <JWTdataVO>{access: evt.access, refresh: evt.refresh};

        let now: number = Date.now();

        this.storage
            .set(Const.KEYS.JWT_TOKENS, this._tokens)
            .then(
                () => {
                    this._onStorageComplete(this._tokens);
                },
                (err) => {
                    this._onStorageError(err);
                }
            )
    }

    /**
     *
     * @param data
     * @private
     */
    private _readStorageSuccess(data): void {
        this._tokens = <JWTdataVO>JSON.parse(data);
        this.events.onReadStorageSuccess.emit(this._tokens);
    }

    /**
     *
     * @private
     */
    private _readStorageError(err): void {
        this.events.onReadStorageError.emit(err);
    }

    /**
     *
     * @param tokens
     * @private
     */
    private _onStorageComplete(tokens): void {
        this.events.onStorageComplete.emit(tokens);
    }

    /**
     *
     * @param error
     * @private
     */
    private _onStorageError(error: any): void {
        this.events.onStorageError.emit(error);
    }

}