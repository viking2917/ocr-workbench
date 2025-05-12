import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class UxToolsService {
  currentLoader: any;
  currentToast: HTMLIonToastElement | false = false;

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    public toastController: ToastController,
    
    private navCtrl: NavController,
    private platform: Platform,
  ) { }

  async loading(message: string = 'Please wait...') {
    this.currentLoader = await this.loadingController.create({
      cssClass: 'loader-waiting-class',
      spinner: 'crescent',
      message: message,
    });

    await this.currentLoader.present();
  }

  async dismissLoading() {
    const top = await this.loadingController.getTop();
    if (top) {
      this.loadingController.dismiss();
    }
  }

  goBack() {
    this.navCtrl.pop();  // .back() doesn't seem to do the tabs right, i.e. if you switch tabs back gets confused.
  }

  goForward(string: string) {
    this.navCtrl.navigateForward(string);
  }
  
  async showToast(msg: string, duration: number = 100) {
    const theDuration = duration; //  || this.params.multiple ? 100 : 3000;
    this.currentToast = await this.toastController.create({
      duration: theDuration,
      message: msg,
      cssClass: 'bookship-toast',
      animated: true,
      position: 'top',
    });

    await this.currentToast.present();
  }

  async confirm(header: string, message: string, cssClass = 'my-custom-class', ok = 'OK', notOk = 'Cancel'): Promise<boolean> {
    return new Promise((resolve) => {
      // alertController.create(...) returns a promise!
      this.alertController
        .create({
          header,
          message,
          cssClass,
          buttons: [
            {
              text: notOk,
              handler: () => resolve(false)
            },
            {
              text: ok,
              handler: () => resolve(true)
            }
          ]
        })
        .then(alert => {
          // Now we just need to present the alert
          alert.present();
        });
    });
  }

  isDesktop(): boolean {
    let foo = this.platform.is('desktop');
    return foo;
  }


}
