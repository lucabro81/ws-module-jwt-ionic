import {NgModule, ModuleWithProviders} from '@angular/core';
import {IonicJWSService} from "./services/ionic-jwt.service";
import {IonicJWTComponent} from "./components/ionic-jwt.component";
import {IonicModule} from 'ionic-angular';

@NgModule({
    imports: [
        // Only if you use elements like ion-content, ion-xyz...
        IonicModule
    ],
    declarations: [
        // declare all components that your module uses
        IonicJWTComponent
    ],
    exports: [
        // export the component(s) that you want others to be able to use
        IonicJWTComponent
    ]
})
export class IonioJWTModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: IonioJWTModule,
            providers: [IonicJWSService]
        };
    }
}