import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { TokenService } from '../../services/token.service';
import { MessageService } from '../../services/message.service';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../services/users.service';
import io from 'socket.io-client';
import { CaretEvent, EmojiEvent, EmojiPickerOptions, EmojiPickerAppleSheetLocator } from 'ng2-emoji-picker';
import _ from 'lodash';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() users;
  receiver: string;
  receiverData: any;
  user: any;
  message: string;
  messages = [];
  socket: any;
  typingMessage;
  typing = false;
  isOnline = false;
  gSub: Subscription;
  getMessagesSub: Subscription;
  sendMessageSub: Subscription;
  sideDivElement: any;

  eventMock;
  eventPosMock;

  direction = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'top' : 'bottom') : (Math.random() > 0.5 ? 'right' : 'left');
  toggled = false;
  content = ' ';

  _lastCaretEvent: CaretEvent;

  constructor(
    private tokenService: TokenService,
    private usersService: UsersService,
    private msgService: MessageService,
    private route: ActivatedRoute,
    private emojiPickerOptions: EmojiPickerOptions
    ) {
      this.socket = io(environment.ioAddress);
      this.emojiPickerOptions.setEmojiSheet({
        url: 'sheet_apple_32.png',
        locator: EmojiPickerAppleSheetLocator
      });
    }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();

    this.sideDivElement = document.querySelector('.sideDiv');

    this.route.params.subscribe(params => {
      this.receiver = params.name;
      this.GetUserByUsername(this.receiver);

      this.socket.on('refreshPage', () => {
        this.GetUserByUsername(this.receiver);
        this.GetMessages(this.user._id, this.receiverData._id);
      });

      this.socket.on('is_typing', data => {
        console.log(data.sender, this.receiver);
        if(data.sender === this.receiver) {
          this.typing = true;
          console.log(this.typing, 'typing');
        }
      });

      this.socket.on('has_stopped_typing', data => {
        console.log(data.sender, this.receiver);
        if(data.sender === this.receiver) {
          this.typing = false;
          console.log(this.typing, 'typing');
        }
      });
    });
  }

  ngAfterViewInit() {
    const params = {
      room1: this.user.username,
      room2: this.receiver
    };

    this.sideDivElement.style.display = 'none';

    this.socket.emit('join_chat', params);
  }

  ngOnChanges(changes: SimpleChanges) {
    const title = document.querySelector('.nameCol');
    if(changes.users.currentValue.length > 0) {
      const result = _.indexOf(changes.users.currentValue, this.receiver);
      if(result > -1) {
        this.isOnline = true;
        (title as HTMLElement).style.marginTop = '10px';
      } else {
        this.isOnline = false;
        (title as HTMLElement).style.marginTop = '20px';
      }
    }
  }

  ngOnDestroy() {
    if(this.gSub) {
      this.gSub.unsubscribe();
    }

    if(this.getMessagesSub) {
      this.getMessagesSub.unsubscribe();
    }

    if(this.sendMessageSub) {
      this.sendMessageSub.unsubscribe();
    }

    this.sideDivElement.style.display = 'block';
  }


  GetUserByUsername(username) {
    this.gSub = this.usersService.GetUserByName(username).subscribe(data => {
      this.receiverData = data.result;

      this.GetMessages(this.user._id, this.receiverData._id);
    });
  }

  GetMessages(senderId, receiverId) {
    this.getMessagesSub = this.msgService.GetAllMessages(senderId, receiverId).subscribe(data => {
      this.messages = data.messages.message;
    });
  }

  SendMessage() {
    if (this.message) {
      this.sendMessageSub = this.msgService.SendMessage(this.user._id, this.receiverData._id, this.receiverData.username, this.message).subscribe(data => {
        this.socket.emit('refresh', {});
        this.message = '';
      });
    }
  }

  // Check this method
  IsTyping() {
    this.socket.emit('start_typing', {
      sender: this.user.username,
      receiver: this.receiver
    });

    console.log(this.receiver);

    if(this.typingMessage) {
      clearTimeout(this.typingMessage);
    }

    this.typingMessage = setTimeout(() => {
      this.socket.emit('stop_typing', {
        sender: this.user.username,
        receiver: this.receiver
      });
    }, 500);
  }

  Toggled() {
    this.toggled = !this.toggled;
  }

  HandleSelection(event: EmojiEvent) {
    this.content = this.content.slice(0, this._lastCaretEvent.caretOffset) + event.char + this.content.slice(this._lastCaretEvent.caretOffset);
    this.eventMock = JSON.stringify(event);

    this.message = this.content;

    this.toggled = !this.toggled;
    // Clear emoji
    this.content = '';
  }

  HandleCurrentCaret(event: CaretEvent) {
    this._lastCaretEvent = event;
    this.eventPosMock = `{ caretOffset : ${event.caretOffset}, caretRange: Range{...}, textContent: ${event.textContent} }`;
  }
}
