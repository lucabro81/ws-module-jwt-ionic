import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';

@Injectable()
export class IonicJWSService {
    public constructor(public storage:Storage) {

    }
}