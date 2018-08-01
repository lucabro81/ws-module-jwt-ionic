import {EventEmitter, Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';
import {SecureStorage, SecureStorageObject} from "@ionic-native/secure-storage";
import {JWTdataVO} from "../vo/JWTdataVO";
import {Const} from "../utils/Const";
import {TokenVO} from "../vo/TokenVO";
import {JWTEvents} from "../vo/JWTEvents";
import {Platform} from "ionic-angular";

@Injectable()
export class IonicJWSService {

    public events: JWTEvents = <JWTEvents>{
        onEndRequest: new EventEmitter(),
        onCreateNameSpacedStorageSuccess: new EventEmitter(),
        onCreateNameSpacedStorageError: new EventEmitter(),
        onReadSecureStorageSuccess: new EventEmitter(),
        onReadSecureStorageError: new EventEmitter(),
        onTokensDataSet: new EventEmitter(),
        onStorageComplete: new EventEmitter(),
        onStorageError: new EventEmitter()
    };

    private _tokens: JWTdataVO;
    private _tokens_container: SecureStorageObject;
    private _expiring_time: number = 720; // 12 minutes

  /////////////////////////////////
 ////////// CONSTRUCTOR //////////
/////////////////////////////////

    /**
     *
     * @param plt
     * @param storage       fallback nel caso di android e cordova o secure non disponibili
     * @param secureStorage
     */
    public constructor(public plt: Platform,
                       private storage: Storage,
                       private secureStorage: SecureStorage) {

        if (this.plt.is(Const.KEYS.CORDOVA_PLT)) {
            this.secureStorage
                .create(Const.KEYS.TOKENS)
                .then(
                    (secure_obj: SecureStorageObject) => {
                        this._tokens_container = secure_obj;
                        this.events.onEndRequest.subscribe(this._saveTokens);
                        this.events.onCreateNameSpacedStorageSuccess;

                        this._tokens_container
                            .get(Const.KEYS.JWT_TOKENS)
                            .then(
                                this._readSecureStorageSuccess,
                                this._readSecureStorageError
                            );
                    },
                    () => {
                        this.events.onEndRequest.subscribe(this._saveTokens);
                        this.events.onCreateNameSpacedStorageError.emit();
                        this._readSecureStorageError();
                    }
                );
        }
        else {

        }
    }

  ////////////////////////////
 ////////// PUBLIC //////////
////////////////////////////

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
    public getSecondsRemaining(): number {
        let now: number = Date.now();
        return this._tokens.access.expires - (now / 1000);
    }

    /**
     * Quanti minuti mancano prima che scada l'access token
     *
     * @returns {number}
     */
    public getMinutesRemaining(): number {
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

        // TODO: valutare se eliminare il controllo
        if (!this._tokens_container) { // se non c'è ritento la creazione, valutare se eliminare il controllo
            if (this.plt.is(Const.KEYS.CORDOVA_PLT)) {
                this.secureStorage
                    .create(Const.KEYS.TOKENS)
                    .then(
                        (storage) => {
                            this._tokens_container = storage;
                            this._onStoreTokensCreationSuccess()
                        },
                        (err) => this._onStoreTokensCreationError(err)
                    )
            }
            else {
                this._onStoreTokensCreationError();
            }
        }
        else { // altrimenti uso l'istanza che ho e bon
            this._onStoreTokensCreationSuccess();
        }
    }

    /**
     *
     * @param data
     * @private
     */
    private _readSecureStorageSuccess(data) {
        this._tokens = <JWTdataVO>JSON.parse(data);
        this.events.onReadSecureStorageSuccess.emit();
        this.events.onTokensDataSet.emit(this._tokens);
    }

    /**
     *
     * @private
     */
    private _readSecureStorageError() {
        this.storage
            .get(<string>Const.KEYS.JWT_TOKENS)
            .then(
                (token_obj) => {
                    this._tokens = token_obj;
                    this.events.onTokensDataSet.emit(this._tokens);
                }
            );
        this.events.onReadSecureStorageError.emit();
    }

    /**
     *
     * @param storage
     * @private
     */
    private _onStoreTokensCreationSuccess() {
        this._tokens_container
            .set(Const.KEYS.JWT_TOKENS, JSON.stringify(this._tokens))
            .then((data) => this._onStorageComplete(data))
            .catch((err) => this._onStorageError(err));
    }

    /**
     *
     * @param err
     * @private
     */
    private _onStoreTokensCreationError(err?:any) {
        this.storage
            .set(Const.KEYS.JWT_TOKENS, this._tokens)
            .then(
                () => {
                    this.events.onStorageComplete.emit(this._tokens);
                },
                (err) => {
                    this.events.onStorageError.emit(err);
                }
            );
    }

    /**
     *
     * @param data
     * @private
     */
    private _onStorageComplete(data) {
        this.events.onStorageComplete.emit(data);
    }

    /**
     *
     * @param error
     * @private
     */
    private _onStorageError(error:any):void {
        this.storage
            .set(Const.KEYS.JWT_TOKENS, this._tokens)
            .then(
                () => {
                    this.events.onStorageComplete.emit(this._tokens);
                },
                (err) => {
                    this.events.onStorageError.emit(err);
                }
            );
    }

}