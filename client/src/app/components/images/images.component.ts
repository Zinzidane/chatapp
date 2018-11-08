import { Component, OnInit, OnDestroy } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { UsersService } from '../../services/users.service';
import { TokenService } from '../../services/token.service';
import io from 'socket.io-client';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

// const URL = 'http://localhost:3000/api/chatapp/upload-image';
const URL = '/api/chatapp/upload-image';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.css']
})
export class ImagesComponent implements OnInit, OnDestroy {
  uploader: FileUploader = new FileUploader({
    url: URL,
    disableMultipart: true
  });
  selectedFile: any;
  user: any;
  socket: any;
  images = [];
  sSub: Subscription;
  uSub: Subscription;
  gSub: Subscription;

  constructor(private usersService: UsersService, private tokenService: TokenService) {
    this.socket = io(environment.ioAddress);
  }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();
    this.GetUser();

    this.socket.on('refreshPage', () => {
      this.GetUser();
    });
  }

  ngOnDestroy() {
    if(this.sSub) {
      this.sSub.unsubscribe();
    }

    if(this.uSub) {
      this.uSub.unsubscribe();
    }

    if(this.gSub) {
      this.gSub.unsubscribe();
    }

  }

  GetUser() {
    this.gSub = this.usersService.GetUserById(this.user._id).subscribe(data => {
      this.images = data.result.images;
    }, err => console.log(err));
  }

  onFileSelected(event) {
    const file: File = event[0];

    this.ReadAsBase64(file)
      .then(result => this.selectedFile = result)
      .catch(err => console.log(err));
  }

  ReadAsBase64(file): Promise<any> {
    const reader = new FileReader();
    const fileValue = new Promise((resolve, reject) => {
      reader.addEventListener('load', () => {
        resolve(reader.result);
      });

      reader.addEventListener('error', (event) => {
        reject(event);
      });

      reader.readAsDataURL(file);
    });
    return fileValue;
  }

  Upload() {
    if(this.selectedFile) {
      this.uSub = this.usersService.AddImage(this.selectedFile).subscribe(data => {
        this.socket.emit('refresh', {});
        const filePath = <HTMLInputElement>document.getElementById('filePath');
        filePath.value = '';
      },
        err => console.log(err)
      );
    }
  }

  SetProfileImage(img) {
    this.sSub = this.usersService.SetDefaultImage(img.imgId, img.imgVersion).subscribe(data => {
      this.socket.emit('refresh', {});
    }, err => console.log(err));
  }
}
